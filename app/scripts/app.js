/* global define, gettext, ngettext, jed, app */
define([
    'jquery',
    'underscore',
    'backbone',
    'handlebars',
    'moment',
    'numeral',
    'layoutmanager',
    'jquery.serialize-object',
    // datetimepicker
    'bootstrap',
    'bootstrap-datetimepicker',
    'bootstrap-pagination',
    'helpers/notify-osd',
    'moment-timezone',
    'vendor/backbone.cache',
    'socket.io'
], function($, _, Backbone, HandlebarsEnv, moment, numeral) {
    'use strict';

    window.gettext = function () {
        return arguments[0];
    };
    var DEFAULT_OPTIONS = {
        root: '/', //暂时没用
        apiRoot: '/', //api地址
        assetsLocation: '' //cdn地址
    };
    var options = _.extend({}, DEFAULT_OPTIONS, $('base#options').data());
    // default application class
    var Application = function Application() {
        this.dateFormat = 'YYYY-MM-dd';
        this.datetimeFormat = 'YYYY-MM-dd HH:mm:SS';
        this.vent.on('notification', function(options) {
            var o = options;
            if( _.isString(options) ) {
                o = {text: options};
            }
        }, this);
        this.vent.on('confirm', function(o) {
            require(['helpers/confirm-view'], function(ConfirmView) {
                var view = new ConfirmView(o);
                view.render().promise().done(function() {
                    view.show(o);
                });
            });
        });
        this.vent.on('notify', function(o) {
            require(['helpers/confirm-view'], function(ConfirmView) {
                var view = new ConfirmView(_.extend(o, {type: 'notify'}));
                view.render().promise().done(function() {
                    view.show(o);
                });
            });
        });
        this.vent.on('dialog', function(o) {
            require(['helpers/dialog-view'], function(DialogView) {
                var view = new DialogView(o);
                view.render().promise().done(function() {
                    view.show(o);
                });
            });
        });
        this.vent.on('pop', function(view) {
            require(['helpers/pop-view'], function(PopView) {
                var popView = new PopView();
                app.$layout.setView('#pop-view-div', popView).render().promise().done(function(){
                    popView.setView('.pop-content-view', view).render().promise().done(function(){
                        popView.$('.modal-dialog').css('width', 'auto');
                        popView.show();
                    });
                });
            });
        });
    };

    // app event prototype
    Application.prototype.vent = _.extend({}, Backbone.Events);

    Application.prototype.getSioServer = function(){
        return options.sioServer;
    };

    Application.prototype.version = '1.0';

    Application.prototype.routers = {};
    Application.prototype.initialize = function() {
    };
    Application.prototype.useLayout = function() {
        return this.$layout;
    };

    Application.prototype.globalCache = new Backbone.Cache();
    Application.prototype.start = function() {
        this.vent.trigger('initialize:before', this);
        this.vent.trigger('initialize:after');
    };
    Application.prototype.redirectHashBang = function() {
        window.location = window.location.hash.substring(2);
    };
    var EMAIL_PATTERN = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    Application.prototype.validateEmail =   function(email) {
        return EMAIL_PATTERN.test(email);
    };
    var MAC_PATTERN = /(([a-zA-Z0-9]{2}-){5})[a-zA-Z0-9]{2}/;
    Application.prototype.validateMAC = function(mac) {
        return MAC_PATTERN.test(mac);
    };
    /**
    * ajax访问api的内容的url
    */
    var buildUrl = Application.prototype.buildUrl = function() {
        return [options.apiRoot].concat(_.toArray(arguments)).join('/');
    };

    Application.prototype.handleFail = function(xhr) {
        if (xhr.responseJSON) {
            var resp = xhr.responseJSON;
            if(resp.message) {
                this.vert.trigger('notification', resp.message);
            }
        } else {
            this.vert.trigger('notification', '与服务器通讯发生异常');
        }
    };
    Application.prototype.loadModules = function(modules) {
        var deferred = new $.Deferred();
        modules = _.isArray(modules) ? modules : _.toArray(arguments);
        require(_.toArray(modules), function() {
            _.each(_.toArray(arguments), function(module) {
                module();
            });
            deferred.resolve();
        }, function(){
            deferred.reject();
        });
        return deferred.promise();
    };
    Application.prototype.assets = function(path) {
        return options.assetsLocation + path;
    };

    Application.prototype.tools = {
        contactAndUniq: function(arrA, arrB){
            if(!(_.isArray(arrA) && _.isArray(arrB))){
                return arrA;
            }
            var temp = arrA.concat(arrB);
            var tempMap = {};
            _.each(temp, function(one){
                tempMap[one] = 0;
            });
            return _.keys(tempMap);
        }
    };

    // 设置Backbone的AJAX代码
    Backbone.originalSync = Backbone.sync;
    Backbone.sync = function(method, model, options) {
        var _beforeSend;
        _beforeSend = options.beforeSend;
        options.beforeSend = function(jqXHR, settings) {
            // window.client
            // 用于认证
            if (window.client) {
                window.client.doBeforeSend(jqXHR, settings);
            }
            if (/^(\/|(http[s]?\:\/\/))/i.test(settings.url) === false) {
                settings.url = buildUrl(settings.url);
            }
            if (method === 'delete' && options.data && !!!options.ignoreMatrixParam) {
                settings.url = settings.url + _.reduce(options.data, function(memo, value, key) {
                    return memo + ';' + key  + (value ? ('=' + value) : '');
                }, '');
            }
            if (_beforeSend) {
                _beforeSend.apply(this, arguments);
            }

        };
        return Backbone.originalSync(method, model, options);
    };
    // 支持hateoas功能
    var originalParse = Backbone.Collection.prototype.originalParse = Backbone.Collection.prototype.parse;
    Backbone.Collection.prototype.parse = function(response) {
        response = response || {};
        if (/*response.links && */response.page) {
            this.page = response.page;
            return response.content;
        }
        return originalParse.apply(this, _.toArray(arguments));
    };

    //支持before router, 统一的before设置，或者在单个的router中设置before也可以
    var originalRoute = Backbone.Router.prototype.route;
    var nop = function(){};
    _.extend(Backbone.Router.prototype, {

        before: function(){
            /*if(!app.profile.equipment && app.profile.userInfo.loginname !== 'admin'){
                var EquipmentRegisterView = require('settings/equipment-register-view');
                app.$layout.setMainView(new EquipmentRegisterView()).render();
                //
                return false;
            }*/
        },

        // Add default after filter.
        after: nop,

        // Pave over Backbone.Router.prototype.route, the public method used
        // for adding routes to a router instance on the fly, and the
        // method which backbone uses internally for binding routes to handlers
        // on the Backbone.history singleton once it's instantiated.
        route: function(route, name, callback) {

            // If there is no callback present for this route, then set it to
            // be the name that was set in the routes property of the constructor,
            // or the name arguement of the route method invocation. This is what
            // Backbone.Router.route already does. We need to do it again,
            // because we are about to wrap the callback in a function that calls
            // the before and after filters as well as the original callback that
            // was passed in.
            if( !callback ){
                callback = this[ name ];
            }

            // Create a new callback to replace the original callback that calls
            // the before and after filters as well as the original callback
            // internally.
            var wrappedCallback = _.bind( function() {

                // Call the before filter and if it returns false, run the
                // route's original callback, and after filter. This allows
                // the user to return false from within the before filter
                // to prevent the original route callback and after
                // filter from running.
                var callbackArgs = [ route, _.toArray(arguments) ];
                var beforeCallback;

                if ( _.isFunction(this.before) ) {

                    // If the before filter is just a single function, then call
                    // it with the arguments.
                    beforeCallback = this.before;
                } else if ( typeof this.before[route] !== 'undefined' ) {

                    // otherwise, find the appropriate callback for the route name
                    // and call that.
                    beforeCallback = this.before[route];
                } else {

                    // otherwise, if we have a hash of routes, but no before callback
                    // for this route, just use a nop function.
                    beforeCallback = nop;
                }

                // If the before callback fails during its execusion (by returning)
                // false, then do not proceed with the route triggering.
                if ( beforeCallback.apply(this, callbackArgs) === false ) {
                    return;
                }

                // If the callback exists, then call it. This means that the before
                // and after filters will be called whether or not an actual
                // callback function is supplied to handle a given route.
                if( callback ) {
                    callback.apply( this, arguments );
                }

                var afterCallback;
                if ( _.isFunction(this.after) ) {

                    // If the after filter is a single funciton, then call it with
                    // the proper arguments.
                    afterCallback = this.after;

                } else if ( typeof this.after[route] !== 'undefined' ) {

                    // otherwise if we have a hash of routes, call the appropriate
                    // callback based on the route name.
                    afterCallback = this.after[route];

                } else {

                    // otherwise, if we have a has of routes but no after callback
                    // for this route, just use the nop function.
                    afterCallback = nop;
                }

                // Call the after filter.
                afterCallback.apply( this, callbackArgs );

            }, this);

            // Call our original route, replacing the callback that was originally
            // passed in when Backbone.Router.route was invoked with our wrapped
            // callback that calls the before and after callbacks as well as the
            // original callback.
            return originalRoute.call( this, route, name, wrappedCallback );
        }
    });

    // 注册Handlebars helpers
    var Handlebars = HandlebarsEnv.default;
    Handlebars.registerHelper('dateFormat', function(context, block) {
        var f = block.hash.format || 'll';
        // 默认返回ISO DATE
        var m = moment(context, 'YYYY-MM-DD');
        if (m.isValid()) {
            // 只选择日期的话，是不需要时区的
            return m.format(f);
        }
        return '';
    });
    Handlebars.registerHelper('datetimeFormat', function(context, block) {
        var f = block.hash.format || 'llll';
        // 默认返回ISO DATE
        var m = moment(context, 'YYYY-MM-DD\'T\'HH:mm:ssZ');
        if (m.isValid()) {
            // 目前仅支持这个时区
            return m.tz('Asia/Shanghai').format(f);
        }
        return '';
    });
    //expired
    Handlebars.registerHelper('expired', function(time, opts) {
        if(moment(time) < moment()){ // Or === depending on your needs
            return opts.fn(this);
        }
        else{
            return opts.inverse(this);
        }
    });
    //in  3 months
    Handlebars.registerHelper('in3months', function(time, opts) {
        if(moment(time) < moment().add('3', 'months')){ // Or === depending on your needs
            return opts.fn(this);
        }
        else{
            return opts.inverse(this);
        }
    });
    //in  6 months
    Handlebars.registerHelper('in6months', function(time, opts) {
        if(moment(time) < moment().add('6', 'months')){ // Or === depending on your needs
            return opts.fn(this);
        }
        else{
            return opts.inverse(this);
        }
    });
    Handlebars.registerHelper('fromNow', function(context) {
        if(_.isDate(context)) {
            return moment(context).tz('Asia/Shanghai').fromNow();
        }
        // 默认返回ISO DATE
        var m = moment(context, 'YYYY-MM-DD\'T\'HH:mm:ssZ');
        if (m.isValid()) {
            // 目前仅支持这个时区
            return m.tz('Asia/Shanghai').fromNow();
        }
        return '';
    });
    Handlebars.registerHelper('numeralFormat', function(context, block) {
        var f = block.hash.format || '0,0';
        return numeral(context || '').format(f);
    });
    Handlebars.registerHelper('increment', function(context) {
        return numeral(context || '').add(1);
    });
    Handlebars.registerHelper('hasComponent', function(value, context) {
        if (window.client.hasComponent(value) === true) {
            return new Handlebars.SafeString(context.fn(this));
        }
        return context.inverse(this);
    });
    Handlebars.registerHelper('isPermitted', function() {
        var params = _.initial(arguments);
        var context = _.last(arguments);
        if (window.client.isPermitted.apply(window.client, params) === true) {
            return new Handlebars.SafeString(context.fn(this));
        }
        return context.inverse(this);
    });

    Handlebars.registerHelper('isPermittedAny', function() {
        var params = _.initial(arguments);
        var context = _.last(arguments);
        if (window.client.isPermittedAny.apply(window.client, params) === true) {
            return new Handlebars.SafeString(context.fn(this));
        }
        return context.inverse(this);
    });
    //his 权限前端控制
    Handlebars.registerHelper('permit', function(action) {
        var context = _.last(arguments);
        if (window.client.permit(action) === true) {
            return new Handlebars.SafeString(context.fn(this));
        }
        return context.inverse(this);
    });
    Handlebars.registerHelper('option', function(value, label, selectedValue) {
        var selectedProperty = value === selectedValue ? 'selected="selected"' : '';
        return new Handlebars.SafeString('<option value="' + value + '"' +  selectedProperty + '>' + label + '</option>');
    });
    Handlebars.registerHelper('options', function(values, selectedValue, options) {
        var html = '';
        _.each(values, function(value) {
            var selectedProperty = value === selectedValue ? 'selected="selected"' : '';
            html += '<option value="' + value + '"' +  selectedProperty + '>' + options.fn(value) + '</option>';
        });
        return new Handlebars.SafeString(html);
    });
    Handlebars.registerHelper('ticketsTypeOptions', function(values, selectedValue) {
        var html = '', valueMatch = false;
        _.each(values, function(value) {
            var selectedProperty = '';
            if(value === selectedValue){
                selectedProperty = 'selected="selected"';
                valueMatch = true;
            }
            html += '<option value="' + value + '"' +  selectedProperty + '>' +value + '</option>';
        });
        if(!valueMatch){
            html += '<option value="' + selectedValue + '" selected="selected">' + selectedValue + '</option>';
        }
        return new Handlebars.SafeString(html);
    });
    Handlebars.registerHelper('objectOptions', function(objects, selectedValue, options) {
        var value = options.hash.value ? options.hash.value: 'id';
        var html = '';
        _.each(objects, function(obj) {
            var selectedProperty = obj[value] === selectedValue ? 'selected="selected"' : '';
            html += '<option' + (obj[value]?' value="' + obj[value] + '"': '') +  selectedProperty + '>' + options.fn(obj) + '</option>';
        });
        return new Handlebars.SafeString(html);
    });
    Handlebars.registerHelper('assets', function(value) {
        return options.assetsLocation + value;
    });
    // 注册 handlebars gettext 方法
    Handlebars.registerHelper('gettext', function() {
        if (arguments.length === 2) {
            var context = _.first(arguments);
            return gettext.apply(gettext, [context]);
        } else {
            var args = _.initial(arguments);
            return ngettext.apply(ngettext, args);
        }
    });
    // 注册stringf方法
    Handlebars.registerHelper('sprintf', function() {
        var params = _.initial(arguments);
        if (!_.isString(params[0])){
            params[0] = params[0].toString();
        }
        return jed.sprintf.apply(jed, params);
    });
    Handlebars.registerHelper('if_eq', function(a, b, opts) {
        if(a === b){ // Or === depending on your needs
            return opts.fn(this);
        }
        else{
            return opts.inverse(this);
        }
    });
    Handlebars.registerHelper('if_not_eq', function(a, b, opts) {
        if(a !== b){ // Or === depending on your needs
            return opts.fn(this);
        }
        else{
            return opts.inverse(this);
        }
    });
    Handlebars.registerHelper('if_eqeq', function(a, b, opts) {
        //jshint eqeqeq:false
        if(a == b){ // Or === depending on your needs
            return opts.fn(this);
        }
        else{
            return opts.inverse(this);
        }
    });
    Handlebars.registerHelper('if_not_eqeq', function(a, b, opts) {
        //jshint eqeqeq:false
        if(a != b){ // Or === depending on your needs
            return opts.fn(this);
        }
        else{
            return opts.inverse(this);
        }
    });
    Handlebars.registerHelper('in_array', function(a, b, opts) {
        var i = 0;
        for(; i < b.length; i++){
            if(a === b[i]){
               return opts.fn(this);
            }
        }
        return opts.inverse(this);
    });
   /* 设置ajax回调 */
    // var compile = function(text) {
    //     return Handlebars.compile(text);
    // };
    // 设置Backbone Layoutmanager
    var templates = window.healthTemplates = window.healthTemplates || {};
    var getTemplate = function(name, path) {
        var template = templates[name];
        if (template) {
            return Backbone.Layout.cache(path, Handlebars.template(template));
        }
        throw 'template ' + name + ' undefined';
    };
    Backbone.Layout.configure({
        manage: true,
        fetchTemplate: function(path) {
            var template = Backbone.Layout.cache(path);
            if (template) {
                return template;
            }
            if (/^templates\:/.test(path)) {
                var names = path.substring('templates:'.length).split(':');
                if (names.length !== 2) {
                    throw 'unsupported templates path ' + path + '.';
                }
                template = templates[names.join('/')];
                if (template) {
                    return Backbone.Layout.cache(path, Handlebars.template(template));
                }
                // console.log('fetch module templates:' + names[0]);
                var done = this.async();
                require(['templates/' + names[0]], function() {
                    done(getTemplate(names.join('/'), path));
                }, function() { // fallback
                    throw 'template ' + names + ' undefined';
                });

            // } else if (/^fragment\:/.test(path)) {
            //     url = buildUrl(path.substring('fragment:'.length));
            //     $.get(url).done(function(data) {
            //         template = compile(data);
            //         return done(template);
            //     });
            //     return;
            // } else {
            //     template = Backbone.Layout.cache(path);
            //     if (template !== void 0) {
            //         return template;
            //     }
            //     url = buildUrl(path);
            //     done = this.async();
            //     $.get(url).done(function(data) {
            //         template = compile(data);
            //         Backbone.Layout.cache(path, template);
            //         return done(template);
            //     });
            } else {
                throw 'templates path ' + path +' unsupported';
            }
        }
    });
    $.ajaxSetup({
        statusCode : {
            401 : function(error) {
                //session expire
                if(DEBUG){
                    console.error('session expired: '+error);
                }
                app.vent.trigger('confirm', {
                    callback: function (view) {
                        view.hide();
                        window.location = error.responseText.urlRedirect;
                    },
                    text: {
                        title: 'Session expired',
                        content: 'Confirm relogin'
                    }
                });

            },
            403 : function() {
                Backbone.history.navigate('denied', true);
            }
        }
    });
    $(document).on('click', 'a:not([data-bypass])', function (e) {
        var href = $(this).attr('href');
        if (!href) { return; }
        // jshint scripturl:true
        // 无视javascript
        if (href.slice(0, 'javascript:'.length) === 'javascript:') { return; }
        // 无视mailto
        if (href.slice(0, 'mailto:'.length) === 'mailto:') { return; }
        // 无视https
        if (href.slice(0, 'https:'.length) === 'https:') { return; }
        // 无视http
        if (href.slice(0, 'http:'.length) === 'http:') { return; }
        // 无视锚点
        if (href.slice(0, '#'.length) === '#') { return; }

        // jshint scripturl:false
        var protocol = this.protocol + '//';
        if (href.slice(protocol.length) !== protocol) {
            e.preventDefault();
            Backbone.history.navigate(href, true);
        }
    });
    return Application;
});

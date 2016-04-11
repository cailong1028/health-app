/* global define, app */
define([
    'underscore',
    'jquery',
    'underscore.string',
    'backbone',
    //'helpers/pop-view',
    'layoutmanager'
], function(_, $, _s, Backbone/*, PopView*/) {
    'use strict';
    var mainId = '#main';
    var NAV_MODULES_SELECTOR = '#prog-mods';
    var GeneralModel = Backbone.Model.extend({
        url: 'sites',
        attributes: [
            'title',
            'description',
            'logo',
            'timezone'
        ],
        isNew: function() {
            return false;
        }
    });

    // var clickNavModuleAnchor = function(e) {
    //     this.$(NAV_MODULES_SELECTOR + ' li.active').removeClass('active');
    //     $(e.target).parent('li').addClass('active');
    // };
    var LayoutView = Backbone.Layout.extend({
        el: '#body_wrap',
        template: 'templates:main:layout',
        model : new GeneralModel(),
        views: {
        },
        events: {
        },
        initialize: function() {
            this.listenTo(app.vent, 'navbar:active', function(mod) {
                if (this.actived !== mod) {
                    this.actived = mod;
                    this.$(NAV_MODULES_SELECTOR + ' li.active').removeClass('active');
                    this.$(NAV_MODULES_SELECTOR + ' li.' + mod).addClass('active');
                }
            });
        },
        serialize: function() {
            return _.extend(this.model.toJSON(), {authority: app.profile.resourceAuthority});
        },
        beforeRender: function() {
            var done = this.async();
            this.model.fetch().done(_.bind(function() {
                done();
            }, this));
        },
        afterRender: function() {
            this.$(NAV_MODULES_SELECTOR + ' li.' + this.actived).addClass('active');
            this.$('.dropdown-toggle').dropdown();
        },
        /**
        * replace view with name
        * if view already exists, call view.remove function and set it.
        */
        setMainView: function(view) {
            var originView = this.getView(mainId);
            if (originView) {
                if(originView.beforeRemove && _.isFunction(originView.beforeRemove)){
                    originView.beforeRemove();
                }
                originView.remove();
            }
            return this.setView(mainId, view);
        },
        getMainView: function() {
            return this.getView(mainId);
        }
    });
    return LayoutView;
});

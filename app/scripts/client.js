/* global define, app*/
'use strict';
define([
    'underscore',
    'backbone'
], function(_, Backbone) {
    var isPermitted = function( /* permission ... or [permission, ...] */ ) {
        var permissions = coalescePermissions.apply(null, arguments);
        if (permissions.length === 0) {
            return false;
        }
        for (var i = 0; i < permissions.length; i++) {
            if (!this.test(permissions[i])) {
                return false;
            }
        }
        return true;
    };
    var isPermittedAny = function( /* permission ... or [permission, ...] */ ) {
        var permissions = coalescePermissions.apply(null, arguments);
        if (permissions.length === 0) {
            return false;
        }
        for (var i = 0; i < permissions.length; i++) {
            if (this.test(permissions[i])) {
                return true;
            }
        }
        return false;
    };

    var compileClaim = function( /* permission ... or [permission, ....] */ ) {
        var permissions = coalescePermissions.apply(null, arguments);
        if (permissions.length === 0) {return new RegExp('$false^');}

        var compilePermission = function(permission) {
            permission = permission.replace(/(\:\*)+$/, '');
            return permission.split(':').map(function(part) {
                var list = part.split(',').map(function(part) {
                    return compilePart(part);
                });
                switch (list.length) {
                    case 0:
                        return '';
                    case 1:
                        return list[0];
                    default:
                        return '(' + list.join('|') + ')';
                }
            }).join(':');
        };

        var compilePart = function(part) {
            var special = '\\^$*+?.()|{}[]';
            var exp = [];
            for (var i = 0; i < part.length; ++i) {
                var c = part.charAt(i);
                if (c === '?') {
                    exp.push('[^:]');
                } else if (c === '*') {
                    exp.push('[^:]*');
                } else {
                    if (special.indexOf(c) >= 0) {
                        exp.push('\\');
                    }
                    exp.push(c);
                }
            }
            return exp.join('');
        };

        var statements = [];
        for (var i = 0; i < permissions.length; i++) {
            statements.push(compilePermission(permissions[i]));
        }
        var result = statements.join('|');
        if (statements.length > 1) { result = '(' + result + ')';}
        return new RegExp('^' + result + '(\\:.*)*$');
    };

    var considerPermissions = function(/* permission ... or [permission, ....] */) {
        var claim = compileClaim.apply(null, arguments);
        claim.isPermitted = isPermitted;
        claim.isPermittedAny = isPermittedAny;
        return claim;
    };

    var coalescePermissions = function( /* permission ... or [permission, ...] */ ) {
        var permissions = [],
            i;
        for (i = 0; i < arguments.length; i++) {
            if (arguments[i] !== null && arguments[i] !== undefined) {
                permissions = permissions.concat(arguments[i]);
            }
        }
        return permissions;
    };

    var ProfileModel = Backbone.Model.extend({
        url: 'profile'
    });

    var profile = new ProfileModel();
    var Client = function() {};
    Client.prototype = _.extend(Client.prototype, {
        profile: function() {
            return profile;
        },
        fetch: function() {
            return profile.fetch.apply(profile, arguments);
        },
        doBeforeSend: function() {
            // TODO append Authenticated token
        },
        //his 权限判断
        permit: function(action) {
            var actionAuths = app.profile.actionAuthority;
            var i = 0;
            for(; i < actionAuths.length; i++){
                if(action === actionAuths[i].code){
                    return true;
                }
            }
            return false;
        },
        isPermitted: function() {
            if (this.claim === undefined) {
                this.claim = considerPermissions(profile.get('permissions'));
            }
            if (DEBUG) {
                console.log('assert User', profile.get('username'), ' isPermitted', arguments);
            }
            return this.claim.isPermitted.apply(this.claim, arguments);
        },
        isPermittedAny: function() {
            if (this.claim === undefined) {
                this.claim = considerPermissions(profile.get('permissions'));
            }
            if (DEBUG) {
                console.log('assert User', profile.get('username'), ' isPermittedAny', arguments);
            }
            return this.claim.isPermittedAny.apply(this.claim, arguments);
        },
        hasRole: function(value) {
            return _.contains(profile.get('roles'), value);
        },
        hasComponent: function(value) {
            return _.contains(profile.get('components'), value);
        }
    });
    return Client;
});

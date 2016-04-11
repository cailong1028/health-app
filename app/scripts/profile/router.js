/* global define, app */
'use strict';
define([
    'backbone',
    'profile/profile-update-view',
    'profile/profile-finger-view'
], function(Backbone, ProfileUpdateView, ProfileFingerView) {
    var activedLayoutNavigation = function() {
            app.vent.trigger('navbar:active', 'profile');
    };
    var ProfileRouter = Backbone.Router.extend({
        routes: {
            'profile/form': '_profileUpdate',
            'profile/finger': '_profileFinger'
        },
        _profileUpdate: function() {
            activedLayoutNavigation();
            app.$layout.setMainView(new ProfileUpdateView()).render();
        },
        _profileFinger: function(){
            activedLayoutNavigation();
            app.$layout.setMainView(new ProfileFingerView()).render();
        }
    });
    return ProfileRouter;
});

/*global define, debug*/
'use strict';
define([
    'underscore',
    'underscore.string',
    'backbone',
    'profile/profile-finger-model'
], function(_, _s, Backbone, ProfileFingerModel) {
    var ProfileFingerView = Backbone.View.extend({
        template: 'templates:profile:profile-finger',
        events: {
            'click button.cancel': '_clickCancelButton'
        },
        initialize: function() {

        },
        beforeRender: function() {
            //发送指令，通知exe客户端指纹开始注册指纹
            var done = this.async();
            var profileFingerModel = new ProfileFingerModel();
            profileFingerModel.startFingerRegister().done(function(){
                debug('success to start finger register');
                done();
            }).fail(function(){
                $('window').error('Fail to start finger register');
            });
        },
        _clickCancelButton: function(e) {
            e.preventDefault();
            // history回退
            window.history.back(-1);
        },
        _changeInfo: function(message){
            this.$('#finger-register-info').text(message);
        }

    });

    return ProfileFingerView;
});

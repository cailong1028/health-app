/* global define,app,gettext*/
'use strict';
define([
    'underscore',
    'underscore.string',
    'backbone',
    'profile/profile-model',
    'profile/password-model',
    'helpers/sha1'
], function(_, _s, Backbone, ProfileModel, PasswordModel, sha1) {
    var UpdatePasswordView = Backbone.View.extend({
        template: 'templates:profile:update-password',
        events: {
            'submit #form2': '_submitPasswordForm'
        },
        _submitPasswordForm: function(e) {
            e.preventDefault();
            this.$('.error-messages').removeClass('show');
            var passwordModel = new PasswordModel();
            var data = this.$('#form2').serializeObject();
            passwordModel.set(data);
            var that = this;
            // 提取model定义的attributes
            passwordModel.set(_.pick(data, PasswordModel.prototype.attributes));
            if (!passwordModel.isValid()) {
                this.$('#' + passwordModel.validationError).addClass('show');
                return false;
            }
            passwordModel.set('id', app.profile.userInfo.id);
            passwordModel.unset('confirmPassword');
            passwordModel.set('password', sha1(passwordModel.get('password')));
            passwordModel.set('newPassword', sha1(passwordModel.get('newPassword')));
            passwordModel.save({},{validate:false})
                .done(function() {
                    $(window).info(gettext('Reset password successful'));
                    that.render();
                })
                .fail(function(res){
                    if(res.responseJSON && res.responseJSON.type === 'passwordNotMatch'){
                        that.$('#passwordNotMatch').addClass('show');
                    }
                    $(window).info(gettext('Reset password failure'));
                 });
        }
    });
    var ProfileUpdateView = Backbone.View.extend({
        template: 'templates:profile:profile-update',
        events: {
            'click button.submit': '_submitForm',
            'submit #form1': '_submitForm',
            'reset #form1': '_resetForm',
            'click button.cancel': '_clickCancelButton'
        },
        initialize: function() {
            this.listenTo(app.vent, 'update-password:successful', function() {
                this.render();
            });
        },
        beforeRender: function() {

            if (!this.model) {
                var done = this.async();
                this.model = new ProfileModel();
                this.model.set('id', app.profile.userInfo.id);
                this.model.fetch({}, {wait: true}).done(function(){
                    done();
                });
            }
            this.setView('.update-password', new UpdatePasswordView());
        },
        _resetForm: function() {
            this.$('.error-messages').removeClass('show');
        },
        _clickCancelButton: function(e) {
            e.preventDefault();
            // history回退
            window.history.back(-1);
        },
        _submitForm: function(e) {
            e.preventDefault();
            var serObj = _.extend({username: '', worknum: '', mobile: '', memo: ''}, this.$('#form1').serializeObject());
            var data = _.omit(serObj, this.model.idAttribute);
            var model = new ProfileModel({id: this.model.id});
            model.set(data);
            this.$('.error-messages').removeClass('show');
            if (!model.isValid()) {
                this.$('#name_required').addClass('show');
                return;
            }
            // wait true 等待服务器端返回内容，原文大概是这样写的
            // Pass {wait: true} if you'd like to wait for the server before setting the new attributes on the model.
            model.save({}, {wait: true})
                .done(function() {
                    $(window).info(gettext('Update personal info successful'));
                })
                .fail(_.bind(function(resp){
                    var data = resp.responseJSON;
                    if (data.type === 'WorkNumAlreadyExists') {
                        this.$('#alreadyExists_workNum').addClass('show');
                    }
                    else {
                        $(window).info(gettext('Update personal info failure'));
                    }
                },this));
        }
    });


    return ProfileUpdateView;
});

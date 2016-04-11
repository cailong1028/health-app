/* global define*/
'use strict';
define([
    'underscore',
    'backbone',
    'settings/agent-model',
    'profile/reset-password-model'
], function(_, Backbone, AgentModel,ResetPasswordModel) {
        var ResetPasswordView = Backbone.View.extend({
            template: 'templates:profile:reset-password',
            events: {
                'click button.submit': '_submitForm',
                'submit form': '_submitForm',
                'click button.cancel': '_clickCancelButton'
            },
            initialize: function() {
            },
            beforeRender: function() {
                if (!this.model) {
                    var done = this.async();
                    this.model = new AgentModel(this.options);
                    this.model.fetch({}, {wait: true}).done(function(){
                        done();
                    });
                }
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
                this.$('.error-messages').removeClass('show');
                var data = _.omit(this.$('form').serializeObject(), this.model.idAttribute);
                var model = new ResetPasswordModel({id: this.model.id});
                var id = this.model.id;
                model.set(data);
                if (!model.isValid()) {
                    this.$('#' + model.validationError).addClass('show');
                    return;
                }
                model.unset('confirmPassword');
                model.save({}, {validate: false})
                    .done(function() {
                        $(window).info('重置密码成功');
                        Backbone.history.navigate('settings/agents/'+id, true);
                    })
                    .fail(function(){
                        $(window).info('重置密码失败！');
                    });
            }
        });


    return ResetPasswordView;
});

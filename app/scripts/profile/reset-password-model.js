/* global define */
'use strict';
define([
    'underscore',
    'backbone'
], function(_, Backbone) {
    var PasswordModel = Backbone.Model.extend({
        urlRoot: 'profile/reset-password',
        attributes: [
            'id',
            'newPassword',//新密码
            'confirmPassword'//确认密码
        ],
        validate: function(attrs) {
            // 新密码不存在
            if (!attrs.password) {
                return 'password_required';
            }
            if (attrs.password.trim() === '') {
                return 'password_required';
            }
            //新密码不能小于6位
            if(attrs.password.length < 6) {
                return 'passwordMinError_required';
            }
            //新密码不能大于64位
            if(attrs.password.length > 64) {
                return 'passwordMaxError_required';
            }
            // 确认密码不存在
            if (!attrs.confirmPassword) {
                return 'confirmPassword_required';
            }
            //确认密码不能小于6位
            if(attrs.confirmPassword.length < 6) {
                return 'confirmPasswordMinError_required';
            }
            //确认密码不能大于64位
            if(attrs.confirmPassword.length > 64) {
                return 'confirmPasswordMaxError_required';
            }
            // 如果新密码与确认密码不相同
            if (attrs.password !== attrs.confirmPassword) {
                return 'confirmPasswordError_required';
            }
        }
    });
    return PasswordModel;
});

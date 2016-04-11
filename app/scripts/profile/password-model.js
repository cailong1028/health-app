/* global define */
'use strict';
define([
    'underscore',
    'backbone'
], function(_, Backbone) {
    var PasswordPattern=/^[a-zA-Z0-9!@#\$%\^&\*\(\)-=_\+\[\]\{\}\|;':",\.\/<>\?`~]*$/;
    var PasswordModel = Backbone.Model.extend({
        url: function(){
            return 'user/'+this.get('id')+'/update-password';
        },
        attributes: [
            'id',
            'password',//旧密码
            'newPassword',//新密码
            'confirmPassword'//确认密码
        ],
        validate: function(attrs) {
            //密码不存在
            if (!attrs.password) {
                return 'password_required';
            }
            //密码不符合定义的规则
            if (!PasswordPattern.test(attrs.password)) {
                return 'passwordError_required';
            }
            //密码不能小于6位
            if(attrs.password.length<6){
                return 'passwordMinError_required';
            }
            //密码不能大于32位
            if(attrs.password.length>32){
                return 'passwordMaxError_required';
            }
            // 新密码不存在
            if (!attrs.newPassword) {
                return 'newPassword_required';
            }
            //新密码不符合定义的规则
            if (!PasswordPattern.test(attrs.newPassword)) {
                return 'newPassword_required';
            }
            //密码不能小于6位
            if(attrs.newPassword.length<6){
                return 'newPasswordMinError_required';
            }
            //密码不能大于32位
            if(attrs.newPassword.length>32){
                return 'newPasswordMaxError_required';
            }
            // 确认密码不存在
            if (!attrs.confirmPassword) {
                return 'confirmPassword_required';
            }
            //确认密码不能小于6位
            if(attrs.confirmPassword.length<6){
                return 'confirmPasswordMinError_required';
            }
            //确认密码不能大于32位
            if(attrs.confirmPassword.length>32){
                return 'confirmPasswordMaxError_required';
            }
            // 如果email存在，但是检查没有通过
            if (attrs.newPassword!==attrs.confirmPassword) {
                return 'confirmPasswordError_required';
            }
        }
    });
    return PasswordModel;
});

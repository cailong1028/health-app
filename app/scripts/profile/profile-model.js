/* global define*/
'use strict';
define([
    'underscore',
    'underscore.string',
    'backbone'
], function(_, _s, Backbone) {
    /*
    address: 地址
    address2: 地址2
    avatar: 头像
    dateFormat: 日期格式化
    dateTimeFormat: 日期时间格式化
    id: id
    language: 语言
    mobile: 手机
    name: 姓名
    username: 用户名
    */
    var ProfileModel = Backbone.Model.extend({
        urlRoot: 'user',
        attributes: [
            'id',
            'username', // 姓名
            'loginname', // 邮箱
            'avatar', // 头像
            'mobile'
        ],
        validate: function(attrs) {
            //姓名不存在
            if (!attrs.username) {
                return 'name_required';
            }
            //姓名为空格
            if (_s.trim(attrs.username) === '') {
                return 'name_required';
            }
            // 如果email不存在
            if (!attrs.loginname) {
                return 'userName_required';
            }
            // 如果email存在，但是检查没有通过
            /*if (attrs.loginname && !app.validateEmail(attrs.username)) {
                return 'invalidation_userName';
            }*/
        }
    });
    return ProfileModel;
});

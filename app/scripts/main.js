/* global define */
'use strict';
define([
    'underscore',
    'backbone',
    'client',
    'app',
    'layout-view'
], function (_, Backbone, Client, Application, LayoutView) {

    window.debug = function(info){
        if(DEBUG && _.isString(info)){
            console.log(info);
        }
    };

    var app = window.app = new Application();
    var client = window.client = new Client();
    // 获取用户信息
    app.vent.on('initialize:before', function() {
        // 理论上来说这玩意时延时加载的...
        // body...
        app.loadModules([
            'home',
            'profile',
            'hypertension'
        ]).done(function() {
            Backbone.history.start({ pushState: true });
        });
    });
    client.fetch().done(function(profile) {
        app.profile = profile;
        app.$layout = new LayoutView();
        app.$layout.render();
        app.datetimeFormat = 'YYYY-MM-DD HH:mm:ss';
        app.dateFormat = 'YYYY-MM-DD';
        // 首先加载语言文件
        console.log('app start');
        app.start();
    }).fail(function(){
        //go to login
    });
});

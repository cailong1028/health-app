/* global define, app */
'use strict';
define([
    'backbone',
    'home/home-view'
], function (Backbone,HomeView) {
    var IndexRouter = Backbone.Router.extend({
        routes: {
            '': 'home',
            'home\.*': 'home'
        },
        // 登录首页
        home: function() {
            app.vent.trigger('navbar:active', 'home');
            app.$layout.setMainView(app.homeView = new HomeView()).render();
        }
    });
    return IndexRouter;
});

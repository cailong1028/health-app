/**
 * Created by cailong on 2016/3/2.
 */
/*global define*/
'use strict';
define([
    'underscore',
    'backbone'
],function(_, Backbone){
    var PopView = Backbone.View.extend({
        template: 'templates:main:pop',
        className: 'pop-view modal fade',
        views: {
        },
        initialize: function(){
        },
        afterRender: function(){
        },
        hide: function() {
            this.$el.modal('hide');
        },
        show: function() {
            var that = this;
            //this.$el.appendTo('body');
            this.$el.modal('show');
            this.$el.on('hidden.bs.modal', function() {
                _.delay(function() {
                    that.remove();
                }, 300);
            });
            _.delay(_.bind(function() {
                this.$('button.cancel').focus();
            }, this), 300);
        }
    });
    return PopView;
});

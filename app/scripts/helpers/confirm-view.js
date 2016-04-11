/* global define */
'use strict';
define([
    'jquery',
    'underscore',
    'backbone',
    'bootstrap'
], function($, _, Backbone) {
    // 默认的事件
    var _confirmCallback = function(view) {
        view.hide();
    };
    // 默认的事件
    var _cancelCallback = function(view) {
        view.hide();
    };
    var ConfirmView = Backbone.View.extend({
        manage: true,
        template: 'templates:main:confirm',
        className: 'modal fade',
        events: {
            'keypress form': '_keypressForm',
            'submit form': '_submitForm',
            'reset form': '_resetForm'
        },
        _text: {
            title: 'Confirm Title',
            confirmButton: 'Submit Button',
            cancelButton: 'Cancel Button',
            content: 'Confirm Message'
        },
        initialize: function(o) {
            o = o || {};
            //默认confirm，可以设置type为nofity
            this.type = o.type || 'confirm';
            this._text = _.extend({}, this._text, o.text);
            this._confirmCallback = o.callback || o.confirmCallback || _confirmCallback;
            this._cancelCallback = o.cancelCallback || _cancelCallback;
        },
        serialize: function() {
            var messages = this._text;
            return {
                title: _.result(messages, 'title'),
                confirmButton: _.result(messages, 'confirmButton'),
                cancelButton: _.result(messages, 'cancelButton'),
                content: _.result(messages, 'content')
            };
        },
        afterRender: function() {
            if(this.type === 'confirm'){
                this.$('#cancel').removeClass('hide');
            }
            this.$el.modal({
                show: false
            });
        },
        // 确定按钮
        _submitForm: function(e) {
            e.preventDefault();
            this.hide();
            this._confirmCallback({
                hide: _.bind(function() {
                    this.hide();
                }, this)
            });
        },
        // 取消按钮
        _resetForm: function(e) {
            e.preventDefault();
            this.hide();
            this._cancelCallback({
                hide: _.bind(function() {
                    this.hide();
                }, this)
            });
        },
        // 点击ESC时消除modal框
        _keypressForm: function(e) {
            if (e.keyCode === 27) {
                e.preventDefault();
                this._cancelCallback({
                    hide: _.bind(function() {
                        this.hide();
                    }, this)
                });
            }
        },
        hide: function() {
            this.$el.modal('hide');
        },
        show: function() {
            var that = this;
            this.$el.appendTo('body');
            this.$el.modal('show');
            this.$el.on('hidden.bs.modal', function() {
                _.delay(function() {
                    that.remove();
                }, 300);
            });
            _.delay(_.bind(function() {
                this.$('button.ok').focus();
            }, this), 300);
        }
    });
    return ConfirmView;
});

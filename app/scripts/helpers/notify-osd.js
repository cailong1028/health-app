/**
 * Created by cailong on 2015/2/4.
 * 信息提示插件
 */
/*global define*/
'use strict';
/*global gettext*/
define([
    'underscore.string',
    'jquery'
], function (_s, $) {
    var init = function (type) {
        return function(text){
            base(text, type);
        };
    };
    var base = function(text, type){
        if(text && _s.trim(text)  !== ''){
            text = gettext(text);
        }
        var animateTime = 10000;
        var parent = $('body');
        var $info = parent.find('.information-layer');
        var $alert;
        if ($info.length > 0) {
            $alert = $info.find('.alert');
            $alert.removeClass();
            $alert.addClass('alert ' + type);
            $alert.find('span').text(text);
            $alert.show();
            if($alert.is(':animated')){
                $alert.stop();
            }
            $alert.animate({'opacity': '1'},0, function(){
                $(this).animate({
                    opacity: 0.0
                }, animateTime, function(){
                    $(this).hide();
                });
            });
        } else {
            var close = $('<a class="close" href="#"></a>');
            close.click(function(e){
                e.preventDefault();
                e.stopPropagation();
                $(e.target).parent().stop();
                //$(e.target)
                $(e.target).parent().hide();
            });
            $alert = $('<div class="alert '+(type || 'info')+' notice" id="notice" style="display: block;text-align: center;"><span>'+text+'</span></div>');
            $info = $('<div class="information-layer"></div>');
            $alert.append(close);
            $info.append($alert);
            parent.prepend($info);
            $alert.hover(function(){
                $(this).animate({'opacity': '1'});
                $(this).stop();
            },function(){
                $(this).animate({
                    opacity: 0.0
                }, animateTime, function(){
                    $(this).hide();
                });
            });
            $alert.animate({
                opacity: 0.0
            }, animateTime, function(){
                $(this).hide();
            });
        }
    };
    $.fn.info = init('info');
    $.fn.error = init('error');
    $.fn.succ = init('succ');
});

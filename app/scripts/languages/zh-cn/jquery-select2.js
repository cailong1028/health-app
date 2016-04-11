/* global require */
require([
    'jquery-select2'
], function(select2) {
    $.fn.select2.locales = [];
    $.fn.select2.locales['_CN'] = {
        formatMatches: function (matches) { if (matches === 1) { return "请选择"; } return "请选择"; },
        formatNoMatches: function () { return "没有找到相应内容"; },
        formatAjaxError: function (jqXHR, textStatus, errorThrown) { return "查找失败"; },
        formatInputTooShort: function (input, min) {  return "请输入一个或更多字符"; },
        formatInputTooLong: function (input, max) { return "输入内容超出限制长度"; },
        formatSelectionTooBig: function (limit) { return "最多只能添加" + limit + "个"; },
        formatLoadMore: function (pageNumber) { return "正在加载"; },
        formatSearching: function () { return "正在加载"; }
    }
    $.extend($.fn.select2.defaults, $.fn.select2.locales['_CN']);
});
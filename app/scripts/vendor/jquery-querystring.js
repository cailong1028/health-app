/* global define */
'use strict';
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        root.QueryString = factory(jQuery);
    }
} (this, function($) {
    var QueryString = {};

    QueryString.parse = function (str) {
        if (arguments.length === 0) {
            str = window.location.href;
            var idx = str.indexOf('?');
            str = idx > 0 ? str.substring(idx + 1): '';
        } else if (typeof str !== 'string') {
            return {};
        }

        str = $.trim(str).replace(/^(\?|#)/, '');

        if (!str) {
            return {};
        }
        var ret = {};
        var params = $.trim(str).split('&');
        $(params).each(function(index, param) {
            var parts = param.replace(/\+/g, ' ').split('=');
            var key = parts[0];
            var val = parts[1];

            key = decodeURIComponent(key);
            // missing `=` should be `null`:
            // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
            val = val === undefined ? null : decodeURIComponent(val);

            if (!ret.hasOwnProperty(key)) {
                ret[key] = val;
            } else if ($.isArray(ret[key])) {
                ret[key].push(val);
            } else {
                ret[key] = [ret[key], val];
            }
        });
        return ret;
    };

    QueryString.stringify = function (obj) {
        var params = [];
        var format = function(key, value) {
            return encodeURIComponent(key) + (value !== undefined ? ('=' + encodeURIComponent(value)): '');
        }
        $.each(obj, function(key, val) {
            if (Array.isArray(val)) {
                $.each(val, function (index, val2) {
                    params.push(format(key, val2));
                });
                return;
            }
            params.push(format(key, val));
        });
        return params ? params.join('&') : '';
    };
    $.QueryString = QueryString;
    return QueryString;
}));

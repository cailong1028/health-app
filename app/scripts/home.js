/* global define */
'use strict';
define([
    'home/router'
], function(IndexRouter) {
    return function() {
        return new IndexRouter();
    };
});

/*
* @Author: chongzhen
* @Date:   2015-03-19 15:55:35
* @Last Modified by:   chongzhen
* @Last Modified time: 2015-03-26 14:06:03
*/

/* global define */
'use strict';
define([
    'underscore',
    'jquery',
    'backbone'
], function(_, $, Backbone) {
    var HomeActivitiesModel = Backbone.Model.extend({});
    var HomeActivitiesCollection = Backbone.Collection.extend({
        url: 'tickets/activities',
        model: HomeActivitiesModel
    });
    return HomeActivitiesCollection;
});
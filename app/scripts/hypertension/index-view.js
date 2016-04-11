/**
 * Created by cl
 */
/*global define*/
'use strict';
define([
    'underscore',
    'backbone'
], function(_, Backbone){

    var IndexView = Backbone.View.extend({
        template: 'templates:hypertension:index'
    });
    return IndexView;
});

/**
 * Created by cl on 2016/3/8.
 */
/*global define*/
'use strict';
define([
    'backbone'
], function(Backbone){
    var ProfileFingerModel = Backbone.Model.extend({
        urlRoot: 'finger/register',
        startFingerRegister: function(){
            this.url = function(){
                return 'finger/register/start';
            };
            return this.save();
        },
        stopFingerRegister: function(){
            this.url = function(){
                return 'finger/register/stop';
            };
            return this.save();
        }
    });
    return ProfileFingerModel;
});

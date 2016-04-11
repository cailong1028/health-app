/**
 * Created by cl on 2015/12/23.
 */
'use strict';
/*global define*/
define([
    'hypertension/router'
], function(StatisticsRouter){
    return function(){
        return new StatisticsRouter();
    };
});

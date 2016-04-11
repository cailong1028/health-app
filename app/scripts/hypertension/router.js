/**
 * Created by cl
 */
'use strict';
/*global define, app*/
define([
    'backbone',
    'hypertension/index-view'
], function(Backbone, IndexView){
    var activedLayoutNavigation = function() {
        app.vent.trigger('navbar:active', 'hypertension');
    };
    var HypertensionRouter = Backbone.Router.extend({
        routes: {
            'hypertension': '_index'
        },
        _index: function(){
            activedLayoutNavigation();
            app.$layout.setMainView(new IndexView()).render();
        }
    });

    return HypertensionRouter;
});

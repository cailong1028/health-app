/* global require */
'use strict';
require.config({
    paths: {
        jquery: '../../bower_components/jquery/dist/jquery',
        underscore: '../../bower_components/underscore/underscore',
        'underscore.string': '../../bower_components/underscore.string/dist/underscore.string',
        backbone: '../../bower_components/backbone/backbone',
        layoutmanager: '../../bower_components/layoutmanager/backbone.layoutmanager.js',
        //'backbone.localStorage': 'vendor/backbone.localStorage',

        // bootstrap
        bootstrap: '../../bower_components/bootstrap-sass-official/assets/javascripts/bootstrap',

        // template
        // 'handlebars.runtime': '../../bower_components/handlebars/handlebars.runtime.amd',
        'handlebars': '../../bower_components/handlebars/handlebars.amd',

        //vendor
        'bootstrap-datetimepicker': '/libs/jslib/bootstrap-datetimepicker/bootstrap-datetimepicker4',
        'bootstrap-pagination' : '/libs/jslib/bootstrap-pagination/bootstrap-pagination',
        // bootstrapSwitch: '../../bower_components/bootstrap-switch/dist/js/bootstrap-switch',
        // custom jquery plugin
        'jquery.serialize-object': 'vendor/jquery.serialize-object',
        'jed': '../../bower_components/jed/jed',

        'moment': '../../bower_components/momentjs/moment',
        'moment-timezone': '../../bower_components/moment-timezone/builds/moment-timezone-with-data',

        // file uploader
        'jquery-file-upload': '../../bower_components/jquery-file-upload/js/jquery.fileupload',
        'jquery.iframe-transport': '../../bower_components/jquery-file-upload/js/jquery.iframe-transport',
        'jquery.ui.widget': '../../bower_components/jquery-file-upload/js/vendor/jquery.ui.widget',
        // end
        'dropzone': '/libs/jslib/dropzone/dropzone-amd-module',

        'numeral': '../../bower_components/numeral/numeral',
        // editor
        'bootstrap.wysihtml5': '/libs/jslib/bootstrap-wysihtml5/bootstrap.wysihtml5',
        'bootstrap.wysihtml5.templates': '/libs/jslib/bootstrap-wysihtml5/bootstrap.wysihtml5.templates',
        'bootstrap.wysihtml5.commands': '/libs/jslib/bootstrap-wysihtml5/bootstrap.wysihtml5.commands',
        'wysihtml5': '/libs/jslib/bootstrap-wysihtml5/wysihtml5',
        'rangy': '/libs/jslib/rangy/rangy-core',
        'rangy-selectionsaverestore': '/libs/jslib/rangy/rangy-selectionsaverestore',

        'jquery-select2': '/libs/jslib/jquery-select2/jquery-select2',
        //此文件不再更新
        'socket.io': '/libs/jslib/jquery-select2/jquery-select2'
    },
    shim: {
        bootstrap: {
            deps: ['jquery']
        },
        'underscore.string': {
            deps: ['underscore']
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        layoutmanager: {
            deps: ['backbone']
        },
        underscore: {
            exports: '_'
        },
        // handlebars: {
        //     exports: 'Handlebars'
        // },
        // vendor
        'bootstrap-datetimepicker': {
            deps: [
                'jquery',
                'moment',
                'bootstrap'
            ]
        },
        'jquery-file-upload': {
            deps: [
                'jquery',
                'jquery.ui.widget',
                'jquery.iframe-transport'
            ]
        },
        'jquery.serialize-object': {
            deps: ['jquery']
        },
        'bootstrap.wysihtml5': {
            deps: ['jquery', 'bootstrap']
        },
        'rangy': {
            exports: 'rangy'
        },
        'rangy-selectionsaverestore': {
            deps: ['rangy']
        },
        'jquery-select2': {
            deps: [
                'jquery'
            ]
        }
    }
});
(function (document) {
    var root = this;
    root.DEBUG = true;
    var base = document.querySelector('#options');
    var language = 'languages/' + navigator.language.toLowerCase();
    var assets = base.dataset.assetsLocation ? base.dataset.assetsLocation : '';
    // 正式环境 将使用launcher加载js和资源。
    require.config({
        // 改为CDN地址
        // By default load any module IDs from js/lib
        baseUrl: assets + '/scripts',
        shim: {
            'main': {
                deps: [language]
            }
        }
    });
    require(['main']);
}).call(window, document);

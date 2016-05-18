 /*define require*/
'use strict';
(function (document) {
    var base = document.querySelector('#options');
    // disable multi language require;
    //var language = 'languages/' + navigator.language.toLowerCase();
    var language = 'languages/zh-cn';
    var cdnBasePath = base.dataset.cdnBasePath;
    // 正式环境 将使用launcher加载js和资源。
    require.config({
        // 改为CDN地址
        //By default load any module IDs from js/lib
        baseUrl: base.dataset.assetsLocation + '/scripts',
        paths: {
            'jquery': 'http://'+cdnBasePath+'/jslib/jquery/jquery.min',
            //'jquery': 'http://libs.baidu.com/jquery/2.0.0/jquery.min',
            'underscore': 'http://'+cdnBasePath+'/jslib/underscore/underscore.min',
            'underscore.string': 'http://'+cdnBasePath+'/jslib/underscore.string/underscore.string.min',
            'backbone': 'http://'+cdnBasePath+'/jslib/backbone/backbone.min',
            'layoutmanager': 'http://'+cdnBasePath+'/jslib/layoutmanager/backbone.layoutmanager.min',

            // bootstrap
            'bootstrap': 'http://'+cdnBasePath+'/jslib/bootstrap/bootstrap.min',
            //'bootstrap': 'http://libs.baidu.com/bootstrap/3.0.3/js/bootstrap.min',

            // template
            'handlebars': 'http://'+cdnBasePath+'/jslib/handlebars/handlebars.amd.min',

            //vendor
            'bootstrap-datetimepicker': 'http://'+cdnBasePath+'/jslib/bootstrap-datetimepicker/bootstrap-datetimepicker4',
            'bootstrap-pagination' : 'http://'+cdnBasePath+'/jslib/bootstrap-pagination/bootstrap-pagination.min',
            // custom jquery plugin
            'jquery.serialize-object': 'http://'+cdnBasePath+'/jslib/jquery.serialize-object',
            'jed': 'http://'+cdnBasePath+'/jslib/jed/jed.min',

            'moment': 'http://'+cdnBasePath+'/jslib/moment/moment.min',
            'moment-timezone': 'http://'+cdnBasePath+'/jslib/moment-timezone/moment-timezone-with-data-2010-2020.min',

            // file uploader
            'jquery-file-upload': 'http://'+cdnBasePath+'/jslib/jquery-file-upload/js/jquery.fileupload',
            'jquery.iframe-transport': 'http://'+cdnBasePath+'/jslib/jquery-file-upload/js/jquery.iframe-transport',
            // end

            'dropzone': 'http://'+cdnBasePath+'/jslib/dropzone/dropzone-amd-module.min',

            'numeral': 'http://'+cdnBasePath+'/jslib/numeral/numeral.min',
            // editor
            'bootstrap.wysihtml5': 'http://'+cdnBasePath+'/jslib/bootstrap-wysihtml5/bootstrap.wysihtml5.min',
            'bootstrap.wysihtml5.templates': 'http://'+cdnBasePath+'/jslib/bootstrap-wysihtml5/bootstrap.wysihtml5.templates.min',
            'bootstrap.wysihtml5.commands': 'http://'+cdnBasePath+'/jslib/bootstrap-wysihtml5/bootstrap.wysihtml5.commands.min',
            'wysihtml5': 'http://'+cdnBasePath+'/jslib/bootstrap-wysihtml5/wysihtml5.min',
            'rangy': 'http://'+cdnBasePath+'/jslib/rangy/rangy-core.min',
            'rangy-selectionsaverestore': 'http://'+cdnBasePath+'/jslib/rangy/rangy-selectionsaverestore.min',

            'jquery-select2': 'http://'+cdnBasePath+'/jslib/jquery-select2/jquery-select2.min',
            'Blob': 'http://'+cdnBasePath+'/jslib/Blob/Blob',
            'FileSaver': 'http://'+cdnBasePath+'/jslib/FileSaver/FileSaver.min',
            'amcharts': 'http://'+cdnBasePath+'/jslib/amcharts2/amcharts/amcharts',
            'jqueryui': 'http://'+cdnBasePath+'/jslib/jqueryui/jquery-ui.min',
            'socket.io': 'http://'+cdnBasePath+'/jslib/socket.io/socket.io-1.3.7'
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
                deps: ['jquery']
            },
            main: {
                deps: [language]
            },
            'jqueryui': {
                deps: ['jquery']
            },
            'amcharts': {
                exports: 'AmCharts'
            }
        }
    });
    window.DEBUG = true;
    require(['main']);
}).call(window, document);

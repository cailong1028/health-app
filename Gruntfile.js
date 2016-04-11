'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'


module.exports = function(grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // it may be enabled inside your Gruntfile with this line of JavaScript
    grunt.loadNpmTasks('grunt-connect-proxy');

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // for express
    var path = require('path');

    //grunt.loadNpmTasks('grunt-connect-prism');
    var pushState = require('grunt-connect-pushstate/lib/utils').pushState;
    // Configurable paths
    var config = {
        app: 'app',
        dist: 'dist',
        healthdist: '../health/public/healthapp'
    };
    grunt.config.set('buildId', 'devlopment');
    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        config: config,



        // Watches files for changes and runs tasks based on the changed files
        watch: {
            // bower: {
            //     files: ['bower.json'],
            //     tasks: ['bowerInstall']
            // },
            js: {
                files: ['<%= config.app %>/scripts/{,*/}*.js'],
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            jstest: {
                files: ['test/spec/{,*/}*.js'],
                tasks: ['test:watch']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            sass: {
                files: [
                    '<%= config.app %>/styles/{,*/}*.{scss,sass}'
                ],
                tasks: ['sass:server', 'autoprefixer']
            },
            styles: {
                files: ['<%= config.app %>/styles/{,*/}*.css'],
                tasks: ['newer:copy:styles', 'autoprefixer']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= config.app %>/{,*/}*.html',
                    '<%= config.app %>/images/{,*/}*',
                    '.tmp/styles/{,*/}*.css'
                ]
            },
            // add express watch
            // express: {
            //     files: ['express/*.js'],
            //     tasks: ['express:api'],
            //     options: {
            //         spawn: false
            //     }
            // },
            // add handlebars watch
            handlebars: {
                files: [
                    'templates/{,*/}*.hbs'
                ],
                tasks: ['handlebars']
            }

        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                open: false,
                livereload: 35729,
                // Change this to '0.0.0.0' to access the server from outside
                hostname: '0.0.0.0'
            },
            livereload: {
                options: {
                    base: [
                        '.tmp',
                        '<%= config.app %>'
                    ],
                    // jshint unused:true
                    middleware: function(connect, options) {
                    // jshint unused:false
                        // inject a custom middleware into the array of default middlewares
                        var middlewares = [];
                        // CORS
                        middlewares.push(function(req, res, next) {
                            res.setHeader('Access-Control-Allow-Origin', '*');
                            res.setHeader('Access-Control-Allow-Methods', '*');
                            next();
                        });

                        /*
                        var directory = options.directory || options.base[options.base.length - 1];
                        options.base.forEach(function(base) {
                            // Serve static files.
                            middlewares.push(connect.static(base));
                        });
                        // Make directory browse-able.
                        middlewares.push(connect.directory(directory));
                        */
                        return middlewares.concat([
                            require('grunt-connect-prism/middleware'),
                            pushState('/index.html'),
                            connect.static('.tmp'),
                            connect.static('build'),
                            connect().use('/bower_components', connect.static('bower_components')),
                            connect.static(config.app),
                            connect.static('libs')
                        ]);
                    }
                }
            },
            test: {
                options: {
                    open: false,
                    port: 9001,
                    hostname: 'localhost',
                    middleware: function(connect) {
                        return [
                            connect.static('.tmp'),
                            connect.static('test'),
                            connect().use('/bower_components', connect.static('./bower_components')),
                            connect.static(config.app),
                            connect.static('libs')
                        ];
                    }
                }
            },
            dist: {
                options: {
                    livereload: false,
                    keepalive:true,
                    middleware: function(connect, options, middlewares) {
                        return [
                            // Include the proxy first
                            connect().use('/pcmsapp', connect.static('dist')),
                            connect.static('libs')
                        ].concat(middlewares);
                    }
                }
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        'pcmsapp-*.zip',
                        '.tmp',
                        '<%= config.dist %>/*',
                        '!<%= config.dist %>/.git*'
                    ]
                }]
            },
            //pcmsdist
            //直接写文件夹的方式, Cannot delete files outside the current working directory
            //clnhispump: '<%= config.pcmsdist %>',
            clnhispump: {
                files: [{
                    dot: true,
                    src: [
                        '<%= config.pcmsdist %>/**/*'
                    ]
                }]
            },
            server: '.tmp'
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= config.app %>/scripts/{,*/}*.js',
                '!<%= config.app %>/scripts/vendor/*',
                '!<%= config.app %>/scripts/helpers/amcharts.js',
                '!<%= config.app %>/scripts/helpers/tableExport.js',
                '!<%= config.app %>/scripts/helpers/sha1.js',
                'test/spec/{,*/}*.js'
            ]
        },
            // The API that we are going to use grunt-connect-prism with
        express: {
            server: {
                options: {
                    port: 9090,
                    server: path.resolve('./express/index')
                    // livereload: true,
                    // serverreload: true
                }
            }
        },
        prism: {
            options: {
                mocksPath: './mocks',
                host: 'localhost',
                port: 9090
            },
            server: {
                options: {
                    mode: 'proxy',
                    context: '/api'
                }
            }
        },
        // Mocha testing framework configuration options
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: [
                        'http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/index.html'
                    ]
                }
            }
        },



        // Compiles Sass to CSS and generates necessary files if requested
        sass: {
            options: {
                includePaths: [
                    'bower_components',
                    'app/styles/'
                ],
                imagePath: '/images',
                sourceMap: true
            },
            server: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/styles',
                    src: ['*.scss'],
                    dest: '.tmp/styles',
                    ext: '.css'
                }]
            }
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '{,*/}*.css',
                    dest: '.tmp/styles/'
                }]
            }
        },
        // Renames files for browser caching purposes
        rev: {
            dist: {
                files: {
                    src: [
                        '!<%= config.dist %>/scripts/vendor/{,*/}*.js',
                        '<%= config.dist %>/scripts/{,*/}*.js',
                        '<%= config.dist %>/styles/{,*/}*.css',
                        '<%= config.dist %>/images/{,*/}*.*',
                        '<%= config.dist %>/styles/fonts/{,*/}*.*',
                        '<%= config.dist %>/*.{ico,png}'
                    ]
                }
            }
        },

        requirejs: {
            options: {
                baseUrl: '<%= config.app %>/scripts',
                optimize: 'none',
                uglify: {
                    // jshint -W106
                    toplevel: false,
                    ascii_only: true,
                    beautify: false,
                    max_line_length: 1000,
                    // jshint +W106
                    //How to pass uglifyjs defined symbols for AST symbol replacement,
                    //see "defines" options for ast_mangle in the uglifys docs.
                    defines: {
                        DEBUG: ['name', 'false']
                    },
                    //Custom value supported by r.js but done differently
                    //in uglifyjs directly:
                    //Skip the processor.ast_mangle() part of the uglify call (r.js 2.0.5+)
                    // no_mangle: true
                },
                // TODO: Figure out how to make sourcemaps work with grunt-usemin
                // https://github.com/yeoman/grunt-usemin/issues/30
                // generateSourceMaps: true,
                // required to support SourceMaps
                // http://requirejs.org/docs/errors.html#sourcemapcomments
                preserveLicenseComments: false,
                removeCombined: true,
                useStrict: true,
                // wrap: true,
                done: function(done, output) {
                    var duplicates = require('rjs-build-analysis').duplicates(output);

                    if (Object.keys(duplicates).length > 0) {
                        grunt.log.subhead('Duplicates found in requirejs build:');
                        for (var key in duplicates) {
                            grunt.log.error(duplicates[key] + ': ' + key);
                        }
                        return done(new Error('r.js built duplicate modules, please check the excludes option.'));
                    } else {
                        grunt.log.success('No duplicates found!');
                    }
                    done();
                }
            },
            dist : {
                options: {
                    paths: {
                        'templates': '../../.tmp/scripts/templates'
                    },
                    modules: [{
                        name: 'main',
                        include: [
                            'app',
                            //写在这里的文件会打进main，不写则以单独的文件的形式存在
                            'helpers/confirm-view',
                            'helpers/pop-view',
                            'templates/main',
                            'templates/home',
                            'home',
                            // 个人信息
                            'templates/profile',
                            'profile',
                            'templates/hypertension',
                            'hypertension',
                        ],
                        exclude: [
                            'jquery',
                            'handlebars',
                            'bootstrap',
                            'bootstrap.wysihtml5',
                            'jquery-file-upload',
                            'underscore',
                            'backbone',
                            'layoutmanager',
                            'bootstrap-datetimepicker',
                            'bootstrap-pagination',
                            'moment',
                            'moment-timezone',
                            'underscore.string',
                            'jquery-select2',
                            'numeral',
                            'dropzone'
                        ]
                    }, {
                        name: 'languages/zh-cn',
                        exclude: [
                            'jquery',
                            'moment',
                            'handlebars',
                            'dropzone',
                            'jquery-select2',
                            'jed',
                            'bootstrap',
                            'bootstrap.wysihtml5'
                        ]
                    }],
                    dir: '<%= config.dist %>/scripts/',
                    mainConfigFile: 'build/scripts/production-config.js'
                }
            }
        },
        // Replace script tag in index.html, to call require.js from new path using grunt-regex-replace plugin
        'regex-replace': {
            dist: {
                src: ['<%= config.dist %>/*.html'],
                actions: [{
                    name: 'dev',
                    search: '<base(.*)data-env="dev"(.*)>',
                    replace: function(data) {
                        return data.replace('data-env="dev"', 'data-revision="' + grunt.config.process('<%= meta.revision %>') + '"');
                    },
                    flags: 'g'
                // }, {
                //     name: 'hook-to-main',
                //     search: 'scripts/hook.js',
                //     replace: function() {
                //         return 'scripts/main.js';
                //     },
                //     flags: 'g'
                }]
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            options: {
                dest: '<%= config.dist %>'
            },
            html: '<%= config.app %>/*.html'
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            options: {
                assetsDirs: ['<%= config.dist %>',
                    '<%= config.dist %>/images'
                ]
            },
            html: ['<%= config.dist %>/{,*/}*.html'],
            css: ['<%= config.dist %>/styles/{,*/}*.css']
        },
        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/images',
                    src: '{,*/}*.{gif,jpeg,jpg,png}',
                    dest: '<%= config.dist %>/images'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= config.dist %>/images'
                }]
            }
        },
        htmlmin: {
            dist: {
                options: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeCommentsFromCDATA: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.dist %>',
                    src: '{,*/}*.html',
                    dest: '<%= config.dist %>'
                }]
            }
        },

        // By default, your `index.html`'s <!-- Usemin block --> will take care of
        // minification. These next options are pre-configured if you do not wish
        // to use the Usemin blocks.
        // cssmin: {
        //     dist: {
        //         files: {
        //             '<%= config.dist %>/styles/main.css': [
        //                 '.tmp/styles/{,*/}*.css',
        //                 '<%= config.app %>/styles/{,*/}*.css'
        //             ]
        //         }
        //     }
        // },
        // uglify: {
        //     dist: {
        //         files: {
        //             '<%= config.dist %>/scripts/scripts.js': [
        //                 '<%= config.dist %>/scripts/scripts.js'
        //             ]
        //         }
        //     }
        // },
        // 赞时还不用处理遗留浏览器
        concat: {
            // wysihtml: {
            //     files: [{
            //         dest: '.tmp/scripts/vendor/wysihtml.js',
            //         src: [
            //             'app/scripts/vendor/wysihtml/src/editor.js'
            //         ]
            //     }]
            // }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            serve: {
                files: [{
                    expand: true,
                    cwd: 'bower_components/fontawesome/fonts',
                    dest: '.tmp/styles/fonts',
                    src: [
                        'fontawesome-webfont.*'
                    ]
                }, {
                    expand: true,
                    cwd: 'bower_components/bootstrap-sass-official/assets/fonts/bootstrap',
                    dest: '.tmp/styles/fonts',
                    src: [
                        'glyphicons-halflings-regular.*'
                    ]
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        'images/{,*/}*.webp',
                        '{,*/}*.html',
                        'styles/fonts/{,*/}*.*'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images/generated',
                    dest: '<%= config.dist %>/images/generated',
                    src: [
                        '*.png'
                    ]
                }]
            },
            styles: {
                expand: true,
                dot: true,
                cwd: '<%= config.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            },
            cpthealth: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: 'dist',
                    dest: '<%= config.healthdist %>',
                    src: ['**/*']
                }]
            }
        },


        // Generates a custom Modernizr build that includes only the tests you
        // reference in your app
        modernizr: {
            dist: {
                devFile: 'bower_components/modernizr/modernizr.js',
                outputFile: '<%= config.dist %>/scripts/vendor/modernizr.js',
                files: {
                    src: [
                        '<%= config.dist %>/scripts/{,*/}*.js',
                        '<%= config.dist %>/styles/{,*/}*.css',
                        '!<%= config.dist %>/scripts/vendor/*'
                    ]
                },
                uglify: true
            }
        },

        // Run some tasks in parallel to speed up build process
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            server: [
                'sass',
                'copy:serve',
                'copy:styles'
            ],
            test: [
                'copy:styles'
            ],
            dist: [
                'requirejs:dist',
                'sass',
                'copy:styles',
                'imagemin',
                'svgmin'
            ]
        },

        // handlebars task define
        handlebars: {
            options: {
                // amd: ['handlebars'],
                wrapped: false,
                namespace: 'healthTemplates',
                // partialsPathRegex: /\/partials\//,
                processName: function(filename) {
                    // funky name processing here
                    return filename
                        .replace(/^templates\//, '')
                        .replace(/\.hbs$/, '');
                },
                processContent: function(content) {
                    content = content
                        .replace(/^[\x20\t]+/mg, '')
                        .replace(/[\x20\t]+$/mg, '')
                        .replace(/^[\r\n]+/, '')
                        .replace(/[\r\n]*$/, '\n');
                    return content;
                }
            },
            dist: {
                files: {
                    '.tmp/scripts/templates/main.js': 'templates/main/{,*/}*.hbs',
                    '.tmp/scripts/templates/profile.js': 'templates/profile/*.hbs',
                    '.tmp/scripts/templates/home.js': 'templates/home/*.hbs',
                    '.tmp/scripts/templates/hypertension.js': 'templates/hypertension/*.hbs'
                }
            }
        },
        jspot: {
            options: {
                keyword: 'gettext'
            },
            messages: {
                files: [{
                    'translations/LC_MESSAGES': [
                        'app/scripts/home/*.js',
                        'app/scripts/helpers/*.js',
                        'app/scripts/profile/*.js',
                        'app/scripts/hypertension/*.js',
                        'templates/**/*.hbs'
                    ]
                }]
            }
        },
        xgettext: {
            options: {
                functionName: ['_', '__', 'gettext', 'ngettext'],
                processMessage: function(message) {
                    return message.replace(/\s+/g, ' '); // simplify whitespace
                }

            },
            main: {
                files: {
                    handlebars: ['templates/**/*.hbs'],
                    javascript: ['app/**/*.js']
                },
                options: {
                    potFile: 'translations/LC_MESSAGES/messages.pot'
                }
            }
        },
        compress: {
            nightly: {
                options: {
                    archive: 'pcmsapp-<%= buildId %>.zip'
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.dist %>',
                    src: ['**'],
                    dest: 'pcms'
                }]
            }
        },
        revision: {
            options: {
                property: 'meta.revision',
                ref: 'HEAD',
                short: true
            }
        }
    });

    grunt.registerTask('createDefaultTemplate', function () {
        grunt.file.write('.tmp/scripts/templates.js', 'define([], function() {return this.healthTemplates = this.healthTemplates || {};})');
    });


    grunt.registerTask('serve', function(target) {
        if (target === 'dist') {
            return grunt.task.run(['build',
                //'configureProxies:dist',
                //'connect:dist:keepalive',
                'copy:cpthealth',
            ]);
        }

        grunt.task.run([
            'clean:server',
            'createDefaultTemplate',
            'handlebars',
            'concurrent:server',
            'autoprefixer',
            'express:server',
            'prism:server',
            'connect:livereload',
            'watch'
        ]);
    });
    grunt.registerTask('nightly-build', function() {
        var buildId = grunt.option('build-id', new Date().toISOString().substring(0, 10));
        grunt.config.set('buildId', buildId);
        grunt.task.run(['newer:jshint', 'test', 'build', 'compress:nightly']);
    });

    grunt.registerTask('server', function(target) {
        grunt.log.warn(
            'The `server` task has been deprecated. Use `grunt serve` to start a server.'
        );
        grunt.task.run([target ? ('serve:' + target) : 'serve']);
    });

    grunt.registerTask('test', function(target) {
        if (target !== 'watch') {
            grunt.task.run([
                'clean:server',
                'createDefaultTemplate',
                'handlebars',
                'concurrent:test',
                'autoprefixer'
            ]);
        }

        grunt.task.run([
            'createDefaultTemplate',
            'connect:test',
            'mocha'
        ]);
    });

    grunt.registerTask('build', [
        'jshint',
        'clean:dist',
        //'revision',
        'createDefaultTemplate',
        'useminPrepare',
        'handlebars',
        'concurrent:dist',
        'autoprefixer',
        'concat',

        'cssmin',
        //'uglify',
        'copy:dist',
        //'modernizr',
        // 'rev',
        'usemin',
        //'regex-replace:dist',
        'htmlmin'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'build'
    ]);
};

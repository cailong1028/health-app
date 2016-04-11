/* global define, app, gettext */
'use strict';
define([
    'jquery',
    'underscore',
    'backbone',
    'dropzone'
], function ($, _, Backbone) {
    // aws-s3:cn-north-1:uimg://[host]/image
    var AWS_S3_IMAGE_BUCKET = 'uimg';
    var AWS_S3_FILE_BUCKET = 'uobject';

    var buildLocation = function(bucket) {
        return 'https://' + bucket + '.s3.cn-north-1.amazonaws.com.cn';
    };
    var AttachmentUploader = function(buildUrl) {
        this.buildUrl = buildUrl;
    };
    AttachmentUploader.prototype = _.extend({
        constructor: AttachmentUploader,
        url: buildLocation(AWS_S3_FILE_BUCKET),
        presign: function(file, usage) {
            var data = _.pick(file, ['name', 'type', 'size']);
            if (usage) {
                data.usage = usage;
            }
            return $.ajax({
                type: 'GET',
                url: this.buildUrl('attachments/presign'),
                data: data,
                dataType: 'json'
            });
        }
    });
    var attachmentuploader = new AttachmentUploader(_.bind(app.buildUrl, app));

    var ImageUploader = function(buildUrl) {
        this.buildUrl = buildUrl;
    };
    ImageUploader.prototype = _.extend({
        constructor: ImageUploader,
        url: buildLocation(AWS_S3_IMAGE_BUCKET),
        presign: function(file, usage) {
            var data = _.pick(file, ['name', 'type', 'size']);
            if (usage) {
                data.usage = usage;
            }
            return $.ajax({
                type: 'GET',
                url: this.buildUrl('images/presign'),
                data: data,
                dataType: 'json'
            });
        }
    });

    var imageuploader = new ImageUploader(_.bind(app.buildUrl, app));

    var triggerContextEvent = function(context, event, args) {
        return context.trigger.apply(context, [event].concat(_.toArray(args)));
    };

    // --------------------------
    // 单图片上传
    // --------------------------

    /**
     * Constructor Options keys.
     */
    var SIGNLETON_IMAGE_OPTIONS_KEYS = [
        'maxFilesize', // in MB
        'maxThumbnailFilesize',
        'thumbnailWidth',
        'thumbnailHeight',
        'previewTemplate'
    ];
    /**
     * 模板
     */
    var SignletonImageTemplateView = Backbone.View.extend({
        template: 'templates:main:upload-singleton-image-template'
    });
    var SIGNLETON_IMAGE_EVENTS = function(context) {
        return {
            maxfilesexceeded: function(file) {
                if (DEBUG) {
                    console.log('maxfilesexceeded file', file);
                }
                this.removeFile(file);
            },
            addedfile: function(file) {
                if (DEBUG) {
                    console.log('added file');
                }
                var that = this;
                var allFiles = [].concat(this.getAcceptedFiles(), this.getRejectedFiles());
                _.chain(allFiles).without(file).each(function(file) {
                    that.removeFile(file);
                });
                // 设置postdata属性用于暂存数据
                file.postData = {};
                imageuploader.presign(file).done(function(resp) {
                    file.postData = resp.formData;
                    file.uri = resp.uri;
                    file.action = resp.action;
                    if (DEBUG) {
                        console.log('enqueue file: ', file);
                    }
                    return that.enqueueFile(file);
                }).fail(function(resp) {
                    if (resp.message) {
                        throw resp.message;
                    } else {
                        throw gettext('Error preparing the upload');
                    }
                });
                triggerContextEvent(context, 'upload:addedfile', arguments);
            },
            sending: function(file, xhr, formData) {
                if (DEBUG) {
                    console.log('sending: ', arguments);
                }
                _.each(file.postData, function(v, k) {
                    formData.append(k, v);
                });
                triggerContextEvent(context, 'upload:sending', arguments);
            },
            processing: function(file) {
                if (DEBUG) {
                    console.log('upload file processing');
                }
                context.$el.addClass('processing');
                if (file.action) {
                    this.options.url = file.action;
                }
                triggerContextEvent(context, 'upload:processing', arguments);
            },
            success: function() {
                if (DEBUG) {
                    console.log('upload file success');
                }
                triggerContextEvent(context, 'upload:successful', arguments);
            },
            complete: function() {
                if (DEBUG) {
                    console.log('upload file complete');
                }
                context.$el.removeClass('processing');
                triggerContextEvent(context, 'upload:complete', arguments);
            },
            error: function() {
                if (DEBUG) {
                    console.log('upload file error');
                }
                triggerContextEvent(context, 'upload:error', arguments);
            },
            queuecomplete: function() {
                if (DEBUG) {
                    console.log('upload file queuecomplete');
                }
                triggerContextEvent(context, 'upload:queuecomplete', arguments);
            }
        };
    };
    /**
     * 单图片上传
     */
    var SingletonImageView = Backbone.View.extend({
        className: 'udz-singleton-image-uploader',
        template: 'templates:main:upload-singleton-image',
        /**
         * Constructor of Singleton Image View
         * @param o options, includes
         *          <code>maxFilesize</code> defaults 0.5MB
         *          <code>thumbnailWidth<code> defaults 80px
         *          <code>thumbnailHeight</code> defaults 80px
         */
        initialize: function(o) {
            this.dropzoneOptions = _.extend({
                maxFilesize: 0.5, // in MB
                maxThumbnailFilesize: 0.5,
                thumbnailWidth: 80,
                thumbnailHeight: 80
            }, _.pick(o, SIGNLETON_IMAGE_OPTIONS_KEYS));
            this.serializeData = _.extend({}, _.pick(o, ['defaultImageLocation']));
        },
        serialize: function() {
            return this.serializeData;
        },
        beforeRender: function() {
            // 如果包含自定义的模板
            if (this.dropzoneOptions.previewTemplate !== undefined){
                return;
            }
            var initTemplate = _.bind(this.initTemplate, this);
            if (this.templateView === undefined) {
                var done = this.async();
                this.templateView = new SignletonImageTemplateView();
                this.templateView.render().promise().done(function() {
                    initTemplate();
                    done();
                });
            } else {
                initTemplate();
            }
        },
        initTemplate: function() {
            if (DEBUG) {
                console.log('init template');
            }
            this.dropzoneOptions.previewTemplate = this.templateView.$el.html();
        },
        afterRender: function() {
            var that = this;
            var options = this.dropzoneOptions;
            this.$('.preview-default img').css({
                width: options.thumbnailWidth,
                height: options.thumbnailHeight
            });
            this.$el.dropzone(_.extend(options, {
                maxFiles: 1,
                url: imageuploader.url,
                autoQueue: false, // Make sure the files aren't queued until manually added
                previewsContainer: '#previews', // Define the container to display the previews
                clickable: '.fileinput-button', // Define the element that should be used as click trigger to select files.
                accept: function(file, done) {
                    if (!/image\/.*/.test(file.type)) {
                        done(gettext('Only supported image files.'));
                    } else {
                        done();
                    }
                },
                init: function() {
                    _.each(SIGNLETON_IMAGE_EVENTS(that), function(v, k) {
                        this.on(k, _.bind(v, this));
                    },this);
                    _.each(options.events, function(v, k) {
                        this.on(k, _.bind(v, this));
                    }, this);
                }
            }));
        }
    });


    // --------------------------
    // 多文件上传
    // --------------------------

    /**
     * Constructor Options keys.
     */
    var MULTIPLE_OBJECTS_OPTIONS_KEYS = [
        'maxFilesize', // in MB
        'maxFiles',
        'previewTemplate',
        'acceptedFiles'
    ];
    /**
     * 模板
     */
    var MulitpleObjectsTemplateView = Backbone.View.extend({
        template: 'templates:main:upload-multiple-objects-template'
    });
    var MULTIPLE_OBJECTS_EVENTS = function(context) {
        return {
            maxfilesexceeded: function(file) {
                if (DEBUG) {
                    console.log('maxfilesexceeded file', file);
                }
            },
            addedfile: function(file) {
                if (DEBUG) {
                    console.log('added file');
                }
                var that = this;
                // 设置postdata属性用于暂存数据
                file.postData = {};
                attachmentuploader.presign(file).done(function(resp) {
                    file.postData = resp.formData;
                    file.uri = resp.uri;
                    file.action = resp.action;
                    if (DEBUG) {
                        console.log('enqueue file: ', file);
                    }
                    return that.enqueueFile(file);
                }).fail(function(resp) {
                    if (resp.message) {
                        throw resp.message;
                    } else {
                        throw gettext('Error preparing the upload');
                    }
                });
                $(file.previewTemplate).find('[data-dz-name]').attr('title', function() {
                    return $(this).text();
                });
                triggerContextEvent(context, 'upload:addedfile', arguments);
            },
            removedfile: function() {
                if (DEBUG) {
                    console.log('removeedfile: ', arguments);
                }
                triggerContextEvent(context, 'upload:removedfile', arguments);
            },
            sending: function(file, xhr, formData) {
                if (DEBUG) {
                    console.log('sending: ', arguments);
                }
                _.each(file.postData, function(v, k) {
                    formData.append(k, v);
                });
                triggerContextEvent(context, 'upload:sending', arguments);
            },
            processing: function(file) {
                if (DEBUG) {
                    console.log('upload file processing');
                }
                context.$el.addClass('processing');
                if (file.action) {
                    this.options.url = file.action;
                }
                triggerContextEvent(context, 'upload:processing', arguments);
            },
            success: function() {
                if (DEBUG) {
                    console.log('upload file success');
                }
                triggerContextEvent(context, 'upload:successful', arguments);
            },
            complete: function() {
                if (DEBUG) {
                    console.log('upload file complete');
                }
                context.$el.removeClass('processing');
                triggerContextEvent(context, 'upload:complete', arguments);
            },
            error: function() {
                if (DEBUG) {
                    console.log('upload file error');
                }
                triggerContextEvent(context, 'upload:error', arguments);
            },
            queuecomplete: function() {
                if (DEBUG) {
                    console.log('upload file queuecomplete');
                }
                triggerContextEvent(context, 'upload:queuecomplete', arguments);
            }

        };
    };
    /**
     * 单图片上传
     */
    var MultipleObjectsView = Backbone.View.extend({
        className: 'udz-multiple-objects-uploader',
        template: 'templates:main:upload-multiple-objects',
        /**
         * Constructor of Singleton Image View
         * @param o options, includes
         *          <code>maxFilesize</code> defaults 0.5MB
         *          <code>thumbnailWidth<code> defaults 80px
         *          <code>thumbnailHeight</code> defaults 80px
         */
        initialize: function(o) {
            this.dropzoneOptions = _.extend({
                maxFilesize: 2, // in MB
                maxFiles: 5
            }, _.pick(o, MULTIPLE_OBJECTS_OPTIONS_KEYS));
            if (DEBUG) {
                console.log(this.dropzoneOptions);
            }
        },
        beforeRender: function() {
            // 如果包含自定义的模板
            if (this.dropzoneOptions.previewTemplate !== undefined){
                return;
            }
            var initTemplate = _.bind(this.initTemplate, this);
            if (this.templateView === undefined) {
                var done = this.async();
                this.templateView = new MulitpleObjectsTemplateView();
                this.templateView.render().promise().done(function() {
                    initTemplate();
                    done();
                });
            } else {
                initTemplate();
            }
        },
        initTemplate: function() {
            if (DEBUG) {
                console.log('init template');
            }
            this.dropzoneOptions.previewTemplate = this.templateView.$el.html();
        },
        afterRender: function() {
            var that = this;
            var options = this.dropzoneOptions;
            this.$el.dropzone(_.extend(options, {
                url: attachmentuploader.url,
                autoQueue: false, // Make sure the files aren't queued until manually added
                previewsContainer: '#files', // Define the container to display the previews
                clickable: '.fileinput-button', // Define the element that should be used as click trigger to select files.
                init: function() {
                    _.each(MULTIPLE_OBJECTS_EVENTS(that), function(v, k) {
                        this.on(k, _.bind(v, this));
                    },this);
                    _.each(options.events, function(v, k) {
                        this.on(k, _.bind(v, this));
                    }, this);
                },
                accept: function(file, done) {
                    if (file.size === 0) {
                        done(gettext('Not allowed zero files.'));
                    } else {
                        done();
                    }
                },
            }));
        }
    });

    return {
        SingletonImageView: SingletonImageView,
        MultipleObjectsView: MultipleObjectsView
    };
});

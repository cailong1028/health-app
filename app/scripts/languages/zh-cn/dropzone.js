/* global require*/
require([
    'dropzone'
], function(Dropzone) {
    Dropzone.prototype.defaultOptions.dictDefaultMessage = '拖放文件上传';
    Dropzone.prototype.defaultOptions.dictFallbackMessage = '浏览器不支持拖放文件上传';
    Dropzone.prototype.defaultOptions.dictFallbackText = 'Please use the fallback form below to upload your files like in the olden days.';
    // Dropzone.prototype.defaultOptions.dictFileTooBig = '文件长度限制 {{filesize}}MiB. 最大文件长度 {{maxFilesize}}MiB.';
    Dropzone.prototype.defaultOptions.dictFileTooBig = '请上传符合要求的文件';
    Dropzone.prototype.defaultOptions.dictInvalidFileType = '不能上传这些文件';
    Dropzone.prototype.defaultOptions.dictResponseError = '服务器返回 {{statusCode}} 状态.';
    Dropzone.prototype.defaultOptions.dictCancelUpload = '取消上传';
    Dropzone.prototype.defaultOptions.dictCancelUploadConfirmation = '确认取消文件上传？';
    Dropzone.prototype.defaultOptions.dictRemoveFile = '删除文件';
    // Dropzone.prototype.defaultOptions.dictRemoveFileConfirmation = null;
    Dropzone.prototype.defaultOptions.dictMaxFilesExceeded = '不能再上传更多的文件';
});

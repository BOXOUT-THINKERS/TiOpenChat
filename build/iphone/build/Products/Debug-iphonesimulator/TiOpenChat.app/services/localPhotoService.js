function _capturePhotoForOverlay(action, params) {
    if (!(action in Titanium.Media)) {
        params && params._error && params._error({
            messsage: L("ps_failNotSuportCamera")
        });
        return;
    }
    params.success = function(event) {
        if (event.mediaType == Titanium.Media.MEDIA_TYPE_PHOTO) {
            var photoInfo = {
                blob: event.media,
                name: Date.now() + ".jpg"
            };
            params._success ? params._success(photoInfo) : "";
        } else params._error ? params._error({
            messsage: L("ps_failNotPhoto")
        }) : "";
    };
    params.cancel = function() {
        params._error ? params._error({
            messsage: L("ps_failCancle"),
            isCancel: true
        }) : "";
    };
    params.error = function(error) {
        var msg = "";
        msg = L(error.code == Titanium.Media.NO_CAMERA ? "ps_failNotSuportCamera" : "ps_failGetPhoto");
        params._error ? params._error({
            messsage: msg
        }) : "";
    };
    Titanium.Media[action].call(Titanium.Media, params);
}

function _getOrCapturePhoto(action, params) {
    var deferred = Q.defer();
    if (!(action in Titanium.Media)) return Q.fcall(function() {
        throw {
            messsage: L("ps_failNotSuportCamera")
        };
    });
    params.success = function(event) {
        if (event.mediaType == Titanium.Media.MEDIA_TYPE_PHOTO) {
            Ti.API.debug("----------------------------------------사진촬");
            var photoInfo = {
                blob: event.media,
                name: Date.now() + ".jpg"
            };
            deferred.resolve(photoInfo);
        } else deferred.reject({
            messsage: L("ps_failNotPhoto")
        });
    };
    params.cancel = function() {
        deferred.reject({
            messsage: L("ps_failCancle"),
            isCancel: true
        });
    };
    params.error = function(error) {
        var msg = "";
        msg = L(error.code == Titanium.Media.NO_CAMERA ? "ps_failNotSuportCamera" : "ps_failGetPhoto");
        deferred.reject({
            messsage: msg
        });
    };
    Titanium.Media[action].call(Titanium.Media, params);
    return deferred.promise;
}

var Q = Alloy.Globals.Q;

exports.saveToPhotoGallery = function(imageBlob, successCb, failCb) {
    Titanium.Media.saveToPhotoGallery(imageBlob, {
        success: successCb,
        error: failCb
    });
};

exports.getPhoto = function() {
    var params = {
        animated: false,
        saveToPhotoGallery: false,
        allowEditing: false,
        showControls: true,
        autohide: true,
        mediaTypes: [ Titanium.Media.MEDIA_TYPE_PHOTO ]
    };
    return _getOrCapturePhoto("openPhotoGallery", params);
};

exports.capturePhoto = function(options) {
    if (!Titanium.Media.isCameraSupported) return Q.fcall(function() {
        throw {
            messsage: L("ps_failNotSuportCamera")
        };
    });
    var params = {
        saveToPhotoGallery: false,
        allowEditing: false,
        transform: Ti.UI.create2DMatrix().scale(1),
        mediaTypes: [ Titanium.Media.MEDIA_TYPE_PHOTO ]
    };
    if (options && options.overlay && options.success) {
        _.extend(params, {
            overlay: options.overlay,
            _success: options.success,
            _error: options.error,
            animated: true,
            showControls: false,
            autohide: false
        });
        return _capturePhotoForOverlay("showCamera", params);
    }
    _.extend(params, {
        showControls: true
    });
    return _getOrCapturePhoto("showCamera", params);
};

exports.resize = function(photoBlob, targetView) {
    var ImageFactory = require("ti.imagefactory");
    Ti.API.debug("Original Image : ", photoBlob.width, " * ", photoBlob.height);
    var resizedImage, croppedImage;
    var targetHeight;
    var targetWidth;
    var rateHW;
    var targetWidth;
    var targetHeight;
    var rateHW = photoBlob.height / photoBlob.width;
    var targetWidth = Alloy.Globals.ImageWidth;
    var targetHeight = targetWidth * rateHW;
    resizedImage = ImageFactory.imageAsResized(photoBlob, {
        width: targetWidth,
        height: targetHeight
    });
    Titanium.API.info("Resize Image : ", targetWidth, " * ", targetHeight);
    if (targetView) {
        var cropHWRate = targetView.size.height / targetView.size.width;
        var cropWidth = targetWidth;
        var cropHeight = cropWidth * cropHWRate;
        if (cropWidth > resizedImage.width) {
            Titanium.API.info("not crop : cropWidth : ", cropWidth, "> bitmapWidth ", resizedImage.width);
            croppedImage = resizedImage;
        } else {
            croppedImage = ImageFactory.imageAsCropped(resizedImage, {
                x: 0,
                y: 0,
                width: cropWidth,
                height: cropHeight
            });
            Titanium.API.info("Crop Image : ", cropWidth, " * ", cropHeight);
        }
    }
    var imageToCompress = croppedImage || resizedImage;
    return ImageFactory.compress(imageToCompress, Alloy.Globals.ImageQuality);
};

exports.resizeForThumbnail = function(photoBlob) {
    var ImageFactory = require("ti.imagefactory");
    photoBlob = photoBlob.imageAsThumbnail(Alloy.Globals.thumbWidth);
    return ImageFactory.compress(photoBlob, Alloy.Globals.ImageQuality);
};
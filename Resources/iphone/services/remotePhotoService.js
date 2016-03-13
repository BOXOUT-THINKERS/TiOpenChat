var Q = require("q");

exports.savePhoto = function(blobImage, imageName) {
    var deferred = Q.defer();
    var blobOfBase64 = Titanium.Utils.base64encode(blobImage);
    var parseFile = new Parse.File(imageName, {
        base64: blobOfBase64.getText()
    });
    parseFile.save().then(function(result) {
        Ti.API.debug("filesave success");
        return deferred.resolve(result);
    }).fail(function() {
        Ti.API.debug("filesave fail");
        return deferred.reject("파일 저장 실패");
    });
    return deferred.promise;
};

exports.getFileByUrl = function(url, fileName, dir) {
    url = url || "";
    dir = dir || Titanium.Filesystem.applicationCacheDirectory;
    fileName = fileName || Date.now();
    var deferred = Q.defer();
    var file = Titanium.Filesystem.getFile(dir, fileName);
    if (file.exists()) {
        Ti.API.debug("존재하는 파일의 filepath ", file.nativePath);
        return Q(file);
    }
    var xhr = Titanium.Network.createHTTPClient({
        onload: function() {
            file.write(this.responseData);
            Ti.API.debug("remote파일을 가져온후 로컬 filepath ", file.nativePath);
            deferred.resolve(file);
        },
        onerror: function(e) {
            deferred.reject(e.error);
        },
        timeout: 1e4
    });
    xhr.open("GET", url);
    xhr.send();
    return deferred.promise;
};
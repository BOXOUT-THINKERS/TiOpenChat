var Alloy = require("alloy"), _ = require("alloy/underscore")._, model, collection;

var Q = Alloy.Globals.Q;

var remotePhotoService = require("services/remotePhotoService");

exports.definition = {
    config: {
        adapter: {
            type: "parse",
            idAttribute: "objectId"
        }
    },
    extendModel: function(Model) {
        _.extend(Model.prototype, {
            _parse_class_name: "File",
            saveBy: function(fileData) {
                if (!fileData && !fileData.blob && !fileData.name) {
                    Alloy.Globals.alert("c_alertMsgFailSaveImage");
                    return Q();
                }
                var self = this;
                var thumbnailName = "thumbnail_" + fileData.name;
                return Q.all([ remotePhotoService.savePhoto(fileData.thumbnailBlob, thumbnailName), remotePhotoService.savePhoto(fileData.blob, fileData.name) ]).then(function(args) {
                    Ti.API.debug("filesave length : ", args.length);
                    var thumbnailParseFile = args[0];
                    var parseFile = args[1];
                    var deferred = Q.defer();
                    self.set({
                        thumbnailUrl: thumbnailParseFile.url(),
                        url: parseFile.url(),
                        name: parseFile.name(),
                        roomId: fileData.roomId,
                        location: fileData.location,
                        User_objectId: fileData.User_objectId,
                        text: fileData.text,
                        fileType: "image/jpeg"
                    }).save(null, {
                        success: function(result) {
                            Ti.API.debug(fileData.User_objectId);
                            Ti.API.debug("FileM으로 저장성공.");
                            return deferred.resolve(result);
                        },
                        error: function() {
                            Alloy.Globals.alert("c_alertMsgFailSaveImage");
                        }
                    });
                    return deferred.promise;
                }).catch(function() {
                    Alloy.Globals.alert("c_alertMsgFailSaveImage");
                });
            }
        });
        return Model;
    },
    extendCollection: function(Collection) {
        _.extend(Collection.prototype, {
            _parse_class_name: "File",
            fetch: function(options) {
                options = options ? _.clone(options) : {};
                options.reset = true;
                return Backbone.Collection.prototype.fetch.call(this, options);
            }
        });
        return Collection;
    }
};

model = Alloy.M("file", exports.definition, []);

collection = Alloy.C("file", exports.definition, model);

exports.Model = model;

exports.Collection = collection;
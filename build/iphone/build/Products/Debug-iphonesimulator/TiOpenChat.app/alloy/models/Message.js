var Alloy = require("alloy"), _ = require("alloy/underscore")._, model, collection;

exports.definition = {
    config: {
        columns: {
            id: "text PRIMARY KEY",
            type: "text",
            created: "INTEGER",
            isRead: "INTEGER",
            fromUserId: "text",
            fromUser: "text",
            toUserId: "text",
            toUser: "text",
            roomId: "text",
            text: "text",
            requestCount: "text",
            location: "text",
            locationType: "text",
            fileId: "text",
            thumbnailUrl: "text",
            url: "text",
            name: "text",
            fileType: "text",
            openLevel: "INTEGER",
            isReceived: "INTEGER",
            receivedTime: "INTEGER",
            receiverRoomId: "text"
        },
        URL: "http://urlPathToRestAPIServer.com/api/modelname",
        parentNode: "",
        debug: 0,
        useStrictValidation: 0,
        adapter: {
            type: "sqlrest",
            collection_name: "message",
            idAttribute: "id",
            deletedAttribute: ""
        },
        headers: {
            "X-Parse-Application-Id": Ti.App.Properties.getString("Parse_AppId"),
            "X-Parse-REST-API-Key": Ti.App.Properties.getString("Parse_RestKey"),
            "Content-Type": "application/json"
        },
        localOnly: true,
        deleteAllOnFetch: false,
        returnErrorResponse: false,
        disableSaveDataLocallyOnServerError: false
    },
    extendModel: function(Model) {
        _.extend(Model.prototype, {});
        return Model;
    },
    extendCollection: function(Collection) {
        _.extend(Collection.prototype, {
            fetch: function(options) {
                options = options ? _.clone(options) : {};
                options.reset = true;
                return Backbone.Collection.prototype.fetch.call(this, options);
            },
            comparator: function(model) {
                return model.get("created");
            },
            getRecentMessageInfo: function(roomId) {
                var models = this.where({
                    roomId: roomId
                });
                var created, text, thumbnailUrl;
                var lastIndex = models.length - 1;
                for (var i = lastIndex, min = 0; i >= min; --i) {
                    var model = models[i];
                    {
                        model.get("type");
                    }
                    lastIndex == i && (created = model.get("created"));
                    text = text ? text : model.get("text");
                    thumbnailUrl = thumbnailUrl ? thumbnailUrl : model.get("thumbnailUrl");
                    if (created && text && thumbnailUrl) break;
                }
                var message = {
                    created: created,
                    text: text,
                    thumbnailUrl: thumbnailUrl
                };
                Ti.API.debug("finded recentMessage", message);
                return message;
            },
            getRestMessageCount: function(roomId) {
                var myId = Alloy.Globals.user.get("id");
                var models = this.where({
                    roomId: roomId,
                    isRead: false
                });
                var restMessageCount = _.filter(models, function(model) {
                    return model.get("fromUserId") == myId || "send:message" != model.get("type") && "request:where" != model.get("type") ? false : true;
                }).length;
                return restMessageCount || 0;
            },
            removeMessages: function(roomIds) {
                Ti.API.debug("메시지삭제하는데...총 ", this.models.length);
                for (var i = 0, max = roomIds.length; max > i; ++i) {
                    var roomId = roomIds[i];
                    var messages = this.where({
                        roomId: roomId
                    });
                    for (var p in messages) {
                        var message = messages[p];
                        message.destroy();
                    }
                }
                Ti.API.debug("메시지삭제하는데...총 삭제되서.", this.models.length);
            }
        });
        return Collection;
    }
};

model = Alloy.M("message", exports.definition, []);

collection = Alloy.C("message", exports.definition, model);

exports.Model = model;

exports.Collection = collection;
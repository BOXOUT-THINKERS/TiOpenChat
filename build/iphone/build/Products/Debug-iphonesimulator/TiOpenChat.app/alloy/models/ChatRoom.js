var Alloy = require("alloy"), _ = require("alloy/underscore")._, model, collection;

var Q = Alloy.Globals.Q;

exports.definition = {
    config: {
        columns: {
            objectId: "text PRIMARY KEY",
            roomId: "text",
            inUserIds: "text",
            existUserIds: "text",
            inUsers: "text",
            createdAt: "text",
            updatedAt: "text",
            restMessageCount: "INTEGER",
            modified: "text"
        },
        URL: "https://api.parse.com/1/classes/ChatRoom",
        parentNode: "results",
        debug: 0,
        useStrictValidation: 0,
        adapter: {
            type: "sqlrest",
            collection_name: "ChatRoom",
            idAttribute: "objectId",
            deletedAttribute: "",
            addModifedToUrl: true,
            lastModifiedColumn: "modified"
        },
        headers: {
            "X-Parse-Application-Id": Ti.App.Properties.getString("Parse_AppId"),
            "X-Parse-REST-API-Key": Ti.App.Properties.getString("Parse_RestKey"),
            "Content-Type": "application/json"
        },
        deleteAllOnFetch: true,
        returnErrorResponse: true,
        disableSaveDataLocallyOnServerError: true
    },
    extendModel: function(Model) {
        _.extend(Model.prototype, {
            getInUsers: function() {
                var inUsers = this.get("inUsers") || {};
                var returnInUsers = [];
                for (i = 0; i < inUsers.length; i++) {
                    var inUser = inUsers[i] || {};
                    var imageUrl = inUser.profileImage ? inUser.profileImage.url : "";
                    returnInUsers.push({
                        id: inUser.objectId,
                        name: inUser.name,
                        imageUrl: imageUrl,
                        comment: inUser.comment,
                        mainPhone: inUser.username
                    });
                }
                return returnInUsers;
            },
            getFriendInfo: function(myId) {
                var inUsers = this.getInUsers();
                var targetUsers = _.filter(inUsers, function(inUser) {
                    return inUser.id != myId ? true : false;
                });
                friend = targetUsers[0];
                return friend;
            },
            saveInUserIds: function(inUserIds) {
                var tempChatRoomM = Alloy.createModel("ChatRoom");
                tempChatRoomM.save({
                    objectId: this.id,
                    existUserIds: inUserIds
                });
                this.set({
                    existUserIds: inUserIds
                });
                return this;
            }
        });
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
                var recentMsg = model.get("recentMessage");
                var time = recentMsg ? recentMsg.created : model.get("createdAt");
                return -time;
            },
            getBy: function(roomId, inUserIds) {
                var inUserIds = inUserIds || [];
                inUserIds = _.isArray(inUserIds) ? inUserIds : [ inUserIds ];
                var findedRoom;
                var models = this.models;
                for (var i = 0, max = models.length; max > i; ++i) {
                    var curRoom = models[i];
                    var curRoomId = curRoom.get("roomId");
                    var curInUserIds = curRoom.get("inUserIds") || [];
                    if (roomId && curRoomId == roomId) {
                        findedRoom = curRoom;
                        break;
                    }
                    if (inUserIds.length && curInUserIds.length == inUserIds.length) {
                        var isEqualCount = 0;
                        for (var j = 0, maxJ = inUserIds.length; maxJ > j; ++j) {
                            var inUserId = inUserIds[j];
                            if (_.contains(curInUserIds, inUserId)) {
                                curInUserIds = _.without(curInUserIds, inUserId);
                                ++isEqualCount;
                            }
                        }
                        if (inUserIds.length == isEqualCount && 0 == curInUserIds.length) {
                            findedRoom = curRoom;
                            break;
                        }
                    }
                }
                return findedRoom || {};
            },
            getOrCreate: function(roomId, inUserIds, myId) {
                var deferred = Q.defer();
                var chatRoom = this.getBy(roomId, inUserIds);
                if (!_.isEmpty(chatRoom)) {
                    var existUserIds = chatRoom.get("existUserIds");
                    if (inUserIds && existUserIds.length != inUserIds.length) {
                        Ti.API.debug("로컬에서 가져온 채팅룸정보에..내 아이디 추가.", myId);
                        chatRoom.saveInUserIds(inUserIds);
                    }
                    return Q(chatRoom);
                }
                var self = this;
                this.fetch({
                    urlparams: {
                        where: {
                            inUserIds: {
                                $all: inUserIds
                            }
                        },
                        include: "inUsers"
                    },
                    add: true,
                    silent: true,
                    deleteAllOnFetch: false,
                    success: function() {
                        var chatRoom = self.getBy(roomId, inUserIds);
                        if (!_.isEmpty(chatRoom)) {
                            Ti.API.debug("서버에서 가져온 채팅룸정보에..내 아이디 추가.", myId);
                            chatRoom.saveInUserIds(inUserIds);
                            self.trigger("add", chatRoom);
                            return deferred.resolve(chatRoom);
                        }
                        newChatRoom = self.createRoom(roomId, inUserIds, myId);
                        deferred.resolve(newChatRoom);
                    },
                    error: function(e, e2) {
                        Ti.API.debug("채팅룸 fetch실패", e, e2);
                        return deferred.reject(e);
                    }
                });
                return deferred.promise;
            },
            createRoom: function(roomId, inUserIds, myId) {
                var self = this;
                Ti.API.debug("create NewRoom", roomId, inUserIds, myId);
                var roomId = _.isEmpty(roomId) ? "room" + Date.now() : roomId;
                var data = {
                    roomId: roomId,
                    inUserIds: inUserIds,
                    existUserIds: [ myId ]
                };
                var model = Alloy.createModel("ChatRoom");
                model.save(data, {
                    error: function() {
                        Ti.API.debug("fail create room in remote");
                        self.remove(model);
                    }
                });
                this.add(model);
                return model;
            },
            exitRooms: function(chatRoomMs, myId) {
                for (var i = 0, max = chatRoomMs.length; max > i; ++i) {
                    var chatRoomM = chatRoomMs[i];
                    var roomId = chatRoomM.get("roomId");
                    var self = this;
                    this.fetch({
                        urlparams: {
                            where: {
                                roomId: roomId
                            },
                            include: "inUsers"
                        },
                        add: true,
                        silent: true,
                        deleteAllOnFetch: false,
                        success: function() {
                            var chatRoom = self.getBy(roomId);
                            self.remove(chatRoomM);
                            if (!_.isEmpty(chatRoom)) {
                                var existUserIds = _.without(chatRoom.get("existUserIds"), myId);
                                chatRoom.saveInUserIds(existUserIds);
                            }
                            return true;
                        },
                        error: function(e, e2) {
                            Ti.API.debug("채팅룸 fetch실패", e, e2);
                            self.remove(chatRoomM);
                            return false;
                        }
                    });
                }
            }
        });
        return Collection;
    }
};

model = Alloy.M("chatRoom", exports.definition, []);

collection = Alloy.C("chatRoom", exports.definition, model);

exports.Model = model;

exports.Collection = collection;
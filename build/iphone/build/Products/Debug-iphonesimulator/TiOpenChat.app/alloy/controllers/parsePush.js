function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function registerLoginUserInfo() {
        userM.get("id") && ParsePush.putValue("User_objectId", userM.get("id"));
    }
    function unregisterLoginUserInfo() {
        ParsePush.putValue("User_objectId", "");
    }
    function receivePush(msg, isClick) {
        msg = msg.data;
        Alloy.Globals.appOnline ? Alloy.Globals.user ? _doByReceivedPush(msg, false) : $.on("parsePush:ready", function() {
            _doByReceivedPush(msg, false);
            Alloy.Globals.chatListC.off("parsePush:ready", arguments.callee);
        }) : Alloy.Globals.user ? _doByReceivedPush(msg, true) : $.on("parsePush:ready", function() {
            _doByReceivedPush(msg, true);
            Alloy.Globals.chatListC.off("parsePush:ready", arguments.callee);
        });
    }
    function _doByReceivedPush(msg, isClick) {
        if (!Alloy.Globals.user) return;
        var myId = Alloy.Globals.user.get("id");
        var fromUserId = msg.fromUserId;
        msg.title;
        var content = msg.alert;
        var roomId = msg.roomId;
        Ti.API.debug("receivePush :", msg.alert);
        switch (msg.type) {
          case "chat:message":
          case "request:where":
            if (isClick) {
                Ti.API.debug("open chat from notify", msg.alert);
                chatRoomCollection.getOrCreate(roomId, [ myId, fromUserId ], myId).then(function(chatRoomM) {
                    Alloy.Globals.menuC.trigger("menuclick", {
                        itemId: "chatlist",
                        isNotToggle: true
                    });
                    return Alloy.Globals.chatViewManager.openView(chatRoomM);
                }).fail(function(error) {
                    Ti.API.error(error);
                });
            }
        }
        isClick || popupDisplay({
            roomId: roomId,
            fromUserId: fromUserId,
            content: content,
            type: msg.type,
            requestCount: msg.requestCount
        });
    }
    function setBadge(number) {
        if (_.isString(number)) {
            number = Ti.UI.iPhone.getAppBadge() + parseInt(number);
            number = 0 > number ? 0 : number;
        }
        Ti.App.fireEvent("changeBadge", {
            number: number
        });
        installation.set("badge", number).save();
    }
    function afterRegisterDevice() {
        if (!Alloy.Globals.settings.get("Installation_randomId")) {
            var randomId = _.random(0, 1e6) + "" + Date.now();
            ParsePush.putValue("randomId", randomId);
            Alloy.Globals.settings.set("Installation_randomId", randomId).save();
        }
    }
    function popupDisplay(params) {
        function doPopupDisplay() {
            Alloy.createController("pushPopup", _.extend(params, friendInfo));
        }
        if (!Alloy.Globals.user) return;
        var chatRoomM = chatRoomCollection.getBy(params.roomId);
        if (_.isEmpty(chatRoomM)) return;
        var inUsers = chatRoomM.getInUsers();
        var targetUser = _.findWhere(inUsers, {
            id: params.fromUserId
        });
        var friendInfo = {
            friend: targetUser || {}
        };
        if ("send:location" != params.type) {
            doPopupDisplay();
            return;
        }
        if (_.isEmpty(params.location) || !params.location.latitude || !params.location.longitude) return;
        var diffLatitude = parseFloat(parseFloat(params.location.latitude).toFixed(4)) - parseFloat(parseFloat(beforLocation.latitude).toFixed(4));
        var diffLongitude = parseFloat(parseFloat(params.location.longitude).toFixed(4)) - parseFloat(parseFloat(beforLocation.longitude).toFixed(4));
        if (!diffLatitude && !diffLongitude) return;
        beforLocation = params.location;
        doPopupDisplay();
    }
    function _updateUser(data) {
        var userM = Alloy.Globals.user.attributes;
        userM.set(data, {
            change: false
        });
        Parse.Cloud.run("userModify", data, {
            success: function() {
                Ti.API.debug("parsePush:UserModify success");
            },
            error: function(error) {
                Ti.API.debug("parsePush:UserModify error : ", error);
            }
        });
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "parsePush";
    this.args = arguments[0] || {};
    if (arguments[0]) {
        {
            __processArg(arguments[0], "__parentSymbol");
        }
        {
            __processArg(arguments[0], "$model");
        }
        {
            __processArg(arguments[0], "__itemTemplate");
        }
    }
    var $ = this;
    var exports = {};
    exports.destroy = function() {};
    _.extend($, $.__views);
    var ParsePush = require("services/iosPushService");
    var userM = Alloy.Models.instance("user");
    var installation = Alloy.Models.instance("installation");
    var chatRoomCollection = Alloy.Collections.instance("chatRoom");
    Alloy.Globals.loginC.on("login:after", function() {
        Alloy.Globals.settings.get("Installation_randomId") && installation.getByRandomId(Alloy.Globals.settings.get("Installation_randomId")).then(function() {
            Ti.API.debug("fetched Installation : ", installation.attributes);
            Alloy.Globals.settings.set("Installation_objectId", installation.get("objectId")).save();
            registerLoginUserInfo();
            if (void 0 === Alloy.Globals.settings.get("Installation_channels_chat")) {
                Ti.API.debug("settings 초기값 설정");
                Alloy.Globals.settings.save({
                    Installation_channels_chat: true,
                    Installation_channels_event: true
                });
                Alloy.Globals.parsePushC.overwriteChannels([ "Chat", "Event" ]);
                _updateUser({
                    isPermissionAllPush: true,
                    isUsingBanTime: true
                });
            }
        }).catch(function(error) {
            Ti.API.error("Installation fetch Fail : " + error);
            Alloy.Globals.settings.set("Installation_randomId", void 0).save();
            Alloy.Globals.settings.set("Installation_objectId", void 0).save();
        });
    });
    Alloy.Globals.loginC.on("logout", function() {
        unregisterLoginUserInfo();
    });
    exports.regist = function() {
        tryRegisterPush();
    };
    exports.put = function(key, value) {
        ParsePush.putValue(key, value);
    };
    exports.push = function(type, message, toUserIds) {
        var currentUser = Alloy.Globals.user.getInfo();
        var messageText = message.text ? message.text : "";
        var query = {
            userIds: toUserIds
        };
        var data = {
            title: L("c_odizzo"),
            alert: currentUser.name ? currentUser.name + " : " + messageText : messageText,
            badge: "Increment",
            sound: "default",
            roomId: message.roomId
        };
        switch (type) {
          case "chat:message":
            query.channels = [ "Chat" ];
            data.type = type;
            data.fromUserId = message.fromUserId;
            break;

          case "request:where":
            data.type = type;
            data.requestCount = message.requestCount;
            data.fromUser = message.fromUser;
            data.toUser = message.toUser;
            data.fromUserId = message.fromUser.id;
            break;

          case "receive:where":
            data.type = type;
            data.fromUser = message.fromUser;
            data.fromUserId = message.fromUser.id;
            data.toUser = message.toUser;
        }
        Parse.Cloud.run("sendPush", {
            query: query,
            data: data
        }, {
            success: function(r) {
                Ti.API.debug(r);
            },
            error: function(e) {
                Ti.API.debug(e);
            }
        });
    };
    exports.overwriteChannels = function(channels) {
        _.isArray(channels) || (channels = [ channels ]);
        return installation.changeChannels(channels).then(function(currentChannels) {
            return currentChannels;
        });
    };
    exports.subscribeChannels = function(channels) {
        _.isArray(channels) || (channels = [ channels ]);
        var currentChannels = installation.get("channels");
        currentChannels || (currentChannels = []);
        for (var i = 0, max = channels.length; max > i; ++i) {
            var channel = channels[i];
            _.contains(currentChannels, channel) || currentChannels.push(channel);
        }
        return installation.changeChannels(currentChannels).then(function() {
            return currentChannels;
        });
    };
    exports.unsubscribeChannels = function(channels) {
        _.isArray(channels) || (channels = [ channels ]);
        var currentChannels = installation.get("channels");
        currentChannels || (currentChannels = []);
        for (var i = 0, max = channels.length; max > i; ++i) {
            var channel = channels[i];
            _.contains(currentChannels, channel) && (currentChannels = _.without(currentChannels, channel));
        }
        return installation.changeChannels(currentChannels).then(function() {
            return currentChannels;
        });
    };
    exports.popupFromMessage = function(messageModel) {
        popupDisplay({
            roomId: messageModel.get("roomId"),
            fromUserId: messageModel.get("fromUserId"),
            content: messageModel.get("text"),
            type: messageModel.get("type"),
            requestCount: messageModel.get("requestCount"),
            thumbnailUrl: messageModel.get("thumbnailUrl"),
            location: messageModel.get("location") || {}
        });
    };
    exports.notificationClear = function() {};
    exports.setBadge = setBadge;
    var beforLocation = {
        latitude: 0,
        longitude: 0
    };
    var onRegistSuccess = function(e) {
        ParsePush.start(e.deviceToken, {
            success: function() {
                afterRegisterDevice();
            }
        });
    };
    var onRegistError = function(e) {
        Alloy.Globals.alert("푸시 알림 등록을 실패했습니다.");
        Ti.API.debug(e);
    };
    var tryRegisterPush = function(args) {
        args = args || {};
        if (true && parseInt(Ti.Platform.version.split(".")[0]) >= 8) {
            Ti.App.iOS.addEventListener("usernotificationsettings", function registerForPush() {
                Ti.App.iOS.removeEventListener("usernotificationsettings", registerForPush);
                Ti.Network.registerForPushNotifications({
                    success: function(e) {
                        onRegistSuccess(e);
                        _.isFunction(args.success) && args.success();
                    },
                    error: function(e) {
                        onRegistError(e);
                        _.isFunction(args.error) && args.error();
                    },
                    callback: receivePush
                });
            });
            Ti.App.iOS.registerUserNotificationSettings({
                types: [ Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT, Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND, Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE ]
            });
        } else Ti.Network.registerForPushNotifications({
            types: [ Ti.Network.NOTIFICATION_TYPE_BADGE, Ti.Network.NOTIFICATION_TYPE_ALERT, Ti.Network.NOTIFICATION_TYPE_SOUND ],
            success: function(e) {
                onRegistSuccess(e);
                _.isFunction(args.success) && args.success();
            },
            error: function(e) {
                onRegistError(e);
                _.isFunction(args.error) && args.error();
            },
            callback: receivePush
        });
    };
    exports.regist();
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
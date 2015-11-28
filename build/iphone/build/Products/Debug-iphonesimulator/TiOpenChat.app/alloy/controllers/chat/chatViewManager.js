function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function _getController(roomId, inUserIds) {
        var findedChatC = _chatCList[roomId];
        if (findedChatC) Ti.API.debug("--------------이미있는 컨트롤러임."); else for (var p in _chatCList) {
            var curChatC = _chatCList[p];
            var curInUserIds = curChatC.inUserIds || [];
            if (curInUserIds.length == inUserIds.length) {
                var isEqualCount = 0;
                for (var j = 0, maxJ = inUserIds.length; maxJ > j; ++j) {
                    var inUserId = inUserIds[j];
                    _.contains(curInUserIds, inUserId) && (curInUserIds = _.without(curInUserIds, inUserId));
                }
                if (inUserIds.length == isEqualCount && 0 == curInUserIds.length) {
                    Ti.API.debug("findView", inUserIds, curChatC.inUserIds);
                    findedChatC = curChatC;
                    break;
                }
            }
        }
        return findedChatC;
    }
    function _getOrCreateController(roomId, inUserIds) {
        var findedChatC = _getController(roomId, inUserIds);
        if (!findedChatC) {
            Ti.API.debug("=========create new chatRoomController", roomId);
            findedChatC = Alloy.createController("chat/chatRoom", {
                roomId: roomId,
                inUserIds: inUserIds
            });
            _chatCList[roomId] = findedChatC;
        }
        return findedChatC;
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "chat/chatViewManager";
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
    Alloy.Collections.instance("chatRoom");
    exports.currentOpenedRoomId = null;
    var _chatCList = {};
    exports.getOrCreate = function(chatRoomM) {
        Alloy.Globals.user.get("id");
        var roomId = chatRoomM.get("roomId");
        var inUserIds = chatRoomM.get("inUserIds");
        return _getOrCreateController(roomId, inUserIds);
    };
    exports.openView = function(chatRoomM) {
        if (Alloy.Globals.firebaseC) {
            Ti.API.debug("open chat room window");
            var chatC = exports.getOrCreate(chatRoomM);
            Alloy.Globals.stopWaiting();
            Alloy.Globals.openWindow(chatC);
            return chatC;
        }
        Alloy.Globals.chatListC.on("firebase:ready", function() {
            Ti.API.debug("open chat room window");
            var chatC = exports.getOrCreate(chatRoomM);
            Alloy.Globals.stopWaiting();
            Alloy.Globals.openWindow(chatC);
            Alloy.Globals.chatListC.off("firebase:ready", arguments.callee);
        });
    };
    exports.removeController = function(chatRoomMs) {
        for (var i = 0, max = chatRoomMs.length; max > i; ++i) {
            var chatRoomM = chatRoomMs[i];
            var roomId = chatRoomM.get("roomId");
            var inUserIds = chatRoomM.get("inUserIds");
            var chatC = _getController(roomId, inUserIds);
            if (chatC) {
                chatC.remove();
                Ti.API.debug("컨트롤러지우는것이 제대로 되는지보자.-----------------", Object.keys(_chatCList));
                delete _chatCList[roomId];
            }
        }
    };
    exports.refeshLinkToChatRoomM = function(roomId) {
        var findedChatC = _chatCList[roomId];
        findedChatC && findedChatC.refeshLinkToChatRoomM();
    };
    exports.refeshLinkToContactsM = function(roomId) {
        var findedChatC = _chatCList[roomId];
        findedChatC && findedChatC.refeshLinkToContactsM();
    };
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
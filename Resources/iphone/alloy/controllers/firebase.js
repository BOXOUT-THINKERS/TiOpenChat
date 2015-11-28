function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function _onReceiveMessage(data) {
        var message = {
            val: data.val(),
            key: data.name()
        };
        Ti.API.debug(message);
        setTimeout(delayAdapter.bind(null, $, message), 100);
        var pathVal = fbChatPath + "/" + message.key;
        _fbRoot.child(pathVal).remove();
    }
    function delayAdapter($, message) {
        $.trigger("receive:message", message.val);
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "firebase";
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
    var _fbRoot = {};
    var fbChatPath = "";
    exports.isOnline = false;
    exports.listenStart = function(userId) {
        if (_.isEmpty(_fbRoot)) {
            var Firebase = require("com.leftlanelab.firebase");
            fbChatPath = "messages/" + userId;
            Ti.API.debug("connect firebase : ", fbChatPath, Ti.App.Properties.getString("Firebase_AppUrl"));
            _fbRoot = Firebase.new(Ti.App.Properties.getString("Firebase_AppUrl"));
            _fbRoot.child(fbChatPath).on("child_added", _onReceiveMessage);
            exports.isOnline = true;
        }
    };
    exports.sendMessage = function(message, toUsers, excludeUserId) {
        Ti.API.debug("firabase.sendMessage :", message);
        _.isArray(toUsers) || (toUsers = [ toUsers ]);
        for (var i = 0, max = toUsers.length; max > i; ++i) {
            var toUserId = toUsers[i];
            toUserId != excludeUserId && exports.sendMessageToOne(message, toUserId);
        }
    };
    exports.sendMessageToOne = function(message, toUserId) {
        message.toUserId = toUserId;
        var fbPath = "messages/" + toUserId;
        Ti.API.debug("message :", message, "/ toUserId :", toUserId);
        _fbRoot.child(fbPath).push(message);
    };
    exports.goOnline = function() {
        if (!_.isEmpty(_fbRoot)) {
            Ti.API.debug("[Firebase] goOnline");
            exports.isOnline = true;
            _fbRoot.goOnline();
        }
    };
    exports.goOffline = function() {
        if (!_.isEmpty(_fbRoot)) {
            Ti.API.debug("[Firebase] goOffline");
            exports.isOnline = false;
            _fbRoot.goOffline();
        }
    };
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
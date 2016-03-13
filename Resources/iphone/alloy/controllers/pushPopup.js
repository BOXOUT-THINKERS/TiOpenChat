function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function show() {
        win.add($.popupView);
        $.popupView.animate({
            duration: 200,
            top: 0
        }, function() {
            Ti.API.debug("pushPopup Show");
        });
    }
    function hide() {
        var cwin = findCurrentWindow();
        if (win.id == cwin.id) try {
            $.popupView.animate({
                duration: 200,
                top: -73
            }, function() {
                Ti.API.debug("pushPopup Hide");
                win.remove($.popupView);
            });
        } catch (e) {
            win.remove($.popupView);
        } else win.remove($.popupView);
    }
    function findCurrentWindow() {
        var win = Alloy.Globals.currentWindow;
        if (_.isEmpty(win)) {
            win = Alloy.Globals.navigation.topWindow.window;
        }
        if (_.isEmpty(win)) {
            Ti.API.error("pushPopup : Window Not found");
            return false;
        }
        return win;
    }
    function openChatRoom() {
        args.roomId && chatRoomCol.getOrCreate(args.roomId).then(function(chatRoomM) {
            chatC = chatViewManager.getOrCreate(chatRoomM);
            if (!chatC.isOpenedChatRoom) {
                Alloy.Globals.currentWindow && Alloy.Globals.currentWindow.close();
                Alloy.Globals.menuC.trigger("menuclick", {
                    itemId: "chatlist",
                    isNotToggle: true
                });
                var openView = function() {
                    chatViewManager.openView(this.chatRoomM);
                };
                openView = _.bind(openView, {
                    chatRoomM: chatRoomM
                });
                _.delay(openView, 100);
            }
        }).fail(function(error) {
            Ti.API.error(error);
        });
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "pushPopup";
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
    var __defers = {};
    $.__views.popupView = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: 73,
        top: -73,
        backgroundColor: "transparent",
        zIndex: 100,
        layout: "composite",
        id: "popupView"
    });
    $.__views.popupView && $.addTopLevelView($.__views.popupView);
    openChatRoom ? $.addListener($.__views.popupView, "click", openChatRoom) : __defers["$.__views.popupView!click!openChatRoom"] = true;
    $.__views.__alloyId138 = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "black",
        opacity: .6,
        touchEnabled: false,
        id: "__alloyId138"
    });
    $.__views.popupView.add($.__views.__alloyId138);
    $.__views.__alloyId139 = Ti.UI.createView({
        left: 5,
        right: 5,
        top: 5,
        bottom: 5,
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        backgroundColor: "white",
        borderRadius: 3,
        id: "__alloyId139"
    });
    $.__views.popupView.add($.__views.__alloyId139);
    $.__views.__alloyId140 = Ti.UI.createView({
        left: 15,
        height: 40,
        width: 40,
        id: "__alloyId140"
    });
    $.__views.__alloyId139.add($.__views.__alloyId140);
    $.__views.profileImage = Ti.UI.createImageView({
        preventDefaultImage: true,
        height: 38,
        width: 38,
        borderRadius: 19,
        font: {
            fontFamily: "Ionicons",
            fontSize: 30
        },
        color: "#77787f",
        backgroundColor: "#bebfc3",
        id: "profileImage"
    });
    $.__views.__alloyId140.add($.__views.profileImage);
    $.__views.__alloyId141 = Ti.UI.createImageView({
        preventDefaultImage: true,
        height: 40,
        width: 40,
        image: "/images/friendlist_profile_pic_outline.png",
        id: "__alloyId141"
    });
    $.__views.__alloyId140.add($.__views.__alloyId141);
    $.__views.__alloyId142 = Ti.UI.createView({
        left: 70,
        right: 53,
        height: 40,
        width: Ti.UI.FILL,
        id: "__alloyId142"
    });
    $.__views.__alloyId139.add($.__views.__alloyId142);
    $.__views.profileName = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16,
            fontWeight: "Medium"
        },
        textAlign: "center",
        left: 0,
        top: 0,
        id: "profileName"
    });
    $.__views.__alloyId142.add($.__views.profileName);
    $.__views.msgLabel = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: 15,
        color: "#3a3a3a",
        font: {
            fontSize: 12,
            fontWeight: "Medium"
        },
        textAlign: "center",
        left: 0,
        bottom: 0,
        id: "msgLabel"
    });
    $.__views.__alloyId142.add($.__views.msgLabel);
    $.__views.__alloyId143 = Ti.UI.createView({
        right: 8,
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        id: "__alloyId143"
    });
    $.__views.__alloyId139.add($.__views.__alloyId143);
    $.__views.msgtypeIcon = Ti.UI.createImageView({
        preventDefaultImage: true,
        width: 44.6,
        height: 44.6,
        id: "msgtypeIcon"
    });
    $.__views.__alloyId143.add($.__views.msgtypeIcon);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var chatViewManager = Alloy.Globals.chatViewManager;
    var chatRoomCol = Alloy.Collections.instance("chatRoom");
    var args = arguments[0] || {};
    var popUpIndex = 0;
    $.profileImage.image = args.friend.imageUrl;
    $.profileName.text = args.friend.name;
    $.msgLabel.text = args.content;
    if (args.thumbnailUrl) $.msgtypeIcon.image = "/images/push_photo_badge.png"; else if ("request:where" == args.type || "request:where" == args.type) $.msgtypeIcon.image = "/images/push_peck_badge.png"; else if ("send:location" == args.type) {
        $.msgtypeIcon.image = "/images/push_mappin_badge.png";
        args.location && args.location.address && (args.location.address.street ? $.msgLabel.text = args.location.address.street + L("c_locationPopupPush") : args.location.address.city ? $.msgLabel.text = args.location.address.city + L("c_locationPopupPush") : args.location.address.country && ($.msgLabel.text = args.location.address.country + L("c_locationPopupPush")));
    } else $.msgtypeIcon.image = null;
    var win = findCurrentWindow();
    if (win) {
        popUpIndex++;
        show();
        setTimeout(hide, 3e3);
    }
    __defers["$.__views.popupView!click!openChatRoom"] && $.addListener($.__views.popupView, "click", openChatRoom);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
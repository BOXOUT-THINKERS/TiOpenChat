function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function moveHideFriendManage() {
        var controller = Alloy.createController("setting/hideFriendManage");
        Alloy.Globals.openWindow(controller);
    }
    function moveBanFriendManage() {
        var controller = Alloy.createController("setting/banFriendManage");
        Alloy.Globals.openWindow(controller);
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "setting/banManage";
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
    $.__views.container = Ti.UI.createWindow({
        backgroundColor: "#f7f7f7",
        barColor: "#54EE92",
        translucent: false,
        navTintColor: "white",
        titleAttributes: {
            color: "white"
        },
        statusBarStyle: Titanium.UI.iPhone.StatusBar.LIGHT_CONTENT,
        id: "container"
    });
    $.__views.container && $.addTopLevelView($.__views.container);
    var __alloyId386 = [];
    $.__views.__alloyId387 = Ti.UI.createTableViewSection({
        id: "__alloyId387"
    });
    __alloyId386.push($.__views.__alloyId387);
    $.__views.__alloyId388 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId388"
    });
    $.__views.__alloyId387.add($.__views.__alloyId388);
    moveHideFriendManage ? $.addListener($.__views.__alloyId388, "click", moveHideFriendManage) : __defers["$.__views.__alloyId388!click!moveHideFriendManage"] = true;
    $.__views.hideFriendTitle = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 36,
        id: "hideFriendTitle"
    });
    $.__views.__alloyId388.add($.__views.hideFriendTitle);
    $.__views.__alloyId389 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId389"
    });
    $.__views.__alloyId388.add($.__views.__alloyId389);
    $.__views.__alloyId390 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId390"
    });
    $.__views.__alloyId389.add($.__views.__alloyId390);
    $.__views.__alloyId391 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId391"
    });
    $.__views.__alloyId388.add($.__views.__alloyId391);
    $.__views.__alloyId392 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId392"
    });
    $.__views.__alloyId387.add($.__views.__alloyId392);
    moveBanFriendManage ? $.addListener($.__views.__alloyId392, "click", moveBanFriendManage) : __defers["$.__views.__alloyId392!click!moveBanFriendManage"] = true;
    $.__views.banFriendTitle = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 36,
        id: "banFriendTitle"
    });
    $.__views.__alloyId392.add($.__views.banFriendTitle);
    $.__views.__alloyId393 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId393"
    });
    $.__views.__alloyId392.add($.__views.__alloyId393);
    $.__views.__alloyId394 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId394"
    });
    $.__views.__alloyId393.add($.__views.__alloyId394);
    $.__views.__alloyId395 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId395"
    });
    $.__views.__alloyId392.add($.__views.__alloyId395);
    $.__views.__alloyId385 = Ti.UI.createTableView({
        backgroundColor: "#f7f7f7",
        separatorColor: "transparent",
        separatorInsets: {
            left: 0,
            right: 0
        },
        data: __alloyId386,
        id: "__alloyId385"
    });
    $.__views.container.add($.__views.__alloyId385);
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.container.title = L("s_friendManage");
    $.hideFriendTitle.text = L("sb_hideFriendTitle");
    $.banFriendTitle.text = L("sb_banFriendTitle");
    __defers["$.__views.__alloyId388!click!moveHideFriendManage"] && $.addListener($.__views.__alloyId388, "click", moveHideFriendManage);
    __defers["$.__views.__alloyId392!click!moveBanFriendManage"] && $.addListener($.__views.__alloyId392, "click", moveBanFriendManage);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
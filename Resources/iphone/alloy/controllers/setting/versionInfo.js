function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function updateRecentVersion() {
        var linkInfo = {
            ios: {},
            android: {}
        };
        linkInfo = Alloy.Globals.appInfoM.get("ko" == Alloy.Globals.currentLanguage ? "linkInfo_ko" : "linkInfo_en");
        linkInfo = linkInfo.ios;
        Ti.Platform.openURL(linkInfo.url);
    }
    function defineVersion() {
        var Version = function(versionStr) {
            _.isNumber(versionStr) && (versionStr = versionStr.toString());
            var numbers = versionStr.split(".");
            this.major = numbers[0] ? Number(numbers[0]) : 0;
            this.minor = numbers[1] ? Number(numbers[1]) : 0;
            this.patch = numbers[2] ? Number(numbers[2]) : 0;
            this.build = numbers[3] ? Number(numbers[3]) : 0;
        };
        Version.prototype.isLessThan = function(rVersion) {
            if (this.major < rVersion.major) return true;
            if (this.major > rVersion.major) return false;
            if (this.minor < rVersion.minor) return true;
            if (this.minor > rVersion.minor) return false;
            if (this.patch < rVersion.patch) return true;
            if (this.patch > rVersion.patch) return false;
            if (this.build < rVersion.build) return true;
            if (this.build > rVersion.build) return false;
            return false;
        };
        Version.prototype.isGreaterThan = function(rVersion) {
            if (this.major > rVersion.major) return true;
            if (this.major < rVersion.major) return false;
            if (this.minor > rVersion.minor) return true;
            if (this.minor < rVersion.minor) return false;
            if (this.patch > rVersion.patch) return true;
            if (this.patch < rVersion.patch) return false;
            if (this.build > rVersion.build) return true;
            if (this.build < rVersion.build) return false;
            return false;
        };
        Version.prototype.isEqual = function(rVersion) {
            return this.major == rVersion.major && this.minor == rVersion.minor && this.patch == rVersion.patch && this.build == rVersion.build ? true : false;
        };
        Version.prototype.toString = function() {
            return this.major + "." + this.minor + "." + this.patch;
        };
        return Version;
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "setting/versionInfo";
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
    $.__views.versionInfoView = Ti.UI.createView({
        width: 230,
        height: Titanium.UI.SIZE,
        top: 30,
        layout: "vertical",
        id: "versionInfoView"
    });
    $.__views.container.add($.__views.versionInfoView);
    $.__views.topViewWrap = Ti.UI.createView({
        width: Titanium.UI.FILL,
        height: 80,
        layout: "composite",
        id: "topViewWrap"
    });
    $.__views.versionInfoView.add($.__views.topViewWrap);
    $.__views.appImageViewWrap = Ti.UI.createView({
        width: "30%",
        height: Titanium.UI.SIZE,
        left: 0,
        top: 0,
        id: "appImageViewWrap"
    });
    $.__views.topViewWrap.add($.__views.appImageViewWrap);
    $.__views.appImageView = Ti.UI.createImageView({
        preventDefaultImage: true,
        width: Titanium.UI.SIZE,
        height: Titanium.UI.SIZE,
        image: "/appicon.png",
        id: "appImageView"
    });
    $.__views.appImageViewWrap.add($.__views.appImageView);
    $.__views.infoWrap = Ti.UI.createView({
        layout: "vertical",
        width: "70%",
        height: Titanium.UI.SIZE,
        right: 0,
        id: "infoWrap"
    });
    $.__views.topViewWrap.add($.__views.infoWrap);
    $.__views.__alloyId451 = Ti.UI.createView({
        layout: "horizontal",
        width: Titanium.UI.SIZE,
        height: "50%",
        right: 0,
        id: "__alloyId451"
    });
    $.__views.infoWrap.add($.__views.__alloyId451);
    $.__views.c_recentVersion = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        id: "c_recentVersion"
    });
    $.__views.__alloyId451.add($.__views.c_recentVersion);
    $.__views.recentVersion = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 5,
        id: "recentVersion"
    });
    $.__views.__alloyId451.add($.__views.recentVersion);
    $.__views.__alloyId452 = Ti.UI.createView({
        layout: "horizontal",
        width: Titanium.UI.SIZE,
        height: "50%",
        right: 0,
        id: "__alloyId452"
    });
    $.__views.infoWrap.add($.__views.__alloyId452);
    $.__views.c_currentVersion = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        id: "c_currentVersion"
    });
    $.__views.__alloyId452.add($.__views.c_currentVersion);
    $.__views.currentVersion = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 5,
        id: "currentVersion"
    });
    $.__views.__alloyId452.add($.__views.currentVersion);
    $.__views.bottomViewWrap = Ti.UI.createView({
        layout: "composite",
        width: Titanium.UI.FILL,
        height: Titanium.UI.SIZE,
        backgroundColor: "#54EF91",
        borderRadius: 10,
        top: 15,
        id: "bottomViewWrap"
    });
    $.__views.versionInfoView.add($.__views.bottomViewWrap);
    $.__views.updateBtn = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "white",
        font: {
            fontSize: 18,
            fontWeight: "Bold"
        },
        textAlign: "center",
        top: 10,
        bottom: 10,
        id: "updateBtn"
    });
    $.__views.bottomViewWrap.add($.__views.updateBtn);
    updateRecentVersion ? $.addListener($.__views.updateBtn, "click", updateRecentVersion) : __defers["$.__views.updateBtn!click!updateRecentVersion"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.container.title = L("s_versionInfo");
    $.c_currentVersion.text = L("c_currentVersion");
    $.c_recentVersion.text = L("c_recentVersion");
    $.updateBtn.text = L("c_updateRecentVersion");
    var Version = defineVersion();
    var currentVersion = new Version(Titanium.App.version);
    var recentVersion = new Version(Alloy.Globals.appInfoM.get("recentVersion"));
    $.recentVersion.text = recentVersion.toString();
    $.currentVersion.text = currentVersion.toString();
    $.bottomViewWrap.visible = false;
    __defers["$.__views.updateBtn!click!updateRecentVersion"] && $.addListener($.__views.updateBtn, "click", updateRecentVersion);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
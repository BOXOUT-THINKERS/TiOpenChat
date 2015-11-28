function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function updateUserData() {
        var userInfo = userM.getInfo();
        $.profileImage.image = userInfo.imageUrl || "/images/navidrawer_profile_pic.png";
        $.profileName.text = userInfo.name;
    }
    function _moveWindow(controllerName) {
        var windowName = "setting/" + controllerName;
        var controller = Alloy.createController(windowName);
        Alloy.Globals.openWindow(controller);
    }
    function _toggleMenu() {
        $.trigger("menuclick", {
            isNotToggle: false
        });
    }
    function _triggerMenu(menuStr, option) {
        var args = {
            itemId: menuStr,
            isNotToggle: false
        };
        option && _.extend(args, option);
        $.trigger("menuclick", args);
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "menu";
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
    $.__views.menu = Ti.UI.createView({
        backgroundColor: "#f7f7f7",
        id: "menu"
    });
    $.__views.menu && $.addTopLevelView($.__views.menu);
    $.__views.__alloyId215 = Ti.UI.createView({
        backgroundColor: "#54EE92",
        layout: "vertical",
        width: Titanium.UI.FILL,
        height: Titanium.UI.FILL,
        id: "__alloyId215"
    });
    $.__views.menu.add($.__views.__alloyId215);
    $.__views.__alloyId216 = Ti.UI.createView({
        layout: "vertical",
        width: Titanium.UI.FILL,
        height: Titanium.UI.SIZE,
        id: "__alloyId216"
    });
    $.__views.__alloyId215.add($.__views.__alloyId216);
    $.__views.__alloyId217 = Ti.UI.createView({
        layout: "composite",
        width: Titanium.UI.FILL,
        height: Titanium.UI.SIZE,
        top: "7",
        id: "__alloyId217"
    });
    $.__views.__alloyId216.add($.__views.__alloyId217);
    $.__views.profileImage = Ti.UI.createImageView({
        preventDefaultImage: true,
        width: 82,
        height: 82,
        zIndex: 0,
        borderRadius: 41,
        id: "profileImage"
    });
    $.__views.__alloyId217.add($.__views.profileImage);
    $.__views.profileImageOutline = Ti.UI.createImageView({
        preventDefaultImage: true,
        width: 85,
        height: 85,
        image: "/images/navidrawer_profile_outline.png",
        zIndex: 5,
        id: "profileImageOutline"
    });
    $.__views.__alloyId217.add($.__views.profileImageOutline);
    $.__views.profileName = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "white",
        font: {
            fontSize: 20,
            fontWeight: "Bold"
        },
        textAlign: "center",
        top: "4",
        id: "profileName",
        text: "test"
    });
    $.__views.__alloyId216.add($.__views.profileName);
    $.__views.editProfile = Ti.UI.createImageView({
        preventDefaultImage: true,
        width: 104.67,
        height: 31,
        top: 7,
        image: "/images/navidrawer_profile_edit_button.png",
        id: "editProfile"
    });
    $.__views.__alloyId216.add($.__views.editProfile);
    $.__views.__alloyId218 = Ti.UI.createView({
        layout: "horizontal",
        width: Titanium.UI.FILL,
        height: Titanium.UI.SIZE,
        top: 15,
        id: "__alloyId218"
    });
    $.__views.__alloyId215.add($.__views.__alloyId218);
    $.__views.contacts = Ti.UI.createView({
        backgroundColor: "#fd9091",
        layout: "composite",
        width: 65,
        height: 65,
        id: "contacts"
    });
    $.__views.__alloyId218.add($.__views.contacts);
    $.__views.eachImg1 = Ti.UI.createImageView({
        preventDefaultImage: true,
        id: "eachImg1",
        image: "/images/navidrawer_friendlist_icon.png"
    });
    $.__views.contacts.add($.__views.eachImg1);
    $.__views.chatList = Ti.UI.createView({
        backgroundColor: "#fd9091",
        layout: "composite",
        width: 65,
        height: 65,
        left: 1,
        id: "chatList"
    });
    $.__views.__alloyId218.add($.__views.chatList);
    $.__views.eachImg2 = Ti.UI.createImageView({
        preventDefaultImage: true,
        id: "eachImg2",
        image: "/images/navidrawer_chatroomlist_icon.png"
    });
    $.__views.chatList.add($.__views.eachImg2);
    $.__views.request = Ti.UI.createView({
        backgroundColor: "#fd9091",
        layout: "composite",
        width: 65,
        height: 65,
        left: 1,
        id: "request"
    });
    $.__views.__alloyId218.add($.__views.request);
    $.__views.eachImg3 = Ti.UI.createImageView({
        preventDefaultImage: true,
        id: "eachImg3",
        image: "/images/navidrawer_pecking_icon.png"
    });
    $.__views.request.add($.__views.eachImg3);
    $.__views.notify = Ti.UI.createView({
        backgroundColor: "#fd9091",
        layout: "composite",
        width: 65,
        height: 65,
        left: 1,
        id: "notify"
    });
    $.__views.__alloyId218.add($.__views.notify);
    $.__views.eachImg4 = Ti.UI.createImageView({
        preventDefaultImage: true,
        id: "eachImg4",
        image: "/images/navidrawer_photo_icon.png"
    });
    $.__views.notify.add($.__views.eachImg4);
    $.__views.__alloyId219 = Ti.UI.createView({
        layout: "vertical",
        width: Titanium.UI.FILL,
        height: 210,
        top: 13,
        id: "__alloyId219"
    });
    $.__views.__alloyId215.add($.__views.__alloyId219);
    $.__views.__alloyId220 = Ti.UI.createView({
        backgroundColor: "#8b61ff",
        layout: "composite",
        width: Titanium.UI.FILL,
        height: 40,
        id: "__alloyId220"
    });
    $.__views.__alloyId219.add($.__views.__alloyId220);
    $.__views.myLocation = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "white",
        font: {
            fontSize: 14,
            fontWeight: "Regular"
        },
        textAlign: "center",
        id: "myLocation"
    });
    $.__views.__alloyId220.add($.__views.myLocation);
    $.__views.__alloyId221 = Ti.UI.createView({
        backgroundColor: "white",
        width: "90%",
        height: 1,
        bottom: 0,
        id: "__alloyId221"
    });
    $.__views.__alloyId220.add($.__views.__alloyId221);
    $.__views.manageFriend = Ti.UI.createView({
        backgroundColor: "#8b61ff",
        layout: "composite",
        width: Titanium.UI.FILL,
        height: 40,
        id: "manageFriend"
    });
    $.__views.__alloyId219.add($.__views.manageFriend);
    $.__views.eactEtcFont1 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "white",
        font: {
            fontSize: 14,
            fontWeight: "Regular"
        },
        textAlign: "center",
        id: "eactEtcFont1"
    });
    $.__views.manageFriend.add($.__views.eactEtcFont1);
    $.__views.__alloyId222 = Ti.UI.createView({
        backgroundColor: "white",
        width: "90%",
        height: 1,
        bottom: 0,
        id: "__alloyId222"
    });
    $.__views.manageFriend.add($.__views.__alloyId222);
    $.__views.banTime = Ti.UI.createView({
        backgroundColor: "#8b61ff",
        layout: "composite",
        width: Titanium.UI.FILL,
        height: 40,
        id: "banTime"
    });
    $.__views.__alloyId219.add($.__views.banTime);
    $.__views.eactEtcFont2 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "white",
        font: {
            fontSize: 14,
            fontWeight: "Regular"
        },
        textAlign: "center",
        id: "eactEtcFont2"
    });
    $.__views.banTime.add($.__views.eactEtcFont2);
    $.__views.__alloyId223 = Ti.UI.createView({
        backgroundColor: "white",
        width: "90%",
        height: 1,
        bottom: 0,
        id: "__alloyId223"
    });
    $.__views.banTime.add($.__views.__alloyId223);
    $.__views.helpPrivate = Ti.UI.createView({
        backgroundColor: "#8b61ff",
        layout: "composite",
        width: Titanium.UI.FILL,
        height: 40,
        id: "helpPrivate"
    });
    $.__views.__alloyId219.add($.__views.helpPrivate);
    $.__views.eactEtcFont3 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "white",
        font: {
            fontSize: 14,
            fontWeight: "Regular"
        },
        textAlign: "center",
        id: "eactEtcFont3"
    });
    $.__views.helpPrivate.add($.__views.eactEtcFont3);
    $.__views.__alloyId224 = Ti.UI.createView({
        backgroundColor: "white",
        width: "90%",
        height: 1,
        bottom: 0,
        id: "__alloyId224"
    });
    $.__views.helpPrivate.add($.__views.__alloyId224);
    $.__views.setting = Ti.UI.createView({
        backgroundColor: "#8b61ff",
        layout: "composite",
        width: Titanium.UI.FILL,
        height: 40,
        id: "setting"
    });
    $.__views.__alloyId219.add($.__views.setting);
    $.__views.eactEtcFont4 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "white",
        font: {
            fontSize: 14,
            fontWeight: "Regular"
        },
        textAlign: "center",
        id: "eactEtcFont4"
    });
    $.__views.setting.add($.__views.eactEtcFont4);
    $.__views.bottomText = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "white",
        font: {
            fontSize: 10
        },
        textAlign: "center",
        bottom: 15,
        id: "bottomText"
    });
    $.__views.menu.add($.__views.bottomText);
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    var userM = Alloy.Models.instance("user");
    $.myLocation.text = L("c_myLocation");
    $.eactEtcFont1.text = L("c_manageBanFriend");
    $.eactEtcFont2.text = L("c_setBanTime");
    $.eactEtcFont3.text = L("s_helpPrivate");
    $.eactEtcFont4.text = L("c_setting");
    $.bottomText.text = L("c_copyright");
    userM.on("change", updateUserData);
    userM.on("change:profile", updateUserData);
    if (Alloy.Globals.is.shortPhone || "ipad" == Titanium.Platform.osname) {
        $.helpPrivate.visible = false;
        $.helpPrivate.height = 0;
        $.bottomText.visible = false;
    }
    $.contacts.addEventListener("click", function() {
        _triggerMenu("contacts");
    });
    $.chatList.addEventListener("click", function() {
        _triggerMenu("chatlist");
    });
    $.request.addEventListener("click", function() {
        _triggerMenu("zzogi");
    });
    $.notify.addEventListener("click", function() {
        _triggerMenu("zzixgi");
    });
    $.myLocation.addEventListener("click", function() {
        _triggerMenu("zzogi", {
            contactM: null,
            isSingle: true
        });
    });
    $.manageFriend.addEventListener("click", function() {
        _toggleMenu();
        _moveWindow("banManage");
    });
    $.banTime.addEventListener("click", function() {
        _toggleMenu();
        _moveWindow("notifyAndSound");
    });
    $.helpPrivate.addEventListener("click", function() {
        _toggleMenu();
        _moveWindow("helpPrivate");
    });
    $.editProfile.addEventListener("click", function() {
        _triggerMenu("setting");
    });
    $.setting.addEventListener("click", function() {
        _triggerMenu("setting");
    });
    !function() {
        $.editProfile.image = "ko" == Alloy.Globals.currentLanguage ? "/images/navidrawer_profile_edit_button.png" : "/images/navidrawer_profile_edit_button_en.png";
        $.eachImg1.image = "ko" == Alloy.Globals.currentLanguage ? "/images/navidrawer_friendlist_icon.png" : "/images/navidrawer_friendlist_icon_en.png";
        $.eachImg2.image = "ko" == Alloy.Globals.currentLanguage ? "/images/navidrawer_chatroomlist_icon.png" : "/images/navidrawer_chatroomlist_icon_en.png";
        $.eachImg3.image = "ko" == Alloy.Globals.currentLanguage ? "/images/navidrawer_pecking_icon.png" : "/images/navidrawer_pecking_icon_en.png";
        $.eachImg4.image = "ko" == Alloy.Globals.currentLanguage ? "/images/navidrawer_photo_icon.png" : "/images/navidrawer_photo_icon_en.png";
    }();
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
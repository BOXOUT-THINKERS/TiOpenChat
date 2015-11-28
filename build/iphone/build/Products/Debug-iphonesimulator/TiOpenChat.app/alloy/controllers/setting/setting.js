function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function registerListerners() {
        var userM = Alloy.Models.instance("user");
        userM.on("change:profile", updateUserData);
        $.notifyAndSound.addEventListener("click", moveWindow.bind(null, "notifyAndSound"));
        $.banManage.addEventListener("click", moveWindow.bind(null, "banManage"));
        $.versionInfo.addEventListener("click", moveWindow.bind(null, "versionInfo"));
        $.helpPrivate.addEventListener("click", moveWindow.bind(null, "helpPrivate"));
    }
    function init() {
        updateUserData();
        updateSettingData();
    }
    function updateSettingData() {}
    function updateUserData() {
        var userM = Alloy.Globals.user.attributes || {};
        $.profileImage.image = userM.get("profileImage") ? userM.get("profileImage").url() : "/images/setting_default_profile_pic.png";
        $.profileName.text = userM.get("name") || "";
        $.profileComment.text = userM.get("comment") || "";
        $.phoneNumber.text = userM.get("local") + "-" + userM.get("phone");
    }
    function moveWindow(controllerName) {
        var windowName = "setting/" + controllerName;
        var controller = Alloy.createController(windowName);
        Alloy.Globals.openWindow(controller);
    }
    function moveProfileEdittingForName() {
        var args = {
            caseName: "name"
        };
        var controller = Alloy.createController("setting/profileEditing", args);
        Alloy.Globals.openWindow(controller);
    }
    function moveProfileEdittingForComment() {
        var args = {
            caseName: "comment"
        };
        var controller = Alloy.createController("setting/profileEditing", args);
        Alloy.Globals.openWindow(controller);
    }
    function changeProfileImage() {
        function _successCallback(photoInfo) {
            Alloy.Globals.startWaiting();
            var photoBlob = photoInfo.blob;
            var imgName = photoInfo.name;
            var thumbnailBlob = localPhotoService.resizeForThumbnail(photoBlob);
            Ti.API.debug("capturePhoto : " + imgName);
            remotePhotoService.savePhoto(thumbnailBlob, imgName).then(function(parseFile) {
                var imgPath = parseFile.url();
                Ti.API.debug("savePhoto : " + imgPath);
                Alloy.Globals.stopWaiting();
                _updateUser({
                    profileImage: parseFile
                }, false);
                Ti.API.debug("remote save : ", imgPath);
            }).catch(function(e) {
                Ti.API.debug(e);
            });
        }
        function _errorCallback(error) {
            Alloy.Globals.stopWaiting();
            var message = error.message ? error.message : error;
            Ti.API.debug(message);
            error.isCancel || Alloy.Globals.toast(msg);
        }
        var opts = {
            byAlbum: 0,
            byCamera: 1
        };
        opts.options = [ L("s_selectPhotoByAlbum"), L("s_selectPhotoByCamera"), L("c_cancle") ];
        var dialog = Ti.UI.createOptionDialog(opts);
        dialog.addEventListener("click", function(e) {
            if (e.index > 1) return;
            e.index == e.source.byAlbum && localPhotoService.getPhoto().then(_successCallback).catch(_errorCallback);
            e.index == e.source.byCamera && localPhotoService.capturePhoto().then(_successCallback).catch(_errorCallback);
        });
        dialog.show();
    }
    function scrollHandler() {}
    function _updateUser(data, isNotNotifyAboutChangeUser) {
        var userM = Alloy.Globals.user.attributes;
        userM.set(data, {
            change: false
        });
        isNotNotifyAboutChangeUser || Alloy.Globals.user.trigger("change:profile");
        Parse.Cloud.run("userModify", data, {
            success: function() {
                Ti.API.debug("settings:UserModify success");
            },
            error: function(error) {
                Ti.API.debug("settings:UserModify error : ", error);
            }
        });
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "setting/setting";
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
    $.__views.container = Ti.UI.createView({
        id: "container"
    });
    $.__views.container && $.addTopLevelView($.__views.container);
    $.__views.settingView = Ti.UI.createScrollView({
        width: Titanium.UI.FILL,
        height: Titanium.UI.FILL,
        layout: "vertical",
        id: "settingView"
    });
    $.__views.container.add($.__views.settingView);
    scrollHandler ? $.addListener($.__views.settingView, "scroll", scrollHandler) : __defers["$.__views.settingView!scroll!scrollHandler"] = true;
    $.__views.__alloyId506 = Ti.UI.createView({
        width: Titanium.UI.FILL,
        height: Titanium.UI.SIZE,
        layout: "composite",
        id: "__alloyId506"
    });
    $.__views.settingView.add($.__views.__alloyId506);
    changeProfileImage ? $.addListener($.__views.__alloyId506, "click", changeProfileImage) : __defers["$.__views.__alloyId506!click!changeProfileImage"] = true;
    $.__views.profileImageWrap = Ti.UI.createView({
        width: Titanium.UI.FILL,
        height: Titanium.UI.SIZE,
        layout: "composite",
        top: 10,
        bottom: 10,
        id: "profileImageWrap"
    });
    $.__views.__alloyId506.add($.__views.profileImageWrap);
    $.__views.profileImage = Ti.UI.createImageView({
        preventDefaultImage: true,
        height: 130,
        width: 130,
        borderRadius: 65,
        id: "profileImage"
    });
    $.__views.profileImageWrap.add($.__views.profileImage);
    $.__views.profileImageOutline = Ti.UI.createImageView({
        preventDefaultImage: true,
        height: 131,
        width: 131,
        image: "/images/setting_profile_outline.png",
        id: "profileImageOutline"
    });
    $.__views.profileImageWrap.add($.__views.profileImageOutline);
    $.__views.__alloyId507 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId507"
    });
    $.__views.__alloyId506.add($.__views.__alloyId507);
    $.__views.__alloyId508 = Ti.UI.createView({
        backgroundColor: "#f7f7f7",
        height: 43,
        width: Titanium.UI.FILL,
        layout: "composite",
        id: "__alloyId508"
    });
    $.__views.settingView.add($.__views.__alloyId508);
    moveProfileEdittingForName ? $.addListener($.__views.__alloyId508, "click", moveProfileEdittingForName) : __defers["$.__views.__alloyId508!click!moveProfileEdittingForName"] = true;
    $.__views.s_nameTitle = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 36,
        id: "s_nameTitle"
    });
    $.__views.__alloyId508.add($.__views.s_nameTitle);
    $.__views.profileName = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#A6A6A6",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        right: 55,
        id: "profileName"
    });
    $.__views.__alloyId508.add($.__views.profileName);
    $.__views.__alloyId509 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId509"
    });
    $.__views.__alloyId508.add($.__views.__alloyId509);
    $.__views.__alloyId510 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId510"
    });
    $.__views.__alloyId509.add($.__views.__alloyId510);
    $.__views.__alloyId511 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId511"
    });
    $.__views.__alloyId508.add($.__views.__alloyId511);
    $.__views.__alloyId512 = Ti.UI.createView({
        backgroundColor: "#f7f7f7",
        height: 43,
        width: Titanium.UI.FILL,
        layout: "composite",
        id: "__alloyId512"
    });
    $.__views.settingView.add($.__views.__alloyId512);
    moveProfileEdittingForComment ? $.addListener($.__views.__alloyId512, "click", moveProfileEdittingForComment) : __defers["$.__views.__alloyId512!click!moveProfileEdittingForComment"] = true;
    $.__views.s_commentTitle = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 36,
        id: "s_commentTitle"
    });
    $.__views.__alloyId512.add($.__views.s_commentTitle);
    $.__views.profileComment = Ti.UI.createLabel({
        width: "50%",
        height: 22,
        color: "#A6A6A6",
        font: {
            fontSize: 16
        },
        textAlign: Titanium.UI.TEXT_ALIGNMENT_RIGHT,
        right: 55,
        ellipsize: true,
        wordWrap: false,
        id: "profileComment"
    });
    $.__views.__alloyId512.add($.__views.profileComment);
    $.__views.__alloyId513 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId513"
    });
    $.__views.__alloyId512.add($.__views.__alloyId513);
    $.__views.__alloyId514 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId514"
    });
    $.__views.__alloyId513.add($.__views.__alloyId514);
    $.__views.__alloyId515 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId515"
    });
    $.__views.__alloyId512.add($.__views.__alloyId515);
    $.__views.__alloyId516 = Ti.UI.createView({
        backgroundColor: "#eeeeee",
        width: Ti.UI.FILL,
        height: 33,
        id: "__alloyId516"
    });
    $.__views.settingView.add($.__views.__alloyId516);
    $.__views.__alloyId517 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId517"
    });
    $.__views.__alloyId516.add($.__views.__alloyId517);
    $.__views.notifyAndSound = Ti.UI.createView({
        backgroundColor: "#f7f7f7",
        height: 43,
        width: Titanium.UI.FILL,
        layout: "composite",
        id: "notifyAndSound"
    });
    $.__views.settingView.add($.__views.notifyAndSound);
    $.__views.s_notifyAndSound = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 36,
        id: "s_notifyAndSound"
    });
    $.__views.notifyAndSound.add($.__views.s_notifyAndSound);
    $.__views.__alloyId518 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId518"
    });
    $.__views.notifyAndSound.add($.__views.__alloyId518);
    $.__views.__alloyId519 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId519"
    });
    $.__views.__alloyId518.add($.__views.__alloyId519);
    $.__views.__alloyId520 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId520"
    });
    $.__views.notifyAndSound.add($.__views.__alloyId520);
    $.__views.banManage = Ti.UI.createView({
        backgroundColor: "#f7f7f7",
        height: 43,
        width: Titanium.UI.FILL,
        layout: "composite",
        id: "banManage"
    });
    $.__views.settingView.add($.__views.banManage);
    $.__views.s_friendManage = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 36,
        id: "s_friendManage"
    });
    $.__views.banManage.add($.__views.s_friendManage);
    $.__views.__alloyId521 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId521"
    });
    $.__views.banManage.add($.__views.__alloyId521);
    $.__views.__alloyId522 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId522"
    });
    $.__views.__alloyId521.add($.__views.__alloyId522);
    $.__views.__alloyId523 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId523"
    });
    $.__views.banManage.add($.__views.__alloyId523);
    $.__views.privateInfo = Ti.UI.createView({
        backgroundColor: "#f7f7f7",
        height: 43,
        width: Titanium.UI.FILL,
        layout: "composite",
        id: "privateInfo"
    });
    $.__views.settingView.add($.__views.privateInfo);
    $.__views.s_connectSNS = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#A6A6A6",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 36,
        id: "s_connectSNS"
    });
    $.__views.privateInfo.add($.__views.s_connectSNS);
    $.__views.__alloyId524 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId524"
    });
    $.__views.privateInfo.add($.__views.__alloyId524);
    $.__views.__alloyId525 = Ti.UI.createView({
        backgroundColor: "#f7f7f7",
        height: 43,
        width: Titanium.UI.FILL,
        layout: "composite",
        id: "__alloyId525"
    });
    $.__views.settingView.add($.__views.__alloyId525);
    $.__views.s_phone = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 36,
        id: "s_phone"
    });
    $.__views.__alloyId525.add($.__views.s_phone);
    $.__views.phoneNumber = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#A6A6A6",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        right: 55,
        id: "phoneNumber"
    });
    $.__views.__alloyId525.add($.__views.phoneNumber);
    $.__views.__alloyId526 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId526"
    });
    $.__views.__alloyId525.add($.__views.__alloyId526);
    $.__views.versionInfo = Ti.UI.createView({
        backgroundColor: "#f7f7f7",
        height: 43,
        width: Titanium.UI.FILL,
        layout: "composite",
        id: "versionInfo"
    });
    $.__views.settingView.add($.__views.versionInfo);
    $.__views.s_versionInfo = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 36,
        id: "s_versionInfo"
    });
    $.__views.versionInfo.add($.__views.s_versionInfo);
    $.__views.__alloyId527 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId527"
    });
    $.__views.versionInfo.add($.__views.__alloyId527);
    $.__views.__alloyId528 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId528"
    });
    $.__views.__alloyId527.add($.__views.__alloyId528);
    $.__views.__alloyId529 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId529"
    });
    $.__views.versionInfo.add($.__views.__alloyId529);
    $.__views.helpPrivate = Ti.UI.createView({
        backgroundColor: "#f7f7f7",
        height: 43,
        width: Titanium.UI.FILL,
        layout: "composite",
        id: "helpPrivate"
    });
    $.__views.settingView.add($.__views.helpPrivate);
    $.__views.s_helpPrivate = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 36,
        id: "s_helpPrivate"
    });
    $.__views.helpPrivate.add($.__views.s_helpPrivate);
    $.__views.__alloyId530 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId530"
    });
    $.__views.helpPrivate.add($.__views.__alloyId530);
    $.__views.__alloyId531 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId531"
    });
    $.__views.__alloyId530.add($.__views.__alloyId531);
    $.__views.__alloyId532 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId532"
    });
    $.__views.helpPrivate.add($.__views.__alloyId532);
    $.__views.__alloyId533 = Ti.UI.createView({
        backgroundColor: "#eeeeee",
        width: Ti.UI.FILL,
        height: 33,
        id: "__alloyId533"
    });
    $.__views.settingView.add($.__views.__alloyId533);
    $.__views.__alloyId534 = Ti.UI.createView({
        backgroundColor: "#eeeeee",
        width: Ti.UI.FILL,
        height: 33,
        id: "__alloyId534"
    });
    $.__views.settingView.add($.__views.__alloyId534);
    $.__views.__alloyId535 = Ti.UI.createView({
        backgroundColor: "#eeeeee",
        width: Ti.UI.FILL,
        height: 33,
        id: "__alloyId535"
    });
    $.__views.settingView.add($.__views.__alloyId535);
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.container.title = L("c_setting");
    $.s_nameTitle.text = L("s_nameTitle");
    $.s_commentTitle.text = L("s_commentTitle");
    $.s_notifyAndSound.text = L("s_notifyAndSound");
    $.s_friendManage.text = L("s_friendManage");
    $.s_connectSNS.text = L("s_connectSNS");
    $.s_phone.text = L("s_phone");
    $.s_versionInfo.text = L("s_versionInfo");
    $.s_helpPrivate.text = L("s_helpPrivate");
    Alloy.Globals.util;
    Alloy.Globals.settings;
    var localPhotoService = require("services/localPhotoService");
    var remotePhotoService = require("services/remotePhotoService");
    exports.rightBtn = function() {
        init();
        var rightBtnOption = {
            title: ""
        };
        var rightBtnFn = function() {};
        return {
            centerTitle: L("c_setting"),
            rightBtnOption: rightBtnOption,
            rightBtnFn: rightBtnFn
        };
    };
    registerListerners();
    "ko" != Alloy.Globals.currentLanguage && true && ($.phoneNumber.right = 18);
    __defers["$.__views.settingView!scroll!scrollHandler"] && $.addListener($.__views.settingView, "scroll", scrollHandler);
    __defers["$.__views.__alloyId506!click!changeProfileImage"] && $.addListener($.__views.__alloyId506, "click", changeProfileImage);
    __defers["$.__views.__alloyId508!click!moveProfileEdittingForName"] && $.addListener($.__views.__alloyId508, "click", moveProfileEdittingForName);
    __defers["$.__views.__alloyId512!click!moveProfileEdittingForComment"] && $.addListener($.__views.__alloyId512, "click", moveProfileEdittingForComment);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "chat/photoViewer";
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
    $.__views.window = Ti.UI.createWindow({
        backgroundColor: "white",
        barColor: "#54EE92",
        translucent: false,
        navTintColor: "white",
        titleAttributes: {
            color: "white"
        },
        statusBarStyle: Titanium.UI.iPhone.StatusBar.LIGHT_CONTENT,
        layout: "composite",
        width: Titanium.UI.FILL,
        height: Titanium.UI.FILL,
        theme: "Theme.NoActionBar",
        id: "window",
        title: "photo"
    });
    $.__views.window && $.addTopLevelView($.__views.window);
    $.__views.__alloyId271 = Ti.UI.createView({
        backgroundColor: "black",
        opacity: .5,
        height: 20,
        top: 0,
        zIndex: 1,
        id: "__alloyId271"
    });
    $.__views.window.add($.__views.__alloyId271);
    $.__views.topView = Ti.UI.createView({
        backgroundColor: "black",
        opacity: .5,
        layout: "composite",
        width: Titanium.UI.FILL,
        height: 48,
        top: 20,
        zIndex: 1,
        visible: true,
        id: "topView"
    });
    $.__views.window.add($.__views.topView);
    $.__views.closeBtn = Ti.UI.createButton({
        color: "white",
        font: {
            fontWeight: "Regular",
            fontSize: 15
        },
        left: 24,
        id: "closeBtn"
    });
    $.__views.topView.add($.__views.closeBtn);
    $.__views.nameAndTime = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#9e9e9e",
        font: {
            fontSize: 13,
            fontWeight: "Regular"
        },
        textAlign: "center",
        id: "nameAndTime"
    });
    $.__views.topView.add($.__views.nameAndTime);
    $.__views.centerView = Ti.UI.createView({
        layout: "vertical",
        width: Titanium.UI.SIZE,
        height: Ti.UI.SIZE,
        id: "centerView"
    });
    $.__views.window.add($.__views.centerView);
    $.__views.currentImage = Ti.UI.createImageView({
        preventDefaultImage: true,
        width: Titanium.UI.SIZE,
        height: Titanium.UI.SIZE,
        zIndex: 0,
        id: "currentImage"
    });
    $.__views.centerView.add($.__views.currentImage);
    $.__views.bottomView = Ti.UI.createView({
        backgroundColor: "black",
        opacity: .5,
        layout: "composite",
        width: Titanium.UI.FILL,
        height: 48,
        bottom: 0,
        zIndex: 1,
        visible: true,
        id: "bottomView"
    });
    $.__views.window.add($.__views.bottomView);
    $.__views.saveBtn = Ti.UI.createImageView({
        preventDefaultImage: true,
        left: 24,
        image: "/images/Picture_dnload_button.png",
        id: "saveBtn",
        title: "save"
    });
    $.__views.bottomView.add($.__views.saveBtn);
    $.__views.exportBtn = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "image/Picture_export_button.png",
        id: "exportBtn"
    });
    $.__views.bottomView.add($.__views.exportBtn);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    $.closeBtn.title = L("pv_closeBtn");
    var photoUrl = args.photoUrl;
    var photoName = args.photoName;
    args.location;
    var localPhotoService = require("services/localPhotoService");
    exports.isLoadCompletePrevImage = false;
    Ti.API.debug("photoViewer :");
    $.currentImage.addEventListener("load", function() {
        exports.isLoadCompletePrevImage = true;
        Alloy.Globals.stopWaiting();
    });
    $.currentImage.image = photoUrl;
    $.window.addEventListener("open", function() {
        exports.isLoadCompletePrevImage || Alloy.Globals.startWaiting();
    });
    $.currentImage.addEventListener("click", function() {
        if ($.topView.visible) {
            $.topView.visible = false;
            $.bottomView.visible = false;
        } else {
            $.topView.visible = true;
            $.bottomView.visible = true;
        }
    });
    $.saveBtn.addEventListener("click", function() {
        Ti.API.debug("save photo", photoUrl, photoName);
        Alloy.Globals.startWaiting();
        var blob = $.currentImage.toBlob();
        localPhotoService.saveToPhotoGallery(blob, function(e) {
            Ti.API.debug("----photoGallery saved", e);
            Alloy.Globals.toast("ps_successSavePhoto");
            Alloy.Globals.stopWaiting();
        }, function(e) {
            Ti.API.debug("-----photoGallery errro", e);
            Alloy.Globals.error("ps_failSavePhoto");
            Alloy.Globals.stopWaiting();
        });
    });
    $.closeBtn.addEventListener("click", function() {
        $.getView().close();
        Alloy.Globals.stopWaiting();
    });
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
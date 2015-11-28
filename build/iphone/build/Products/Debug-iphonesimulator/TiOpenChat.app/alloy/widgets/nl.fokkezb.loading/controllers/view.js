function WPATH(s) {
    var index = s.lastIndexOf("/");
    var path = -1 === index ? "nl.fokkezb.loading/" + s : s.substring(0, index) + "/nl.fokkezb.loading/" + s.substring(index + 1);
    return path;
}

function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function update(_message, _cancelable) {
        $.loadingMessage.text = _message || L("loadingMessage", "Loading...");
        cancelable = _cancelable;
    }
    function cancel() {
        if (_.isFunction(cancelable)) {
            cancelable();
            $.trigger("cancel");
            hide();
        }
    }
    function show(_message, _cancelable) {
        update(_message, _cancelable);
        $.loadingMask.show();
        useImages ? $.loadingImages.start() : $.loadingIndicator.show();
    }
    function hide() {
        $.loadingMask.hide();
    }
    new (require("alloy/widget"))("nl.fokkezb.loading");
    this.__widgetId = "nl.fokkezb.loading";
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "view";
    this.args = arguments[0] || {};
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.loadingMask = Ti.UI.createView({
        backgroundColor: "#5000",
        visible: false,
        id: "loadingMask"
    });
    $.__views.loadingMask && $.addTopLevelView($.__views.loadingMask);
    cancel ? $.addListener($.__views.loadingMask, "click", cancel) : __defers["$.__views.loadingMask!click!cancel"] = true;
    $.__views.loadingOuter = Ti.UI.createView({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        borderRadius: 10,
        backgroundColor: "#C000",
        id: "loadingOuter"
    });
    $.__views.loadingMask.add($.__views.loadingOuter);
    $.__views.loadingInner = Ti.UI.createView({
        top: "20dp",
        right: "20dp",
        bottom: "20dp",
        left: "20dp",
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        layout: "vertical",
        id: "loadingInner"
    });
    $.__views.loadingOuter.add($.__views.loadingInner);
    $.__views.loadingIndicator = Ti.UI.createActivityIndicator({
        top: "0dp",
        style: Ti.UI.iPhone.ActivityIndicatorStyle.BIG,
        id: "loadingIndicator"
    });
    $.__views.loadingInner.add($.__views.loadingIndicator);
    $.__views.loadingImages = Ti.UI.createImageView({
        preventDefaultImage: true,
        top: "0dp",
        images: [ "/images/nl.fokkezb.loading/00.png", "/images/nl.fokkezb.loading/01.png", "/images/nl.fokkezb.loading/02.png", "/images/nl.fokkezb.loading/03.png", "/images/nl.fokkezb.loading/04.png", "/images/nl.fokkezb.loading/05.png", "/images/nl.fokkezb.loading/06.png", "/images/nl.fokkezb.loading/07.png", "/images/nl.fokkezb.loading/08.png", "/images/nl.fokkezb.loading/09.png", "/images/nl.fokkezb.loading/10.png", "/images/nl.fokkezb.loading/11.png" ],
        id: "loadingImages"
    });
    $.__views.loadingInner.add($.__views.loadingImages);
    $.__views.loadingMessage = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#fff",
        font: {
            fontSize: "16dp"
        },
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        top: "20dp",
        text: L("loadingMessage", "Loading.."),
        id: "loadingMessage"
    });
    $.__views.loadingInner.add($.__views.loadingMessage);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var useImages = false, cancelable = null;
    $.show = show;
    $.hide = hide;
    $.update = update;
    $.cancel = cancel;
    Object.defineProperty($, "visible", {
        get: function() {
            return $.loadingMask.visible;
        },
        set: function(visible) {
            return visible ? show() : hide();
        }
    });
    !function(args) {
        if ($.loadingMask.images) {
            useImages = true;
            $.loadingInner.remove($.loadingIndicator);
            $.loadingIndicator = null;
        } else {
            $.loadingInner.remove($.loadingImages);
            $.loadingImages = null;
        }
        args = null;
    }(arguments[0] || {});
    __defers["$.__views.loadingMask!click!cancel"] && $.addListener($.__views.loadingMask, "click", cancel);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
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
        $.view.update(_message, _cancelable);
        cancelable = _cancelable;
    }
    function show(_message, _cancelable) {
        $.view.show(_message, _cancelable);
        $.win.open();
    }
    function hide() {
        var close = function() {
            $.view.hide();
            $.win.close();
            cancelable = null;
        };
        close();
    }
    function onFocus() {
        hasFocus = true;
    }
    function onBlur() {
        hasFocus = false;
    }
    new (require("alloy/widget"))("nl.fokkezb.loading");
    this.__widgetId = "nl.fokkezb.loading";
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "window";
    this.args = arguments[0] || {};
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.win = Ti.UI.createWindow({
        backgroundColor: "transparent",
        barColor: "#54EE92",
        translucent: false,
        navTintColor: "white",
        titleAttributes: {
            color: "white"
        },
        statusBarStyle: Titanium.UI.iPhone.StatusBar.LIGHT_CONTENT,
        backgroundImage: null,
        opacity: 1,
        navBarHidden: true,
        modal: false,
        theme: "Theme.AppCompat.Translucent.NoTitleBar",
        id: "win"
    });
    $.__views.win && $.addTopLevelView($.__views.win);
    onFocus ? $.addListener($.__views.win, "focus", onFocus) : __defers["$.__views.win!focus!onFocus"] = true;
    onBlur ? $.addListener($.__views.win, "blur", onBlur) : __defers["$.__views.win!blur!onBlur"] = true;
    $.__views.view = Alloy.createWidget("nl.fokkezb.loading", "view", {
        id: "view",
        __parentSymbol: $.__views.win
    });
    $.__views.view.setParent($.__views.win);
    hide ? $.__views.view.on("cancel", hide) : __defers["$.__views.view!cancel!hide"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.update = update;
    $.show = show;
    $.hide = hide;
    Object.defineProperty($, "visible", {
        get: function() {
            return isOpen && hasFocus;
        },
        set: function(visible) {
            return visible ? show() : hide();
        }
    });
    var cancelable;
    var isOpen = false;
    var hasFocus = false;
    !function(args) {
        args = null;
    }(arguments[0] || {});
    __defers["$.__views.win!focus!onFocus"] && $.addListener($.__views.win, "focus", onFocus);
    __defers["$.__views.win!blur!onBlur"] && $.addListener($.__views.win, "blur", onBlur);
    __defers["$.__views.view!cancel!hide"] && $.__views.view.on("cancel", hide);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
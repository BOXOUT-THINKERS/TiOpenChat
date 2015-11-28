function WPATH(s) {
    var index = s.lastIndexOf("/");
    var path = -1 === index ? "nl.fokkezb.toast/" + s : s.substring(0, index) + "/nl.fokkezb.toast/" + s.substring(index + 1);
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
    function show() {
        $.view.animate(_.omit($.createStyle({
            classes: [ "nlFokkezbToast_enterAnimation" ]
        }), "classes"));
    }
    function hide() {
        $.view.animate(_.omit($.createStyle({
            classes: [ "nlFokkezbToast_exitAnimation" ]
        }), "classes"), function() {
            parent === $.window && $.window.close();
            parent.remove($.view);
        });
    }
    new (require("alloy/widget"))("nl.fokkezb.toast");
    this.__widgetId = "nl.fokkezb.toast";
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "widget";
    this.args = arguments[0] || {};
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.window = Ti.UI.createWindow({
        backgroundColor: "transparent",
        barColor: "#54EE92",
        translucent: false,
        navTintColor: "white",
        titleAttributes: {
            color: "white"
        },
        statusBarStyle: Titanium.UI.iPhone.StatusBar.LIGHT_CONTENT,
        width: Ti.UI.SIZE,
        height: "60dp",
        bottom: 0,
        backgroundImage: null,
        apiName: "Ti.UI.Window",
        id: "window",
        classes: [ "nlFokkezbToast_window" ]
    });
    $.__views.window && $.addTopLevelView($.__views.window);
    $.__views.view = Ti.UI.createView({
        width: Ti.UI.SIZE,
        height: "30dp",
        bottom: "-30dp",
        backgroundColor: "#000",
        borderRadius: "5dp",
        apiName: "Ti.UI.View",
        id: "view",
        classes: [ "nlFokkezbToast_view" ]
    });
    $.__views.view && $.addTopLevelView($.__views.view);
    hide ? $.addListener($.__views.view, "click", hide) : __defers["$.__views.view!click!hide"] = true;
    $.__views.label = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#fff",
        font: {
            fontSize: 17,
            fontWeight: "bold"
        },
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        left: "10dp",
        right: "10dp",
        apiName: "Ti.UI.Label",
        id: "label",
        classes: [ "nlFokkezbToast_label" ]
    });
    $.__views.view.add($.__views.label);
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.show = show;
    $.hide = hide;
    var parent;
    !function(args) {
        var viewClasses = [ "nlFokkezbToast_view" ];
        var labelClasses = [ "nlFokkezbToast_label" ];
        if (args.theme) {
            viewClasses.push("nlFokkezbToast_view_" + args.theme);
            labelClasses.push("nlFokkezbToast_label_" + args.theme);
        }
        $.resetClass($.view, viewClasses);
        $.resetClass($.label, labelClasses, {
            text: args.message
        });
        parent = args.view || $.window;
        parent.add($.view);
        args.view || $.window.open();
        show();
        args.persistent || setTimeout(function() {
            hide();
        }, args.duration || 3e3);
    }(arguments[0] || {});
    __defers["$.__views.view!click!hide"] && $.addListener($.__views.view, "click", hide);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
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
    function show(_message, _cancelable) {
        if (ctrl && ctrl.hasFocus) {
            ctrl.update(_message, _cancelable);
            return;
        }
        var newCtrl = Widget.createController("window");
        newCtrl.show(_message, _cancelable);
        ctrl && hide();
        ctrl = newCtrl;
    }
    function hide() {
        if (ctrl) {
            ctrl.hide();
            ctrl = null;
        }
        return;
    }
    var Widget = new (require("alloy/widget"))("nl.fokkezb.loading");
    this.__widgetId = "nl.fokkezb.loading";
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
    exports.destroy = function() {};
    _.extend($, $.__views);
    var ctrl;
    Object.defineProperty($, "visible", {
        get: function() {
            return ctrl && ctrl.hasFocus;
        },
        set: function(visible) {
            return visible ? show() : hide();
        }
    });
    $.show = show;
    $.hide = hide;
    $.progress = true;
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
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
    this.__controllerPath = "setting/profileTemplate";
    this.args = arguments[0] || {};
    if (arguments[0]) {
        {
            __processArg(arguments[0], "__parentSymbol");
        }
        {
            __processArg(arguments[0], "$model");
        }
        var __itemTemplate = __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    var __alloyId408 = [];
    var __alloyId410 = {
        type: "Ti.UI.ImageView",
        bindId: "profileImg",
        properties: {
            preventDefaultImage: true,
            bindId: "profileImg",
            height: "100",
            width: "100",
            left: "10"
        }
    };
    __alloyId408.push(__alloyId410);
    var __alloyId412 = {
        type: "Ti.UI.View",
        childTemplates: function() {
            var __alloyId413 = [];
            var __alloyId415 = {
                type: "Ti.UI.Label",
                bindId: "name",
                properties: {
                    width: Ti.UI.SIZE,
                    height: Ti.UI.SIZE,
                    color: "black",
                    font: {
                        fontSize: "18sp"
                    },
                    textAlign: "center",
                    bindId: "name"
                }
            };
            __alloyId413.push(__alloyId415);
            var __alloyId417 = {
                type: "Ti.UI.Label",
                bindId: "word",
                properties: {
                    width: Ti.UI.SIZE,
                    height: Ti.UI.SIZE,
                    color: "black",
                    font: {
                        fontSize: "18sp"
                    },
                    textAlign: "center",
                    bindId: "word"
                }
            };
            __alloyId413.push(__alloyId417);
            return __alloyId413;
        }(),
        properties: {}
    };
    __alloyId408.push(__alloyId412);
    $.__views.profileTemplate = {
        properties: {
            name: "profileTemplate",
            height: "100",
            id: "profileTemplate"
        },
        childTemplates: __alloyId408
    };
    __itemTemplate["profileTemplate"] = $.__views.profileTemplate;
    $.__views.profileTemplate && $.addTopLevelView($.__views.profileTemplate);
    exports.destroy = function() {};
    _.extend($, $.__views);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
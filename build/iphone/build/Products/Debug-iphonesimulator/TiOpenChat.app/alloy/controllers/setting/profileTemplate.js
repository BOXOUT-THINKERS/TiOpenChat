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
    var __alloyId493 = [];
    var __alloyId495 = {
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
    __alloyId493.push(__alloyId495);
    var __alloyId497 = {
        type: "Ti.UI.View",
        childTemplates: function() {
            var __alloyId498 = [];
            var __alloyId500 = {
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
            __alloyId498.push(__alloyId500);
            var __alloyId502 = {
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
            __alloyId498.push(__alloyId502);
            return __alloyId498;
        }(),
        properties: {}
    };
    __alloyId493.push(__alloyId497);
    $.__views.profileTemplate = {
        properties: {
            name: "profileTemplate",
            height: "100",
            id: "profileTemplate"
        },
        childTemplates: __alloyId493
    };
    __itemTemplate["profileTemplate"] = $.__views.profileTemplate;
    $.__views.profileTemplate && $.addTopLevelView($.__views.profileTemplate);
    exports.destroy = function() {};
    _.extend($, $.__views);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
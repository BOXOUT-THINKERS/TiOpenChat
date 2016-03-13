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
    this.__controllerPath = "setting/rowTemplate";
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
    var __alloyId418 = [];
    var __alloyId419 = {
        type: "Ti.UI.Label",
        bindId: "title",
        properties: {
            width: Ti.UI.SIZE,
            height: Ti.UI.SIZE,
            color: "black",
            font: {
                fontSize: "18sp"
            },
            textAlign: "center",
            left: 10,
            bindId: "title"
        }
    };
    __alloyId418.push(__alloyId419);
    var __alloyId420 = {
        type: "Ti.UI.Button",
        bindId: "detail",
        properties: {
            right: 10,
            bindId: "detail"
        }
    };
    __alloyId418.push(__alloyId420);
    $.__views.rowTemplate = {
        properties: {
            name: "rowTemplate",
            id: "rowTemplate"
        },
        childTemplates: __alloyId418
    };
    __itemTemplate["rowTemplate"] = $.__views.rowTemplate;
    $.__views.rowTemplate && $.addTopLevelView($.__views.rowTemplate);
    exports.destroy = function() {};
    _.extend($, $.__views);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
function WPATH(s) {
    var index = s.lastIndexOf("/");
    var path = -1 === index ? "danielhanold.pickerWidget/" + s : s.substring(0, index) + "/danielhanold.pickerWidget/" + s.substring(index + 1);
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
    function onCancel() {
        args.parentFunctions.close({
            cancel: true
        });
    }
    function onDone() {
        args.parentFunctions.done();
    }
    new (require("alloy/widget"))("danielhanold.pickerWidget");
    this.__widgetId = "danielhanold.pickerWidget";
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "pickerView";
    this.args = arguments[0] || {};
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.pickerView = Ti.UI.createView({
        backgroundColor: "white",
        bottom: 0,
        height: 260,
        zIndex: 99,
        id: "pickerView"
    });
    $.__views.pickerView && $.addTopLevelView($.__views.pickerView);
    var __alloyId1 = [];
    $.__views.buttonCancel = Ti.UI.createButton({
        id: "buttonCancel",
        title: L("cancelButton", "Cancel"),
        style: Ti.UI.iPhone.SystemButtonStyle.BORDERED
    });
    __alloyId1.push($.__views.buttonCancel);
    onCancel ? $.addListener($.__views.buttonCancel, "click", onCancel) : __defers["$.__views.buttonCancel!click!onCancel"] = true;
    $.__views.__alloyId2 = Ti.UI.createButton({
        systemButton: Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    __alloyId1.push($.__views.__alloyId2);
    $.__views.buttonDone = Ti.UI.createButton({
        id: "buttonDone",
        title: L("doneButton", "Done"),
        style: Ti.UI.iPhone.SystemButtonStyle.DONE
    });
    __alloyId1.push($.__views.buttonDone);
    onDone ? $.addListener($.__views.buttonDone, "click", onDone) : __defers["$.__views.buttonDone!click!onDone"] = true;
    $.__views.toolbar = Ti.UI.iOS.createToolbar({
        top: 0,
        barColor: "white",
        items: __alloyId1,
        id: "toolbar"
    });
    $.__views.pickerView.add($.__views.toolbar);
    $.__views.picker = Ti.UI.createPicker({
        top: 44,
        selectionIndicator: true,
        useSpinner: true,
        id: "picker"
    });
    $.__views.pickerView.add($.__views.picker);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    var pickerParams = args.pickerParams || {};
    if ("date-picker" === args.type) {
        $.picker.type = Ti.UI.PICKER_TYPE_DATE;
        $.picker.selectionIndicator = false;
        _.isDate(pickerParams.minDate) && ($.picker.minDate = pickerParams.minDate);
        _.isDate(pickerParams.maxDate) && ($.picker.maxDate = pickerParams.maxDate);
        _.isDate(pickerParams.value) && ($.picker.value = pickerParams.value);
    }
    __defers["$.__views.buttonCancel!click!onCancel"] && $.addListener($.__views.buttonCancel, "click", onCancel);
    __defers["$.__views.buttonDone!click!onDone"] && $.addListener($.__views.buttonDone, "click", onDone);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
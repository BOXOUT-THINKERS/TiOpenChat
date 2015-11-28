function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function _createRightBtnOption() {
        return {
            btnData: {
                title: L("s_enter"),
                font: {
                    fontSize: 15
                }
            },
            onClick: function() {
                if ("" == $.inputArea.value || null == $.inputArea.value) Alloy.Globals.alert("s_alertEmptyComment"); else {
                    var data = {};
                    data[caseName] = $.inputArea.value;
                    _updateUser(data);
                    $.window.close();
                }
            }
        };
    }
    function _updateUser(data) {
        var userM = Alloy.Globals.user.attributes;
        userM.set(data, {
            change: false
        });
        Alloy.Globals.user.trigger("change:profile");
        Parse.Cloud.run("userModify", data, {
            success: function() {
                Ti.API.debug("settings:UserModify");
            },
            error: function(error) {
                Ti.API.debug("settings:UserModify", error);
            }
        });
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "setting/profileEditing";
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
        backgroundColor: "#F5F5F5",
        barColor: "#54EE92",
        translucent: false,
        navTintColor: "white",
        titleAttributes: {
            color: "white"
        },
        statusBarStyle: Titanium.UI.iPhone.StatusBar.LIGHT_CONTENT,
        id: "window"
    });
    $.__views.window && $.addTopLevelView($.__views.window);
    $.__views.inputWrap = Ti.UI.createView({
        layout: "vertical",
        width: "80%",
        height: Titanium.UI.SIZE,
        top: 22,
        id: "inputWrap"
    });
    $.__views.window.add($.__views.inputWrap);
    $.__views.explanaionWord = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "black",
        font: {
            fontSize: 16,
            fontWeight: "Regular"
        },
        textAlign: "center",
        left: 10,
        id: "explanaionWord"
    });
    $.__views.inputWrap.add($.__views.explanaionWord);
    $.__views.inputAreaWrap = Ti.UI.createView({
        left: 0,
        top: 5,
        height: 45,
        width: Titanium.UI.FILL,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#bebebe",
        backgroundColor: "#f9faff",
        id: "inputAreaWrap"
    });
    $.__views.inputWrap.add($.__views.inputAreaWrap);
    $.__views.inputArea = Ti.UI.createTextField({
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_NONE,
        color: "black",
        font: {
            fontSize: 16,
            fontWeight: "Regular"
        },
        width: Titanium.UI.FILL,
        height: Titanium.UI.FILL,
        left: 22,
        right: 22,
        id: "inputArea",
        value: ""
    });
    $.__views.inputAreaWrap.add($.__views.inputArea);
    $.__views.inputLimit = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#ff5d5d",
        font: {
            fontSize: 10,
            fontWeight: "bold"
        },
        textAlign: "center",
        right: 10,
        top: 7,
        id: "inputLimit"
    });
    $.__views.inputWrap.add($.__views.inputLimit);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    var caseName = args.caseName;
    var titleName = L("name" == caseName ? "s_nameTitle" : "s_commentTitle");
    var inputLimitSize = "name" == caseName ? Alloy.Globals.inputLimit.name : Alloy.Globals.inputLimit.comment;
    $.window.title = titleName;
    var opt = _createRightBtnOption();
    var rightMenuView = Ti.UI.createView();
    var rightBtn = Ti.UI.createButton(opt.btnData);
    rightBtn.addEventListener("click", opt.onClick);
    rightMenuView.add(rightBtn);
    $.window.rightNavButton = rightMenuView;
    !function() {
        function onChangeInputField() {
            var curText = $.inputArea.value || "";
            Ti.API.debug(";;;;;;;;;;;;;;;;;;;;;;;", $.inputArea.getSelection());
            if (curText.length > inputLimitSize) {
                var selection = $.inputArea.getSelection() || {
                    location: curText.length
                };
                var location = selection.location;
                $.inputArea.value = curText.slice(0, inputLimitSize);
                inputLimitSize > location && $.inputArea.setSelection(location, location);
            } else {
                $.inputLimit.color = curText.length == inputLimitSize ? "#ff5d5d" : "#bebebe";
                $.inputLimit.text = curText.length + " / " + inputLimitSize;
            }
        }
        var userM = Alloy.Globals.user.attributes;
        var inputText = userM.get(caseName) || "";
        var opt = _createRightBtnOption();
        $.explanaionWord.text = titleName + L("s_explanaionWord");
        $.inputArea.value = inputText;
        onChangeInputField();
        $.inputArea.addEventListener("change", onChangeInputField);
        $.inputArea.addEventListener("return", opt.onClick);
    }();
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
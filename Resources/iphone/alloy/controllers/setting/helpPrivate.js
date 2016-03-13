function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function userWithdrawFn() {
        var dialog = Ti.UI.createAlertDialog({
            cancel: 1,
            buttonNames: [ L("sp_confirm"), L("sp_cancle") ],
            message: L("sp_message"),
            title: L("sp_title")
        });
        dialog.addEventListener("click", function(e) {
            switch (e.index) {
              case 0:
                Alloy.Globals.alert("sp_alertWithdrawal");
                Alloy.Globals.loginC.withdraw();
                break;

              case 1:
                Alloy.Globals.toast("sp_alertCancle");
            }
        });
        dialog.show();
    }
    function requestByEmail() {
        var emailDialog = Ti.UI.createEmailDialog();
        emailDialog.setToRecipients([ "contact@boxoutthinkers.com" ]);
        emailDialog.setSubject(L("s_hp_emailSubject"));
        emailDialog.setMessageBody(L("s_hp_emailContent"));
        emailDialog.addEventListener("complete", function(e) {
            if (e.result == emailDialog.SENT) Alloy.Globals.toast("c_alertMsgSendedEmail"); else {
                Alloy.Globals.alert("c_alertMsgFailSendEmail");
                Ti.API.debug(e);
            }
        });
        emailDialog.open();
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "setting/helpPrivate";
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
    var __defers = {};
    $.__views.container = Ti.UI.createWindow({
        backgroundColor: "#f7f7f7",
        barColor: "#54EE92",
        translucent: false,
        navTintColor: "white",
        titleAttributes: {
            color: "white"
        },
        statusBarStyle: Titanium.UI.iPhone.StatusBar.LIGHT_CONTENT,
        id: "container"
    });
    $.__views.container && $.addTopLevelView($.__views.container);
    var __alloyId310 = [];
    $.__views.tableSection = Ti.UI.createTableViewSection({
        id: "tableSection"
    });
    __alloyId310.push($.__views.tableSection);
    $.__views.__alloyId311 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId311"
    });
    $.__views.tableSection.add($.__views.__alloyId311);
    requestByEmail ? $.addListener($.__views.__alloyId311, "click", requestByEmail) : __defers["$.__views.__alloyId311!click!requestByEmail"] = true;
    $.__views.s_hp_question = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 36,
        id: "s_hp_question"
    });
    $.__views.__alloyId311.add($.__views.s_hp_question);
    $.__views.__alloyId312 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId312"
    });
    $.__views.__alloyId311.add($.__views.__alloyId312);
    $.__views.__alloyId313 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId313"
    });
    $.__views.__alloyId312.add($.__views.__alloyId313);
    $.__views.__alloyId314 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId314"
    });
    $.__views.__alloyId311.add($.__views.__alloyId314);
    $.__views.agreeUsingView = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "agreeUsingView"
    });
    $.__views.tableSection.add($.__views.agreeUsingView);
    agreeUsingViewOpen ? $.addListener($.__views.agreeUsingView, "click", agreeUsingViewOpen) : __defers["$.__views.agreeUsingView!click!agreeUsingViewOpen"] = true;
    $.__views.s_hp_usingLaw = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 36,
        id: "s_hp_usingLaw"
    });
    $.__views.agreeUsingView.add($.__views.s_hp_usingLaw);
    $.__views.__alloyId315 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId315"
    });
    $.__views.agreeUsingView.add($.__views.__alloyId315);
    $.__views.__alloyId316 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId316"
    });
    $.__views.__alloyId315.add($.__views.__alloyId316);
    $.__views.__alloyId317 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId317"
    });
    $.__views.agreeUsingView.add($.__views.__alloyId317);
    $.__views.__alloyId318 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId318"
    });
    $.__views.tableSection.add($.__views.__alloyId318);
    agreePrivateViewOpen ? $.addListener($.__views.__alloyId318, "click", agreePrivateViewOpen) : __defers["$.__views.__alloyId318!click!agreePrivateViewOpen"] = true;
    $.__views.s_hp_dealWithPrivate = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 36,
        id: "s_hp_dealWithPrivate"
    });
    $.__views.__alloyId318.add($.__views.s_hp_dealWithPrivate);
    $.__views.__alloyId319 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId319"
    });
    $.__views.__alloyId318.add($.__views.__alloyId319);
    $.__views.__alloyId320 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId320"
    });
    $.__views.__alloyId319.add($.__views.__alloyId320);
    $.__views.__alloyId321 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId321"
    });
    $.__views.__alloyId318.add($.__views.__alloyId321);
    $.__views.__alloyId322 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId322"
    });
    $.__views.tableSection.add($.__views.__alloyId322);
    userWithdrawFn ? $.addListener($.__views.__alloyId322, "click", userWithdrawFn) : __defers["$.__views.__alloyId322!click!userWithdrawFn"] = true;
    $.__views.s_hp_withdrawal = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#A6A6A6",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 36,
        id: "s_hp_withdrawal"
    });
    $.__views.__alloyId322.add($.__views.s_hp_withdrawal);
    $.__views.__alloyId323 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId323"
    });
    $.__views.__alloyId322.add($.__views.__alloyId323);
    $.__views.__alloyId324 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId324"
    });
    $.__views.__alloyId323.add($.__views.__alloyId324);
    $.__views.__alloyId325 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId325"
    });
    $.__views.__alloyId322.add($.__views.__alloyId325);
    $.__views.__alloyId309 = Ti.UI.createTableView({
        backgroundColor: "#f7f7f7",
        separatorColor: "transparent",
        separatorInsets: {
            left: 0,
            right: 0
        },
        data: __alloyId310,
        id: "__alloyId309"
    });
    $.__views.container.add($.__views.__alloyId309);
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    $.container.title = L("s_helpPrivate");
    $.s_hp_question.text = L("s_hp_question");
    $.s_hp_usingLaw.text = L("agree_usingTitle");
    $.s_hp_dealWithPrivate.text = L("agree_privateTitle");
    $.s_hp_withdrawal.text = L("s_hp_withdrawal");
    $.s_hp_usingLaw.text ? "" : $.tableSection.remove($.agreeUsingView);
    __defers["$.__views.__alloyId311!click!requestByEmail"] && $.addListener($.__views.__alloyId311, "click", requestByEmail);
    __defers["$.__views.agreeUsingView!click!agreeUsingViewOpen"] && $.addListener($.__views.agreeUsingView, "click", agreeUsingViewOpen);
    __defers["$.__views.__alloyId318!click!agreePrivateViewOpen"] && $.addListener($.__views.__alloyId318, "click", agreePrivateViewOpen);
    __defers["$.__views.__alloyId322!click!userWithdrawFn"] && $.addListener($.__views.__alloyId322, "click", userWithdrawFn);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
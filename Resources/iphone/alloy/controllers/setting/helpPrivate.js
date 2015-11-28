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
    var __alloyId397 = [];
    $.__views.tableSection = Ti.UI.createTableViewSection({
        id: "tableSection"
    });
    __alloyId397.push($.__views.tableSection);
    $.__views.__alloyId398 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId398"
    });
    $.__views.tableSection.add($.__views.__alloyId398);
    requestByEmail ? $.addListener($.__views.__alloyId398, "click", requestByEmail) : __defers["$.__views.__alloyId398!click!requestByEmail"] = true;
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
    $.__views.__alloyId398.add($.__views.s_hp_question);
    $.__views.__alloyId399 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId399"
    });
    $.__views.__alloyId398.add($.__views.__alloyId399);
    $.__views.__alloyId400 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId400"
    });
    $.__views.__alloyId399.add($.__views.__alloyId400);
    $.__views.__alloyId401 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId401"
    });
    $.__views.__alloyId398.add($.__views.__alloyId401);
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
    $.__views.__alloyId402 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId402"
    });
    $.__views.agreeUsingView.add($.__views.__alloyId402);
    $.__views.__alloyId403 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId403"
    });
    $.__views.__alloyId402.add($.__views.__alloyId403);
    $.__views.__alloyId404 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId404"
    });
    $.__views.agreeUsingView.add($.__views.__alloyId404);
    $.__views.__alloyId405 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId405"
    });
    $.__views.tableSection.add($.__views.__alloyId405);
    agreePrivateViewOpen ? $.addListener($.__views.__alloyId405, "click", agreePrivateViewOpen) : __defers["$.__views.__alloyId405!click!agreePrivateViewOpen"] = true;
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
    $.__views.__alloyId405.add($.__views.s_hp_dealWithPrivate);
    $.__views.__alloyId406 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId406"
    });
    $.__views.__alloyId405.add($.__views.__alloyId406);
    $.__views.__alloyId407 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId407"
    });
    $.__views.__alloyId406.add($.__views.__alloyId407);
    $.__views.__alloyId408 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId408"
    });
    $.__views.__alloyId405.add($.__views.__alloyId408);
    $.__views.__alloyId409 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId409"
    });
    $.__views.tableSection.add($.__views.__alloyId409);
    userWithdrawFn ? $.addListener($.__views.__alloyId409, "click", userWithdrawFn) : __defers["$.__views.__alloyId409!click!userWithdrawFn"] = true;
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
    $.__views.__alloyId409.add($.__views.s_hp_withdrawal);
    $.__views.__alloyId410 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId410"
    });
    $.__views.__alloyId409.add($.__views.__alloyId410);
    $.__views.__alloyId411 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId411"
    });
    $.__views.__alloyId410.add($.__views.__alloyId411);
    $.__views.__alloyId412 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId412"
    });
    $.__views.__alloyId409.add($.__views.__alloyId412);
    $.__views.__alloyId396 = Ti.UI.createTableView({
        backgroundColor: "#f7f7f7",
        separatorColor: "transparent",
        separatorInsets: {
            left: 0,
            right: 0
        },
        data: __alloyId397,
        id: "__alloyId396"
    });
    $.__views.container.add($.__views.__alloyId396);
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    $.container.title = L("s_helpPrivate");
    $.s_hp_question.text = L("s_hp_question");
    $.s_hp_usingLaw.text = L("agree_usingTitle");
    $.s_hp_dealWithPrivate.text = L("agree_privateTitle");
    $.s_hp_withdrawal.text = L("s_hp_withdrawal");
    $.s_hp_usingLaw.text ? "" : $.tableSection.remove($.agreeUsingView);
    __defers["$.__views.__alloyId398!click!requestByEmail"] && $.addListener($.__views.__alloyId398, "click", requestByEmail);
    __defers["$.__views.agreeUsingView!click!agreeUsingViewOpen"] && $.addListener($.__views.agreeUsingView, "click", agreeUsingViewOpen);
    __defers["$.__views.__alloyId405!click!agreePrivateViewOpen"] && $.addListener($.__views.__alloyId405, "click", agreePrivateViewOpen);
    __defers["$.__views.__alloyId409!click!userWithdrawFn"] && $.addListener($.__views.__alloyId409, "click", userWithdrawFn);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
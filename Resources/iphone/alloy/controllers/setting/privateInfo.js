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
            buttonNames: [ L("sp_confirm"), L("sp_cancle"), L("sp_help") ],
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
                Alloy.Globals.alert("sp_alertCancle");
                break;

              case 2:
                Alloy.Globals.alert("sp_alertHelp");
            }
        });
        dialog.show();
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "setting/privateInfo";
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
    var __alloyId370 = [];
    $.__views.__alloyId371 = Ti.UI.createTableViewSection({
        id: "__alloyId371"
    });
    __alloyId370.push($.__views.__alloyId371);
    $.__views.__alloyId372 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId372"
    });
    $.__views.__alloyId371.add($.__views.__alloyId372);
    $.__views.sp_banList = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 36,
        id: "sp_banList"
    });
    $.__views.__alloyId372.add($.__views.sp_banList);
    $.__views.__alloyId373 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId373"
    });
    $.__views.__alloyId372.add($.__views.__alloyId373);
    $.__views.__alloyId374 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId374"
    });
    $.__views.__alloyId373.add($.__views.__alloyId374);
    $.__views.__alloyId375 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId375"
    });
    $.__views.__alloyId372.add($.__views.__alloyId375);
    $.__views.__alloyId376 = Ti.UI.createTableViewSection({
        id: "__alloyId376"
    });
    __alloyId370.push($.__views.__alloyId376);
    $.__views.__alloyId377 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId377"
    });
    $.__views.__alloyId376.add($.__views.__alloyId377);
    $.__views.sp_SNSList = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 36,
        id: "sp_SNSList"
    });
    $.__views.__alloyId377.add($.__views.sp_SNSList);
    $.__views.__alloyId378 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId378"
    });
    $.__views.__alloyId377.add($.__views.__alloyId378);
    $.__views.__alloyId379 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId379"
    });
    $.__views.__alloyId376.add($.__views.__alloyId379);
    $.__views.__alloyId380 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 58,
        text: "Google",
        id: "__alloyId380"
    });
    $.__views.__alloyId379.add($.__views.__alloyId380);
    $.__views.__alloyId381 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#8b61ff",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        right: 55,
        text: "google@google@com",
        id: "__alloyId381"
    });
    $.__views.__alloyId379.add($.__views.__alloyId381);
    $.__views.__alloyId382 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId382"
    });
    $.__views.__alloyId379.add($.__views.__alloyId382);
    $.__views.__alloyId383 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId383"
    });
    $.__views.__alloyId382.add($.__views.__alloyId383);
    $.__views.__alloyId384 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: "90%",
        height: .5,
        bottom: 0,
        right: 0,
        id: "__alloyId384"
    });
    $.__views.__alloyId379.add($.__views.__alloyId384);
    $.__views.__alloyId385 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId385"
    });
    $.__views.__alloyId376.add($.__views.__alloyId385);
    $.__views.__alloyId386 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 58,
        text: "Facebook",
        id: "__alloyId386"
    });
    $.__views.__alloyId385.add($.__views.__alloyId386);
    $.__views.__alloyId387 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#8b61ff",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        right: 55,
        text: "google@google@com",
        id: "__alloyId387"
    });
    $.__views.__alloyId385.add($.__views.__alloyId387);
    $.__views.__alloyId388 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId388"
    });
    $.__views.__alloyId385.add($.__views.__alloyId388);
    $.__views.__alloyId389 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId389"
    });
    $.__views.__alloyId388.add($.__views.__alloyId389);
    $.__views.__alloyId390 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: "90%",
        height: .5,
        bottom: 0,
        right: 0,
        id: "__alloyId390"
    });
    $.__views.__alloyId385.add($.__views.__alloyId390);
    $.__views.__alloyId391 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId391"
    });
    $.__views.__alloyId376.add($.__views.__alloyId391);
    $.__views.__alloyId392 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 58,
        text: "Naver",
        id: "__alloyId392"
    });
    $.__views.__alloyId391.add($.__views.__alloyId392);
    $.__views.__alloyId393 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#8b61ff",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        right: 55,
        text: "google@google@com",
        id: "__alloyId393"
    });
    $.__views.__alloyId391.add($.__views.__alloyId393);
    $.__views.__alloyId394 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId394"
    });
    $.__views.__alloyId391.add($.__views.__alloyId394);
    $.__views.__alloyId395 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId395"
    });
    $.__views.__alloyId394.add($.__views.__alloyId395);
    $.__views.__alloyId396 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: "90%",
        height: .5,
        bottom: 0,
        right: 0,
        id: "__alloyId396"
    });
    $.__views.__alloyId391.add($.__views.__alloyId396);
    $.__views.__alloyId397 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId397"
    });
    $.__views.__alloyId376.add($.__views.__alloyId397);
    $.__views.__alloyId398 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 58,
        text: "Kakao",
        id: "__alloyId398"
    });
    $.__views.__alloyId397.add($.__views.__alloyId398);
    $.__views.__alloyId399 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#8b61ff",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        right: 55,
        text: "google@google@com",
        id: "__alloyId399"
    });
    $.__views.__alloyId397.add($.__views.__alloyId399);
    $.__views.__alloyId400 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId400"
    });
    $.__views.__alloyId397.add($.__views.__alloyId400);
    $.__views.__alloyId401 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId401"
    });
    $.__views.__alloyId400.add($.__views.__alloyId401);
    $.__views.__alloyId402 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId402"
    });
    $.__views.__alloyId397.add($.__views.__alloyId402);
    $.__views.__alloyId403 = Ti.UI.createTableViewSection({
        id: "__alloyId403"
    });
    __alloyId370.push($.__views.__alloyId403);
    $.__views.__alloyId404 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId404"
    });
    $.__views.__alloyId403.add($.__views.__alloyId404);
    userWithdrawFn ? $.addListener($.__views.__alloyId404, "click", userWithdrawFn) : __defers["$.__views.__alloyId404!click!userWithdrawFn"] = true;
    $.__views.sp_withdrawal = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 36,
        id: "sp_withdrawal"
    });
    $.__views.__alloyId404.add($.__views.sp_withdrawal);
    $.__views.__alloyId405 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId405"
    });
    $.__views.__alloyId404.add($.__views.__alloyId405);
    $.__views.__alloyId406 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId406"
    });
    $.__views.__alloyId405.add($.__views.__alloyId406);
    $.__views.__alloyId407 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId407"
    });
    $.__views.__alloyId404.add($.__views.__alloyId407);
    $.__views.__alloyId369 = Ti.UI.createTableView({
        backgroundColor: "#f7f7f7",
        separatorColor: "transparent",
        separatorInsets: {
            left: 0,
            right: 0
        },
        data: __alloyId370,
        id: "__alloyId369"
    });
    $.__views.container.add($.__views.__alloyId369);
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    $.container.title = L("s_privateAndSNS");
    $.sp_banList.text = L("sp_banList");
    $.sp_SNSList.text = L("sp_SNSList");
    $.sp_withdrawal.text = L("sp_withdrawal");
    $.getView().addEventListener("open", function() {});
    __defers["$.__views.__alloyId404!click!userWithdrawFn"] && $.addListener($.__views.__alloyId404, "click", userWithdrawFn);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
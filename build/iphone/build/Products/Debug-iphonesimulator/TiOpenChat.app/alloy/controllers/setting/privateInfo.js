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
    var __alloyId455 = [];
    $.__views.__alloyId456 = Ti.UI.createTableViewSection({
        id: "__alloyId456"
    });
    __alloyId455.push($.__views.__alloyId456);
    $.__views.__alloyId457 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId457"
    });
    $.__views.__alloyId456.add($.__views.__alloyId457);
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
    $.__views.__alloyId457.add($.__views.sp_banList);
    $.__views.__alloyId458 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId458"
    });
    $.__views.__alloyId457.add($.__views.__alloyId458);
    $.__views.__alloyId459 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId459"
    });
    $.__views.__alloyId458.add($.__views.__alloyId459);
    $.__views.__alloyId460 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId460"
    });
    $.__views.__alloyId457.add($.__views.__alloyId460);
    $.__views.__alloyId461 = Ti.UI.createTableViewSection({
        id: "__alloyId461"
    });
    __alloyId455.push($.__views.__alloyId461);
    $.__views.__alloyId462 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId462"
    });
    $.__views.__alloyId461.add($.__views.__alloyId462);
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
    $.__views.__alloyId462.add($.__views.sp_SNSList);
    $.__views.__alloyId463 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId463"
    });
    $.__views.__alloyId462.add($.__views.__alloyId463);
    $.__views.__alloyId464 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId464"
    });
    $.__views.__alloyId461.add($.__views.__alloyId464);
    $.__views.__alloyId465 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 58,
        text: "Google",
        id: "__alloyId465"
    });
    $.__views.__alloyId464.add($.__views.__alloyId465);
    $.__views.__alloyId466 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#8b61ff",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        right: 55,
        text: "google@google@com",
        id: "__alloyId466"
    });
    $.__views.__alloyId464.add($.__views.__alloyId466);
    $.__views.__alloyId467 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId467"
    });
    $.__views.__alloyId464.add($.__views.__alloyId467);
    $.__views.__alloyId468 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId468"
    });
    $.__views.__alloyId467.add($.__views.__alloyId468);
    $.__views.__alloyId469 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: "90%",
        height: .5,
        bottom: 0,
        right: 0,
        id: "__alloyId469"
    });
    $.__views.__alloyId464.add($.__views.__alloyId469);
    $.__views.__alloyId470 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId470"
    });
    $.__views.__alloyId461.add($.__views.__alloyId470);
    $.__views.__alloyId471 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 58,
        text: "Facebook",
        id: "__alloyId471"
    });
    $.__views.__alloyId470.add($.__views.__alloyId471);
    $.__views.__alloyId472 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#8b61ff",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        right: 55,
        text: "google@google@com",
        id: "__alloyId472"
    });
    $.__views.__alloyId470.add($.__views.__alloyId472);
    $.__views.__alloyId473 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId473"
    });
    $.__views.__alloyId470.add($.__views.__alloyId473);
    $.__views.__alloyId474 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId474"
    });
    $.__views.__alloyId473.add($.__views.__alloyId474);
    $.__views.__alloyId475 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: "90%",
        height: .5,
        bottom: 0,
        right: 0,
        id: "__alloyId475"
    });
    $.__views.__alloyId470.add($.__views.__alloyId475);
    $.__views.__alloyId476 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId476"
    });
    $.__views.__alloyId461.add($.__views.__alloyId476);
    $.__views.__alloyId477 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 58,
        text: "Naver",
        id: "__alloyId477"
    });
    $.__views.__alloyId476.add($.__views.__alloyId477);
    $.__views.__alloyId478 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#8b61ff",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        right: 55,
        text: "google@google@com",
        id: "__alloyId478"
    });
    $.__views.__alloyId476.add($.__views.__alloyId478);
    $.__views.__alloyId479 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId479"
    });
    $.__views.__alloyId476.add($.__views.__alloyId479);
    $.__views.__alloyId480 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId480"
    });
    $.__views.__alloyId479.add($.__views.__alloyId480);
    $.__views.__alloyId481 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: "90%",
        height: .5,
        bottom: 0,
        right: 0,
        id: "__alloyId481"
    });
    $.__views.__alloyId476.add($.__views.__alloyId481);
    $.__views.__alloyId482 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId482"
    });
    $.__views.__alloyId461.add($.__views.__alloyId482);
    $.__views.__alloyId483 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 58,
        text: "Kakao",
        id: "__alloyId483"
    });
    $.__views.__alloyId482.add($.__views.__alloyId483);
    $.__views.__alloyId484 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#8b61ff",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        right: 55,
        text: "google@google@com",
        id: "__alloyId484"
    });
    $.__views.__alloyId482.add($.__views.__alloyId484);
    $.__views.__alloyId485 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId485"
    });
    $.__views.__alloyId482.add($.__views.__alloyId485);
    $.__views.__alloyId486 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId486"
    });
    $.__views.__alloyId485.add($.__views.__alloyId486);
    $.__views.__alloyId487 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId487"
    });
    $.__views.__alloyId482.add($.__views.__alloyId487);
    $.__views.__alloyId488 = Ti.UI.createTableViewSection({
        id: "__alloyId488"
    });
    __alloyId455.push($.__views.__alloyId488);
    $.__views.__alloyId489 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId489"
    });
    $.__views.__alloyId488.add($.__views.__alloyId489);
    userWithdrawFn ? $.addListener($.__views.__alloyId489, "click", userWithdrawFn) : __defers["$.__views.__alloyId489!click!userWithdrawFn"] = true;
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
    $.__views.__alloyId489.add($.__views.sp_withdrawal);
    $.__views.__alloyId490 = Ti.UI.createView({
        width: 40,
        height: 40,
        right: 18,
        id: "__alloyId490"
    });
    $.__views.__alloyId489.add($.__views.__alloyId490);
    $.__views.__alloyId491 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/setting_arrow.png",
        id: "__alloyId491"
    });
    $.__views.__alloyId490.add($.__views.__alloyId491);
    $.__views.__alloyId492 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId492"
    });
    $.__views.__alloyId489.add($.__views.__alloyId492);
    $.__views.__alloyId454 = Ti.UI.createTableView({
        backgroundColor: "#f7f7f7",
        separatorColor: "transparent",
        separatorInsets: {
            left: 0,
            right: 0
        },
        data: __alloyId455,
        id: "__alloyId454"
    });
    $.__views.container.add($.__views.__alloyId454);
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    $.container.title = L("s_privateAndSNS");
    $.sp_banList.text = L("sp_banList");
    $.sp_SNSList.text = L("sp_SNSList");
    $.sp_withdrawal.text = L("sp_withdrawal");
    $.getView().addEventListener("open", function() {});
    __defers["$.__views.__alloyId489!click!userWithdrawFn"] && $.addListener($.__views.__alloyId489, "click", userWithdrawFn);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
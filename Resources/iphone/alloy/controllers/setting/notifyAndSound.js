function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function onOpenBanStartTimePicker() {
        _openTimePicker([ banInfo.banStartHour, banInfo.banStartMinute ], function(hour, minute) {
            banInfo.banStartHour = hour;
            banInfo.banStartMinute = minute;
            $.banStartTime.text = banInfo.banStartHour + " : " + banInfo.banStartMinute;
            _updateUser(banInfo);
        });
    }
    function onOpenBanEndTimePicker() {
        _openTimePicker([ banInfo.banEndHour, banInfo.banEndMinute ], function(hour, minute) {
            banInfo.banEndHour = hour;
            banInfo.banEndMinute = minute;
            $.banEndTime.text = banInfo.banEndHour + " : " + banInfo.banEndMinute;
            _updateUser(banInfo);
        });
    }
    function _getBanTimeInfo(userM) {
        var banInfo = {
            isUsingBanTime: void 0 != userM.get("isUsingBanTime") ? userM.get("isUsingBanTime") : true,
            banStartHour: _.isNumber(userM.get("banStartHour")) ? userM.get("banStartHour") : 0,
            banStartMinute: _.isNumber(userM.get("banStartMinute")) ? userM.get("banStartMinute") : 0,
            banEndHour: _.isNumber(userM.get("banEndHour")) ? userM.get("banEndHour") : 0,
            banEndMinute: _.isNumber(userM.get("banEndMinute")) ? userM.get("banEndMinute") : 0
        };
        _.isNumber(userM.get("banStartHour")) || _updateUser(banInfo);
        return banInfo;
    }
    function _updateUser(data) {
        var userM = Alloy.Globals.user.attributes;
        userM.set(data, {
            change: false
        });
        Parse.Cloud.run("userModify", data, {
            success: function() {
                Ti.API.debug("settings:UserModify");
            },
            error: function(error) {
                Ti.API.debug("settings:UserModify", error);
            }
        });
    }
    function _openTimePicker(selectedValues, doneCallback) {
        Alloy.createWidget("danielhanold.pickerWidget", {
            id: "myAgePicker",
            outerView: $.mainView,
            hideNavBar: false,
            type: "time-picker",
            pickerValues: [],
            pickerParams: [ {
                min: 0,
                max: 23,
                diff: 1
            }, {
                min: 0,
                max: 59,
                diff: 5
            } ],
            selectedValues: selectedValues,
            onDone: function(e) {
                Ti.API.debug("click picker");
                if (e.cancel) ; else {
                    Ti.API.debug(e.data);
                    doneCallback(e.data.low, e.data.high);
                }
            }
        });
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "setting/notifyAndSound";
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
    $.__views.mainView = Ti.UI.createWindow({
        backgroundColor: "#f7f7f7",
        barColor: "#54EE92",
        translucent: false,
        navTintColor: "white",
        titleAttributes: {
            color: "white"
        },
        statusBarStyle: Titanium.UI.iPhone.StatusBar.LIGHT_CONTENT,
        id: "mainView"
    });
    $.__views.mainView && $.addTopLevelView($.__views.mainView);
    var __alloyId439 = [];
    $.__views.__alloyId440 = Ti.UI.createTableViewSection({
        id: "__alloyId440"
    });
    __alloyId439.push($.__views.__alloyId440);
    $.__views.__alloyId441 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId441"
    });
    $.__views.__alloyId440.add($.__views.__alloyId441);
    $.__views.sn_notifyPush = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 36,
        id: "sn_notifyPush"
    });
    $.__views.__alloyId441.add($.__views.sn_notifyPush);
    $.__views.permission_push_switch = Ti.UI.createSwitch({
        right: 29,
        value: false,
        id: "permission_push_switch"
    });
    $.__views.__alloyId441.add($.__views.permission_push_switch);
    $.__views.__alloyId442 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId442"
    });
    $.__views.__alloyId441.add($.__views.__alloyId442);
    $.__views.__alloyId443 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: 43,
        id: "__alloyId443"
    });
    $.__views.__alloyId440.add($.__views.__alloyId443);
    $.__views.sn_notifyEventAndNotice = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 36,
        id: "sn_notifyEventAndNotice"
    });
    $.__views.__alloyId443.add($.__views.sn_notifyEventAndNotice);
    $.__views.Installation_channels_eventSwitch = Ti.UI.createSwitch({
        right: 29,
        value: false,
        id: "Installation_channels_eventSwitch"
    });
    $.__views.__alloyId443.add($.__views.Installation_channels_eventSwitch);
    $.__views.__alloyId444 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId444"
    });
    $.__views.__alloyId443.add($.__views.__alloyId444);
    $.__views.__alloyId445 = Ti.UI.createTableViewSection({
        id: "__alloyId445"
    });
    __alloyId439.push($.__views.__alloyId445);
    $.__views.__alloyId446 = Ti.UI.createTableViewRow({
        backgroundColor: "#f7f7f7",
        height: Titanium.UI.SIZE,
        id: "__alloyId446"
    });
    $.__views.__alloyId445.add($.__views.__alloyId446);
    $.__views.__alloyId447 = Ti.UI.createView({
        width: Titanium.UI.FILL,
        height: Titanium.UI.SIZE,
        layout: "vertical",
        id: "__alloyId447"
    });
    $.__views.__alloyId446.add($.__views.__alloyId447);
    $.__views.__alloyId448 = Ti.UI.createView({
        width: Titanium.UI.FILL,
        height: 43,
        layout: "composite",
        id: "__alloyId448"
    });
    $.__views.__alloyId447.add($.__views.__alloyId448);
    $.__views.sn_banTime = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 36,
        id: "sn_banTime"
    });
    $.__views.__alloyId448.add($.__views.sn_banTime);
    $.__views.isStopNoticeTimeSwitch = Ti.UI.createSwitch({
        right: 29,
        value: false,
        id: "isStopNoticeTimeSwitch"
    });
    $.__views.__alloyId448.add($.__views.isStopNoticeTimeSwitch);
    $.__views.__alloyId449 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId449"
    });
    $.__views.__alloyId448.add($.__views.__alloyId449);
    $.__views.isStopNoticeTimeSubSection = Ti.UI.createView({
        width: Titanium.UI.FILL,
        height: Titanium.UI.SIZE,
        layout: "vertical",
        id: "isStopNoticeTimeSubSection"
    });
    $.__views.__alloyId447.add($.__views.isStopNoticeTimeSubSection);
    $.__views.__alloyId450 = Ti.UI.createView({
        width: Titanium.UI.FILL,
        height: 43,
        layout: "composite",
        id: "__alloyId450"
    });
    $.__views.isStopNoticeTimeSubSection.add($.__views.__alloyId450);
    onOpenBanStartTimePicker ? $.addListener($.__views.__alloyId450, "click", onOpenBanStartTimePicker) : __defers["$.__views.__alloyId450!click!onOpenBanStartTimePicker"] = true;
    $.__views.sn_banTimeStart = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 58,
        id: "sn_banTimeStart"
    });
    $.__views.__alloyId450.add($.__views.sn_banTimeStart);
    $.__views.banStartTime = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        right: 29,
        id: "banStartTime"
    });
    $.__views.__alloyId450.add($.__views.banStartTime);
    $.__views.__alloyId451 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        left: 36,
        id: "__alloyId451"
    });
    $.__views.isStopNoticeTimeSubSection.add($.__views.__alloyId451);
    $.__views.__alloyId452 = Ti.UI.createView({
        width: Titanium.UI.FILL,
        height: 43,
        layout: "composite",
        id: "__alloyId452"
    });
    $.__views.isStopNoticeTimeSubSection.add($.__views.__alloyId452);
    onOpenBanEndTimePicker ? $.addListener($.__views.__alloyId452, "click", onOpenBanEndTimePicker) : __defers["$.__views.__alloyId452!click!onOpenBanEndTimePicker"] = true;
    $.__views.sn_banTimeEnd = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        left: 58,
        id: "sn_banTimeEnd"
    });
    $.__views.__alloyId452.add($.__views.sn_banTimeEnd);
    $.__views.banEndTime = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#3a3a3a",
        font: {
            fontSize: 16
        },
        textAlign: "center",
        right: 29,
        id: "banEndTime"
    });
    $.__views.__alloyId452.add($.__views.banEndTime);
    $.__views.__alloyId453 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        bottom: 0,
        id: "__alloyId453"
    });
    $.__views.isStopNoticeTimeSubSection.add($.__views.__alloyId453);
    $.__views.tableView = Ti.UI.createTableView({
        backgroundColor: "#f7f7f7",
        separatorColor: "transparent",
        separatorInsets: {
            left: 0,
            right: 0
        },
        data: __alloyId439,
        id: "tableView"
    });
    $.__views.mainView.add($.__views.tableView);
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.mainView.title = L("s_notifyAndSound");
    $.sn_notifyPush.text = L("sn_notifyPush");
    $.sn_notifyEventAndNotice.text = L("sn_notifyEventAndNotice");
    $.sn_banTime.text = L("sn_banTime");
    $.sn_banTimeStart.text = L("sn_banTimeStart");
    $.sn_banTimeEnd.text = L("sn_banTimeEnd");
    Alloy.Globals.util;
    var pushC = Alloy.Globals.parsePushC;
    var settingsM = Alloy.Globals.settings;
    var banInfo = _getBanTimeInfo(Alloy.Globals.user.attributes);
    !function() {
        var userM = Alloy.Globals.user.attributes;
        $.permission_push_switch.value = userM.get("isPermissionAllPush") || false;
        $.Installation_channels_eventSwitch.value = settingsM.get("Installation_channels_event") || false;
        $.isStopNoticeTimeSwitch.value = banInfo.isUsingBanTime;
        $.isStopNoticeTimeSubSection.visible = $.isStopNoticeTimeSwitch.value ? true : false;
        $.banStartTime.text = banInfo.banStartHour + " : " + banInfo.banStartMinute;
        $.banEndTime.text = banInfo.banEndHour + " : " + banInfo.banEndMinute;
    }();
    !function() {
        $.permission_push_switch.addEventListener("change", function() {
            _updateUser($.permission_push_switch.value ? {
                isPermissionAllPush: true
            } : {
                isPermissionAllPush: false
            });
        });
        $.Installation_channels_eventSwitch.addEventListener("change", function() {
            settingsM.save({
                Installation_channels_event: $.Installation_channels_eventSwitch.value
            });
            $.Installation_channels_eventSwitch.value ? pushC.subscribeChannels("Event") : pushC.unsubscribeChannels("Event");
        });
        $.isStopNoticeTimeSwitch.addEventListener("change", function() {
            $.isStopNoticeTimeSubSection.visible = $.isStopNoticeTimeSwitch.value ? true : false;
            _updateUser({
                isUsingBanTime: $.isStopNoticeTimeSwitch.value
            });
        });
    }();
    __defers["$.__views.__alloyId450!click!onOpenBanStartTimePicker"] && $.addListener($.__views.__alloyId450, "click", onOpenBanStartTimePicker);
    __defers["$.__views.__alloyId452!click!onOpenBanEndTimePicker"] && $.addListener($.__views.__alloyId452, "click", onOpenBanEndTimePicker);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
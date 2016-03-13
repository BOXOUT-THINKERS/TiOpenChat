function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function onChangeInputField() {
        var curText = $.nameInput.value || "";
        if (curText.length > _inputLimitSize) {
            var selection = $.nameInput.getSelection() || {
                location: curText.length
            };
            var location = selection.location;
            $.nameInput.value = curText.slice(0, _inputLimitSize);
            _inputLimitSize > location && $.nameInput.setSelection(location, location);
        } else {
            $.nameLimitLabel.color = curText.length == _inputLimitSize ? "#ff5d5d" : "#bebebe";
            $.nameLimitLabel.text = curText.length + " / " + _inputLimitSize;
        }
    }
    function onPopupCountryPicker() {
        var mainView = $.getView();
        Alloy.createWidget("danielhanold.pickerWidget", {
            id: "countryPicker",
            outerView: mainView,
            hideNavBar: false,
            type: "single-column",
            pickerValues: [ countryPickerValues ],
            selectedValues: [ countryCode ],
            onDone: function(e) {
                if (e.cancel) ; else {
                    countryCode = e.data[0].key;
                    $.localNm.text = "+" + countries[countryCode].phoneCode;
                    $.countryLabel.text = countries[countryCode].name;
                }
            }
        });
    }
    function onClickTryCode() {
        if (inDelay) {
            Alloy.Globals.alert("tryCodeSendBetweenLimit");
            return;
        }
        inDelay = true;
        setTimeout(function() {
            inDelay = false;
        }, 1e4);
        codeSendCount++;
        if (codeSendCount > 3) {
            if (!inWait) {
                inWait = true;
                setTimeout(function() {
                    inWait = false;
                    codeSendCount = 0;
                }, 6e4);
            }
            Alloy.Globals.alert("tryCodeSendCountMax");
            return;
        }
        Alloy.Globals.startWaiting("verifyCodeSend");
        parseSMSVerification($.localNm.text, $.phoneNm.value);
    }
    function onClickRetry() {
        $.verifyCode.blur();
        $.scrollView.scrollToView($.requestView);
        $.phoneNm.focus();
    }
    function parseSMSVerification(local, phone) {
        phone = (1 * Alloy.Globals.util.getNumberOnly(phone)).toString();
        var phoneNm = local + phone;
        if (phone.length < 8) {
            Alloy.Globals.alert("verifyPhoneShort");
            return;
        }
        Parse.User.current() && Parse.User.logOut();
        var query = new Parse.Query(Parse.User);
        query.equalTo("username", phoneNm);
        query.find({
            success: function(results) {
                if (results.length > 0) parseSMSVerificationLoginTemp(results[0]); else {
                    var user = new Parse.User();
                    user.set("username", phoneNm);
                    user.set("password", phoneNm + Ti.App.Properties.getString("Parse_PwdFix"));
                    user.set("phone", phone);
                    user.set("local", local);
                    user.signUp(null, {
                        success: function(user) {
                            parseSMSVerificationLoginTemp(user);
                        },
                        error: function(user, error) {
                            Ti.API.error(error);
                            Alloy.Globals.alert("tryAgainAlert");
                        }
                    });
                }
            },
            error: function(results, error) {
                Ti.API.error(error);
                Alloy.Globals.alert("tryAgainAlert");
            }
        });
    }
    function parseSMSVerificationLoginTemp(user) {
        Parse.User.logIn(user.get("username"), user.get("username") + Ti.App.Properties.getString("Parse_PwdFix"), {
            success: function(user) {
                parseSMSVerificationCloudCode(user.get("local") + user.get("phone"));
            },
            error: function(user, error) {
                Ti.API.error(error);
                Alloy.Globals.alert("tryAgainAlert");
            }
        });
    }
    function parseSMSVerificationCloudCode(phoneNm) {
        if (Parse.User.current()) {
            var now = new Date();
            Parse.Cloud.run("sendVerificationCode", {
                phoneNumber: phoneNm,
                timezoneOffset: now.getTimezoneOffset(),
                currentLanguage: Alloy.Globals.currentLanguage
            }, {
                success: function() {
                    Alloy.Globals.alert("verifyCodeSendSuccess");
                    $.phoneNmLabel.text = phoneNm;
                    $.phoneNm.blur();
                    $.scrollView.scrollToView($.verifyView);
                    $.verifyCode.blur();
                },
                error: function(error) {
                    Ti.API.error(error);
                    Alloy.Globals.alert("tryAgainAlert");
                }
            });
        }
    }
    function onClickJoinComplete() {
        if ("" == $.nameInput.value || null == $.nameInput.value) Alloy.Globals.alert("s_alertEmptyName"); else {
            var userName = $.nameInput.value;
            $.nameInput.blur();
            userNameUpdateAndLogin(userName);
        }
    }
    function userNameUpdateAndLogin(userName) {
        Alloy.Globals.startWaiting();
        Parse.Cloud.run("userModify", {
            name: userName
        }, {
            success: function() {
                Alloy.Globals.settings.set("User_sessionToken", Parse.User.current().getSessionToken()).save(null, {
                    success: function() {
                        Alloy.Globals.stopWaiting();
                        Alloy.Globals.loginC.requiredLogin();
                    },
                    error: function(model, error) {
                        Ti.API.error(error);
                        Alloy.Globals.alert("tryAgainAlert");
                    }
                });
            },
            error: function(error) {
                Ti.API.error(error);
                Alloy.Globals.alert("tryAgainAlert");
            }
        });
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "join";
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
    $.__views.login = Ti.UI.createWindow({
        backgroundColor: "white",
        barColor: "#54EE92",
        translucent: false,
        navTintColor: "white",
        titleAttributes: {
            color: "white"
        },
        statusBarStyle: Titanium.UI.iPhone.StatusBar.LIGHT_CONTENT,
        layout: "composite",
        width: Titanium.UI.FILL,
        height: Titanium.UI.FILL,
        theme: "Theme.NoActionBar",
        id: "login"
    });
    $.__views.login && $.addTopLevelView($.__views.login);
    $.__views.__alloyId111 = Ti.UI.createView({
        backgroundColor: "#54EE92",
        height: 20,
        top: 0,
        id: "__alloyId111"
    });
    $.__views.login.add($.__views.__alloyId111);
    var __alloyId112 = [];
    $.__views.requestView = Ti.UI.createView({
        layout: "composite",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        id: "requestView"
    });
    __alloyId112.push($.__views.requestView);
    $.__views.__alloyId113 = Ti.UI.createView({
        top: 0,
        backgroundColor: "#54EE92",
        width: Ti.UI.FILL,
        height: 40,
        id: "__alloyId113"
    });
    $.__views.requestView.add($.__views.__alloyId113);
    $.__views.formWrap = Ti.UI.createView({
        top: 40,
        bottom: 85,
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        id: "formWrap"
    });
    $.__views.requestView.add($.__views.formWrap);
    $.__views.middleView1 = Ti.UI.createView({
        layout: "vertical",
        width: 294,
        height: 181,
        id: "middleView1"
    });
    $.__views.formWrap.add($.__views.middleView1);
    $.__views.__alloyId114 = Ti.UI.createView({
        top: 20,
        layout: "horizontal",
        width: 294,
        height: 40,
        id: "__alloyId114"
    });
    $.__views.middleView1.add($.__views.__alloyId114);
    $.__views.__alloyId115 = Ti.UI.createView({
        width: 70,
        height: 38,
        layout: "composite",
        id: "__alloyId115"
    });
    $.__views.__alloyId114.add($.__views.__alloyId115);
    $.__views.localNm = Ti.UI.createLabel({
        width: 70,
        height: 38,
        color: "white",
        font: {
            fontSize: 18,
            fontWeight: "bold"
        },
        textAlign: "center",
        borderRadius: 5,
        backgroundColor: "#FB8F8F",
        zIndex: 5,
        id: "localNm",
        text: "+82"
    });
    $.__views.__alloyId115.add($.__views.localNm);
    onPopupCountryPicker ? $.addListener($.__views.localNm, "click", onPopupCountryPicker) : __defers["$.__views.localNm!click!onPopupCountryPicker"] = true;
    $.__views.__alloyId116 = Ti.UI.createView({
        bottom: 0,
        width: 70,
        height: 20,
        backgroundColor: "#FB8F8F",
        id: "__alloyId116"
    });
    $.__views.__alloyId115.add($.__views.__alloyId116);
    $.__views.phoneNm = Ti.UI.createTextField({
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_NONE,
        borderRadius: 0,
        borderWidth: 0,
        keyboardType: Titanium.UI.KEYBOARD_PHONE_PAD,
        width: 200,
        left: 12,
        right: 12,
        textAlign: Titanium.UI.TEXT_ALIGNMENT_LEFT,
        font: {
            fontSize: 18,
            fontWeight: "bold"
        },
        color: "#C5C5C5",
        id: "phoneNm",
        text: ""
    });
    $.__views.__alloyId114.add($.__views.phoneNm);
    $.__views.__alloyId117 = Ti.UI.createView({
        width: 294,
        height: 2,
        backgroundColor: "#FB8F8F",
        id: "__alloyId117"
    });
    $.__views.__alloyId114.add($.__views.__alloyId117);
    $.__views.__alloyId118 = Ti.UI.createView({
        top: 20,
        layout: "horizontal",
        width: 294,
        height: 40,
        id: "__alloyId118"
    });
    $.__views.middleView1.add($.__views.__alloyId118);
    $.__views.gpsImage = Ti.UI.createImageView({
        preventDefaultImage: true,
        left: 10,
        id: "gpsImage",
        image: "/images/signin_gps_icon.png"
    });
    $.__views.__alloyId118.add($.__views.gpsImage);
    $.__views.countryLabel = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: 40,
        color: "#5D5D5D",
        font: {
            fontSize: 15,
            fontWeight: "bold"
        },
        textAlign: "center",
        left: 10,
        id: "countryLabel",
        text: ""
    });
    $.__views.__alloyId118.add($.__views.countryLabel);
    $.__views.__alloyId119 = Ti.UI.createView({
        width: 294,
        height: 1,
        backgroundColor: "#ADADAD",
        id: "__alloyId119"
    });
    $.__views.middleView1.add($.__views.__alloyId119);
    $.__views.agreeLabelView = Ti.UI.createView({
        top: 20,
        layout: "horizontal",
        width: 294,
        height: 40,
        id: "agreeLabelView"
    });
    $.__views.middleView1.add($.__views.agreeLabelView);
    $.__views.agreeLabel = Ti.UI.createLabel({
        width: 240,
        height: Ti.UI.SIZE,
        color: "#C5C5C5",
        font: {
            fontSize: 12
        },
        textAlign: "center",
        left: 27,
        id: "agreeLabel"
    });
    $.__views.agreeLabelView.add($.__views.agreeLabel);
    $.__views.__alloyId120 = Ti.UI.createView({
        top: 10,
        bottom: 10,
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        id: "__alloyId120"
    });
    $.__views.formWrap.add($.__views.__alloyId120);
    $.__views.__alloyId121 = Ti.UI.createView({
        bottom: 0,
        height: 85,
        id: "__alloyId121"
    });
    $.__views.requestView.add($.__views.__alloyId121);
    $.__views.tryCodeBtn = Ti.UI.createButton({
        width: 325,
        height: 53,
        borderRadius: 5,
        color: "white",
        font: {
            fontSize: 18,
            fontWeight: "bold"
        },
        backgroundColor: "#8B61FF",
        id: "tryCodeBtn"
    });
    $.__views.__alloyId121.add($.__views.tryCodeBtn);
    onClickTryCode ? $.addListener($.__views.tryCodeBtn, "click", onClickTryCode) : __defers["$.__views.tryCodeBtn!click!onClickTryCode"] = true;
    $.__views.verifyView = Ti.UI.createView({
        layout: "composite",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        id: "verifyView"
    });
    __alloyId112.push($.__views.verifyView);
    $.__views.__alloyId122 = Ti.UI.createView({
        top: 0,
        backgroundColor: "#54EE92",
        width: Ti.UI.FILL,
        height: 40,
        id: "__alloyId122"
    });
    $.__views.verifyView.add($.__views.__alloyId122);
    $.__views.__alloyId123 = Ti.UI.createView({
        width: 40,
        height: 40,
        left: 0,
        id: "__alloyId123"
    });
    $.__views.__alloyId122.add($.__views.__alloyId123);
    onClickRetry ? $.addListener($.__views.__alloyId123, "click", onClickRetry) : __defers["$.__views.__alloyId123!click!onClickRetry"] = true;
    $.__views.__alloyId124 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/slider_back_icn.png",
        id: "__alloyId124"
    });
    $.__views.__alloyId123.add($.__views.__alloyId124);
    $.__views.phoneNmLabel = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "white",
        font: {
            fontSize: 20,
            fontWeight: "bold"
        },
        textAlign: "center",
        id: "phoneNmLabel",
        text: ""
    });
    $.__views.__alloyId122.add($.__views.phoneNmLabel);
    $.__views.formWrap = Ti.UI.createView({
        top: 40,
        bottom: 85,
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        id: "formWrap"
    });
    $.__views.verifyView.add($.__views.formWrap);
    $.__views.middleView2 = Ti.UI.createView({
        layout: "vertical",
        width: 294,
        height: 181,
        id: "middleView2"
    });
    $.__views.formWrap.add($.__views.middleView2);
    $.__views.verifyCodeView = Ti.UI.createView({
        width: 294,
        height: 121,
        id: "verifyCodeView"
    });
    $.__views.middleView2.add($.__views.verifyCodeView);
    $.__views.verifyCode = Ti.UI.createTextField({
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_NONE,
        borderRadius: 0,
        borderWidth: 0,
        keyboardType: Titanium.UI.KEYBOARD_PHONE_PAD,
        textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
        top: 50,
        width: 135,
        height: 65,
        font: {
            fontSize: 50,
            fontWeight: "bold"
        },
        color: "#5FEEA3",
        id: "verifyCode",
        text: ""
    });
    $.__views.verifyCodeView.add($.__views.verifyCode);
    $.__views.verifyStatusImage = Ti.UI.createImageView({
        preventDefaultImage: true,
        right: 40,
        top: 75,
        id: "verifyStatusImage",
        image: "/images/signin_check_box.png"
    });
    $.__views.verifyCodeView.add($.__views.verifyStatusImage);
    $.__views.bottomLineVerify = Ti.UI.createView({
        top: 107,
        width: 130,
        height: 5,
        backgroundColor: "#5FEEA3",
        id: "bottomLineVerify"
    });
    $.__views.verifyCodeView.add($.__views.bottomLineVerify);
    $.__views.bottomLineVerifyFail = Ti.UI.createView({
        top: 107,
        width: 130,
        height: 5,
        backgroundColor: "#ea4e4e",
        visible: false,
        id: "bottomLineVerifyFail"
    });
    $.__views.verifyCodeView.add($.__views.bottomLineVerifyFail);
    $.__views.verifyMsgView = Ti.UI.createView({
        width: 294,
        height: 60,
        id: "verifyMsgView"
    });
    $.__views.middleView2.add($.__views.verifyMsgView);
    $.__views.verifyMsgLabel = Ti.UI.createLabel({
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        color: "#C5C5C5",
        font: {
            fontSize: 13
        },
        textAlign: "center",
        left: 27,
        id: "verifyMsgLabel"
    });
    $.__views.verifyMsgView.add($.__views.verifyMsgLabel);
    $.__views.verifyFailMsgLabel = Ti.UI.createLabel({
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        color: "#ea4e4e",
        font: {
            fontSize: 13
        },
        textAlign: "center",
        left: 27,
        visible: false,
        id: "verifyFailMsgLabel"
    });
    $.__views.verifyMsgView.add($.__views.verifyFailMsgLabel);
    $.__views.__alloyId125 = Ti.UI.createView({
        top: 10,
        bottom: 10,
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        id: "__alloyId125"
    });
    $.__views.formWrap.add($.__views.__alloyId125);
    $.__views.__alloyId126 = Ti.UI.createView({
        bottom: 0,
        height: 85,
        id: "__alloyId126"
    });
    $.__views.verifyView.add($.__views.__alloyId126);
    $.__views.retryBtn = Ti.UI.createButton({
        width: 325,
        height: 53,
        borderRadius: 5,
        color: "white",
        font: {
            fontSize: 18,
            fontWeight: "bold"
        },
        backgroundColor: "#FB8F8F",
        id: "retryBtn"
    });
    $.__views.__alloyId126.add($.__views.retryBtn);
    onClickTryCode ? $.addListener($.__views.retryBtn, "click", onClickTryCode) : __defers["$.__views.retryBtn!click!onClickTryCode"] = true;
    $.__views.joinView = Ti.UI.createView({
        layout: "composite",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        id: "joinView"
    });
    __alloyId112.push($.__views.joinView);
    $.__views.__alloyId127 = Ti.UI.createView({
        top: 0,
        backgroundColor: "#54EE92",
        width: Ti.UI.FILL,
        height: 40,
        id: "__alloyId127"
    });
    $.__views.joinView.add($.__views.__alloyId127);
    $.__views.formWrap = Ti.UI.createView({
        top: 40,
        bottom: 85,
        layout: "vertical",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        id: "formWrap"
    });
    $.__views.joinView.add($.__views.formWrap);
    $.__views.middleView3 = Ti.UI.createView({
        layout: "vertical",
        width: 294,
        height: 181,
        id: "middleView3"
    });
    $.__views.formWrap.add($.__views.middleView3);
    $.__views.nameView = Ti.UI.createView({
        top: 40,
        width: Ti.UI.FILL,
        height: 80,
        zIndex: 50,
        id: "nameView"
    });
    $.__views.middleView3.add($.__views.nameView);
    $.__views.nameLabel = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#8b61ff",
        font: {
            fontSize: 16,
            fontWeight: "bold"
        },
        textAlign: "center",
        left: 0,
        top: 0,
        id: "nameLabel"
    });
    $.__views.nameView.add($.__views.nameLabel);
    $.__views.nameLimitLabel = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#bebebe",
        font: {
            fontSize: 10,
            fontWeight: "Bold"
        },
        textAlign: "center",
        right: 0,
        top: 0,
        id: "nameLimitLabel"
    });
    $.__views.nameView.add($.__views.nameLimitLabel);
    $.__views.nameInput = Ti.UI.createTextField({
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_NONE,
        borderRadius: 0,
        borderWidth: 0,
        top: 19,
        left: 0,
        width: Ti.UI.FILL,
        height: 54,
        font: {
            fontSize: 30,
            fontWeight: "bold"
        },
        color: "#8b61ff",
        id: "nameInput",
        value: ""
    });
    $.__views.nameView.add($.__views.nameInput);
    $.__views.__alloyId128 = Ti.UI.createView({
        top: 59,
        width: Ti.UI.FILL,
        height: 3,
        backgroundColor: "white",
        id: "__alloyId128"
    });
    $.__views.nameView.add($.__views.__alloyId128);
    $.__views.__alloyId129 = Ti.UI.createView({
        top: 62,
        width: Ti.UI.FILL,
        height: 3,
        backgroundColor: "#8b61ff",
        id: "__alloyId129"
    });
    $.__views.nameView.add($.__views.__alloyId129);
    $.__views.nameMsgView = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: 30,
        id: "nameMsgView"
    });
    $.__views.middleView3.add($.__views.nameMsgView);
    $.__views.nameMsgLabel = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#676767",
        font: {
            fontSize: 13,
            fontWeight: "bold"
        },
        textAlign: "center",
        top: 0,
        id: "nameMsgLabel"
    });
    $.__views.nameMsgView.add($.__views.nameMsgLabel);
    $.__views.agreeMsgView = Ti.UI.createView({
        bottom: 0,
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        id: "agreeMsgView"
    });
    $.__views.joinView.add($.__views.agreeMsgView);
    $.__views.agreeMsgLabel = Ti.UI.createLabel({
        width: 294,
        height: Ti.UI.SIZE,
        color: "#8b61ff",
        font: {
            fontSize: 13,
            fontWeight: "bold"
        },
        textAlign: "center",
        bottom: 85,
        id: "agreeMsgLabel"
    });
    $.__views.agreeMsgView.add($.__views.agreeMsgLabel);
    $.__views.joinBtn = Ti.UI.createButton({
        width: 325,
        height: 53,
        borderRadius: 5,
        color: "white",
        font: {
            fontSize: 18,
            fontWeight: "bold"
        },
        backgroundColor: "#8B61FF",
        bottom: 16,
        zIndex: 55,
        id: "joinBtn"
    });
    $.__views.agreeMsgView.add($.__views.joinBtn);
    onClickJoinComplete ? $.addListener($.__views.joinBtn, "click", onClickJoinComplete) : __defers["$.__views.joinBtn!click!onClickJoinComplete"] = true;
    $.__views.scrollView = Ti.UI.createScrollableView({
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        scrollingEnabled: false,
        top: 20,
        views: __alloyId112,
        id: "scrollView",
        showPagingControl: "false"
    });
    $.__views.login.add($.__views.scrollView);
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    $.agreeLabel.text = L("l_welcomeLabel");
    $.tryCodeBtn.title = L("verifyCodeSendBtn");
    $.verifyMsgLabel.text = L("l_verifyMsgLabel");
    $.verifyFailMsgLabel.text = L("l_verifyMsgLabel_Fail");
    $.retryBtn.title = L("verifyCodeResendBtn");
    $.nameLabel.text = L("joinNameLabel");
    $.nameMsgLabel.text = L("joinNameMsgLabel");
    $.agreeMsgLabel.text = L("l_agreeLabel");
    $.joinBtn.title = L("joinCompleteBtn");
    if (Alloy.Globals.is.shortPhone || "ipad" == Titanium.Platform.osname) {
        $.middleView1.height = 141;
        $.middleView2.height = 141;
        $.middleView3.height = 141;
        $.verifyCodeView.top = -40;
        $.nameView.top = 5;
        $.nameView.height = 65;
        $.nameMsgView.height = 30;
    }
    Alloy.Models.instance("user");
    Alloy.Models.instance("settings");
    Ti.App.addEventListener("keyboardframechanged", function(e) {
        $.agreeMsgView.bottom = e.keyboardFrame.height;
    });
    var _inputLimitSize = Alloy.Globals.inputLimit.name;
    $.nameLimitLabel.text = "0 / " + _inputLimitSize;
    $.nameInput.addEventListener("change", onChangeInputField);
    var countries = require("countries");
    var countryCode = Titanium.Locale.getCurrentCountry().toLowerCase() ? Titanium.Locale.getCurrentCountry().toLowerCase() : "us";
    $.localNm.text = "+" + countries[countryCode].phoneCode;
    $.countryLabel.text = countries[countryCode].name;
    var countryPickerValues = [];
    var countryKeys = _.keys(countries);
    for (i = 0; i < countryKeys.length; i++) {
        var countryKey = countryKeys[i];
        countryPickerValues.push([ countryKey, countries[countryKey].name ]);
    }
    countryPickerValues = _.object(countryPickerValues);
    var codeSendCount = 0;
    var inWait = false;
    var inDelay = false;
    Alloy.Globals.loginC.on("login:open", function() {
        $.getView().close();
    });
    $.getView().addEventListener("open", function() {
        $.phoneNm.focus();
    });
    $.getView().addEventListener("close", function() {});
    __defers["$.__views.localNm!click!onPopupCountryPicker"] && $.addListener($.__views.localNm, "click", onPopupCountryPicker);
    __defers["$.__views.tryCodeBtn!click!onClickTryCode"] && $.addListener($.__views.tryCodeBtn, "click", onClickTryCode);
    __defers["$.__views.__alloyId123!click!onClickRetry"] && $.addListener($.__views.__alloyId123, "click", onClickRetry);
    __defers["$.__views.retryBtn!click!onClickTryCode"] && $.addListener($.__views.retryBtn, "click", onClickTryCode);
    __defers["$.__views.joinBtn!click!onClickJoinComplete"] && $.addListener($.__views.joinBtn, "click", onClickJoinComplete);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
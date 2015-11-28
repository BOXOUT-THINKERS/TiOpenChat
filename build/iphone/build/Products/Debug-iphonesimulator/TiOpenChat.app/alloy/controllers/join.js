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
    function onClickNumberpad(e) {
        if (true && "click" == e.type) return;
        var phoneNm = $.phoneNm.text;
        switch (e.source.itemId) {
          case "plus":
            break;

          case "delete":
            $.phoneNm.text = phoneNm.substring(0, phoneNm.length - 1);
            break;

          default:
            $.phoneNm.text = phoneNm + e.source.itemId;
        }
    }
    function onClickNumberpad2(e) {
        if (true && "click" == e.type) return;
        var verifyCode = $.verifyCode.text;
        switch (e.source.itemId) {
          case "plus":
            break;

          case "delete":
            $.verifyCode.text = verifyCode.substring(0, verifyCode.length - 1);
            break;

          default:
            $.verifyCode.text = verifyCode + e.source.itemId;
        }
        onChangeVerifyCode();
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
        parseSMSVerification($.localNm.text, $.phoneNm.text);
    }
    function onClickRetry() {
        $.scrollView.scrollToView($.requestView);
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
                    $.scrollView.scrollToView($.verifyView);
                },
                error: function(error) {
                    Ti.API.error(error);
                    Alloy.Globals.alert("tryAgainAlert");
                }
            });
        }
    }
    function onChangeVerifyCode() {
        var verifyCode = $.verifyCode.text;
        verifyCode.length >= 4 && checkVerifyCode();
    }
    function checkVerifyCode() {
        if (Parse.User.current()) {
            Alloy.Globals.startWaiting("verifyCodeCheck");
            Parse.Cloud.run("verifyPhoneNumber", {
                phoneVerificationCode: $.verifyCode.text
            }, {
                success: function() {
                    $.verifyStatusImage.image = "/images/signin_check_box_selected.png";
                    $.verifyFailMsgLabel.visible = false;
                    $.verifyMsgLabel.visible = true;
                    $.bottomLineVerifyFail.visible = false;
                    $.bottomLineVerify.visible = true;
                    Alloy.Globals.stopWaiting();
                    $.scrollView.scrollToView($.joinView);
                },
                error: function(error) {
                    Ti.API.error(error);
                    $.verifyStatusImage.image = "/images/signin_x_box.png";
                    $.verifyMsgLabel.visible = false;
                    $.verifyFailMsgLabel.visible = true;
                    $.bottomLineVerify.visible = false;
                    $.bottomLineVerifyFail.visible = true;
                    Alloy.Globals.stopWaiting();
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
    $.__views.__alloyId116 = Ti.UI.createView({
        backgroundColor: "#54EE92",
        height: 20,
        top: 0,
        id: "__alloyId116"
    });
    $.__views.login.add($.__views.__alloyId116);
    var __alloyId117 = [];
    $.__views.requestView = Ti.UI.createView({
        layout: "composite",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        id: "requestView"
    });
    __alloyId117.push($.__views.requestView);
    $.__views.__alloyId118 = Ti.UI.createView({
        top: 0,
        backgroundColor: "#54EE92",
        width: Ti.UI.FILL,
        height: 40,
        id: "__alloyId118"
    });
    $.__views.requestView.add($.__views.__alloyId118);
    $.__views.fakeNavTitle = Ti.UI.createImageView({
        preventDefaultImage: true,
        id: "fakeNavTitle",
        image: "/images/signin_navi_title_odizzo.png"
    });
    $.__views.__alloyId118.add($.__views.fakeNavTitle);
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
    $.__views.__alloyId119 = Ti.UI.createView({
        top: 20,
        layout: "horizontal",
        width: 294,
        height: 40,
        id: "__alloyId119"
    });
    $.__views.middleView1.add($.__views.__alloyId119);
    $.__views.__alloyId120 = Ti.UI.createView({
        width: 70,
        height: 38,
        layout: "composite",
        id: "__alloyId120"
    });
    $.__views.__alloyId119.add($.__views.__alloyId120);
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
    $.__views.__alloyId120.add($.__views.localNm);
    onPopupCountryPicker ? $.addListener($.__views.localNm, "click", onPopupCountryPicker) : __defers["$.__views.localNm!click!onPopupCountryPicker"] = true;
    $.__views.__alloyId121 = Ti.UI.createView({
        bottom: 0,
        width: 70,
        height: 20,
        backgroundColor: "#FB8F8F",
        id: "__alloyId121"
    });
    $.__views.__alloyId120.add($.__views.__alloyId121);
    $.__views.phoneNm = Ti.UI.createLabel({
        width: 200,
        height: Ti.UI.SIZE,
        color: "#C5C5C5",
        font: {
            fontSize: 18,
            fontWeight: "bold"
        },
        textAlign: Titanium.UI.TEXT_ALIGNMENT_LEFT,
        left: 12,
        right: 12,
        id: "phoneNm",
        text: ""
    });
    $.__views.__alloyId119.add($.__views.phoneNm);
    $.__views.__alloyId122 = Ti.UI.createView({
        width: 294,
        height: 2,
        backgroundColor: "#FB8F8F",
        id: "__alloyId122"
    });
    $.__views.__alloyId119.add($.__views.__alloyId122);
    $.__views.__alloyId123 = Ti.UI.createView({
        top: 20,
        layout: "horizontal",
        width: 294,
        height: 40,
        id: "__alloyId123"
    });
    $.__views.middleView1.add($.__views.__alloyId123);
    $.__views.gpsImage = Ti.UI.createImageView({
        preventDefaultImage: true,
        left: 10,
        id: "gpsImage",
        image: "/images/signin_gps_icon.png"
    });
    $.__views.__alloyId123.add($.__views.gpsImage);
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
    $.__views.__alloyId123.add($.__views.countryLabel);
    $.__views.__alloyId124 = Ti.UI.createView({
        width: 294,
        height: 1,
        backgroundColor: "#ADADAD",
        id: "__alloyId124"
    });
    $.__views.middleView1.add($.__views.__alloyId124);
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
    $.__views.__alloyId125 = Ti.UI.createView({
        top: 10,
        bottom: 10,
        layout: "vertical",
        width: 274.33,
        height: Ti.UI.FILL,
        id: "__alloyId125"
    });
    $.__views.formWrap.add($.__views.__alloyId125);
    $.__views.__alloyId126 = Ti.UI.createView({
        layout: "horizontal",
        width: Ti.UI.FILL,
        height: "25%",
        id: "__alloyId126"
    });
    $.__views.__alloyId125.add($.__views.__alloyId126);
    $.__views.__alloyId127 = Ti.UI.createView({
        width: 274.33,
        height: 7,
        id: "__alloyId127"
    });
    $.__views.__alloyId126.add($.__views.__alloyId127);
    $.__views.__alloyId128 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "1",
        id: "__alloyId128"
    });
    $.__views.__alloyId126.add($.__views.__alloyId128);
    onClickNumberpad ? $.addListener($.__views.__alloyId128, "singletap", onClickNumberpad) : __defers["$.__views.__alloyId128!singletap!onClickNumberpad"] = true;
    onClickNumberpad ? $.addListener($.__views.__alloyId128, "click", onClickNumberpad) : __defers["$.__views.__alloyId128!click!onClickNumberpad"] = true;
    $.__views.__alloyId129 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "1",
        image: "/images/signin_number_key_1.png",
        id: "__alloyId129"
    });
    $.__views.__alloyId128.add($.__views.__alloyId129);
    $.__views.__alloyId130 = Ti.UI.createView({
        width: 7,
        height: Ti.UI.FILL,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId130"
    });
    $.__views.__alloyId126.add($.__views.__alloyId130);
    $.__views.__alloyId131 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "2",
        id: "__alloyId131"
    });
    $.__views.__alloyId126.add($.__views.__alloyId131);
    onClickNumberpad ? $.addListener($.__views.__alloyId131, "singletap", onClickNumberpad) : __defers["$.__views.__alloyId131!singletap!onClickNumberpad"] = true;
    onClickNumberpad ? $.addListener($.__views.__alloyId131, "click", onClickNumberpad) : __defers["$.__views.__alloyId131!click!onClickNumberpad"] = true;
    $.__views.__alloyId132 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "2",
        image: "/images/signin_number_key_2.png",
        id: "__alloyId132"
    });
    $.__views.__alloyId131.add($.__views.__alloyId132);
    $.__views.__alloyId133 = Ti.UI.createView({
        width: 7,
        height: Ti.UI.FILL,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId133"
    });
    $.__views.__alloyId126.add($.__views.__alloyId133);
    $.__views.__alloyId134 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "3",
        id: "__alloyId134"
    });
    $.__views.__alloyId126.add($.__views.__alloyId134);
    onClickNumberpad ? $.addListener($.__views.__alloyId134, "singletap", onClickNumberpad) : __defers["$.__views.__alloyId134!singletap!onClickNumberpad"] = true;
    onClickNumberpad ? $.addListener($.__views.__alloyId134, "click", onClickNumberpad) : __defers["$.__views.__alloyId134!click!onClickNumberpad"] = true;
    $.__views.__alloyId135 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "3",
        image: "/images/signin_number_key_3.png",
        id: "__alloyId135"
    });
    $.__views.__alloyId134.add($.__views.__alloyId135);
    $.__views.__alloyId136 = Ti.UI.createView({
        layout: "horizontal",
        width: Ti.UI.FILL,
        height: "25%",
        id: "__alloyId136"
    });
    $.__views.__alloyId125.add($.__views.__alloyId136);
    $.__views.__alloyId137 = Ti.UI.createView({
        width: 274.33,
        height: 7,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId137"
    });
    $.__views.__alloyId136.add($.__views.__alloyId137);
    $.__views.__alloyId138 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "4",
        id: "__alloyId138"
    });
    $.__views.__alloyId136.add($.__views.__alloyId138);
    onClickNumberpad ? $.addListener($.__views.__alloyId138, "singletap", onClickNumberpad) : __defers["$.__views.__alloyId138!singletap!onClickNumberpad"] = true;
    onClickNumberpad ? $.addListener($.__views.__alloyId138, "click", onClickNumberpad) : __defers["$.__views.__alloyId138!click!onClickNumberpad"] = true;
    $.__views.__alloyId139 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "4",
        image: "/images/signin_number_key_4.png",
        id: "__alloyId139"
    });
    $.__views.__alloyId138.add($.__views.__alloyId139);
    $.__views.__alloyId140 = Ti.UI.createView({
        width: 7,
        height: Ti.UI.FILL,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId140"
    });
    $.__views.__alloyId136.add($.__views.__alloyId140);
    $.__views.__alloyId141 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "5",
        id: "__alloyId141"
    });
    $.__views.__alloyId136.add($.__views.__alloyId141);
    onClickNumberpad ? $.addListener($.__views.__alloyId141, "singletap", onClickNumberpad) : __defers["$.__views.__alloyId141!singletap!onClickNumberpad"] = true;
    onClickNumberpad ? $.addListener($.__views.__alloyId141, "click", onClickNumberpad) : __defers["$.__views.__alloyId141!click!onClickNumberpad"] = true;
    $.__views.__alloyId142 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "5",
        image: "/images/signin_number_key_5.png",
        id: "__alloyId142"
    });
    $.__views.__alloyId141.add($.__views.__alloyId142);
    $.__views.__alloyId143 = Ti.UI.createView({
        width: 7,
        height: Ti.UI.FILL,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId143"
    });
    $.__views.__alloyId136.add($.__views.__alloyId143);
    $.__views.__alloyId144 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "6",
        id: "__alloyId144"
    });
    $.__views.__alloyId136.add($.__views.__alloyId144);
    onClickNumberpad ? $.addListener($.__views.__alloyId144, "singletap", onClickNumberpad) : __defers["$.__views.__alloyId144!singletap!onClickNumberpad"] = true;
    onClickNumberpad ? $.addListener($.__views.__alloyId144, "click", onClickNumberpad) : __defers["$.__views.__alloyId144!click!onClickNumberpad"] = true;
    $.__views.__alloyId145 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "6",
        image: "/images/signin_number_key_6.png",
        id: "__alloyId145"
    });
    $.__views.__alloyId144.add($.__views.__alloyId145);
    $.__views.__alloyId146 = Ti.UI.createView({
        layout: "horizontal",
        width: Ti.UI.FILL,
        height: "25%",
        id: "__alloyId146"
    });
    $.__views.__alloyId125.add($.__views.__alloyId146);
    $.__views.__alloyId147 = Ti.UI.createView({
        width: 274.33,
        height: 7,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId147"
    });
    $.__views.__alloyId146.add($.__views.__alloyId147);
    $.__views.__alloyId148 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "7",
        id: "__alloyId148"
    });
    $.__views.__alloyId146.add($.__views.__alloyId148);
    onClickNumberpad ? $.addListener($.__views.__alloyId148, "singletap", onClickNumberpad) : __defers["$.__views.__alloyId148!singletap!onClickNumberpad"] = true;
    onClickNumberpad ? $.addListener($.__views.__alloyId148, "click", onClickNumberpad) : __defers["$.__views.__alloyId148!click!onClickNumberpad"] = true;
    $.__views.__alloyId149 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "7",
        image: "/images/signin_number_key_7.png",
        id: "__alloyId149"
    });
    $.__views.__alloyId148.add($.__views.__alloyId149);
    $.__views.__alloyId150 = Ti.UI.createView({
        width: 7,
        height: Ti.UI.FILL,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId150"
    });
    $.__views.__alloyId146.add($.__views.__alloyId150);
    $.__views.__alloyId151 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "8",
        id: "__alloyId151"
    });
    $.__views.__alloyId146.add($.__views.__alloyId151);
    onClickNumberpad ? $.addListener($.__views.__alloyId151, "singletap", onClickNumberpad) : __defers["$.__views.__alloyId151!singletap!onClickNumberpad"] = true;
    onClickNumberpad ? $.addListener($.__views.__alloyId151, "click", onClickNumberpad) : __defers["$.__views.__alloyId151!click!onClickNumberpad"] = true;
    $.__views.__alloyId152 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "8",
        image: "/images/signin_number_key_8.png",
        id: "__alloyId152"
    });
    $.__views.__alloyId151.add($.__views.__alloyId152);
    $.__views.__alloyId153 = Ti.UI.createView({
        width: 7,
        height: Ti.UI.FILL,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId153"
    });
    $.__views.__alloyId146.add($.__views.__alloyId153);
    $.__views.__alloyId154 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "9",
        id: "__alloyId154"
    });
    $.__views.__alloyId146.add($.__views.__alloyId154);
    onClickNumberpad ? $.addListener($.__views.__alloyId154, "singletap", onClickNumberpad) : __defers["$.__views.__alloyId154!singletap!onClickNumberpad"] = true;
    onClickNumberpad ? $.addListener($.__views.__alloyId154, "click", onClickNumberpad) : __defers["$.__views.__alloyId154!click!onClickNumberpad"] = true;
    $.__views.__alloyId155 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "9",
        image: "/images/signin_number_key_9.png",
        id: "__alloyId155"
    });
    $.__views.__alloyId154.add($.__views.__alloyId155);
    $.__views.__alloyId156 = Ti.UI.createView({
        layout: "horizontal",
        width: Ti.UI.FILL,
        height: "25%",
        id: "__alloyId156"
    });
    $.__views.__alloyId125.add($.__views.__alloyId156);
    $.__views.__alloyId157 = Ti.UI.createView({
        width: 274.33,
        height: 7,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId157"
    });
    $.__views.__alloyId156.add($.__views.__alloyId157);
    $.__views.__alloyId158 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "plus",
        id: "__alloyId158"
    });
    $.__views.__alloyId156.add($.__views.__alloyId158);
    onClickNumberpad ? $.addListener($.__views.__alloyId158, "singletap", onClickNumberpad) : __defers["$.__views.__alloyId158!singletap!onClickNumberpad"] = true;
    onClickNumberpad ? $.addListener($.__views.__alloyId158, "click", onClickNumberpad) : __defers["$.__views.__alloyId158!click!onClickNumberpad"] = true;
    $.__views.__alloyId159 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "plus",
        image: "/images/signin_number_key_plus.png",
        id: "__alloyId159"
    });
    $.__views.__alloyId158.add($.__views.__alloyId159);
    $.__views.__alloyId160 = Ti.UI.createView({
        width: 7,
        height: Ti.UI.FILL,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId160"
    });
    $.__views.__alloyId156.add($.__views.__alloyId160);
    $.__views.__alloyId161 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "0",
        id: "__alloyId161"
    });
    $.__views.__alloyId156.add($.__views.__alloyId161);
    onClickNumberpad ? $.addListener($.__views.__alloyId161, "singletap", onClickNumberpad) : __defers["$.__views.__alloyId161!singletap!onClickNumberpad"] = true;
    onClickNumberpad ? $.addListener($.__views.__alloyId161, "click", onClickNumberpad) : __defers["$.__views.__alloyId161!click!onClickNumberpad"] = true;
    $.__views.__alloyId162 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "0",
        image: "/images/signin_number_key_0.png",
        id: "__alloyId162"
    });
    $.__views.__alloyId161.add($.__views.__alloyId162);
    $.__views.__alloyId163 = Ti.UI.createView({
        width: 7,
        height: Ti.UI.FILL,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId163"
    });
    $.__views.__alloyId156.add($.__views.__alloyId163);
    $.__views.__alloyId164 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "delete",
        id: "__alloyId164"
    });
    $.__views.__alloyId156.add($.__views.__alloyId164);
    onClickNumberpad ? $.addListener($.__views.__alloyId164, "singletap", onClickNumberpad) : __defers["$.__views.__alloyId164!singletap!onClickNumberpad"] = true;
    onClickNumberpad ? $.addListener($.__views.__alloyId164, "click", onClickNumberpad) : __defers["$.__views.__alloyId164!click!onClickNumberpad"] = true;
    $.__views.__alloyId165 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "delete",
        image: "/images/signin_number_key_delete.png",
        id: "__alloyId165"
    });
    $.__views.__alloyId164.add($.__views.__alloyId165);
    $.__views.__alloyId166 = Ti.UI.createView({
        bottom: 0,
        height: 85,
        id: "__alloyId166"
    });
    $.__views.requestView.add($.__views.__alloyId166);
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
    $.__views.__alloyId166.add($.__views.tryCodeBtn);
    onClickTryCode ? $.addListener($.__views.tryCodeBtn, "click", onClickTryCode) : __defers["$.__views.tryCodeBtn!click!onClickTryCode"] = true;
    $.__views.verifyView = Ti.UI.createView({
        layout: "composite",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        id: "verifyView"
    });
    __alloyId117.push($.__views.verifyView);
    $.__views.__alloyId167 = Ti.UI.createView({
        top: 0,
        backgroundColor: "#54EE92",
        width: Ti.UI.FILL,
        height: 40,
        id: "__alloyId167"
    });
    $.__views.verifyView.add($.__views.__alloyId167);
    $.__views.__alloyId168 = Ti.UI.createView({
        width: 40,
        height: 40,
        left: 0,
        id: "__alloyId168"
    });
    $.__views.__alloyId167.add($.__views.__alloyId168);
    onClickRetry ? $.addListener($.__views.__alloyId168, "click", onClickRetry) : __defers["$.__views.__alloyId168!click!onClickRetry"] = true;
    $.__views.__alloyId169 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/slider_back_icn.png",
        id: "__alloyId169"
    });
    $.__views.__alloyId168.add($.__views.__alloyId169);
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
    $.__views.__alloyId167.add($.__views.phoneNmLabel);
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
    $.__views.verifyCode = Ti.UI.createLabel({
        width: 135,
        height: 65,
        color: "#5FEEA3",
        font: {
            fontSize: 50,
            fontWeight: "bold"
        },
        textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_NONE,
        borderRadius: 0,
        borderWidth: 0,
        top: 50,
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
    $.__views.__alloyId170 = Ti.UI.createView({
        top: 10,
        bottom: 10,
        layout: "vertical",
        width: 274.33,
        height: Ti.UI.FILL,
        id: "__alloyId170"
    });
    $.__views.formWrap.add($.__views.__alloyId170);
    $.__views.__alloyId171 = Ti.UI.createView({
        layout: "horizontal",
        width: Ti.UI.FILL,
        height: "25%",
        id: "__alloyId171"
    });
    $.__views.__alloyId170.add($.__views.__alloyId171);
    $.__views.__alloyId172 = Ti.UI.createView({
        width: 274.33,
        height: 7,
        id: "__alloyId172"
    });
    $.__views.__alloyId171.add($.__views.__alloyId172);
    $.__views.__alloyId173 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "1",
        id: "__alloyId173"
    });
    $.__views.__alloyId171.add($.__views.__alloyId173);
    onClickNumberpad2 ? $.addListener($.__views.__alloyId173, "singletap", onClickNumberpad2) : __defers["$.__views.__alloyId173!singletap!onClickNumberpad2"] = true;
    onClickNumberpad2 ? $.addListener($.__views.__alloyId173, "click", onClickNumberpad2) : __defers["$.__views.__alloyId173!click!onClickNumberpad2"] = true;
    $.__views.__alloyId174 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "1",
        image: "/images/signin_number_key_1.png",
        id: "__alloyId174"
    });
    $.__views.__alloyId173.add($.__views.__alloyId174);
    $.__views.__alloyId175 = Ti.UI.createView({
        width: 7,
        height: Ti.UI.FILL,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId175"
    });
    $.__views.__alloyId171.add($.__views.__alloyId175);
    $.__views.__alloyId176 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "2",
        id: "__alloyId176"
    });
    $.__views.__alloyId171.add($.__views.__alloyId176);
    onClickNumberpad2 ? $.addListener($.__views.__alloyId176, "singletap", onClickNumberpad2) : __defers["$.__views.__alloyId176!singletap!onClickNumberpad2"] = true;
    onClickNumberpad2 ? $.addListener($.__views.__alloyId176, "click", onClickNumberpad2) : __defers["$.__views.__alloyId176!click!onClickNumberpad2"] = true;
    $.__views.__alloyId177 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "2",
        image: "/images/signin_number_key_2.png",
        id: "__alloyId177"
    });
    $.__views.__alloyId176.add($.__views.__alloyId177);
    $.__views.__alloyId178 = Ti.UI.createView({
        width: 7,
        height: Ti.UI.FILL,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId178"
    });
    $.__views.__alloyId171.add($.__views.__alloyId178);
    $.__views.__alloyId179 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "3",
        id: "__alloyId179"
    });
    $.__views.__alloyId171.add($.__views.__alloyId179);
    onClickNumberpad2 ? $.addListener($.__views.__alloyId179, "singletap", onClickNumberpad2) : __defers["$.__views.__alloyId179!singletap!onClickNumberpad2"] = true;
    onClickNumberpad2 ? $.addListener($.__views.__alloyId179, "click", onClickNumberpad2) : __defers["$.__views.__alloyId179!click!onClickNumberpad2"] = true;
    $.__views.__alloyId180 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "3",
        image: "/images/signin_number_key_3.png",
        id: "__alloyId180"
    });
    $.__views.__alloyId179.add($.__views.__alloyId180);
    $.__views.__alloyId181 = Ti.UI.createView({
        layout: "horizontal",
        width: Ti.UI.FILL,
        height: "25%",
        id: "__alloyId181"
    });
    $.__views.__alloyId170.add($.__views.__alloyId181);
    $.__views.__alloyId182 = Ti.UI.createView({
        width: 274.33,
        height: 7,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId182"
    });
    $.__views.__alloyId181.add($.__views.__alloyId182);
    $.__views.__alloyId183 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "4",
        id: "__alloyId183"
    });
    $.__views.__alloyId181.add($.__views.__alloyId183);
    onClickNumberpad2 ? $.addListener($.__views.__alloyId183, "singletap", onClickNumberpad2) : __defers["$.__views.__alloyId183!singletap!onClickNumberpad2"] = true;
    onClickNumberpad2 ? $.addListener($.__views.__alloyId183, "click", onClickNumberpad2) : __defers["$.__views.__alloyId183!click!onClickNumberpad2"] = true;
    $.__views.__alloyId184 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "4",
        image: "/images/signin_number_key_4.png",
        id: "__alloyId184"
    });
    $.__views.__alloyId183.add($.__views.__alloyId184);
    $.__views.__alloyId185 = Ti.UI.createView({
        width: 7,
        height: Ti.UI.FILL,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId185"
    });
    $.__views.__alloyId181.add($.__views.__alloyId185);
    $.__views.__alloyId186 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "5",
        id: "__alloyId186"
    });
    $.__views.__alloyId181.add($.__views.__alloyId186);
    onClickNumberpad2 ? $.addListener($.__views.__alloyId186, "singletap", onClickNumberpad2) : __defers["$.__views.__alloyId186!singletap!onClickNumberpad2"] = true;
    onClickNumberpad2 ? $.addListener($.__views.__alloyId186, "click", onClickNumberpad2) : __defers["$.__views.__alloyId186!click!onClickNumberpad2"] = true;
    $.__views.__alloyId187 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "5",
        image: "/images/signin_number_key_5.png",
        id: "__alloyId187"
    });
    $.__views.__alloyId186.add($.__views.__alloyId187);
    $.__views.__alloyId188 = Ti.UI.createView({
        width: 7,
        height: Ti.UI.FILL,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId188"
    });
    $.__views.__alloyId181.add($.__views.__alloyId188);
    $.__views.__alloyId189 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "6",
        id: "__alloyId189"
    });
    $.__views.__alloyId181.add($.__views.__alloyId189);
    onClickNumberpad2 ? $.addListener($.__views.__alloyId189, "singletap", onClickNumberpad2) : __defers["$.__views.__alloyId189!singletap!onClickNumberpad2"] = true;
    onClickNumberpad2 ? $.addListener($.__views.__alloyId189, "click", onClickNumberpad2) : __defers["$.__views.__alloyId189!click!onClickNumberpad2"] = true;
    $.__views.__alloyId190 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "6",
        image: "/images/signin_number_key_6.png",
        id: "__alloyId190"
    });
    $.__views.__alloyId189.add($.__views.__alloyId190);
    $.__views.__alloyId191 = Ti.UI.createView({
        layout: "horizontal",
        width: Ti.UI.FILL,
        height: "25%",
        id: "__alloyId191"
    });
    $.__views.__alloyId170.add($.__views.__alloyId191);
    $.__views.__alloyId192 = Ti.UI.createView({
        width: 274.33,
        height: 7,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId192"
    });
    $.__views.__alloyId191.add($.__views.__alloyId192);
    $.__views.__alloyId193 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "7",
        id: "__alloyId193"
    });
    $.__views.__alloyId191.add($.__views.__alloyId193);
    onClickNumberpad2 ? $.addListener($.__views.__alloyId193, "singletap", onClickNumberpad2) : __defers["$.__views.__alloyId193!singletap!onClickNumberpad2"] = true;
    onClickNumberpad2 ? $.addListener($.__views.__alloyId193, "click", onClickNumberpad2) : __defers["$.__views.__alloyId193!click!onClickNumberpad2"] = true;
    $.__views.__alloyId194 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "7",
        image: "/images/signin_number_key_7.png",
        id: "__alloyId194"
    });
    $.__views.__alloyId193.add($.__views.__alloyId194);
    $.__views.__alloyId195 = Ti.UI.createView({
        width: 7,
        height: Ti.UI.FILL,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId195"
    });
    $.__views.__alloyId191.add($.__views.__alloyId195);
    $.__views.__alloyId196 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "8",
        id: "__alloyId196"
    });
    $.__views.__alloyId191.add($.__views.__alloyId196);
    onClickNumberpad2 ? $.addListener($.__views.__alloyId196, "singletap", onClickNumberpad2) : __defers["$.__views.__alloyId196!singletap!onClickNumberpad2"] = true;
    onClickNumberpad2 ? $.addListener($.__views.__alloyId196, "click", onClickNumberpad2) : __defers["$.__views.__alloyId196!click!onClickNumberpad2"] = true;
    $.__views.__alloyId197 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "8",
        image: "/images/signin_number_key_8.png",
        id: "__alloyId197"
    });
    $.__views.__alloyId196.add($.__views.__alloyId197);
    $.__views.__alloyId198 = Ti.UI.createView({
        width: 7,
        height: Ti.UI.FILL,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId198"
    });
    $.__views.__alloyId191.add($.__views.__alloyId198);
    $.__views.__alloyId199 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "9",
        id: "__alloyId199"
    });
    $.__views.__alloyId191.add($.__views.__alloyId199);
    onClickNumberpad2 ? $.addListener($.__views.__alloyId199, "singletap", onClickNumberpad2) : __defers["$.__views.__alloyId199!singletap!onClickNumberpad2"] = true;
    onClickNumberpad2 ? $.addListener($.__views.__alloyId199, "click", onClickNumberpad2) : __defers["$.__views.__alloyId199!click!onClickNumberpad2"] = true;
    $.__views.__alloyId200 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "9",
        image: "/images/signin_number_key_9.png",
        id: "__alloyId200"
    });
    $.__views.__alloyId199.add($.__views.__alloyId200);
    $.__views.__alloyId201 = Ti.UI.createView({
        layout: "horizontal",
        width: Ti.UI.FILL,
        height: "25%",
        id: "__alloyId201"
    });
    $.__views.__alloyId170.add($.__views.__alloyId201);
    $.__views.__alloyId202 = Ti.UI.createView({
        width: 274.33,
        height: 7,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId202"
    });
    $.__views.__alloyId201.add($.__views.__alloyId202);
    $.__views.__alloyId203 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "plus",
        id: "__alloyId203"
    });
    $.__views.__alloyId201.add($.__views.__alloyId203);
    onClickNumberpad2 ? $.addListener($.__views.__alloyId203, "singletap", onClickNumberpad2) : __defers["$.__views.__alloyId203!singletap!onClickNumberpad2"] = true;
    onClickNumberpad2 ? $.addListener($.__views.__alloyId203, "click", onClickNumberpad2) : __defers["$.__views.__alloyId203!click!onClickNumberpad2"] = true;
    $.__views.__alloyId204 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "plus",
        image: "/images/signin_number_key_plus.png",
        id: "__alloyId204"
    });
    $.__views.__alloyId203.add($.__views.__alloyId204);
    $.__views.__alloyId205 = Ti.UI.createView({
        width: 7,
        height: Ti.UI.FILL,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId205"
    });
    $.__views.__alloyId201.add($.__views.__alloyId205);
    $.__views.__alloyId206 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "0",
        id: "__alloyId206"
    });
    $.__views.__alloyId201.add($.__views.__alloyId206);
    onClickNumberpad2 ? $.addListener($.__views.__alloyId206, "singletap", onClickNumberpad2) : __defers["$.__views.__alloyId206!singletap!onClickNumberpad2"] = true;
    onClickNumberpad2 ? $.addListener($.__views.__alloyId206, "click", onClickNumberpad2) : __defers["$.__views.__alloyId206!click!onClickNumberpad2"] = true;
    $.__views.__alloyId207 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "0",
        image: "/images/signin_number_key_0.png",
        id: "__alloyId207"
    });
    $.__views.__alloyId206.add($.__views.__alloyId207);
    $.__views.__alloyId208 = Ti.UI.createView({
        width: 7,
        height: Ti.UI.FILL,
        backgroundImage: "/images/signin_dot_line.png",
        backgroundRepeat: true,
        id: "__alloyId208"
    });
    $.__views.__alloyId201.add($.__views.__alloyId208);
    $.__views.__alloyId209 = Ti.UI.createView({
        layout: "composite",
        width: 86,
        height: Ti.UI.FILL,
        itemId: "delete",
        id: "__alloyId209"
    });
    $.__views.__alloyId201.add($.__views.__alloyId209);
    onClickNumberpad2 ? $.addListener($.__views.__alloyId209, "singletap", onClickNumberpad2) : __defers["$.__views.__alloyId209!singletap!onClickNumberpad2"] = true;
    onClickNumberpad2 ? $.addListener($.__views.__alloyId209, "click", onClickNumberpad2) : __defers["$.__views.__alloyId209!click!onClickNumberpad2"] = true;
    $.__views.__alloyId210 = Ti.UI.createImageView({
        preventDefaultImage: true,
        itemId: "delete",
        image: "/images/signin_number_key_delete.png",
        id: "__alloyId210"
    });
    $.__views.__alloyId209.add($.__views.__alloyId210);
    $.__views.__alloyId211 = Ti.UI.createView({
        bottom: 0,
        height: 85,
        id: "__alloyId211"
    });
    $.__views.verifyView.add($.__views.__alloyId211);
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
    $.__views.__alloyId211.add($.__views.retryBtn);
    onClickTryCode ? $.addListener($.__views.retryBtn, "click", onClickTryCode) : __defers["$.__views.retryBtn!click!onClickTryCode"] = true;
    $.__views.joinView = Ti.UI.createView({
        layout: "composite",
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        id: "joinView"
    });
    __alloyId117.push($.__views.joinView);
    $.__views.__alloyId212 = Ti.UI.createView({
        top: 0,
        backgroundColor: "#54EE92",
        width: Ti.UI.FILL,
        height: 40,
        id: "__alloyId212"
    });
    $.__views.joinView.add($.__views.__alloyId212);
    $.__views.fakeNavTitle2 = Ti.UI.createImageView({
        preventDefaultImage: true,
        id: "fakeNavTitle2",
        image: "/images/signin_navi_title_odizzo.png"
    });
    $.__views.__alloyId212.add($.__views.fakeNavTitle2);
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
    $.__views.__alloyId213 = Ti.UI.createView({
        top: 59,
        width: Ti.UI.FILL,
        height: 3,
        backgroundColor: "white",
        id: "__alloyId213"
    });
    $.__views.nameView.add($.__views.__alloyId213);
    $.__views.__alloyId214 = Ti.UI.createView({
        top: 62,
        width: Ti.UI.FILL,
        height: 3,
        backgroundColor: "#8b61ff",
        id: "__alloyId214"
    });
    $.__views.nameView.add($.__views.__alloyId214);
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
        views: __alloyId117,
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
    $.fakeNavTitle.image = "ko" == Alloy.Globals.currentLanguage ? "/images/signin_navi_title_odizzo.png" : "/images/signin_navi_title_odizzo_en.png";
    $.fakeNavTitle2.image = "ko" == Alloy.Globals.currentLanguage ? "/images/signin_navi_title_odizzo.png" : "/images/signin_navi_title_odizzo_en.png";
    __defers["$.__views.localNm!click!onPopupCountryPicker"] && $.addListener($.__views.localNm, "click", onPopupCountryPicker);
    __defers["$.__views.__alloyId128!singletap!onClickNumberpad"] && $.addListener($.__views.__alloyId128, "singletap", onClickNumberpad);
    __defers["$.__views.__alloyId128!click!onClickNumberpad"] && $.addListener($.__views.__alloyId128, "click", onClickNumberpad);
    __defers["$.__views.__alloyId131!singletap!onClickNumberpad"] && $.addListener($.__views.__alloyId131, "singletap", onClickNumberpad);
    __defers["$.__views.__alloyId131!click!onClickNumberpad"] && $.addListener($.__views.__alloyId131, "click", onClickNumberpad);
    __defers["$.__views.__alloyId134!singletap!onClickNumberpad"] && $.addListener($.__views.__alloyId134, "singletap", onClickNumberpad);
    __defers["$.__views.__alloyId134!click!onClickNumberpad"] && $.addListener($.__views.__alloyId134, "click", onClickNumberpad);
    __defers["$.__views.__alloyId138!singletap!onClickNumberpad"] && $.addListener($.__views.__alloyId138, "singletap", onClickNumberpad);
    __defers["$.__views.__alloyId138!click!onClickNumberpad"] && $.addListener($.__views.__alloyId138, "click", onClickNumberpad);
    __defers["$.__views.__alloyId141!singletap!onClickNumberpad"] && $.addListener($.__views.__alloyId141, "singletap", onClickNumberpad);
    __defers["$.__views.__alloyId141!click!onClickNumberpad"] && $.addListener($.__views.__alloyId141, "click", onClickNumberpad);
    __defers["$.__views.__alloyId144!singletap!onClickNumberpad"] && $.addListener($.__views.__alloyId144, "singletap", onClickNumberpad);
    __defers["$.__views.__alloyId144!click!onClickNumberpad"] && $.addListener($.__views.__alloyId144, "click", onClickNumberpad);
    __defers["$.__views.__alloyId148!singletap!onClickNumberpad"] && $.addListener($.__views.__alloyId148, "singletap", onClickNumberpad);
    __defers["$.__views.__alloyId148!click!onClickNumberpad"] && $.addListener($.__views.__alloyId148, "click", onClickNumberpad);
    __defers["$.__views.__alloyId151!singletap!onClickNumberpad"] && $.addListener($.__views.__alloyId151, "singletap", onClickNumberpad);
    __defers["$.__views.__alloyId151!click!onClickNumberpad"] && $.addListener($.__views.__alloyId151, "click", onClickNumberpad);
    __defers["$.__views.__alloyId154!singletap!onClickNumberpad"] && $.addListener($.__views.__alloyId154, "singletap", onClickNumberpad);
    __defers["$.__views.__alloyId154!click!onClickNumberpad"] && $.addListener($.__views.__alloyId154, "click", onClickNumberpad);
    __defers["$.__views.__alloyId158!singletap!onClickNumberpad"] && $.addListener($.__views.__alloyId158, "singletap", onClickNumberpad);
    __defers["$.__views.__alloyId158!click!onClickNumberpad"] && $.addListener($.__views.__alloyId158, "click", onClickNumberpad);
    __defers["$.__views.__alloyId161!singletap!onClickNumberpad"] && $.addListener($.__views.__alloyId161, "singletap", onClickNumberpad);
    __defers["$.__views.__alloyId161!click!onClickNumberpad"] && $.addListener($.__views.__alloyId161, "click", onClickNumberpad);
    __defers["$.__views.__alloyId164!singletap!onClickNumberpad"] && $.addListener($.__views.__alloyId164, "singletap", onClickNumberpad);
    __defers["$.__views.__alloyId164!click!onClickNumberpad"] && $.addListener($.__views.__alloyId164, "click", onClickNumberpad);
    __defers["$.__views.tryCodeBtn!click!onClickTryCode"] && $.addListener($.__views.tryCodeBtn, "click", onClickTryCode);
    __defers["$.__views.__alloyId168!click!onClickRetry"] && $.addListener($.__views.__alloyId168, "click", onClickRetry);
    __defers["$.__views.__alloyId173!singletap!onClickNumberpad2"] && $.addListener($.__views.__alloyId173, "singletap", onClickNumberpad2);
    __defers["$.__views.__alloyId173!click!onClickNumberpad2"] && $.addListener($.__views.__alloyId173, "click", onClickNumberpad2);
    __defers["$.__views.__alloyId176!singletap!onClickNumberpad2"] && $.addListener($.__views.__alloyId176, "singletap", onClickNumberpad2);
    __defers["$.__views.__alloyId176!click!onClickNumberpad2"] && $.addListener($.__views.__alloyId176, "click", onClickNumberpad2);
    __defers["$.__views.__alloyId179!singletap!onClickNumberpad2"] && $.addListener($.__views.__alloyId179, "singletap", onClickNumberpad2);
    __defers["$.__views.__alloyId179!click!onClickNumberpad2"] && $.addListener($.__views.__alloyId179, "click", onClickNumberpad2);
    __defers["$.__views.__alloyId183!singletap!onClickNumberpad2"] && $.addListener($.__views.__alloyId183, "singletap", onClickNumberpad2);
    __defers["$.__views.__alloyId183!click!onClickNumberpad2"] && $.addListener($.__views.__alloyId183, "click", onClickNumberpad2);
    __defers["$.__views.__alloyId186!singletap!onClickNumberpad2"] && $.addListener($.__views.__alloyId186, "singletap", onClickNumberpad2);
    __defers["$.__views.__alloyId186!click!onClickNumberpad2"] && $.addListener($.__views.__alloyId186, "click", onClickNumberpad2);
    __defers["$.__views.__alloyId189!singletap!onClickNumberpad2"] && $.addListener($.__views.__alloyId189, "singletap", onClickNumberpad2);
    __defers["$.__views.__alloyId189!click!onClickNumberpad2"] && $.addListener($.__views.__alloyId189, "click", onClickNumberpad2);
    __defers["$.__views.__alloyId193!singletap!onClickNumberpad2"] && $.addListener($.__views.__alloyId193, "singletap", onClickNumberpad2);
    __defers["$.__views.__alloyId193!click!onClickNumberpad2"] && $.addListener($.__views.__alloyId193, "click", onClickNumberpad2);
    __defers["$.__views.__alloyId196!singletap!onClickNumberpad2"] && $.addListener($.__views.__alloyId196, "singletap", onClickNumberpad2);
    __defers["$.__views.__alloyId196!click!onClickNumberpad2"] && $.addListener($.__views.__alloyId196, "click", onClickNumberpad2);
    __defers["$.__views.__alloyId199!singletap!onClickNumberpad2"] && $.addListener($.__views.__alloyId199, "singletap", onClickNumberpad2);
    __defers["$.__views.__alloyId199!click!onClickNumberpad2"] && $.addListener($.__views.__alloyId199, "click", onClickNumberpad2);
    __defers["$.__views.__alloyId203!singletap!onClickNumberpad2"] && $.addListener($.__views.__alloyId203, "singletap", onClickNumberpad2);
    __defers["$.__views.__alloyId203!click!onClickNumberpad2"] && $.addListener($.__views.__alloyId203, "click", onClickNumberpad2);
    __defers["$.__views.__alloyId206!singletap!onClickNumberpad2"] && $.addListener($.__views.__alloyId206, "singletap", onClickNumberpad2);
    __defers["$.__views.__alloyId206!click!onClickNumberpad2"] && $.addListener($.__views.__alloyId206, "click", onClickNumberpad2);
    __defers["$.__views.__alloyId209!singletap!onClickNumberpad2"] && $.addListener($.__views.__alloyId209, "singletap", onClickNumberpad2);
    __defers["$.__views.__alloyId209!click!onClickNumberpad2"] && $.addListener($.__views.__alloyId209, "click", onClickNumberpad2);
    __defers["$.__views.retryBtn!click!onClickTryCode"] && $.addListener($.__views.retryBtn, "click", onClickTryCode);
    __defers["$.__views.joinBtn!click!onClickJoinComplete"] && $.addListener($.__views.joinBtn, "click", onClickJoinComplete);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
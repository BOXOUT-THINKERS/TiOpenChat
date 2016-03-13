function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function onOpen() {
        Ti.API.debug("Open Event");
        Ti.App.addEventListener("resumed", addHandler);
        Ti.App.addEventListener("paused", removeHandler);
    }
    function onClose() {
        Ti.API.debug("Close Event");
        removeHandler();
        Ti.App.removeEventListener("resumed", addHandler);
        Ti.App.removeEventListener("paused", removeHandler);
    }
    function rightBtnSet(params) {
        if (params && params.rightBtnOption && params.rightBtnFn) {
            var rightMenuView = Ti.UI.createView();
            var rightBtn = Ti.UI.createButton(params.rightBtnOption);
            rightBtn.addEventListener("click", function() {
                params.rightBtnFn(rightBtn);
            });
            rightMenuView.add(rightBtn);
            $.centerWindow.rightNavButton = rightMenuView;
            if (params.centerTitle) {
                $.centerWindow.titleControl = Ti.UI.createLabel({
                    text: params.centerTitle,
                    color: "white",
                    font: {
                        fontSize: "17",
                        fontFamily: "AppleSDGothicNeo-SemiBold"
                    }
                });
                Ti.API.debug("title확인", $.centerWindow.titleControl.text);
            }
        }
    }
    function changeCenterView(controller, viewName) {
        if (_currentViewName == viewName) return;
        addHandler();
        try {
            _.isFunction(controller.rightBtn) && rightBtnSet(controller.rightBtn());
        } catch (e) {}
        try {
            _.isFunction(controller.openFn) && controller.openFn();
        } catch (e) {}
        $.index.setCenterView(controller.getView());
        try {
            _.isFunction(_currentController.closeFn) && _currentController.closeFn();
        } catch (e) {}
        _currentViewName = viewName;
        _currentController = controller;
    }
    function onMenuButtonClick() {
        $.index.toggleLeftView();
    }
    function onDrawerOpen() {
        Ti.API.debug($.index.isLeftDrawerOpen);
    }
    function onDrawerClose() {
        Ti.API.debug($.index.isLeftDrawerOpen);
    }
    function defineVersion() {
        var Version = function(versionStr) {
            _.isNumber(versionStr) && (versionStr = versionStr.toString());
            var numbers = versionStr.split(".");
            this.major = numbers[0] ? Number(numbers[0]) : 0;
            this.minor = numbers[1] ? Number(numbers[1]) : 0;
            this.patch = numbers[2] ? Number(numbers[2]) : 0;
            this.build = numbers[3] ? Number(numbers[3]) : 0;
        };
        Version.prototype.isLessThan = function(rVersion) {
            if (this.major < rVersion.major) return true;
            if (this.major > rVersion.major) return false;
            if (this.minor < rVersion.minor) return true;
            if (this.minor > rVersion.minor) return false;
            if (this.patch < rVersion.patch) return true;
            if (this.patch > rVersion.patch) return false;
            if (this.build < rVersion.build) return true;
            if (this.build > rVersion.build) return false;
            return false;
        };
        Version.prototype.isGreaterThan = function(rVersion) {
            if (this.major > rVersion.major) return true;
            if (this.major < rVersion.major) return false;
            if (this.minor > rVersion.minor) return true;
            if (this.minor < rVersion.minor) return false;
            if (this.patch > rVersion.patch) return true;
            if (this.patch < rVersion.patch) return false;
            if (this.build > rVersion.build) return true;
            if (this.build < rVersion.build) return false;
            return false;
        };
        Version.prototype.isEqual = function(rVersion) {
            return this.major == rVersion.major && this.minor == rVersion.minor && this.patch == rVersion.patch && this.build == rVersion.build ? true : false;
        };
        return Version;
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "index";
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
    $.__views.__alloyId107 = Ti.UI.createView({
        top: 64,
        role: "leftView",
        id: "__alloyId107"
    });
    $.__views.menuC = Alloy.createController("menu", {
        id: "menuC",
        __parentSymbol: $.__views.__alloyId107
    });
    $.__views.menuC.setParent($.__views.__alloyId107);
    $.__views.centerWindow = Ti.UI.createWindow({
        backgroundColor: "#f7f7f7",
        barColor: "#54EE92",
        translucent: false,
        navTintColor: "white",
        titleAttributes: {
            color: "white"
        },
        statusBarStyle: Titanium.UI.iPhone.StatusBar.LIGHT_CONTENT,
        id: "centerWindow",
        title: L("c_odizzo"),
        role: "centerWindow",
        exitOnClose: "true"
    });
    onOpen ? $.addListener($.__views.centerWindow, "open", onOpen) : __defers["$.__views.centerWindow!open!onOpen"] = true;
    onClose ? $.addListener($.__views.centerWindow, "close", onClose) : __defers["$.__views.centerWindow!close!onClose"] = true;
    $.__views.__alloyId109 = Ti.UI.createView({
        id: "__alloyId109"
    });
    $.__views.__alloyId110 = Ti.UI.createButton({
        font: {
            fontFamily: "Ionicons",
            fontSize: 25
        },
        text: "",
        title: "",
        left: -5,
        backgroundColor: "#54EE92",
        id: "__alloyId110"
    });
    $.__views.__alloyId109.add($.__views.__alloyId110);
    onMenuButtonClick ? $.addListener($.__views.__alloyId110, "click", onMenuButtonClick) : __defers["$.__views.__alloyId110!click!onMenuButtonClick"] = true;
    $.__views.centerWindow.leftNavButton = $.__views.__alloyId109;
    $.__views.centerWindow.rightNavButton = void 0;
    $.__views.mainC = Alloy.createController("blank", {
        id: "mainC",
        __parentSymbol: $.__views.centerWindow
    });
    $.__views.mainC.setParent($.__views.centerWindow);
    $.__views.index = Alloy.createWidget("kr.yostudio.drawer", "widget", {
        id: "index",
        children: [ $.__views.__alloyId107, $.__views.centerWindow ]
    });
    $.__views.index && $.addTopLevelView($.__views.index);
    onDrawerOpen ? $.__views.index.on("draweropen", onDrawerOpen) : __defers["$.__views.index!draweropen!onDrawerOpen"] = true;
    onDrawerClose ? $.__views.index.on("drawerclose", onDrawerClose) : __defers["$.__views.index!drawerclose!onDrawerClose"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    Alloy.Globals.navigation = $.index;
    Alloy.Globals.menuC = $.menuC;
    Alloy.Globals.loginC = Alloy.createController("login");
    Alloy.Globals.loginC.requiredLogin();
    var appVersionCheck = function() {
        function fetchAppInfo(retryCount) {
            Ti.API.debug("retryCount Remain : ", retryCount, "/3", "name :", Titanium.App.name);
            Alloy.Globals.appInfoM.fetch({
                query: {
                    where: {
                        name: Titanium.App.name
                    }
                },
                success: successCallbackAfterFetch,
                error: function(err) {
                    Ti.API.debug("fetchAppInfo error :", err);
                    if (0 >= retryCount) {
                        var dialog = Ti.UI.createAlertDialog({
                            ok: 0,
                            buttonNames: [ L("c_alertMsgOk") ],
                            message: L("c_alertFailFetchAppInfo")
                        });
                        dialog.show();
                    } else fetchAppInfo(--retryCount);
                }
            });
        }
        function successCallbackAfterFetch(res) {
            var results = res.attributes.results || [ null ];
            var appInfoData = results[0];
            if (appInfoData) {
                Alloy.Globals.appInfoM = Alloy.createModel("appInfo", appInfoData);
                verifyAndRunByAppVersion(currentVersion);
            } else {
                var msg = L("c_odizzo") + "의 버전 정보가 없습니다.";
                Alloy.Globals.alert(msg);
            }
        }
        function verifyAndRunByAppVersion(currentVersion) {
            var minVersion = new Version(Alloy.Globals.appInfoM.get("minVersion"));
            var recentVersion = new Version(Alloy.Globals.appInfoM.get("recentVersion"));
            var requestVersion = new Version(Alloy.Globals.appInfoM.get("requestVersion"));
            Ti.API.debug("appINfo : ", Alloy.Globals.appInfoM.attributes);
            Ti.API.debug(currentVersion, minVersion, recentVersion, requestVersion);
            if (currentVersion.isLessThan(minVersion)) {
                var dialog = Ti.UI.createAlertDialog({
                    ok: 0,
                    buttonNames: [ "ok" ],
                    message: L("c_alertRequestReinstall")
                });
                dialog.addEventListener("click", function() {
                    Ti.API.debug("====강제종료");
                    Alloy.Globals.startWaiting("c_alertRequestReinstall");
                });
                dialog.show();
                return;
            }
            if (currentVersion.isLessThan(requestVersion)) {
                var dialog = Ti.UI.createAlertDialog({
                    ok: 0,
                    cancel: 1,
                    buttonNames: [ L("c_updateConfirmYes"), L("c_updateConfirmNo") ],
                    message: L("c_updateConfirmMessage")
                });
                dialog.addEventListener("click", function(e) {
                    e.index === e.source.cancel;
                    if (e.index === e.source.ok) {
                        var linkInfo = {
                            ios: {},
                            android: {}
                        };
                        linkInfo = Alloy.Globals.appInfoM.get("ko" == Alloy.Globals.currentLanguage ? "linkInfo_ko" : "linkInfo_en");
                        linkInfo = linkInfo.ios;
                        Ti.API.debug("===============새로운 버전 설치!하는 기능 추가해야함.================");
                        Ti.API.debug(linkInfo);
                        Ti.Platform.openURL(linkInfo.url);
                    }
                });
                dialog.show();
                return;
            }
            if (currentVersion.isGreaterThan(requestVersion) && currentVersion.isLessThan(recentVersion)) return;
        }
        var Version = defineVersion();
        var currentVersion = new Version(Titanium.App.version);
        Alloy.Globals.appInfoM = Alloy.createModel("appInfo");
        fetchAppInfo(3);
    };
    $.centerWindow.addEventListener("open", function() {
        Alloy.Globals.startWaiting("c_waitingMsgFirst");
        Alloy.Globals.chatListC = Alloy.createController("chat/chatList");
        Alloy.Globals.user ? Alloy.Globals.chatListC.fetchInitialData("sync") : Alloy.Globals.loginC.on("login:user", function() {
            Alloy.Globals.chatListC.fetchInitialData("sync");
        });
        Alloy.Globals.chatListC.on("start:complete", function() {
            _.defer(function() {
                if (!Alloy.Globals.firebaseC) {
                    Alloy.Globals.firebaseC = Alloy.createController("firebase");
                    Alloy.Globals.firebaseC.on("receive:message", function(message) {
                        Alloy.Globals.chatService._onReceiveMessage(message);
                    });
                }
                Alloy.Globals.firebaseC.listenStart(Alloy.Globals.user.get("id"));
                _.defer(function() {
                    Alloy.Globals.chatListC.trigger("firebase:ready");
                    _.defer(function() {
                        Alloy.Globals.parsePushC || (Alloy.Globals.parsePushC = Alloy.createController("parsePush"));
                        _.defer(function() {
                            Alloy.Globals.loginC.trigger("login:after", Alloy.Globals.user);
                            _.defer(function() {
                                Alloy.Globals.parsePushC.trigger("parsePush:ready");
                                _.defer(function() {
                                    _.defer(function() {
                                        var now = new Date();
                                        Parse.Cloud.run("userModify", {
                                            timezoneOffset: now.getTimezoneOffset(),
                                            currentLanguage: Alloy.Globals.currentLanguage
                                        });
                                        _.defer(function() {
                                            appVersionCheck();
                                            _.defer(function() {
                                                Alloy.Globals.appStartProcess = false;
                                                Alloy.Globals.chatListC.startComplete = true;
                                                Alloy.Globals.chatListC.trigger("appStartProcess:complete");
                                                Ti.API.debug("==============================================================");
                                                Ti.API.debug("실행 초기화 마무리작업끝");
                                                Ti.API.debug("==============================================================");
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
            Alloy.Globals.chatListC.off("start:complete", arguments.callee);
        });
        changeCenterView(Alloy.Globals.chatListC, "chatlist");
        $.centerWindow.removeEventListener("open", arguments.callee);
    });
    var addHandler = function() {
        Alloy.Globals.appOnline = true;
        Alloy.Globals.firebaseC && Alloy.Globals.firebaseC.goOnline();
    };
    var removeHandler = function() {
        Alloy.Globals.appOnline = false;
        !Alloy.Globals.firebaseC || Alloy.Globals.chatViewManager && Alloy.Globals.chatViewManager.currentOpenedRoomId || Alloy.Globals.firebaseC.goOffline();
        if (!_.isEmpty(Alloy.Globals.user) && Alloy.Globals.parsePushC) {
            var myId = Alloy.Globals.user.get("id");
            var models = Alloy.Collections.instance("message").where({
                isRead: false
            });
            var badgeCount = _.filter(models, function(model) {
                return model.get("fromUserId") == myId || "send:message" != model.get("type") && "request:where" != model.get("type") ? false : true;
            }).length;
            Alloy.Globals.parsePushC.setBadge(parseInt(badgeCount));
        }
    };
    require("Context");
    var _currentViewName;
    var _currentController;
    $.menuC.on("menuclick", function(e) {
        switch (e.itemId) {
          case "contacts":
            changeCenterView(Alloy.createController("contacts"), e.itemId);
            break;

          case "chatlist":
            changeCenterView(Alloy.Globals.chatListC, e.itemId);
            break;

          case "setting":
            changeCenterView(Alloy.createController("setting/setting"), e.itemId);
        }
        e.isNotToggle || $.index.toggleLeftView({
            animated: false
        });
    });
    __defers["$.__views.centerWindow!open!onOpen"] && $.addListener($.__views.centerWindow, "open", onOpen);
    __defers["$.__views.centerWindow!close!onClose"] && $.addListener($.__views.centerWindow, "close", onClose);
    __defers["$.__views.__alloyId110!click!onMenuButtonClick"] && $.addListener($.__views.__alloyId110, "click", onMenuButtonClick);
    __defers["$.__views.index!draweropen!onDrawerOpen"] && $.__views.index.on("draweropen", onDrawerOpen);
    __defers["$.__views.index!drawerclose!onDrawerClose"] && $.__views.index.on("drawerclose", onDrawerClose);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "login";
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
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    var userM = Alloy.Models.instance("user");
    Alloy.Models.instance("settings");
    Alloy.Collections.instance("contacts");
    exports.doingSyncAddress = false;
    userM.on("change", function() {
        Alloy.Globals.settings.set("User_sessionToken", userM.get("_sessionToken")).save();
        Alloy.Globals.user = userM;
        $.trigger("login:user", Alloy.Globals.user);
        userM.off("change", arguments.callee);
    });
    exports.requiredLogin = function() {
        if (exports.isLogin()) {
            userM.login();
            Alloy.Globals.navigation.open();
            $.trigger("login:open");
        } else {
            Alloy.Globals.closeAllWindow();
            Alloy.createController("join").getView().open();
        }
    };
    exports.isLogin = function() {
        var loginData = Alloy.Globals.settings.get("User_sessionToken");
        var isLogin = loginData && _.size(loginData);
        return isLogin;
    };
    exports.logout = function(callback) {
        Alloy.Globals.settings.set("User_sessionToken", void 0).save();
        Alloy.Globals.user = null;
        $.trigger("logout", userM);
        Alloy.Globals.closeAllWindow();
        _.isFunction(callback) && callback();
        Alloy.Globals.loginC.requiredLogin();
        Alloy.Globals.navigation.topWindow.close();
    };
    exports.withdraw = function() {
        Alloy.Globals.user;
        var withdrawUser = function() {
            Parse.Cloud.run("userModify", {
                isWithdraw: true
            }, {
                success: function() {
                    exports.logout();
                },
                error: function(error) {
                    Ti.API.error("withdraw User Failed");
                    Ti.API.error(error);
                }
            });
        };
        Parse.User.become(Alloy.Globals.settings.get("User_sessionToken")).then(function(user) {
            withdrawUser(user);
        }, function(error) {
            Ti.API.error(error);
        });
    };
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
var Alloy = require("alloy"), _ = require("alloy/underscore")._, model, collection;

exports.definition = {
    config: {
        adapter: {
            type: "parse"
        }
    },
    extendModel: function(Model) {
        _.extend(Model.prototype, {
            _parse_class_name: "users",
            login: function(options) {
                function loginParse() {
                    if (Alloy.Globals.settings.get("User_sessionToken")) Parse.User.become(Alloy.Globals.settings.get("User_sessionToken")).then(function(user) {
                        withdrawChk(user);
                    }, function(error) {
                        errorFn(error);
                    }); else if (options && options.username && options.password) Parse.User.logIn(options.username, options.password, {
                        success: function(user) {
                            withdrawChk(user);
                        },
                        error: function(user, error) {
                            errorFn(error);
                        }
                    }); else {
                        Ti.API.error("User Login Faild");
                        Alloy.Globals.settings.set("User_sessionToken", void 0).save();
                        Alloy.Globals.loginC.requiredLogin();
                    }
                }
                var thisModel = this;
                var errorFn = function(error) {
                    Ti.API.error(error);
                    if ("101" == error.code || "209" == error.code) {
                        Alloy.Globals.settings.set("User_sessionToken", void 0).save();
                        Alloy.Globals.loginC.requiredLogin();
                    } else setTimeout(loginParse, 100);
                };
                var withdrawChk = function(user) {
                    true == user.get("isWithdraw") ? errorFn() : thisModel.set(user);
                };
                loginParse();
            },
            getInfo: function() {
                var userM = this.attributes;
                var id = this.get("id");
                var imageUrl = userM.get("profileImage") ? userM.get("profileImage").url() : "";
                var name = userM.get("name") || "";
                return {
                    id: id,
                    name: name,
                    imageUrl: imageUrl,
                    comment: userM.get("comment") || ""
                };
            }
        });
        return Model;
    },
    extendCollection: function(Collection) {
        _.extend(Collection.prototype, {
            _parse_class_name: "users",
            fetch: function(options) {
                options = options ? _.clone(options) : {};
                options.reset = true;
                return Backbone.Collection.prototype.fetch.call(this, options);
            }
        });
        return Collection;
    }
};

model = Alloy.M("user", exports.definition, []);

collection = Alloy.C("user", exports.definition, model);

exports.Model = model;

exports.Collection = collection;
function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function cancleBan(contactM) {
        hideContactsCol.remove(contactM, {
            remove: false
        });
        drawHideFriend();
        var tempContactM = Alloy.createModel("contacts");
        tempContactM.save({
            objectId: contactM.id,
            isHidden: false
        }, {
            success: function() {
                contactM.set({
                    isHidden: false
                }, {
                    change: "false"
                });
            },
            error: function() {
                hideContactsCol.add(contactM, {
                    add: false
                });
                drawHideFriend();
                Alloy.Globals.alert("c_alertMsgDefault");
            }
        });
    }
    function blockFriend(contactM) {
        hideContactsCol.remove(contactM, {
            remove: false
        });
        drawHideFriend();
        var tempContactM = Alloy.createModel("contacts");
        tempContactM.save({
            objectId: contactM.id,
            isHidden: false,
            isBlock: true
        }, {
            success: function() {
                contactM.set({
                    isHidden: false,
                    isBlock: true
                }, {
                    change: "false"
                });
            },
            error: function() {
                hideContactsCol.add(contactM, {
                    add: false
                });
                drawHideFriend();
                Alloy.Globals.alert("c_alertMsgDefault");
            }
        });
    }
    function drawHideFriend() {
        var items = [];
        hideContactsCol.each(function(contactM) {
            var friend = contactM.getUserInfo();
            items.push({
                template: "rowTemplate",
                profileImage: {
                    image: friend.imageUrl || "/images/friendlist_profile_default_img.png"
                },
                profileName: {
                    text: friend.name
                },
                rowRightBtnLabel: {
                    text: L("c_manage")
                },
                properties: {
                    itemId: contactM.id
                }
            });
        });
        $.section.setItems(items);
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "setting/hideFriendManage";
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
    var __alloyId326 = {};
    var __alloyId329 = [];
    var __alloyId331 = {
        type: "Ti.UI.View",
        childTemplates: function() {
            var __alloyId332 = [];
            var __alloyId334 = {
                type: "Ti.UI.View",
                childTemplates: function() {
                    var __alloyId335 = [];
                    var __alloyId337 = {
                        type: "Ti.UI.ImageView",
                        bindId: "profileImage",
                        properties: {
                            preventDefaultImage: true,
                            height: 38,
                            width: 38,
                            borderRadius: 19,
                            font: {
                                fontFamily: "Ionicons",
                                fontSize: 30
                            },
                            color: "#77787f",
                            backgroundColor: "#bebfc3",
                            bindId: "profileImage"
                        }
                    };
                    __alloyId335.push(__alloyId337);
                    var __alloyId339 = {
                        type: "Ti.UI.ImageView",
                        properties: {
                            preventDefaultImage: true,
                            height: 40,
                            width: 40,
                            image: "/images/friendlist_profile_pic_outline.png"
                        }
                    };
                    __alloyId335.push(__alloyId339);
                    return __alloyId335;
                }(),
                properties: {
                    left: 0,
                    height: 40,
                    width: 40
                }
            };
            __alloyId332.push(__alloyId334);
            var __alloyId341 = {
                type: "Ti.UI.Label",
                bindId: "profileName",
                properties: {
                    width: Ti.UI.SIZE,
                    height: Ti.UI.SIZE,
                    color: "#3a3a3a",
                    font: {
                        fontSize: 16,
                        fontWeight: "Medium"
                    },
                    textAlign: "center",
                    left: 13,
                    bindId: "profileName"
                }
            };
            __alloyId332.push(__alloyId341);
            return __alloyId332;
        }(),
        properties: {
            layout: "horizontal",
            height: Ti.UI.SIZE,
            width: Ti.UI.SIZE,
            left: 13
        }
    };
    __alloyId329.push(__alloyId331);
    var __alloyId343 = {
        type: "Ti.UI.View",
        childTemplates: function() {
            var __alloyId344 = [];
            var __alloyId346 = {
                type: "Ti.UI.View",
                childTemplates: function() {
                    var __alloyId347 = [];
                    var __alloyId349 = {
                        type: "Ti.UI.Label",
                        bindId: "rowRightBtnLabel",
                        properties: {
                            width: Ti.UI.SIZE,
                            height: Ti.UI.SIZE,
                            color: "#6C6C6C",
                            font: {
                                fontSize: "18sp"
                            },
                            textAlign: "center",
                            left: 6,
                            right: 6,
                            top: 3,
                            bottom: 3,
                            bindId: "rowRightBtnLabel"
                        }
                    };
                    __alloyId347.push(__alloyId349);
                    return __alloyId347;
                }(),
                properties: {
                    layout: "composite",
                    width: Titanium.UI.SIZE,
                    height: Titanium.UI.SIZE,
                    backgroundColor: "#D9D9D9",
                    borderRadius: 10,
                    right: 0
                }
            };
            __alloyId344.push(__alloyId346);
            return __alloyId344;
        }(),
        properties: {
            layout: "composite",
            height: Ti.UI.SIZE,
            width: "55%",
            right: 13
        }
    };
    __alloyId329.push(__alloyId343);
    var __alloyId328 = {
        properties: {
            backgroundColor: "white",
            layout: "composite",
            height: 56.67,
            width: Ti.UI.FILL,
            selectionStyle: Titanium.UI.iPhone.ListViewCellSelectionStyle.NONE,
            name: "rowTemplate"
        },
        childTemplates: __alloyId329
    };
    __alloyId326["rowTemplate"] = __alloyId328;
    $.__views.section = Ti.UI.createListSection({
        id: "section"
    });
    var __alloyId351 = [];
    __alloyId351.push($.__views.section);
    $.__views.listView = Ti.UI.createListView({
        sections: __alloyId351,
        templates: __alloyId326,
        id: "listView"
    });
    $.__views.container.add($.__views.listView);
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    $.container.title = L("sb_hideFriendTitle");
    require("q");
    var hideContactsCol;
    $.getView().addEventListener("open", function() {
        var allContactsCol = Alloy.Collections.instance("contacts");
        var models = allContactsCol.filter(function(model) {
            return model.get("User_objectId_To") && model.get("isHidden");
        });
        hideContactsCol = Alloy.createCollection("contacts");
        hideContactsCol.reset(models);
        drawHideFriend();
    });
    $.listView.addEventListener("itemclick", function(e) {
        var itemId = e.itemId;
        var contactM = hideContactsCol.get(itemId);
        var opts = {
            cancleBan: 0,
            ban: 1
        };
        opts.options = [ L("sb_cancleBanFriend"), L("sb_ban"), L("c_cancle") ];
        var dialog = Ti.UI.createOptionDialog(opts);
        dialog.addEventListener("click", function(e) {
            if (e.index > 1) return;
            e.index == e.source.cancleBan && cancleBan(contactM);
            e.index == e.source.ban && blockFriend(contactM);
        });
        dialog.show();
    });
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
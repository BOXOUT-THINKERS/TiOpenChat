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
        banContactsCol.remove(contactM, {
            remove: false
        });
        drawBanFriend();
        var tempContactM = Alloy.createModel("contacts");
        tempContactM.save({
            objectId: contactM.id,
            isBlock: false
        }, {
            success: function() {
                contactM.set({
                    isBlock: false
                }, {
                    change: "false"
                });
            },
            error: function() {
                banContactsCol.add(contactM, {
                    add: false
                });
                drawBanFriend();
                Alloy.Globals.alert("c_alertMsgDefault");
            }
        });
    }
    function hideFriend(contactM) {
        banContactsCol.remove(contactM, {
            remove: false
        });
        drawBanFriend();
        var tempContactM = Alloy.createModel("contacts");
        tempContactM.save({
            objectId: contactM.id,
            isHidden: true,
            isBlock: false
        }, {
            success: function() {
                contactM.set({
                    isHidden: true,
                    isBlock: false
                }, {
                    change: "false"
                });
            },
            error: function() {
                banContactsCol.add(contactM, {
                    add: false
                });
                drawBanFriend();
                Alloy.Globals.alert("c_alertMsgDefault");
            }
        });
    }
    function drawBanFriend() {
        var items = [];
        banContactsCol.each(function(contactM) {
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
    this.__controllerPath = "setting/banFriendManage";
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
    var __alloyId359 = {};
    var __alloyId362 = [];
    var __alloyId364 = {
        type: "Ti.UI.View",
        childTemplates: function() {
            var __alloyId365 = [];
            var __alloyId367 = {
                type: "Ti.UI.View",
                childTemplates: function() {
                    var __alloyId368 = [];
                    var __alloyId370 = {
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
                    __alloyId368.push(__alloyId370);
                    var __alloyId372 = {
                        type: "Ti.UI.ImageView",
                        properties: {
                            preventDefaultImage: true,
                            height: 40,
                            width: 40,
                            image: "/images/friendlist_profile_pic_outline.png"
                        }
                    };
                    __alloyId368.push(__alloyId372);
                    return __alloyId368;
                }(),
                properties: {
                    left: 0,
                    height: 40,
                    width: 40
                }
            };
            __alloyId365.push(__alloyId367);
            var __alloyId374 = {
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
            __alloyId365.push(__alloyId374);
            return __alloyId365;
        }(),
        properties: {
            layout: "horizontal",
            height: Ti.UI.SIZE,
            width: Ti.UI.SIZE,
            left: 13
        }
    };
    __alloyId362.push(__alloyId364);
    var __alloyId376 = {
        type: "Ti.UI.View",
        childTemplates: function() {
            var __alloyId377 = [];
            var __alloyId379 = {
                type: "Ti.UI.View",
                childTemplates: function() {
                    var __alloyId380 = [];
                    var __alloyId382 = {
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
                    __alloyId380.push(__alloyId382);
                    return __alloyId380;
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
            __alloyId377.push(__alloyId379);
            return __alloyId377;
        }(),
        properties: {
            layout: "composite",
            height: Ti.UI.SIZE,
            width: "55%",
            right: 13
        }
    };
    __alloyId362.push(__alloyId376);
    var __alloyId361 = {
        properties: {
            backgroundColor: "white",
            layout: "composite",
            height: 56.67,
            width: Ti.UI.FILL,
            selectionStyle: Titanium.UI.iPhone.ListViewCellSelectionStyle.NONE,
            name: "rowTemplate"
        },
        childTemplates: __alloyId362
    };
    __alloyId359["rowTemplate"] = __alloyId361;
    $.__views.section = Ti.UI.createListSection({
        id: "section"
    });
    var __alloyId384 = [];
    __alloyId384.push($.__views.section);
    $.__views.listView = Ti.UI.createListView({
        sections: __alloyId384,
        templates: __alloyId359,
        id: "listView"
    });
    $.__views.container.add($.__views.listView);
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    $.container.title = L("sb_banFriendTitle");
    Alloy.Globals.Q;
    var banContactsCol;
    $.getView().addEventListener("open", function() {
        var allContactsCol = Alloy.Collections.instance("contacts");
        var models = allContactsCol.filter(function(model) {
            return model.get("User_objectId_To") && model.get("isBlock");
        });
        banContactsCol = Alloy.createCollection("contacts");
        banContactsCol.reset(models);
        drawBanFriend();
    });
    $.listView.addEventListener("itemclick", function(e) {
        var itemId = e.itemId;
        var contactM = banContactsCol.get(itemId);
        var opts = {
            cancleBan: 0,
            ban: 1
        };
        opts.options = [ L("sb_cancleBanFriend"), L("sb_changeBlocktToHidden"), L("c_cancle") ];
        var dialog = Ti.UI.createOptionDialog(opts);
        dialog.addEventListener("click", function(e) {
            if (e.index > 1) return;
            e.index == e.source.cancleBan && cancleBan(contactM);
            e.index == e.source.ban && hideFriend(contactM);
        });
        dialog.show();
    });
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
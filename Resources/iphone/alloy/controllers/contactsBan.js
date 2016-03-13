function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function blockContacts() {
        Alloy.Globals.startWaiting("c_waitingMsgDefault");
        blockContactsQ(0).then(function() {
            Alloy.Globals.toast("cb_banFriend");
            Alloy.Globals.stopWaiting();
            contactsCol.trigger("redraw");
            $.getView().close();
        });
    }
    function hiddenContacts() {
        Alloy.Globals.startWaiting("c_waitingMsgDefault");
        hiddenContactQ(0).then(function() {
            Alloy.Globals.toast("cb_hideFriend");
            Alloy.Globals.stopWaiting();
            contactsCol.trigger("redraw");
            $.getView().close();
        });
    }
    function blockContactsQ(idx) {
        Ti.API.debug("blockContactsQ function idx : ", idx);
        if (idx > selectedModels.length - 1) return Q(true);
        var selectedModel = selectedModels[idx];
        return selectedModel.qSave({
            isBlock: true
        }).then(function() {
            return blockContactsQ(idx + 1);
        }).fail(function() {
            return blockContactsQ(idx + 1);
        });
    }
    function hiddenContactQ(idx) {
        Ti.API.debug("hiddenContactQ function idx : ", idx);
        if (idx > selectedModels.length - 1) return Q(true);
        var selectedModel = selectedModels[idx];
        return selectedModel.qSave({
            isHidden: true
        }).then(function() {
            return hiddenContactQ(idx + 1);
        }).fail(function() {
            return hiddenContactQ(idx + 1);
        });
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "contactsBan";
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
    $.__views.__alloyId85 = Ti.UI.createView({
        height: 40,
        id: "__alloyId85"
    });
    var __alloyId86 = {};
    var __alloyId89 = [];
    var __alloyId91 = {
        type: "Ti.UI.View",
        childTemplates: function() {
            var __alloyId92 = [];
            var __alloyId94 = {
                type: "Ti.UI.ImageView",
                bindId: "checkIcon",
                properties: {
                    preventDefaultImage: true,
                    height: 20,
                    width: 20,
                    bindId: "checkIcon"
                }
            };
            __alloyId92.push(__alloyId94);
            var __alloyId96 = {
                type: "Ti.UI.View",
                childTemplates: function() {
                    var __alloyId97 = [];
                    var __alloyId99 = {
                        type: "Ti.UI.ImageView",
                        bindId: "profileImage",
                        properties: {
                            preventDefaultImage: true,
                            height: 38,
                            width: 38,
                            borderRadius: 19,
                            bindId: "profileImage"
                        }
                    };
                    __alloyId97.push(__alloyId99);
                    var __alloyId101 = {
                        type: "Ti.UI.ImageView",
                        properties: {
                            preventDefaultImage: true,
                            height: 40,
                            width: 40,
                            image: "/images/friendlist_edit_profile_pic_outline.png"
                        }
                    };
                    __alloyId97.push(__alloyId101);
                    return __alloyId97;
                }(),
                properties: {
                    left: 13,
                    height: 40,
                    width: 40
                }
            };
            __alloyId92.push(__alloyId96);
            var __alloyId103 = {
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
            __alloyId92.push(__alloyId103);
            return __alloyId92;
        }(),
        properties: {
            layout: "horizontal",
            height: Ti.UI.SIZE,
            width: Ti.UI.SIZE,
            left: 13
        }
    };
    __alloyId89.push(__alloyId91);
    var __alloyId88 = {
        properties: {
            layout: "composite",
            height: 56.67,
            width: Ti.UI.FILL,
            name: "rowTemplate"
        },
        childTemplates: __alloyId89
    };
    __alloyId86["rowTemplate"] = __alloyId88;
    $.__views.section = Ti.UI.createListSection({
        id: "section"
    });
    var __alloyId105 = [];
    __alloyId105.push($.__views.section);
    $.__views.listView = Ti.UI.createListView({
        sections: __alloyId105,
        templates: __alloyId86,
        footerView: $.__views.__alloyId85,
        id: "listView"
    });
    $.__views.container.add($.__views.listView);
    $.__views.footerView = Ti.UI.createView({
        backgroundColor: "#eeeeee",
        width: Titanium.UI.FILL,
        height: 45,
        bottom: 0,
        id: "footerView"
    });
    $.__views.container.add($.__views.footerView);
    $.__views.__alloyId106 = Ti.UI.createView({
        id: "__alloyId106"
    });
    $.__views.footerView.add($.__views.__alloyId106);
    $.__views.blockBtn = Ti.UI.createButton({
        left: "1.4%",
        height: 35,
        width: "48%",
        color: "white",
        font: {
            fontSize: 14,
            fontWeight: "bold"
        },
        backgroundColor: "#8b61ff",
        borderRadius: 4,
        id: "blockBtn"
    });
    $.__views.footerView.add($.__views.blockBtn);
    blockContacts ? $.addListener($.__views.blockBtn, "click", blockContacts) : __defers["$.__views.blockBtn!click!blockContacts"] = true;
    $.__views.hiddenBtn = Ti.UI.createButton({
        right: "1.4%",
        height: 35,
        width: "48%",
        color: "white",
        font: {
            fontSize: 14,
            fontWeight: "bold"
        },
        backgroundColor: "#41385b",
        borderRadius: 4,
        id: "hiddenBtn"
    });
    $.__views.footerView.add($.__views.hiddenBtn);
    hiddenContacts ? $.addListener($.__views.hiddenBtn, "click", hiddenContacts) : __defers["$.__views.hiddenBtn!click!hiddenContacts"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    $.container.title = L("cb_friendTitle");
    $.blockBtn.title = L("cb_banFriendBtn");
    $.hiddenBtn.title = L("cb_hideFriendBtn");
    var contactsCol = Alloy.Collections.instance("contacts");
    var Q = require("q");
    var friendContactsCol;
    var selectedModels = [];
    $.getView().addEventListener("open", function() {
        var allContactsCol = Alloy.Collections.instance("contacts");
        var models = allContactsCol.filter(function(model) {
            return model.get("User_objectId_To") && !(model.get("isHidden") || model.get("isBlock"));
        });
        friendContactsCol = Alloy.createCollection("contacts");
        friendContactsCol.reset(models);
        drawContacts();
        Alloy.Globals.stopWaiting();
    });
    var drawContacts = function() {
        var items = [];
        friendContactsCol.each(function(model) {
            var friend = model.get("User_object_To") || {};
            var imageUrl = friend.profileImage ? friend.profileImage.url : "/images/friendlist_profile_default_img.png";
            items.push({
                template: "rowTemplate",
                checkIcon: {
                    image: "/images/friendlist_edit_un_checkbox.png"
                },
                profileImage: {
                    image: imageUrl
                },
                profileName: {
                    text: model.get("fullName") || friend.name || ""
                },
                properties: {
                    itemId: model.id,
                    searchableText: model.get("fullName") || friend.name
                }
            });
        });
        $.section.setItems(items);
    };
    $.listView.addEventListener("itemclick", function(e) {
        var item = $.section.getItemAt(e.itemIndex);
        var itemId = e.itemId;
        var clickModel = friendContactsCol.get(itemId);
        if (_.findWhere(selectedModels, clickModel)) {
            item.checkIcon.image = "/images/friendlist_edit_un_checkbox.png";
            selectedModels = _.without(selectedModels, clickModel);
        } else {
            item.checkIcon.image = "/images/friendlist_edit_checkbox.png";
            selectedModels.push(clickModel);
        }
        $.blockBtn.title = L("cb_banFriendBtn") + " (" + selectedModels.length + ")";
        $.hiddenBtn.title = L("cb_hideFriendBtn") + " (" + selectedModels.length + ")";
        $.section.updateItemAt(e.itemIndex, item);
    });
    __defers["$.__views.blockBtn!click!blockContacts"] && $.addListener($.__views.blockBtn, "click", blockContacts);
    __defers["$.__views.hiddenBtn!click!hiddenContacts"] && $.addListener($.__views.hiddenBtn, "click", hiddenContacts);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
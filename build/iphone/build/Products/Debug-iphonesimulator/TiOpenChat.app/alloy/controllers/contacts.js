function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function drawContactRow() {
        favoriteFriends = [];
        friends = [];
        unregisteredFriends = [];
        unregisteredFriendsNotDisplayCount = 0;
        contactsCol.each(function(model) {
            var isFavorite = model.get("isFavorite");
            var friend = model.get("User_object_To") || false;
            var rowItem = _createFriendRow(model);
            friend ? model.get("isHidden") || model.get("isBlock") || (isFavorite ? favoriteFriends.push(rowItem) : friends.push(rowItem)) : unregisteredFriends.push(rowItem);
        });
        $.favoriteSection.setItems(favoriteFriends);
        $.friendsSection.setItems(friends);
        $.unregiteredFriendsSection.setItems([]);
        ufIndex = 0;
        listViewLoadMore();
        scrollHandler({
            y: 0,
            type: "scroll"
        });
    }
    function drawProfileRow() {
        var profileRow = _createProfileRow(Alloy.Globals.user);
        $.profileSection.setItems([ profileRow ]);
    }
    function listViewLoadMore(e) {
        if (e) {
            Ti.API.debug("Marker Event Fired ufIndex :", ufIndex);
            if (Alloy.Globals.loginC.doingSyncAddress) {
                Alloy.Globals.toast("c_doingSyncMsgFriend");
                $.listView.scrollToItem(0, 0, {
                    animated: false
                });
                unregisteredFriendsNotDisplayCount ? exports.drawContacts() : $.listView.setMarker({
                    sectionIndex: 4,
                    itemIndex: ufIndex - 1
                });
                return;
            }
        }
        var max = ufIndex ? ufIndex + 49 : 50;
        var data = [];
        for (var i = ufIndex; i < unregisteredFriends.length; i++) {
            data.push(unregisteredFriends[i]);
            ufIndex = i + 1;
            if (i >= max) break;
        }
        Ti.API.debug("listViewLoadMore :", i, "/", unregisteredFriends.length);
        $.unregiteredFriendsSection.appendItems(data);
        if (ufIndex < unregisteredFriends.length) {
            Ti.API.debug("Marker Added :", ufIndex - 1);
            $.listView.setMarker({
                sectionIndex: 4,
                itemIndex: ufIndex - 1
            });
        }
    }
    function _createProfileRow(user) {
        var userId = user.get("id");
        var userM = user.attributes;
        var imageUrl = userM.get("profileImage") ? userM.get("profileImage").url() : "/images/friendlist_profile_mine_default_img.png";
        return {
            template: "rowTemplate",
            profileImage: {
                image: imageUrl
            },
            profileName: {
                text: userM.get("name") || ""
            },
            profileComment: {
                text: userM.get("comment")
            },
            commentWrapView: {
                visible: userM.get("comment") ? true : false
            },
            profileEtcInfoWrapView: {
                visible: false
            },
            properties: {
                itemId: userId
            }
        };
    }
    function _createFriendRow(contactM) {
        var friend = contactM.get("User_object_To") || {};
        var imageUrl = friend.profileImage ? friend.profileImage.url : "/images/friendlist_profile_default_img.png";
        var locationText = "";
        if (!_.isEmpty(friend)) {
            var msgModels = messageCollection.where({
                fromUserId: friend.objectId,
                type: "send:location",
                locationType: "my"
            });
            if (!_.isEmpty(msgModels)) {
                var recentMsg = _.max(msgModels, function(msgModel) {
                    return msgModel.get("created");
                });
                if (!_.isEmpty(recentMsg.get("location"))) {
                    location = recentMsg.get("location");
                    locationText = _getLocationTextByReverseAddress(location.address);
                }
            }
        }
        return {
            template: _.isEmpty(friend) ? "unregiteredFriendsTemplate" : "rowTemplate",
            profileImage: {
                image: imageUrl
            },
            profileName: {
                text: contactM.get("fullName") || friend.name || ""
            },
            profileComment: {
                text: friend.comment || ""
            },
            locationText: {
                text: locationText || ""
            },
            friendZzixgi: {
                text: L("cb_zzixgiFriendBtn")
            },
            frinedInvite: {
                text: L("cb_inviteFriendBtn")
            },
            commentWrapView: {
                visible: friend.comment ? true : false
            },
            profileEtcInfoWrapView: {
                visible: locationText ? true : false
            },
            properties: {
                itemId: contactM.id || "",
                searchableText: contactM.get("fullName") || friend.name
            }
        };
    }
    function _getLocationTextByReverseAddress(address) {
        var locationText = "";
        if (!_.isEmpty(address)) if ("ko" == Alloy.Globals.currentLanguage) {
            address.state && (locationText = locationText + " " + address.state);
            address.city && (locationText = locationText + " " + address.city);
            address.street && (locationText = locationText + " " + address.street);
            locationText = locationText.substr(1);
        } else {
            address.street && (locationText = locationText + ", " + address.street);
            address.city && (locationText = locationText + ", " + address.city);
            address.state && (locationText = locationText + ", " + address.state);
            address.country && (locationText = locationText + ", " + address.country);
            locationText = locationText.substr(2);
        }
        return locationText;
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "contacts";
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
    $.__views.container = Ti.UI.createView({
        id: "container"
    });
    $.__views.container && $.addTopLevelView($.__views.container);
    scrollHandler ? $.addListener($.__views.container, "touchmove", scrollHandler) : __defers["$.__views.container!touchmove!scrollHandler"] = true;
    var __alloyId3 = {};
    var __alloyId6 = [];
    var __alloyId8 = {
        type: "Ti.UI.View",
        childTemplates: function() {
            var __alloyId9 = [];
            var __alloyId11 = {
                type: "Ti.UI.View",
                childTemplates: function() {
                    var __alloyId12 = [];
                    var __alloyId14 = {
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
                    __alloyId12.push(__alloyId14);
                    var __alloyId16 = {
                        type: "Ti.UI.ImageView",
                        properties: {
                            preventDefaultImage: true,
                            height: 40,
                            width: 40,
                            image: "/images/friendlist_profile_pic_outline.png"
                        }
                    };
                    __alloyId12.push(__alloyId16);
                    return __alloyId12;
                }(),
                properties: {
                    left: 0,
                    height: 40,
                    width: 40
                }
            };
            __alloyId9.push(__alloyId11);
            var __alloyId18 = {
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
            __alloyId9.push(__alloyId18);
            return __alloyId9;
        }(),
        properties: {
            layout: "horizontal",
            height: Ti.UI.SIZE,
            width: Ti.UI.SIZE,
            left: 13
        }
    };
    __alloyId6.push(__alloyId8);
    var __alloyId20 = {
        type: "Ti.UI.View",
        childTemplates: function() {
            var __alloyId21 = [];
            var __alloyId23 = {
                type: "Ti.UI.View",
                bindId: "commentWrapView",
                childTemplates: function() {
                    var __alloyId24 = [];
                    var __alloyId26 = {
                        type: "Ti.UI.View",
                        childTemplates: function() {
                            var __alloyId27 = [];
                            var __alloyId29 = {
                                type: "Ti.UI.Label",
                                bindId: "profileComment",
                                properties: {
                                    width: Ti.UI.SIZE,
                                    height: 15,
                                    color: "#63656d",
                                    font: {
                                        fontSize: 12,
                                        fontWeight: "Regular"
                                    },
                                    textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
                                    ellipsize: true,
                                    wordWrap: true,
                                    left: 7,
                                    right: 7,
                                    bindId: "profileComment"
                                }
                            };
                            __alloyId27.push(__alloyId29);
                            return __alloyId27;
                        }(),
                        properties: {
                            backgroundColor: "#f9faff",
                            borderColor: "#d4d4d4",
                            borderRadius: 8,
                            borderWidth: "1px",
                            height: 22,
                            width: Ti.UI.SIZE,
                            right: 0
                        }
                    };
                    __alloyId24.push(__alloyId26);
                    return __alloyId24;
                }(),
                properties: {
                    width: "60%",
                    height: Ti.UI.SIZE,
                    right: 0,
                    bindId: "commentWrapView"
                }
            };
            __alloyId21.push(__alloyId23);
            var __alloyId31 = {
                type: "Ti.UI.View",
                bindId: "profileEtcInfoWrapView",
                childTemplates: function() {
                    var __alloyId32 = [];
                    var __alloyId34 = {
                        type: "Ti.UI.ImageView",
                        properties: {
                            preventDefaultImage: true,
                            height: 9,
                            width: 7,
                            image: "/images/friendlist_map_icn.png"
                        }
                    };
                    __alloyId32.push(__alloyId34);
                    var __alloyId36 = {
                        type: "Ti.UI.Label",
                        bindId: "locationText",
                        properties: {
                            width: Ti.UI.SIZE,
                            height: 12,
                            color: "#63656d",
                            font: {
                                fontSize: 10,
                                fontWeight: "Medium"
                            },
                            textAlign: "center",
                            left: 9,
                            bindId: "locationText"
                        }
                    };
                    __alloyId32.push(__alloyId36);
                    return __alloyId32;
                }(),
                properties: {
                    layout: "horizontal",
                    height: 12,
                    width: Ti.UI.SIZE,
                    top: 4,
                    right: 0,
                    bindId: "profileEtcInfoWrapView"
                }
            };
            __alloyId21.push(__alloyId31);
            return __alloyId21;
        }(),
        properties: {
            layout: "vertical",
            height: Ti.UI.SIZE,
            width: "55%",
            right: 13
        }
    };
    __alloyId6.push(__alloyId20);
    var __alloyId5 = {
        properties: {
            backgroundColor: "#f7f7f7",
            layout: "composite",
            height: 56.67,
            width: Ti.UI.FILL,
            selectionStyle: Titanium.UI.iPhone.ListViewCellSelectionStyle.NONE,
            name: "rowTemplate"
        },
        childTemplates: __alloyId6
    };
    __alloyId3["rowTemplate"] = __alloyId5;
    var __alloyId39 = [];
    var __alloyId41 = {
        type: "Ti.UI.View",
        childTemplates: function() {
            var __alloyId42 = [];
            var __alloyId44 = {
                type: "Ti.UI.View",
                childTemplates: function() {
                    var __alloyId45 = [];
                    var __alloyId47 = {
                        type: "Ti.UI.Label",
                        properties: {
                            width: 38,
                            height: 38,
                            color: "#77787f",
                            font: {
                                fontSize: 30,
                                fontFamily: "Ionicons"
                            },
                            textAlign: "center",
                            borderRadius: 19,
                            backgroundColor: "#bebfc3",
                            text: ""
                        }
                    };
                    __alloyId45.push(__alloyId47);
                    var __alloyId49 = {
                        type: "Ti.UI.ImageView",
                        properties: {
                            preventDefaultImage: true,
                            height: 40,
                            width: 40,
                            image: "/images/friendlist_profile_pic_outline.png"
                        }
                    };
                    __alloyId45.push(__alloyId49);
                    return __alloyId45;
                }(),
                properties: {
                    left: 0,
                    height: 40,
                    width: 40
                }
            };
            __alloyId42.push(__alloyId44);
            var __alloyId51 = {
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
            __alloyId42.push(__alloyId51);
            return __alloyId42;
        }(),
        properties: {
            layout: "horizontal",
            height: Ti.UI.SIZE,
            width: Ti.UI.SIZE,
            left: 13
        }
    };
    __alloyId39.push(__alloyId41);
    var __alloyId53 = {
        type: "Ti.UI.View",
        childTemplates: function() {
            var __alloyId54 = [];
            var __alloyId56 = {
                type: "Ti.UI.View",
                bindId: "friendZzixgiWarp",
                childTemplates: function() {
                    var __alloyId57 = [];
                    var __alloyId59 = {
                        type: "Ti.UI.Label",
                        bindId: "friendZzixgi",
                        properties: {
                            width: Ti.UI.SIZE,
                            height: Ti.UI.FILL,
                            color: "#7641FF",
                            font: {
                                fontSize: 13,
                                fontWeight: "bold"
                            },
                            textAlign: "center",
                            bindId: "friendZzixgi"
                        }
                    };
                    __alloyId57.push(__alloyId59);
                    return __alloyId57;
                }(),
                properties: {
                    right: 8,
                    height: 36.66,
                    width: 45,
                    borderRadius: 5,
                    backgroundColor: "#FDFF46",
                    bindId: "friendZzixgiWarp"
                }
            };
            __alloyId54.push(__alloyId56);
            var __alloyId61 = {
                type: "Ti.UI.View",
                bindId: "friendInviteWarp",
                childTemplates: function() {
                    var __alloyId62 = [];
                    var __alloyId64 = {
                        type: "Ti.UI.Label",
                        bindId: "frinedInvite",
                        properties: {
                            width: Ti.UI.SIZE,
                            height: Ti.UI.FILL,
                            color: "white",
                            font: {
                                fontSize: 13,
                                fontWeight: "bold"
                            },
                            textAlign: "center",
                            bindId: "frinedInvite"
                        }
                    };
                    __alloyId62.push(__alloyId64);
                    return __alloyId62;
                }(),
                properties: {
                    right: 0,
                    height: 36.66,
                    width: 45,
                    borderRadius: 5,
                    backgroundColor: "#9670FE",
                    bindId: "friendInviteWarp"
                }
            };
            __alloyId54.push(__alloyId61);
            return __alloyId54;
        }(),
        properties: {
            layout: "horizontal",
            height: Ti.UI.SIZE,
            width: Ti.UI.SIZE,
            right: 13
        }
    };
    __alloyId39.push(__alloyId53);
    var __alloyId38 = {
        properties: {
            backgroundColor: "#f7f7f7",
            layout: "composite",
            height: 56.67,
            width: Ti.UI.FILL,
            selectionStyle: Titanium.UI.iPhone.ListViewCellSelectionStyle.NONE,
            name: "unregiteredFriendsTemplate"
        },
        childTemplates: __alloyId39
    };
    __alloyId3["unregiteredFriendsTemplate"] = __alloyId38;
    $.__views.__alloyId67 = Ti.UI.createView({
        backgroundColor: "#eeeeee",
        height: 23.33,
        id: "__alloyId67"
    });
    $.__views.headerTitle1 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#bebfc3",
        font: {
            fontSize: 11,
            fontWeight: "Medium"
        },
        textAlign: "center",
        left: 13,
        id: "headerTitle1"
    });
    $.__views.__alloyId67.add($.__views.headerTitle1);
    $.__views.profileSection = Ti.UI.createListSection({
        headerView: $.__views.__alloyId67,
        id: "profileSection"
    });
    var __alloyId68 = [];
    __alloyId68.push($.__views.profileSection);
    $.__views.__alloyId71 = Ti.UI.createView({
        backgroundColor: "#eeeeee",
        height: 23.33,
        id: "__alloyId71"
    });
    $.__views.__alloyId72 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        top: 0,
        id: "__alloyId72"
    });
    $.__views.__alloyId71.add($.__views.__alloyId72);
    $.__views.headerTitle2 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#bebfc3",
        font: {
            fontSize: 11,
            fontWeight: "Medium"
        },
        textAlign: "center",
        left: 13,
        id: "headerTitle2"
    });
    $.__views.__alloyId71.add($.__views.headerTitle2);
    $.__views.favoriteSection = Ti.UI.createListSection({
        headerView: $.__views.__alloyId71,
        id: "favoriteSection"
    });
    __alloyId68.push($.__views.favoriteSection);
    $.__views.__alloyId75 = Ti.UI.createView({
        backgroundColor: "#eeeeee",
        height: 23.33,
        id: "__alloyId75"
    });
    $.__views.__alloyId76 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        top: 0,
        id: "__alloyId76"
    });
    $.__views.__alloyId75.add($.__views.__alloyId76);
    $.__views.headerTitle3 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#bebfc3",
        font: {
            fontSize: 11,
            fontWeight: "Medium"
        },
        textAlign: "center",
        left: 13,
        id: "headerTitle3"
    });
    $.__views.__alloyId75.add($.__views.headerTitle3);
    $.__views.friendsSection = Ti.UI.createListSection({
        headerView: $.__views.__alloyId75,
        id: "friendsSection"
    });
    __alloyId68.push($.__views.friendsSection);
    $.__views.__alloyId79 = Ti.UI.createView({
        backgroundColor: "#f7f7f7",
        layout: "composite",
        height: 56.67,
        width: Ti.UI.FILL,
        id: "__alloyId79"
    });
    $.__views.__alloyId80 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        top: 0,
        id: "__alloyId80"
    });
    $.__views.__alloyId79.add($.__views.__alloyId80);
    $.__views.friendSearchLabel = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#8b61ff",
        font: {
            fontSize: 16,
            fontWeight: "bold"
        },
        textAlign: "center",
        left: 30,
        id: "friendSearchLabel",
        text: L("cb_friendSearchLabel")
    });
    $.__views.__alloyId79.add($.__views.friendSearchLabel);
    $.__views.__alloyId81 = Ti.UI.createView({
        layout: "vertical",
        height: Ti.UI.SIZE,
        width: "55%",
        right: 13,
        id: "__alloyId81"
    });
    $.__views.__alloyId79.add($.__views.__alloyId81);
    $.__views.__alloyId82 = Ti.UI.createView({
        right: 0,
        height: 36.66,
        width: Ti.UI.SIZE,
        borderRadius: 5,
        backgroundColor: "#FD787C",
        layout: "horizontal",
        id: "__alloyId82"
    });
    $.__views.__alloyId81.add($.__views.__alloyId82);
    openFriendInvite ? $.addListener($.__views.__alloyId82, "click", openFriendInvite) : __defers["$.__views.__alloyId82!click!openFriendInvite"] = true;
    $.__views.__alloyId83 = Ti.UI.createImageView({
        preventDefaultImage: true,
        left: 13,
        top: 8.33,
        height: 20,
        width: 20,
        image: "/images/friendlist_friend_search_icn.png",
        id: "__alloyId83"
    });
    $.__views.__alloyId82.add($.__views.__alloyId83);
    $.__views.__alloyId84 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.FILL,
        color: "white",
        font: {
            fontSize: 14,
            fontWeight: "bold"
        },
        textAlign: "center",
        left: 8,
        right: 13,
        text: L("cb_friendSearch"),
        id: "__alloyId84"
    });
    $.__views.__alloyId82.add($.__views.__alloyId84);
    $.__views.friendSearchSection = Ti.UI.createListSection({
        footerView: $.__views.__alloyId79,
        id: "friendSearchSection"
    });
    __alloyId68.push($.__views.friendSearchSection);
    $.__views.__alloyId87 = Ti.UI.createView({
        backgroundColor: "#eeeeee",
        height: 23.33,
        id: "__alloyId87"
    });
    $.__views.__alloyId88 = Ti.UI.createView({
        backgroundColor: "#CACACA",
        width: Ti.UI.FILL,
        height: .5,
        top: 0,
        id: "__alloyId88"
    });
    $.__views.__alloyId87.add($.__views.__alloyId88);
    $.__views.headerTitle4 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#bebfc3",
        font: {
            fontSize: 11,
            fontWeight: "Medium"
        },
        textAlign: "center",
        left: 13,
        id: "headerTitle4"
    });
    $.__views.__alloyId87.add($.__views.headerTitle4);
    $.__views.unregiteredFriendsSection = Ti.UI.createListSection({
        headerView: $.__views.__alloyId87,
        id: "unregiteredFriendsSection"
    });
    __alloyId68.push($.__views.unregiteredFriendsSection);
    $.__views.listView = Ti.UI.createListView({
        width: Titanium.UI.FILL,
        height: Titanium.UI.FILL,
        sections: __alloyId68,
        templates: __alloyId3,
        id: "listView"
    });
    $.__views.container.add($.__views.listView);
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    $.container.title = L("c_friendList");
    $.headerTitle1.text = L("cb_profileTitle");
    $.headerTitle2.text = L("cb_favoriteTitle");
    $.headerTitle3.text = L("cb_friendHeaderTitle");
    $.headerTitle4.text = L("cb_searchTitle");
    var contactsCol = Alloy.Collections.instance("contacts");
    var messageCollection = Alloy.Collections.instance("message");
    var favoriteFriends = [];
    var friends = [];
    var unregisteredFriends = [];
    var ufIndex = 0;
    var GoogleMapsClass = require("GoogleMaps");
    new GoogleMapsClass({
        iOSKey: Ti.App.Properties.getString("google-map-ios-key")
    });
    var unregisteredFriendsNotDisplayCount = 0;
    Alloy.Models.instance("user").on("change:profile", drawProfileRow);
    contactsCol.on("redraw", function() {
        nowOpen && drawContactRow();
    });
    contactsCol.on("fetch", function() {
        nowOpen && drawContactRow();
    });
    contactsCol.on("add", function(model) {
        model.get("isHidden") || model.get("isBlock") || Alloy.Globals.loginC.doingSyncAddress || nowOpen && drawContactRow();
    });
    exports.drawContacts = function() {
        if (nowOpen) {
            drawProfileRow();
            drawContactRow();
        }
    };
    $.listView.addEventListener("marker", listViewLoadMore);
    exports.rightBtn = function() {
        var rightBtnOption = {
            title: L("c_edittingBtn"),
            font: {
                fontSize: 15
            }
        };
        var rightBtnFn = function() {
            Alloy.Globals.startWaiting("c_waitingMsgDefault");
            Alloy.Globals.openWindow("contactsBan");
        };
        return {
            centerTitle: L("c_friendList"),
            rightBtnOption: rightBtnOption,
            rightBtnFn: rightBtnFn
        };
    };
    var nowOpen = false;
    exports.openFn = function() {
        nowOpen = true;
        exports.drawContacts();
        Alloy.Globals.loginC.doingSyncAddress && Alloy.Globals.toast("c_doingSyncMsgFriend");
    };
    exports.closeFn = function() {
        nowOpen = false;
        Ti.API.debug("close contactsView");
    };
    $.listView.addEventListener("itemclick", function(e) {
        function _requestWhereruToSingleUser(contactM, fromUser, shootInfo, isNotRequestWhere) {
            var toUser = contactM ? contactM.getUserInfo() : {};
            Ti.API.debug("requestwhereru ", toUser);
            var fromUserId = fromUser.id;
            var toUserId = toUser.id;
            var inUserIds = [ fromUserId, toUserId ];
            var roomId = null;
            chatRoomCol.getOrCreate(roomId, inUserIds, fromUserId).then(function(chatRoomM) {
                var chatC = chatViewManager.getOrCreate(chatRoomM);
                var delayedTrriger = null;
                if (!isNotRequestWhere) {
                    var messageData = {
                        toUser: toUser,
                        fromUser: fromUser,
                        requestWord: "",
                        shootInfo: shootInfo,
                        location: myLocation
                    };
                    if (chatC.isOpenedChatRoom) chatC.trigger("request:whereru", messageData); else {
                        var delayedTrriger = function() {
                            chatC.trigger("request:whereru", this.messageData);
                        };
                        delayedTrriger = _.bind(delayedTrriger, {
                            messageData: messageData
                        });
                    }
                }
                if (!chatC.isOpenedChatRoom) {
                    Alloy.Globals.menuC.trigger("menuclick", {
                        itemId: "chatlist",
                        isNotToggle: true
                    });
                    var openView = function() {
                        chatViewManager.openView(this.chatRoomM);
                        delayedTrriger && delayedTrriger();
                    };
                    openView = _.bind(openView, {
                        chatRoomM: chatRoomM
                    });
                    _.delay(openView, 100);
                }
            }).fail(function(error) {
                Ti.API.error(error);
            });
        }
        var itemId = e.itemId;
        if (itemId == Alloy.Globals.user.get("id")) ; else {
            var contactM = contactsCol.get(itemId);
            var friendId = contactM.get("User_objectId_To");
            if (friendId) {
                var fromUser = Alloy.Globals.user.getInfo();
                _requestWhereruToSingleUser(contactM, fromUser, {}, true);
            }
        }
    });
    __defers["$.__views.container!touchmove!scrollHandler"] && $.addListener($.__views.container, "touchmove", scrollHandler);
    __defers["$.__views.__alloyId82!click!openFriendInvite"] && $.addListener($.__views.__alloyId82, "click", openFriendInvite);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
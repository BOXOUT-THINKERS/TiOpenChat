function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function explicitBlur() {
        CONTENT_VIEW_STATE.keyboard && $.inputMsg.blur();
    }
    function _changeContenViewHeight() {
        $.inputMsgView.bottom = VIEW_HEIGHT.keyboard;
        $.contentViewWrap.bottom = VIEW_HEIGHT.inputMsgView + VIEW_HEIGHT.keyboard;
        $.chatViewInnerBackgroud.backgroundColor = "#dbf1ea";
        $.chatView.height = Titanium.UI.FILL;
        if (listVisibleItemIndex) {
            $.messageView.bottom = 0;
            $.messageView.scrollToItem(0, listVisibleItemIndex, {
                animated: false
            });
        } else messageScrolltoBottom();
    }
    function scrollEnd(e) {
        if (!isChecked && !_isFirstRun) {
            isChecked = true;
            Ti.API.debug("scrollEnd / firstVisibleItemIndex : ", e.firstVisibleItemIndex);
            listVisibleItemIndex = e.firstVisibleItemIndex + e.visibleItemCount - 1;
            if (0 == e.firstVisibleItemIndex && false == flagNowLoading) {
                flagNowLoading = true;
                var addRows = _limitedUnshiftMessagesRow();
                0 == addRows.length && $.messageView.removeEventListener("scrollend", scrollEnd);
                listVisibleItemIndex = addRows.length + e.visibleItemCount - 1;
                $.messageView.bottom = 0;
                $.messageView.scrollToItem(0, listVisibleItemIndex, {
                    animated: false
                });
            }
            isChecked = false;
        }
    }
    function messageScrolltoBottom() {
        listVisibleItemIndex = $.messageSection.items.length - 1;
        $.messageView.bottom = 0;
        $.messageView.scrollToItem(0, listVisibleItemIndex, {
            animated: false
        });
    }
    function _sendPhotoMessageByFileM(fileM) {
        Ti.API.debug("fileM,");
        var messageData = {
            fileId: fileM.id,
            thumbnailUrl: fileM.get("thumbnailUrl"),
            url: fileM.get("url"),
            name: fileM.get("name"),
            fileType: fileM.get("fileType"),
            roomId: fileM.get("roomId"),
            location: fileM.get("location"),
            text: fileM.get("text")
        };
        Ti.API.debug("send photo message data : ", messageData);
        chatService.sendMessage(messageData);
    }
    function _updateFriendRoomData(friendInfo) {
        $.friendName.text = friendInfo.name;
        $.roomTitle.text = friendInfo.name;
    }
    function messageAdded(messageModel) {
        messageModel.get("fromUserId") != currentUserId && (yourLastMessageTime = messageModel.get("created"));
        switch (messageModel.get("type")) {
          case "send:message":
            var row = _createMessageRow(messageModel, "new");
            if (!_isFirstRun) if (exports.isOpenedChatRoom) {
                $.messageSection.appendItems([ row ], {
                    animated: false
                });
                messageScrolltoBottom();
            } else exports.delayedTextMessageRows.push(row);
            break;

          case "enter:receiver":
            if (exports.isOpenedChatRoom) {
                messageModel.set({
                    isReceived: true,
                    receivedTime: Date.now(),
                    receiverRoomId: exports.roomId
                });
                _updateUnreadToRead(messageModel, true);
            } else exports.delayedEnterReceiverModel = messageModel;
        }
        if (!exports.isOpenedChatRoom && messageModel.get("fromUserId") != currentUserId && "enter:receiver" != messageModel.get("type")) {
            var now = new Date();
            var created = new Date(messageModel.get("created"));
            var intervalMs = now.getTime() - created.getTime();
            var intervalMin = Math.floor(intervalMs / 6e4);
            1 > intervalMin && Alloy.Globals.parsePushC && Alloy.Globals.parsePushC.popupFromMessage(messageModel);
            chatRoomM.set({
                restMessageCount: chatRoomM.get("restMessageCount") + 1
            });
        }
        exports.isOpenedChatRoom && messageModel.set("isRead", true).save();
    }
    function _processUnregisterFriendAtOpen() {
        var opts = {
            chatAfterAddFriend: 0,
            banFriend: 1
        };
        opts.options = [ L("cr_chatAfterAddFriend"), L("cr_banFriend"), L("cr_justChat") ];
        var dialog = Ti.UI.createOptionDialog(opts);
        dialog.addEventListener("click", function(e) {
            if (e.index > 1) return;
            e.index == e.source.chatAfterAddFriend && _addUnregisterFriend();
            e.index == e.source.banFriend && _banUnregitserFriend();
        });
        dialog.show();
        return dialog;
    }
    function _addUnregisterFriend(extendData) {
        Ti.API.debug("_addUnregisterFriend");
        var frinedInfo = friendContactM.getUserInfo();
        Alloy.Globals.startWaiting("c_waitingMsgDefault");
        var friendContactData = {
            User_objectId: currentUserId,
            isUnregister: false,
            User_objectId_To: null,
            mainPhone: frinedInfo.mainPhone,
            User_object_To: null
        };
        extendData && _.extend(friendContactData, extendData);
        var tempContactM = Alloy.createModel("contacts");
        tempContactM.save(friendContactData, {
            success: function() {
                friendContactM.set({
                    objectId: tempContactM.id
                }, {
                    change: false
                });
                friendContactM.fetch({
                    urlparams: {
                        include: "User_object_To"
                    },
                    success: function() {
                        contactsColllection.add(friendContactM);
                        Alloy.Globals.stopWaiting();
                    },
                    error: function(e, e2) {
                        Ti.API.debug("_addUnregisterFriend: ", e, e2);
                        Alloy.Globals.alert("c_alertMsgDefault");
                    }
                });
            },
            error: function(e, e2) {
                Ti.API.debug("_addUnregisterFriend: ", e2);
                Alloy.Globals.alert("c_alertMsgDefault");
            }
        });
    }
    function _banUnregitserFriend() {
        _addUnregisterFriend({
            isBlock: true
        });
        Ti.API.debug("ban");
    }
    function chatListInitial() {
        if (_isFirstRun) {
            Ti.API.debug("---------------------------------이거한번만되야함!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            var addRows = _limitedUnshiftMessagesRow();
            0 == addRows.length && $.messageView.removeEventListener("scrollend", scrollEnd);
        }
        isReadTrueAll();
        Ti.API.debug("open chatRoomView ", exports.roomId, exports.inUserIds, friendContactM.attributes);
    }
    function isReadTrueAll() {
        var models = messageCollection.where({
            roomId: exports.roomId,
            isRead: false
        });
        for (i = models.length - 1; i >= 0; i--) {
            model = models[i];
            model.set("isRead", true).save();
        }
        chatRoomM.set({
            restMessageCount: 0
        });
    }
    function _limitedUnshiftMessagesRow() {
        _.isEmpty(models) && (models = messageCollection.where({
            roomId: exports.roomId
        }));
        _fromIndex = _fromIndex || models.length - 1;
        var recentMsgIsReceived = false;
        var curLimitSize = MAX_LIMIT_SIZE;
        var rows = [];
        for (var i = _fromIndex, min = 0; i >= min; --i) {
            model = models[i];
            recentMsgIsReceived ? model.get("isReceived") ? "" : model.save({
                isReceived: true
            }) : model.get("isReceived") && (recentMsgIsReceived = true);
            if (!(_fromIndex >= 0 && curLimitSize > 0)) break;
            var type = model.get("type");
            if (curLimitSize > 0 && _fromIndex >= 0) {
                if ("send:message" == type || "request:where" == type) {
                    var row;
                    "send:message" == type && (row = _createMessageRow(model, "old"));
                    if (row) {
                        rows.push(row);
                        --curLimitSize;
                    }
                }
                --_fromIndex;
            }
            yourLastMessageTime || model.get("fromUserId") == currentUserId || (yourLastMessageTime = model.get("created"));
        }
        rows.reverse();
        if (0 != rows.length) {
            $.messageSection.insertItemsAt(0, rows, {
                animated: false
            });
            setTimeout(function() {
                flagNowLoading = false;
            }, 100);
        }
        return rows;
    }
    function _createMessageRow(messageModel) {
        messageModel.get("isReceived");
        var text = messageModel.get("text");
        var created = messageModel.get("created");
        var fromUserId = messageModel.get("fromUserId");
        var fileType = messageModel.get("fileType");
        var thumbnailUrl = messageModel.get("thumbnailUrl");
        var url = messageModel.get("url");
        var photoName = messageModel.get("name");
        var aItem = {
            properties: {}
        };
        aItem.properties.selectionStyle = Titanium.UI.iPhone.ListViewCellSelectionStyle.NONE;
        if (currentUserId != fromUserId) {
            aItem.fromMe = false;
            if (fileType) {
                if ("image/jpeg" == fileType) {
                    aItem.content = {
                        image: thumbnailUrl,
                        originUrl: url,
                        photoName: photoName
                    };
                    aItem.template = "rowLeftImageTemplate";
                }
            } else {
                aItem.template = "rowLeftTemplate";
                aItem.content = {
                    text: text
                };
            }
            var friendInfo = friendContactM.getUserInfo();
            aItem.friendImage = {
                image: friendInfo.imageUrl || "/images/friendlist_profile_default_img.png"
            };
        } else {
            aItem.fromMe = true;
            if (fileType) {
                if ("image/jpeg" == fileType) {
                    aItem.content = {
                        image: thumbnailUrl,
                        originUrl: url,
                        photoName: photoName
                    };
                    aItem.template = "rowImageTemplate";
                }
            } else {
                aItem.template = "rowTemplate";
                aItem.content = {
                    text: text
                };
            }
        }
        if (created) {
            var createdTime = Alloy.Globals.moment(created).format("M[ / ]D") + "\n" + Alloy.Globals.moment(created).format("HH:mm");
            aItem.createdTime = {
                text: createdTime
            };
            aItem.created = created;
        }
        aItem.readCount = {
            text: ""
        };
        if (!messageModel.get("isReceived")) {
            aItem.readCount.text = "";
            messageModel.on("change:isReceived", _updateUnreadToRead);
        }
        return aItem;
    }
    function _updateUnreadToRead(messageModel, isDirectCall) {
        var receiverRoomId = messageModel.get("receiverRoomId");
        if (receiverRoomId && receiverRoomId == exports.roomId) {
            var receivedTime = messageModel.get("receivedTime");
            receivedTime = new Date(receivedTime);
            var items = $.messageSection.items;
            for (var i = items.length - 1, min = 0; i >= min; --i) {
                var item = items[i];
                var createdTime = new Date(item.created);
                if (item.readCount) if (item.readCount.text && receivedTime >= createdTime) {
                    item.readCount.text = "";
                    $.messageSection.updateItemAt(i, item, {
                        animated: false
                    });
                } else if (item.fromMe) break;
            }
            messageModel.save(null, {
                change: false
            });
        }
        isDirectCall || messageModel.off("change:isReceived", _updateUnreadToRead);
    }
    function onClickSend() {
        var text = $.inputMsg.value;
        if ("" == text || void 0 == text || null == text) return;
        var messageData = {
            text: text,
            roomId: exports.roomId
        };
        chatService.sendMessage(messageData);
        $.inputMsg.value = "";
        CONTENT_VIEW_STATE.keyboard && setTimeout(function() {
            $.inputMsg.focus();
        }, 100);
    }
    function onClickSendGallery() {
        localPhotoService.getPhoto().then(function(photoInfo) {
            var dialog = Ti.UI.createAlertDialog({
                ok: 0,
                cancel: 1,
                buttonNames: [ L("c_alertMsgOk"), L("c_cancle") ],
                message: L("c_youWannaSendPhoto")
            });
            dialog.addEventListener("click", function(e) {
                if (e.index === e.source.cancel) return;
                if (e.index === e.source.ok) {
                    Alloy.Globals.toast("c_msgSendingPhoto");
                    var photoBlob = localPhotoService.resize(photoInfo.blob);
                    var imgName = photoInfo.name;
                    var thumbnailBlob = localPhotoService.resizeForThumbnail(photoBlob);
                    var _fileM = Alloy.createModel("file");
                    return _fileM.saveBy({
                        blob: photoBlob,
                        thumbnailBlob: thumbnailBlob,
                        name: imgName,
                        text: L("c_photo"),
                        roomId: exports.roomId,
                        User_objectId: currentUserId
                    }).then(function(fileM) {
                        _sendPhotoMessageByFileM(fileM);
                    }).catch(function(error) {
                        var message = error.message ? error.message : error;
                        Ti.API.debug(message);
                        Alloy.Globals.toast("cr_failSendPhotoMessage");
                    });
                }
            });
            dialog.show();
        }).catch(function(error) {
            var message = error.message ? error.message : error;
            Ti.API.debug(message);
            error.isCancel || Alloy.Globals.toast(msg);
        });
    }
    function clickThumbnail(e) {
        var itemInfo;
        itemInfo = e.source;
        var params = {
            photoUrl: itemInfo.originUrl,
            photoName: itemInfo.photoName,
            location: itemInfo.location
        };
        var photoViewerC = Alloy.createController("chat/photoViewer", params);
        photoViewerC.getView().open();
    }
    function backBtn() {
        $.getView().close();
    }
    function messageClick() {
        explicitBlur();
    }
    function onOpen() {
        Ti.API.debug("ChatRoom Open Event / Start");
        onFocusRun = false;
        Ti.App.addEventListener("keyboardframechanged", keyboardFrameChanged);
        Ti.API.debug("ChatList Initial");
        chatListInitial();
        _isFirstRun = false;
        !friendContactM.isRegister() || Alloy.Globals.loginC.doingSyncAddress || Alloy.Globals.appStartProcess || friendContactM.fetch({
            urlparams: {
                include: "User_object_To"
            }
        });
        Ti.API.debug("ChatRoom Open Event / End");
    }
    function onClose() {
        Ti.API.debug("ChatRoom Close Event / Start");
        exports.isOpenedChatRoom = false;
        exports.isOpenedTiming = false;
        Alloy.Globals.chatViewManager.currentOpenedRoomId = null;
        Ti.App.removeEventListener("keyboardframechanged", keyboardFrameChanged);
        CONTENT_VIEW_STATE.keyboard = false;
        VIEW_HEIGHT.keyboard = 0;
        Alloy.Globals.chatListC.openFn();
        Ti.API.debug("ChatRoom Close Event / End");
    }
    function onFocus() {
        Ti.API.debug("ChatRoom Focus Event / Start");
        exports.isOpenedChatRoom = true;
        exports.isOpenedTiming = true;
        isOpenedCount++;
        setTimeout(function() {
            isSetTimeoutCount++;
            if (isOpenedCount == isSetTimeoutCount) {
                exports.isOpenedTiming = false;
                Ti.API.debug("exports.isOpenedTiming set to ", exports.isOpenedTiming, " after 30 sec");
            } else Ti.API.debug("exports.isOpenedTiming set to canceled");
        }, 3e4);
        Alloy.Globals.chatViewManager.currentOpenedRoomId = exports.roomId;
        Alloy.Globals.firebaseC && Alloy.Globals.firebaseC.goOnline();
        exports.sendEnterReceiver();
        if (!onFocusRun) {
            onFocusRun = true;
            friendContactM.isRegister() || _processUnregisterFriendAtOpen();
        }
        if (!_.isEmpty(exports.delayedTextMessageRows) && exports.isOpenedChatRoom) {
            var delayedTextMessageRows = _.clone(exports.delayedTextMessageRows) || [];
            var firstRow = delayedTextMessageRows.length > 0 ? delayedTextMessageRows.shift() : null;
            firstRow && $.messageSection.appendItems([ firstRow ], {
                animated: false
            });
            $.messageSection.appendItems(delayedTextMessageRows, {
                animated: false
            });
            exports.delayedTextMessageRows = [];
            messageScrolltoBottom();
        }
        if (!_.isEmpty(exports.delayedEnterReceiverModel) && exports.isOpenedChatRoom) {
            var enteredTime = exports.delayedEnterReceiverModel.get("created");
            enteredTime = enteredTime ? new Date(enteredTime) : -1;
            var models = messageCollection.where({
                roomId: exports.roomId
            });
            var justBeforeModel;
            for (var i = models.length - 1, min = 0; i >= min; --i) {
                var model = models[i];
                var createdTime = model.get("created");
                createdTime = new Date(createdTime);
                if (enteredTime > createdTime) {
                    justBeforeModel = model;
                    break;
                }
            }
            if (justBeforeModel) {
                justBeforeModel.set({
                    isReceived: true,
                    receivedTime: justBeforeModel.get("created"),
                    receiverRoomId: exports.roomId
                });
                _updateUnreadToRead(justBeforeModel, true);
            }
        }
        Ti.API.debug("ChatRoom Focus Event / End");
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "chat/chatRoom";
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
        navBarHidden: true,
        id: "mainView"
    });
    $.__views.mainView && $.addTopLevelView($.__views.mainView);
    onFocus ? $.addListener($.__views.mainView, "focus", onFocus) : __defers["$.__views.mainView!focus!onFocus"] = true;
    onOpen ? $.addListener($.__views.mainView, "open", onOpen) : __defers["$.__views.mainView!open!onOpen"] = true;
    onClose ? $.addListener($.__views.mainView, "close", onClose) : __defers["$.__views.mainView!close!onClose"] = true;
    $.__views.__alloyId144 = Ti.UI.createView({
        width: Ti.UI.FILL,
        zIndex: 98,
        top: 20,
        height: 40,
        id: "__alloyId144"
    });
    $.__views.mainView.add($.__views.__alloyId144);
    $.__views.__alloyId145 = Ti.UI.createView({
        left: 0,
        width: 40,
        height: Titanium.UI.FILL,
        id: "__alloyId145"
    });
    $.__views.__alloyId144.add($.__views.__alloyId145);
    backBtn ? $.addListener($.__views.__alloyId145, "click", backBtn) : __defers["$.__views.__alloyId145!click!backBtn"] = true;
    $.__views.backBtn = Ti.UI.createImageView({
        preventDefaultImage: true,
        id: "backBtn",
        image: "/images/chat_half_back_icn.png"
    });
    $.__views.__alloyId145.add($.__views.backBtn);
    $.__views.roomTitleWrap = Ti.UI.createView({
        layout: "composite",
        width: Titanium.UI.SIZE,
        height: Titanium.UI.FILL,
        id: "roomTitleWrap"
    });
    $.__views.__alloyId144.add($.__views.roomTitleWrap);
    $.__views.roomTitleInnerView = Ti.UI.createView({
        layout: "horizontal",
        width: Titanium.UI.SIZE,
        height: Titanium.UI.SIZE,
        id: "roomTitleInnerView"
    });
    $.__views.roomTitleWrap.add($.__views.roomTitleInnerView);
    $.__views.roomTitle = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#8b61ff",
        font: {
            fontSize: 17,
            fontWeight: "bold"
        },
        textAlign: "center",
        id: "roomTitle"
    });
    $.__views.roomTitleInnerView.add($.__views.roomTitle);
    $.__views.roomTitleDistance = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#8b61ff",
        font: {
            fontSize: 17,
            fontWeight: "bold"
        },
        textAlign: "center",
        id: "roomTitleDistance"
    });
    $.__views.roomTitleInnerView.add($.__views.roomTitleDistance);
    $.__views.routeView = Ti.UI.createScrollView({
        id: "routeView"
    });
    $.__views.mainView.add($.__views.routeView);
    $.__views.contentViewWrap = Ti.UI.createView({
        layout: "composite",
        width: Titanium.UI.FILL,
        height: Titanium.UI.FILL,
        zIndex: 10,
        id: "contentViewWrap"
    });
    $.__views.mainView.add($.__views.contentViewWrap);
    $.__views.chatView = Ti.UI.createView({
        layout: "vertical",
        width: Titanium.UI.FILL,
        height: "30%",
        bottom: 0,
        zIndex: 50,
        id: "chatView"
    });
    $.__views.contentViewWrap.add($.__views.chatView);
    explicitBlur ? $.addListener($.__views.chatView, "click", explicitBlur) : __defers["$.__views.chatView!click!explicitBlur"] = true;
    $.__views.chatViewInnerViewWrap = Ti.UI.createView({
        layout: "composite",
        width: Titanium.UI.FILL,
        height: Titanium.UI.FILL,
        id: "chatViewInnerViewWrap"
    });
    $.__views.chatView.add($.__views.chatViewInnerViewWrap);
    $.__views.chatViewInnerBackgroud = Ti.UI.createView({
        backgroundColor: "#dbf1ea",
        width: Titanium.UI.FILL,
        height: Titanium.UI.FILL,
        zIndex: 49,
        id: "chatViewInnerBackgroud"
    });
    $.__views.chatViewInnerViewWrap.add($.__views.chatViewInnerBackgroud);
    $.__views.chatViewInnerView = Ti.UI.createView({
        layout: "vertical",
        width: Titanium.UI.FILL,
        height: Titanium.UI.FILL,
        zIndex: 50,
        id: "chatViewInnerView"
    });
    $.__views.chatViewInnerViewWrap.add($.__views.chatViewInnerView);
    $.__views.locationBar = Ti.UI.createView({
        layout: "vertical",
        width: Titanium.UI.FILL,
        height: 105,
        backgroundColor: "#dbf1ea",
        zIndex: 55,
        id: "locationBar"
    });
    $.__views.chatViewInnerView.add($.__views.locationBar);
    $.__views.fakeNavbar = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: 60,
        backgroundColor: "#dbf1ea",
        id: "fakeNavbar"
    });
    $.__views.locationBar.add($.__views.fakeNavbar);
    $.__views.__alloyId146 = Ti.UI.createView({
        backgroundColor: "#b6d8cc",
        width: Ti.UI.FILL,
        height: "1px",
        id: "__alloyId146"
    });
    $.__views.locationBar.add($.__views.__alloyId146);
    $.__views.__alloyId147 = Ti.UI.createView({
        backgroundColor: "white",
        width: Ti.UI.FILL,
        height: 2,
        id: "__alloyId147"
    });
    $.__views.locationBar.add($.__views.__alloyId147);
    $.__views.locationBarInner = Ti.UI.createView({
        layout: "composite",
        width: Titanium.UI.FILL,
        height: 40,
        id: "locationBarInner"
    });
    $.__views.locationBar.add($.__views.locationBarInner);
    $.__views.locationLine = Ti.UI.createView({
        backgroundColor: "#8eb9ab",
        width: Ti.UI.FILL,
        height: "1px",
        id: "locationLine"
    });
    $.__views.locationBar.add($.__views.locationLine);
    $.__views.locationLine2 = Ti.UI.createView({
        backgroundColor: "#b3e1cf",
        width: Ti.UI.FILL,
        height: "1px",
        id: "locationLine2"
    });
    $.__views.locationBar.add($.__views.locationLine2);
    var __alloyId148 = {};
    var __alloyId151 = [];
    var __alloyId153 = {
        type: "Ti.UI.View",
        childTemplates: function() {
            var __alloyId154 = [];
            var __alloyId156 = {
                type: "Ti.UI.View",
                childTemplates: function() {
                    var __alloyId157 = [];
                    var __alloyId159 = {
                        type: "Ti.UI.View",
                        childTemplates: function() {
                            var __alloyId160 = [];
                            var __alloyId162 = {
                                type: "Ti.UI.Label",
                                bindId: "systemContent",
                                properties: {
                                    width: Titanium.UI.SIZE,
                                    height: Titanium.UI.SIZE,
                                    color: "white",
                                    font: {
                                        fontSize: 12
                                    },
                                    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
                                    bindId: "systemContent"
                                }
                            };
                            __alloyId160.push(__alloyId162);
                            return __alloyId160;
                        }(),
                        properties: {
                            layout: "compoiste",
                            width: Titanium.UI.SIZE,
                            height: Titanium.UI.SIZE,
                            top: 5,
                            bottom: 5,
                            left: 12,
                            right: 12
                        }
                    };
                    __alloyId157.push(__alloyId159);
                    return __alloyId157;
                }(),
                properties: {
                    layout: "composite",
                    width: Titanium.UI.SIZE,
                    height: Titanium.UI.SIZE,
                    backgroundColor: "#d0bfff",
                    borderRadius: 12,
                    right: 37
                }
            };
            __alloyId154.push(__alloyId156);
            var __alloyId164 = {
                type: "Ti.UI.Label",
                bindId: "readCount",
                properties: {
                    width: 16,
                    height: 16,
                    color: "#ff8b8b",
                    font: {
                        fontSize: 8,
                        fontFamily: "Ionicons",
                        fontWeight: "bold"
                    },
                    textAlign: "center",
                    bottom: 13,
                    shadowColor: "white",
                    shadowOffset: {
                        x: .5,
                        y: .5
                    },
                    zIndex: 50,
                    right: -4,
                    bindId: "readCount"
                }
            };
            __alloyId154.push(__alloyId164);
            var __alloyId166 = {
                type: "Ti.UI.Label",
                bindId: "createdTime",
                properties: {
                    width: 44,
                    height: 21,
                    color: "#363636",
                    font: {
                        fontSize: 8
                    },
                    textAlign: "center",
                    bottom: 3.4,
                    verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM,
                    shadowColor: "white",
                    shadowOffset: {
                        x: .5,
                        y: .5
                    },
                    shadowRadius: 3,
                    right: 0,
                    bindId: "createdTime"
                }
            };
            __alloyId154.push(__alloyId166);
            return __alloyId154;
        }(),
        properties: {
            backgroundColor: "transparent",
            layout: "composite",
            width: Titanium.UI.SIZE,
            height: Titanium.UI.SIZE,
            top: 3,
            bottom: 3
        }
    };
    __alloyId151.push(__alloyId153);
    var __alloyId150 = {
        properties: {
            backgroundColor: "transparent",
            layout: "composite",
            width: Titanium.UI.FILL,
            height: Titanium.UI.SIZE,
            name: "rowSystemTemplate"
        },
        childTemplates: __alloyId151
    };
    __alloyId148["rowSystemTemplate"] = __alloyId150;
    var __alloyId169 = [];
    var __alloyId171 = {
        type: "Ti.UI.View",
        childTemplates: function() {
            var __alloyId172 = [];
            var __alloyId174 = {
                type: "Ti.UI.View",
                childTemplates: function() {
                    var __alloyId175 = [];
                    var __alloyId177 = {
                        type: "Ti.UI.ImageView",
                        bindId: "friendImage",
                        properties: {
                            preventDefaultImage: true,
                            height: 36,
                            width: 36,
                            borderRadius: 18,
                            zIndex: 54,
                            bindId: "friendImage"
                        }
                    };
                    __alloyId175.push(__alloyId177);
                    var __alloyId179 = {
                        type: "Ti.UI.ImageView",
                        properties: {
                            preventDefaultImage: true,
                            image: "/images/chatroom_profile_outline.png",
                            height: 36,
                            width: 36,
                            zIndex: 55
                        }
                    };
                    __alloyId175.push(__alloyId179);
                    return __alloyId175;
                }(),
                properties: {
                    layout: "composite",
                    width: Ti.UI.SIZE,
                    height: Ti.UI.SIZE,
                    left: 0
                }
            };
            __alloyId172.push(__alloyId174);
            var __alloyId181 = {
                type: "Ti.UI.ImageView",
                properties: {
                    preventDefaultImage: true,
                    image: "/images/chatroom_bubble_tail.png",
                    left: 39,
                    bottom: 4,
                    zIndex: 55
                }
            };
            __alloyId172.push(__alloyId181);
            var __alloyId183 = {
                type: "Ti.UI.View",
                childTemplates: function() {
                    var __alloyId184 = [];
                    var __alloyId186 = {
                        type: "Ti.UI.View",
                        childTemplates: function() {
                            var __alloyId187 = [];
                            var __alloyId189 = {
                                type: "Ti.UI.Label",
                                bindId: "content",
                                properties: {
                                    width: "auto",
                                    height: "auto",
                                    color: "#8b61ff",
                                    font: {
                                        fontSize: 14,
                                        fontWeight: "bold"
                                    },
                                    textAlign: Ti.UI.TEXT_AUTOCAPITALIZATION_ALL,
                                    top: 7,
                                    left: 7,
                                    right: 7,
                                    bottom: 7,
                                    bindId: "content"
                                }
                            };
                            __alloyId187.push(__alloyId189);
                            return __alloyId187;
                        }(),
                        properties: {
                            width: Titanium.UI.SIZE,
                            height: Titanium.UI.SIZE,
                            backgroundColor: "white",
                            borderColor: "#d0d0d0",
                            borderWidth: 1,
                            borderRadius: 6,
                            zIndex: 50,
                            right: 38
                        }
                    };
                    __alloyId184.push(__alloyId186);
                    var __alloyId191 = {
                        type: "Ti.UI.Label",
                        bindId: "readCount",
                        properties: {
                            width: 16,
                            height: 16,
                            color: "#ff8b8b",
                            font: {
                                fontSize: 8,
                                fontFamily: "Ionicons",
                                fontWeight: "bold"
                            },
                            textAlign: "center",
                            bottom: 13,
                            shadowColor: "white",
                            shadowOffset: {
                                x: .5,
                                y: .5
                            },
                            zIndex: 50,
                            right: -4,
                            bindId: "readCount"
                        }
                    };
                    __alloyId184.push(__alloyId191);
                    var __alloyId193 = {
                        type: "Ti.UI.Label",
                        bindId: "createdTime",
                        properties: {
                            width: 44,
                            height: 21,
                            color: "#363636",
                            font: {
                                fontSize: 8
                            },
                            textAlign: "center",
                            bottom: 3.4,
                            verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM,
                            shadowColor: "white",
                            shadowOffset: {
                                x: .5,
                                y: .5
                            },
                            shadowRadius: 3,
                            right: 0,
                            bindId: "createdTime"
                        }
                    };
                    __alloyId184.push(__alloyId193);
                    return __alloyId184;
                }(),
                properties: {
                    layout: "composite",
                    width: Titanium.UI.SIZE,
                    height: Titanium.UI.SIZE,
                    left: 45
                }
            };
            __alloyId172.push(__alloyId183);
            return __alloyId172;
        }(),
        properties: {
            backgroundColor: "transparent",
            layout: "composite",
            width: Titanium.UI.FILL,
            height: Titanium.UI.SIZE,
            top: 3,
            bottom: 3,
            left: 10,
            right: 20
        }
    };
    __alloyId169.push(__alloyId171);
    var __alloyId168 = {
        properties: {
            backgroundColor: "transparent",
            layout: "composite",
            width: Titanium.UI.FILL,
            height: Titanium.UI.SIZE,
            name: "rowLeftTemplate"
        },
        childTemplates: __alloyId169
    };
    __alloyId148["rowLeftTemplate"] = __alloyId168;
    var __alloyId196 = [];
    var __alloyId198 = {
        type: "Ti.UI.View",
        childTemplates: function() {
            var __alloyId199 = [];
            var __alloyId201 = {
                type: "Ti.UI.View",
                childTemplates: function() {
                    var __alloyId202 = [];
                    var __alloyId204 = {
                        type: "Ti.UI.ImageView",
                        bindId: "friendImage",
                        properties: {
                            preventDefaultImage: true,
                            height: 36,
                            width: 36,
                            borderRadius: 18,
                            zIndex: 54,
                            bindId: "friendImage"
                        }
                    };
                    __alloyId202.push(__alloyId204);
                    var __alloyId206 = {
                        type: "Ti.UI.ImageView",
                        properties: {
                            preventDefaultImage: true,
                            image: "/images/chatroom_profile_outline.png",
                            height: 36,
                            width: 36,
                            zIndex: 55
                        }
                    };
                    __alloyId202.push(__alloyId206);
                    return __alloyId202;
                }(),
                properties: {
                    layout: "composite",
                    width: Ti.UI.SIZE,
                    height: Ti.UI.SIZE,
                    left: 0
                }
            };
            __alloyId199.push(__alloyId201);
            var __alloyId208 = {
                type: "Ti.UI.ImageView",
                properties: {
                    preventDefaultImage: true,
                    image: "/images/chatroom_bubble_tail.png",
                    left: 39,
                    bottom: 4,
                    zIndex: 55
                }
            };
            __alloyId199.push(__alloyId208);
            var __alloyId210 = {
                type: "Ti.UI.View",
                childTemplates: function() {
                    var __alloyId211 = [];
                    var __alloyId213 = {
                        type: "Ti.UI.View",
                        childTemplates: function() {
                            var __alloyId214 = [];
                            var __alloyId216 = {
                                type: "Ti.UI.ImageView",
                                bindId: "content",
                                properties: {
                                    preventDefaultImage: true,
                                    top: 3,
                                    left: 3,
                                    right: 3,
                                    bottom: 3,
                                    width: 70,
                                    height: 70,
                                    bindId: "content"
                                },
                                events: {
                                    click: clickThumbnail
                                }
                            };
                            __alloyId214.push(__alloyId216);
                            return __alloyId214;
                        }(),
                        properties: {
                            width: Titanium.UI.SIZE,
                            height: Titanium.UI.SIZE,
                            backgroundColor: "white",
                            borderColor: "#d0d0d0",
                            borderWidth: 1,
                            borderRadius: 6,
                            zIndex: 50,
                            right: 38
                        }
                    };
                    __alloyId211.push(__alloyId213);
                    var __alloyId218 = {
                        type: "Ti.UI.Label",
                        bindId: "readCount",
                        properties: {
                            width: 16,
                            height: 16,
                            color: "#ff8b8b",
                            font: {
                                fontSize: 8,
                                fontFamily: "Ionicons",
                                fontWeight: "bold"
                            },
                            textAlign: "center",
                            bottom: 13,
                            shadowColor: "white",
                            shadowOffset: {
                                x: .5,
                                y: .5
                            },
                            zIndex: 50,
                            right: -4,
                            bindId: "readCount"
                        }
                    };
                    __alloyId211.push(__alloyId218);
                    var __alloyId220 = {
                        type: "Ti.UI.Label",
                        bindId: "createdTime",
                        properties: {
                            width: 44,
                            height: 21,
                            color: "#363636",
                            font: {
                                fontSize: 8
                            },
                            textAlign: "center",
                            bottom: 3.4,
                            verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM,
                            shadowColor: "white",
                            shadowOffset: {
                                x: .5,
                                y: .5
                            },
                            shadowRadius: 3,
                            right: 0,
                            bindId: "createdTime"
                        }
                    };
                    __alloyId211.push(__alloyId220);
                    return __alloyId211;
                }(),
                properties: {
                    layout: "composite",
                    width: Titanium.UI.SIZE,
                    height: Titanium.UI.SIZE,
                    left: 45
                }
            };
            __alloyId199.push(__alloyId210);
            return __alloyId199;
        }(),
        properties: {
            backgroundColor: "transparent",
            layout: "composite",
            width: Titanium.UI.FILL,
            height: Titanium.UI.SIZE,
            top: 3,
            bottom: 3,
            left: 10,
            right: 20
        }
    };
    __alloyId196.push(__alloyId198);
    var __alloyId195 = {
        properties: {
            backgroundColor: "transparent",
            layout: "composite",
            width: Titanium.UI.FILL,
            height: Titanium.UI.SIZE,
            name: "rowLeftImageTemplate"
        },
        childTemplates: __alloyId196
    };
    __alloyId148["rowLeftImageTemplate"] = __alloyId195;
    var __alloyId223 = [];
    var __alloyId225 = {
        type: "Ti.UI.View",
        childTemplates: function() {
            var __alloyId226 = [];
            var __alloyId228 = {
                type: "Ti.UI.View",
                childTemplates: function() {
                    var __alloyId229 = [];
                    var __alloyId231 = {
                        type: "Ti.UI.View",
                        childTemplates: function() {
                            var __alloyId232 = [];
                            var __alloyId234 = {
                                type: "Ti.UI.Label",
                                bindId: "readCount",
                                properties: {
                                    width: 16,
                                    height: 16,
                                    color: "#ff8b8b",
                                    font: {
                                        fontSize: 8,
                                        fontFamily: "Ionicons",
                                        fontWeight: "bold"
                                    },
                                    textAlign: "center",
                                    bottom: 13,
                                    shadowColor: "white",
                                    shadowOffset: {
                                        x: .5,
                                        y: .5
                                    },
                                    zIndex: 50,
                                    left: -4,
                                    bindId: "readCount"
                                }
                            };
                            __alloyId232.push(__alloyId234);
                            var __alloyId236 = {
                                type: "Ti.UI.Label",
                                bindId: "createdTime",
                                properties: {
                                    width: 44,
                                    height: 21,
                                    color: "#363636",
                                    font: {
                                        fontSize: 8
                                    },
                                    textAlign: "center",
                                    bottom: 3.4,
                                    verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM,
                                    shadowColor: "white",
                                    shadowOffset: {
                                        x: .5,
                                        y: .5
                                    },
                                    shadowRadius: 3,
                                    left: 0,
                                    bindId: "createdTime"
                                }
                            };
                            __alloyId232.push(__alloyId236);
                            var __alloyId238 = {
                                type: "Ti.UI.View",
                                childTemplates: function() {
                                    var __alloyId239 = [];
                                    var __alloyId241 = {
                                        type: "Ti.UI.Label",
                                        bindId: "content",
                                        properties: {
                                            width: "auto",
                                            height: "auto",
                                            color: "white",
                                            font: {
                                                fontSize: 14,
                                                fontWeight: "bold"
                                            },
                                            textAlign: Ti.UI.TEXT_AUTOCAPITALIZATION_ALL,
                                            top: 7,
                                            left: 7,
                                            right: 7,
                                            bottom: 7,
                                            bindId: "content"
                                        }
                                    };
                                    __alloyId239.push(__alloyId241);
                                    return __alloyId239;
                                }(),
                                properties: {
                                    layout: "composite",
                                    width: Titanium.UI.SIZE,
                                    height: Titanium.UI.SIZE,
                                    backgroundColor: "#8b61ff",
                                    borderColor: "#8b61ff",
                                    borderWidth: 1,
                                    borderRadius: 6,
                                    zIndex: 50,
                                    left: 38
                                }
                            };
                            __alloyId232.push(__alloyId238);
                            return __alloyId232;
                        }(),
                        properties: {
                            layout: "composite",
                            width: Titanium.UI.SIZE,
                            height: Titanium.UI.SIZE,
                            right: 6
                        }
                    };
                    __alloyId229.push(__alloyId231);
                    var __alloyId243 = {
                        type: "Ti.UI.ImageView",
                        properties: {
                            preventDefaultImage: true,
                            image: "/images/chatroom_bubble_tail_indigo.png",
                            right: 0,
                            bottom: 3.8,
                            zIndex: 55
                        }
                    };
                    __alloyId229.push(__alloyId243);
                    return __alloyId229;
                }(),
                properties: {
                    layout: "composite",
                    width: Titanium.UI.FILL,
                    height: Titanium.UI.SIZE
                }
            };
            __alloyId226.push(__alloyId228);
            return __alloyId226;
        }(),
        properties: {
            layout: "composite",
            width: Titanium.UI.FILL,
            height: Titanium.UI.SIZE,
            top: 3,
            bottom: 3,
            left: 20,
            right: 10
        }
    };
    __alloyId223.push(__alloyId225);
    var __alloyId222 = {
        properties: {
            backgroundColor: "transparent",
            layout: "composite",
            width: Titanium.UI.FILL,
            height: Titanium.UI.SIZE,
            name: "rowTemplate"
        },
        childTemplates: __alloyId223
    };
    __alloyId148["rowTemplate"] = __alloyId222;
    var __alloyId246 = [];
    var __alloyId248 = {
        type: "Ti.UI.View",
        childTemplates: function() {
            var __alloyId249 = [];
            var __alloyId251 = {
                type: "Ti.UI.View",
                childTemplates: function() {
                    var __alloyId252 = [];
                    var __alloyId254 = {
                        type: "Ti.UI.View",
                        childTemplates: function() {
                            var __alloyId255 = [];
                            var __alloyId257 = {
                                type: "Ti.UI.Label",
                                bindId: "readCount",
                                properties: {
                                    width: 16,
                                    height: 16,
                                    color: "#ff8b8b",
                                    font: {
                                        fontSize: 8,
                                        fontFamily: "Ionicons",
                                        fontWeight: "bold"
                                    },
                                    textAlign: "center",
                                    bottom: 13,
                                    shadowColor: "white",
                                    shadowOffset: {
                                        x: .5,
                                        y: .5
                                    },
                                    zIndex: 50,
                                    left: -4,
                                    bindId: "readCount"
                                }
                            };
                            __alloyId255.push(__alloyId257);
                            var __alloyId259 = {
                                type: "Ti.UI.Label",
                                bindId: "createdTime",
                                properties: {
                                    width: 44,
                                    height: 21,
                                    color: "#363636",
                                    font: {
                                        fontSize: 8
                                    },
                                    textAlign: "center",
                                    bottom: 3.4,
                                    verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM,
                                    shadowColor: "white",
                                    shadowOffset: {
                                        x: .5,
                                        y: .5
                                    },
                                    shadowRadius: 3,
                                    left: 0,
                                    bindId: "createdTime"
                                }
                            };
                            __alloyId255.push(__alloyId259);
                            var __alloyId261 = {
                                type: "Ti.UI.View",
                                childTemplates: function() {
                                    var __alloyId262 = [];
                                    var __alloyId264 = {
                                        type: "Ti.UI.ImageView",
                                        bindId: "content",
                                        properties: {
                                            preventDefaultImage: true,
                                            top: 3,
                                            left: 3,
                                            right: 3,
                                            bottom: 3,
                                            width: 70,
                                            height: 70,
                                            bindId: "content"
                                        },
                                        events: {
                                            click: clickThumbnail
                                        }
                                    };
                                    __alloyId262.push(__alloyId264);
                                    return __alloyId262;
                                }(),
                                properties: {
                                    layout: "composite",
                                    width: Titanium.UI.SIZE,
                                    height: Titanium.UI.SIZE,
                                    backgroundColor: "#8b61ff",
                                    borderColor: "#8b61ff",
                                    borderWidth: 1,
                                    borderRadius: 6,
                                    zIndex: 50,
                                    left: 38
                                }
                            };
                            __alloyId255.push(__alloyId261);
                            return __alloyId255;
                        }(),
                        properties: {
                            layout: "composite",
                            width: Titanium.UI.SIZE,
                            height: Titanium.UI.SIZE,
                            right: 6
                        }
                    };
                    __alloyId252.push(__alloyId254);
                    var __alloyId266 = {
                        type: "Ti.UI.ImageView",
                        properties: {
                            preventDefaultImage: true,
                            image: "/images/chatroom_bubble_tail_indigo.png",
                            right: 0,
                            bottom: 3.8,
                            zIndex: 55
                        }
                    };
                    __alloyId252.push(__alloyId266);
                    return __alloyId252;
                }(),
                properties: {
                    layout: "composite",
                    width: Titanium.UI.FILL,
                    height: Titanium.UI.SIZE
                }
            };
            __alloyId249.push(__alloyId251);
            return __alloyId249;
        }(),
        properties: {
            layout: "composite",
            width: Titanium.UI.FILL,
            height: Titanium.UI.SIZE,
            top: 3,
            bottom: 3,
            left: 20,
            right: 10
        }
    };
    __alloyId246.push(__alloyId248);
    var __alloyId245 = {
        properties: {
            backgroundColor: "transparent",
            layout: "composite",
            width: Titanium.UI.FILL,
            height: Titanium.UI.SIZE,
            name: "rowImageTemplate"
        },
        childTemplates: __alloyId246
    };
    __alloyId148["rowImageTemplate"] = __alloyId245;
    $.__views.messageSection = Ti.UI.createListSection({
        id: "messageSection"
    });
    var __alloyId268 = [];
    __alloyId268.push($.__views.messageSection);
    $.__views.messageView = Ti.UI.createListView({
        width: Ti.UI.FILL,
        height: Ti.UI.FILL,
        separatorColor: "transparent",
        backgroundColor: "transparent",
        top: 0,
        zIndex: 55,
        defaultItemTemplate: "rowSystemTemplate",
        sections: __alloyId268,
        templates: __alloyId148,
        id: "messageView"
    });
    $.__views.chatViewInnerView.add($.__views.messageView);
    messageClick ? $.addListener($.__views.messageView, "itemclick", messageClick) : __defers["$.__views.messageView!itemclick!messageClick"] = true;
    $.__views.inputMsgView = Ti.UI.createView({
        backgroundColor: "#eeeeee",
        layout: "composite",
        width: Titanium.UI.FILL,
        height: 42,
        bottom: 0,
        zIndex: 70,
        id: "inputMsgView"
    });
    $.__views.mainView.add($.__views.inputMsgView);
    $.__views.msgLine = Ti.UI.createView({
        top: 0,
        backgroundColor: "#adadad",
        width: Ti.UI.FILL,
        height: 1,
        id: "msgLine"
    });
    $.__views.inputMsgView.add($.__views.msgLine);
    $.__views.inputMsgLeftView = Ti.UI.createView({
        layout: "composite",
        width: "23.3%",
        height: Titanium.UI.FILL,
        left: 0,
        id: "inputMsgLeftView"
    });
    $.__views.inputMsgView.add($.__views.inputMsgLeftView);
    $.__views.notifyBtn = Ti.UI.createImageView({
        preventDefaultImage: true,
        width: 27.67,
        height: 27.67,
        left: "9.5%",
        image: "/images/chattingtap_zzig_button_active.png",
        id: "notifyBtn"
    });
    $.__views.inputMsgLeftView.add($.__views.notifyBtn);
    $.__views.inputBtnLine = Ti.UI.createView({
        backgroundColor: "gray",
        height: "34%",
        width: 1,
        id: "inputBtnLine"
    });
    $.__views.inputMsgLeftView.add($.__views.inputBtnLine);
    $.__views.requestBtn = Ti.UI.createImageView({
        preventDefaultImage: true,
        width: 27.67,
        height: 27.67,
        right: "9.5%",
        image: "/images/chattingtap_zzo_button_active.png",
        id: "requestBtn"
    });
    $.__views.inputMsgLeftView.add($.__views.requestBtn);
    $.__views.inputMsgWrap = Ti.UI.createView({
        width: "59.9%",
        height: Titanium.UI.FILL,
        right: "16.8%",
        borderRadius: 4,
        borderWidth: 0,
        backgroundColor: "white",
        bottom: 3,
        top: 4,
        id: "inputMsgWrap"
    });
    $.__views.inputMsgView.add($.__views.inputMsgWrap);
    $.__views.inputMsg = Ti.UI.createTextArea({
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_NONE,
        returnKeyType: Titanium.UI.RETURNKEY_DEFAULT,
        verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM,
        suppressReturn: false,
        autocorrect: false,
        width: Titanium.UI.FILL,
        height: Titanium.UI.FILL,
        color: "#77787f",
        font: {
            fontSize: 14
        },
        right: 20,
        id: "inputMsg"
    });
    $.__views.inputMsgWrap.add($.__views.inputMsg);
    $.__views.__alloyId269 = Ti.UI.createView({
        width: 30,
        height: Titanium.UI.FILL,
        right: "16.8%",
        zIndex: 10,
        id: "__alloyId269"
    });
    $.__views.inputMsgView.add($.__views.__alloyId269);
    onClickSendGallery ? $.addListener($.__views.__alloyId269, "click", onClickSendGallery) : __defers["$.__views.__alloyId269!click!onClickSendGallery"] = true;
    $.__views.__alloyId270 = Ti.UI.createImageView({
        preventDefaultImage: true,
        width: Titanium.UI.SIZE,
        height: Titanium.UI.SIZE,
        image: "/images/chattingtap_clip.png",
        id: "__alloyId270"
    });
    $.__views.__alloyId269.add($.__views.__alloyId270);
    $.__views.sendBtn = Ti.UI.createButton({
        backgroundColor: "#8b61ff",
        color: "white",
        font: {
            fontSize: 16,
            fontWeight: "bold"
        },
        width: "14.7%",
        height: Titanium.UI.FILL,
        right: 0,
        id: "sendBtn"
    });
    $.__views.inputMsgView.add($.__views.sendBtn);
    onClickSend ? $.addListener($.__views.sendBtn, "click", onClickSend) : __defers["$.__views.sendBtn!click!onClickSend"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    var Q = require("q");
    $.innerLeftText.text = L("ri_sir");
    $.innerRightText.text = L("ri_pecking");
    $.sendBtn.title = L("cr_send");
    $.cityMsg1_1.text = L("nm_cityMsg1");
    exports.roomId = args.roomId;
    exports.inUserIds = args.inUserIds;
    var chatRoomCollection = Alloy.Collections.instance("chatRoom");
    var chatRoomM = null;
    exports.chatRoomM = null;
    exports.refeshLinkToChatRoomM = function() {
        var refreshedChatRoomM = chatRoomCollection.getBy(exports.roomId);
        if (!_.isEmpty(refreshedChatRoomM)) {
            chatRoomM && chatRoomM.off("receive:message", messageAdded);
            chatRoomM = refreshedChatRoomM;
            exports.chatRoomM = chatRoomM;
            chatRoomM.on("receive:message", messageAdded);
        }
    };
    exports.refeshLinkToChatRoomM();
    Alloy.Globals.user.getInfo();
    var currentUserId = Alloy.Globals.user.get("id");
    var chatService = Alloy.Globals.chatService;
    var messageCollection = Alloy.Collections.instance("message");
    require("services/remotePhotoService");
    var localPhotoService = require("services/localPhotoService");
    var contactsColllection = Alloy.Collections.instance("contacts");
    var _isFirstRun = true;
    exports.isOpenedChatRoom = false;
    exports.isOpenedTiming = false;
    var isOpenedCount = 0;
    var isSetTimeoutCount = 0;
    var onFocusRun = false;
    var friendId = _.without(exports.inUserIds, currentUserId)[0];
    var friendContactM = null;
    var imageUrlBefore = null;
    exports.refeshLinkToContactsM = function() {
        function friendContactMChange() {
            if (!friendContactM.isRegister()) {
                var ___friendInfo = chatRoomM.getFriendInfo(currentUserId);
                friendContactM.set("User_object_To", ___friendInfo);
            }
            friendInfo = friendContactM.getUserInfo();
            _updateFriendRoomData(friendInfo);
            var items = $.messageSection.items;
            var imageUrl = friendInfo.imageUrl || "/images/friendlist_profile_default_img.png";
            if (imageUrlBefore != imageUrl) {
                imageUrlBefore = imageUrl;
                for (var i = 0, max = items.length; max > i; ++i) {
                    var item = items[i];
                    if (item.friendImage && (!item.friendImage.image || item.friendImage.image != imageUrl)) {
                        item.friendImage.image = imageUrl;
                        $.messageSection.updateItemAt(i, item, {
                            animated: false
                        });
                    }
                }
            }
        }
        friendContactM && friendContactM.off("fetch", friendContactMChange);
        friendContactM = contactsColllection.getBy(friendId);
        friendContactMChange();
        friendContactM.on("fetch", friendContactMChange);
    };
    exports.refeshLinkToContactsM();
    exports.delayedTextMessageRows = [];
    exports.delayedEnterReceiverModel = null;
    var listVisibleItemIndex = 0;
    var DEFULAT_HEIGHT = {
        keyboard: 0,
        chatView: $.chatView.height,
        inputMsgView: Number($.inputMsgView.height)
    };
    var VIEW_HEIGHT = _.clone(DEFULAT_HEIGHT);
    var CONTENT_VIEW_STATE = {
        keyboard: false
    };
    var keyboardFrameChanged = function(e) {
        Ti.API.debug("keyboardframechanged / e.keyboardFrame.height :", e.keyboardFrame.height);
        if (e.keyboardFrame.height > 0 && DEFULAT_HEIGHT.keyboard != e.keyboardFrame.height) {
            DEFULAT_HEIGHT.keyboard = e.keyboardFrame.height;
            VIEW_HEIGHT.keyboard = e.keyboardFrame.height;
            CONTENT_VIEW_STATE.keyboard = true;
            _changeContenViewHeight();
        }
    };
    $.inputMsg.addEventListener("focus", function() {
        Ti.API.debug("inputMsg / focus event");
        0 != DEFULAT_HEIGHT.keyboard && (VIEW_HEIGHT.keyboard = DEFULAT_HEIGHT.keyboard);
        if (CONTENT_VIEW_STATE.keyboard) ; else {
            CONTENT_VIEW_STATE.keyboard = true;
            _changeContenViewHeight();
        }
    });
    $.inputMsg.addEventListener("blur", function() {
        Ti.API.debug("inputMsg / blur event");
        if (CONTENT_VIEW_STATE.keyboard) {
            CONTENT_VIEW_STATE.keyboard = false;
            VIEW_HEIGHT.keyboard = 0;
            _changeContenViewHeight();
        } else ;
    });
    var isChecked = false;
    var flagNowLoading = false;
    $.messageView.addEventListener("scrollend", scrollEnd);
    exports.sendPhotoMessage = function(shootInfo, fileM, notificationMsg) {
        if (fileM) {
            fileM.set({
                roomId: exports.roomId,
                location: shootInfo.location,
                User_objectId: currentUserId,
                text: notificationMsg ? notificationMsg.text : null
            });
            _sendPhotoMessageByFileM(fileM);
            return Q();
        }
        if (shootInfo && shootInfo.photoInfo) {
            var photoInfo = shootInfo.photoInfo;
            var photoBlob = photoInfo.blob;
            var imgName = photoInfo.name;
            var thumbnailBlob = localPhotoService.resizeForThumbnail(photoBlob);
            var _fileM = Alloy.createModel("file");
            return _fileM.saveBy({
                blob: photoBlob,
                thumbnailBlob: thumbnailBlob,
                name: imgName,
                roomId: exports.roomId,
                location: shootInfo.location || {},
                User_objectId: currentUserId,
                text: notificationMsg ? notificationMsg.text : null
            }).then(function(fileM) {
                _sendPhotoMessageByFileM(fileM);
            }).catch(function(error) {
                var message = error.message ? error.message : error;
                Ti.API.debug(message);
                Alloy.Globals.alert("cr_failSendPhotoMessage");
            });
        }
        return Q();
    };
    exports.sendEnterReceiver = function() {
        var msg = {
            roomId: exports.roomId,
            receiverRoomId: exports.roomId
        };
        chatService.sendEnterReceiver(msg);
    };
    exports.remove = function() {
        $.mainView.close();
    };
    var _fromIndex;
    var MAX_LIMIT_SIZE = 50;
    var models = {};
    __defers["$.__views.mainView!focus!onFocus"] && $.addListener($.__views.mainView, "focus", onFocus);
    __defers["$.__views.mainView!open!onOpen"] && $.addListener($.__views.mainView, "open", onOpen);
    __defers["$.__views.mainView!close!onClose"] && $.addListener($.__views.mainView, "close", onClose);
    __defers["$.__views.__alloyId145!click!backBtn"] && $.addListener($.__views.__alloyId145, "click", backBtn);
    __defers["$.__views.chatView!click!explicitBlur"] && $.addListener($.__views.chatView, "click", explicitBlur);
    __defers["$.__views.messageView!itemclick!messageClick"] && $.addListener($.__views.messageView, "itemclick", messageClick);
    __defers["$.__views.__alloyId269!click!onClickSendGallery"] && $.addListener($.__views.__alloyId269, "click", onClickSendGallery);
    __defers["$.__views.sendBtn!click!onClickSend"] && $.addListener($.__views.sendBtn, "click", onClickSend);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
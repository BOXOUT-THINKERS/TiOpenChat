function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function contactsColfetch(mode) {
        var myId = Alloy.Globals.user.get("id");
        contactsColllection.defaultFetchData = {
            order: "fullName",
            where: {
                User_objectId: myId
            },
            include: "User_object_To",
            limit: 1e3
        };
        contactsColllection.fetch({
            initFetchWithLocalData: true,
            success: function() {
                exports.fetchContactsCount++;
                Ti.API.debug("Contacts Drawing before Sync / fetchContactsCount:", _fetchContactsCount);
                if (2 == exports.fetchContactsCount) {
                    exports.fetchContactsCount = 0;
                    "sync" == mode && (0 == contactsColllection.length ? contactsColllection.syncAddressBook() : setTimeout(function() {
                        contactsColllection.syncAddressBook();
                    }, 15e3));
                }
            },
            error: function() {
                exports.fetchContactsCount = 0;
                _fetchContactsCount = 0;
                contactsColfetch(mode);
            }
        });
    }
    function chatRoomFetch() {
        var myId = Alloy.Globals.user.get("id");
        Ti.API.debug("chatRoom data fetching is start", Alloy.Globals.moment().format(Alloy.Globals.DATE_FORMAT));
        chatRoomCollection.fetch({
            urlparams: {
                where: {
                    existUserIds: {
                        $in: [ myId ]
                    }
                },
                include: "inUsers"
            },
            sql: {
                like: {
                    existUserIds: myId
                }
            },
            initFetchWithLocalData: true,
            success: function() {},
            error: function(e, e2) {
                Ti.API.debug("-----------------에러가뭐냐", e, e2);
                _fetchChatRoomCount = 0;
                chatRoomFetch();
            }
        });
    }
    function _firstCreateRoomViews() {
        function callbackFn() {
            if (!callbackRun) {
                callbackRun = true;
                Ti.API.debug("chatlist first create is end", Alloy.Globals.moment().format(Alloy.Globals.DATE_FORMAT));
                Alloy.Globals.stopWaiting();
                _.defer(function() {
                    Alloy.Globals.chatService || (Alloy.Globals.chatService = require("services/chatService"));
                    _.defer(function() {
                        Ti.API.debug("chatlist fire event [start:complete]", Alloy.Globals.moment().format(Alloy.Globals.DATE_FORMAT));
                        $.trigger("start:complete");
                    });
                });
            }
        }
        if (_isContactsReset && _isChatRoomsReset && _isMessageReset && !_firstCreateRoomRun) {
            _firstCreateRoomRun = true;
            Ti.API.debug("chatlist first create is start", Alloy.Globals.moment().format(Alloy.Globals.DATE_FORMAT));
            var chatRoomMs = chatRoomCollection.models;
            chatViewCol.initialize(chatRoomMs, callbackFn);
        }
    }
    function _receiveMessageListener(messageModel) {
        Ti.API.debug("ChatList_receiveMessageListener");
        var roomId = messageModel.get("roomId");
        var chatView = chatViewCol.getExistingChatView(roomId);
        if (chatView) {
            Ti.API.debug("-----기존 방에 새메시지 추가하는경우", roomId);
            var chatRoomM = chatView._chatRoomM;
            {
                chatViewManager.getOrCreate(chatRoomM);
            }
            chatRoomM.trigger("receive:message", messageModel);
            _setRecentMessage(chatRoomM, messageModel);
        } else {
            var inUserIds = [ messageModel.get("fromUserId"), messageModel.get("toUserId") ];
            Ti.API.debug("-----메시지로 새방(서버 혹은 새방 만드는경우.).", roomId, inUserIds);
            chatRoomCollection.getOrCreate(roomId, inUserIds, messageModel.get("toUserId")).then(function(chatRoomM) {
                chatViewManager.getOrCreate(chatRoomM);
                chatRoomM.trigger("receive:message", messageModel);
            });
        }
    }
    function _setRecentMessage(chatRoomM, messageModel) {
        "enter:receiver" != messageModel.get("type") && chatRoomM.set({
            recentMessage: messageModel.attributes
        });
    }
    function _getRandomColor() {
        _restColors = _restColors.length > 0 ? _restColors : _.clone(COLORS);
        var restRandomIndex = _.random(0, _restColors.length - 1);
        var color = _restColors[restRandomIndex];
        _restColors = _.without(_restColors, color);
        return color;
    }
    function scrollHandler() {}
    function _defineChatView() {
        function ChatView(chatRoomM, chatViewCol) {
            this.roomId = chatRoomM.get("roomId");
            this._chatViewCol = chatViewCol;
            this._chatRoomM = chatRoomM;
            this._hasRecentPhoto = false;
            this._hasRecentWord = false;
            this._initOuterDataBinding();
            this._parentView = $.UI.create("View", {});
            this._createRowView(false);
            this._updateAllData();
        }
        ChatView.prototype.isSingle = function() {
            return this._isSingle ? true : false;
        };
        ChatView.prototype.toggleEditingView = function() {
            if (this.isEditting()) {
                this.editingViewWrap.visible = true;
                this.friendName.visible = false;
                this.innerRowView.opacity = "0.3";
            } else {
                this.editingViewWrap.visible = false;
                this.friendName.visible = true;
                this.innerRowView.opacity = "1";
            }
        };
        ChatView.prototype.isEditting = function() {
            return this._chatViewCol.isEdittingMode;
        };
        ChatView.prototype.remove = function() {
            return this._unregisterListerner();
        };
        ChatView.prototype._createRowView = function(isSingle) {
            this._isSingle = isSingle;
            var views = this._createSingleOrHalfRow(isSingle);
            this._constructRelation(views);
            if (this.rootView) {
                views.recentMessage.text = this.recentMessage.text;
                this._unregisterListerner();
                this._parentView.remove(this.rootView);
            }
            _.extend(this, views);
            this._parentView.add(this.rootView);
            this._registerListerner();
            this.isEditting() && this.toggleEditingView();
        };
        ChatView.prototype._createSingleOrHalfRow = function(isSingle) {
            Ti.API.debug("create row is single? :", isSingle);
            var views = {};
            views.rootView = $.UI.create("View", {
                classes: isSingle ? [ "oneRowView" ] : [ "oddRowView" ],
                zIndex: 0
            });
            views.innerRowView = $.UI.create("View", {
                classes: isSingle ? [ "innerOneRowView" ] : [ "innerOddRowView" ],
                zIndex: 0
            });
            views.imageViewWrap = $.UI.create("View", {
                classes: isSingle ? [ "oneImageWrap" ] : [ "oddImageWrap" ]
            });
            views.imageView = $.UI.create("ImageView", {
                classes: [ "fillView" ]
            });
            var logicalDensityWidth = Ti.Platform.displayCaps.platformWidth;
            if (isSingle) {
                views.imageView.width = .615 * logicalDensityWidth;
                views.imageView.height = .615 * logicalDensityWidth;
            } else views.imageView.height = .4775 * logicalDensityWidth;
            views.messageView = $.UI.create("View", {
                classes: isSingle ? [ "oneMessageWrap" ] : [ "oddMessageWrap" ]
            });
            views.scaleWord = $.UI.create("Label", {
                classes: [ "scaleWord", "font1" ]
            });
            views.checkedTime = $.UI.create("Label", {
                classes: [ "checkedTime", "font1" ]
            });
            var fnClass = isSingle ? "oneFriendName" : "oddFriendName";
            views.friendName = $.UI.create("Label", {
                classes: [ "font4", fnClass ]
            });
            var mCountClass = isSingle ? "oneRightTop" : "oddBottomLeft";
            views.restMessageCountWrap = $.UI.create("View", {
                classes: [ "restMessageCountWrap", mCountClass ]
            });
            views.restMessageCountOutline = $.UI.create("ImageView", {
                classes: [ "restMessageCountOutline" ]
            });
            views.restMessageCount = $.UI.create("Label", {
                classes: [ "restMessageCount", "font2" ]
            });
            var recentMClass = isSingle ? "recentOneMessage" : "recentOddMessage";
            views.recentMessageBox = $.UI.create("View", {
                classes: [ recentMClass ]
            });
            views.recentMessage = $.UI.create("Label", {
                classes: [ "font3" ],
                textAlign: Titanium.UI.TEXT_ALIGNMENT_RIGHT,
                right: 2,
                shadowColor: "#6A6A6A",
                shadowOffset: {
                    x: .5,
                    y: .5
                },
                shadowRadius: 3
            });
            views.editingViewWrap = $.UI.create("View", {
                classes: [ "editingViewWrap" ]
            });
            views.editingView = $.UI.create("View", {
                classes: isSingle ? [ "oneEditingView" ] : [ "oddEditingView" ]
            });
            views.checkingImageView = $.UI.create("ImageView", {
                classes: [ "checkingImageView" ],
                image: "ko" == Alloy.Globals.currentLanguage ? "/images/chatroomlist_exit_button.png" : "/images/chatroomlist_exit_button_en.png"
            });
            views.editingName = $.UI.create("Label", {
                classes: [ "editingName" ]
            });
            return views;
        };
        ChatView.prototype._constructRelation = function(views) {
            views.restMessageCountWrap.add(views.restMessageCount);
            views.restMessageCountWrap.add(views.restMessageCountOutline);
            views.recentMessageBox.add(views.recentMessage);
            views.messageView.add(views.restMessageCountWrap);
            views.messageView.add(views.recentMessageBox);
            var shadowWrapView = $.UI.create("View", {
                classes: [ "fillView" ]
            });
            var shadowView = $.UI.create("View", {
                classes: [ "fillView", "imageShadowWrap" ]
            });
            shadowWrapView.add(views.imageView);
            shadowWrapView.add(shadowView);
            views.imageViewWrap.add(shadowWrapView);
            views.imageViewWrap.add(views.scaleWord);
            views.imageViewWrap.add(views.checkedTime);
            views.imageViewWrap.add(views.friendName);
            views.innerRowView.add(views.imageViewWrap);
            views.innerRowView.add(views.messageView);
            views.rootView.add(views.innerRowView);
            views.editingView.add(views.checkingImageView);
            views.editingView.add(views.editingName);
            views.editingViewWrap.add(views.editingView);
            views.rootView.add(views.editingViewWrap);
        };
        ChatView.prototype.changeColor = function(color) {
            this.innerRowView.backgroundColor = color;
            this.messageView.backgroundColor = color;
            this.restMessageCount.color = color;
        };
        ChatView.prototype.updateCheckedTimeFromNow = function() {
            this._updateCheckedTime();
        };
        ChatView.prototype._initOuterDataBinding = function() {
            this._setContactsM();
            var restMessageCount = messageCollection.getRestMessageCount(this.roomId);
            this._chatRoomM.set({
                restMessageCount: restMessageCount
            });
            var recentMessageInfo = messageCollection.getRecentMessageInfo(this.roomId) || {};
            recentMessageInfo.type = "send:message";
            this._chatRoomM.set({
                recentMessage: recentMessageInfo
            });
        };
        ChatView.prototype._updateAllData = function() {
            this._updateRestMessageCount();
            this._updateCheckedTime();
            this._updateFriendData();
            this._updateMessageData();
        };
        ChatView.prototype._unregisterListerner = function() {
            this.rootView.removeEventListener("click", this._rootViewClickFn);
            this._chatRoomM.off("change:recentMessage", this._chatRoomMChangeRecentMessageFn);
            this._chatRoomM.off("change:restMessageCount", this._chatRoomMChangeRestMessageCountFn);
            this._contactM.off("change", this._contactMChangeFn);
        };
        ChatView.prototype._registerListerner = function() {
            this._rootViewClickFn = this._onClickRow.bind(this);
            this.rootView.addEventListener("click", this._rootViewClickFn);
            this._chatRoomMChangeRecentMessageFn = this._onReceiveRecentMessage.bind(this);
            this._chatRoomM.on("change:recentMessage", this._chatRoomMChangeRecentMessageFn);
            this._chatRoomMChangeRestMessageCountFn = this._updateRestMessageCount.bind(this);
            this._chatRoomM.on("change:restMessageCount", this._chatRoomMChangeRestMessageCountFn);
            this._contactMChangeFn = this._onChangeContactM.bind(this);
            this._contactM.on("change", this._contactMChangeFn);
        };
        ChatView.prototype._onClickRow = function() {
            if (this.isEditting()) this._exitChatRoom(); else {
                Alloy.Globals.startWaiting("c_waitingMsgDefault");
                this._openChatView();
            }
        };
        ChatView.prototype._onChangeContactM = function() {
            this._updateFriendData();
        };
        ChatView.prototype._onReceiveRecentMessage = function() {
            var recentMessage = this._chatRoomM.get("recentMessage") || {};
            this._updateCheckedTime();
            recentMessage.type;
            this._updateMessageData();
        };
        ChatView.prototype._updateMessageData = function() {
            var recentMessage = this._chatRoomM.get("recentMessage") || {};
            var isHalfToSingle = false;
            if (recentMessage.thumbnailUrl) {
                this._hasRecentPhoto = true;
                if (!this._isSingle) {
                    Ti.API.debug("싱글로우재생성");
                    this._createRowView(true);
                    this._updateAllData();
                    isHalfToSingle = true;
                }
            }
            recentMessage.text && (this._hasRecentWord = true);
            this._updateTextAndImage();
            Ti.API.debug("위치변경.");
            this._chatViewCol.moveChatViewToTop(this, isHalfToSingle);
        };
        ChatView.prototype._updateTextAndImage = function() {
            var recentMessage = this._chatRoomM.get("recentMessage") || {};
            recentMessage.thumbnailUrl && (this.imageView.image = recentMessage.thumbnailUrl);
            recentMessage.text && (this.recentMessage.text = recentMessage.text);
        };
        ChatView.prototype._updateCheckedTime = function() {
            var recentMessage = this._chatRoomM.get("recentMessage") || {};
            if (recentMessage.created) {
                var time = Alloy.Globals.moment(recentMessage.created).fromNow();
                this.checkedTime.text = time;
            }
        };
        ChatView.prototype._refeshLinkToChatRoomM = function() {
            var refreshedChatRoomM = chatRoomCollection.getBy(this.roomId);
            if (!_.isEmpty(refreshedChatRoomM)) {
                var restMessageCount = this._chatRoomM.get("restMessageCount");
                var recentMessage = this._chatRoomM.get("recentMessage") || {};
                this._unregisterListerner();
                this._chatRoomM = refreshedChatRoomM;
                this._chatRoomM.set({
                    restMessageCount: restMessageCount
                });
                this._chatRoomM.set({
                    recentMessage: recentMessage
                });
                this._registerListerner();
                chatViewManager.refeshLinkToChatRoomM(this.roomId);
            }
        };
        ChatView.prototype._setContactsM = function() {
            var inUserIds = this._chatRoomM.get("inUserIds");
            var targetId = _.without(inUserIds, Alloy.Globals.user.get("id"));
            targetId = targetId[0];
            this._contactM = contactsColllection.getBy(targetId);
            if (!this._contactM.isRegister()) {
                var myId = Alloy.Globals.user.get("id");
                var friendInfo = this._chatRoomM.getFriendInfo(myId);
                Ti.API.debug("==============없는 유저", friendInfo);
                this._contactM.set("User_object_To", friendInfo);
                Ti.API.debug("==============없는 유저", this._contactM.getUserInfo());
            }
        };
        ChatView.prototype._refeshLinkToContactsM = function() {
            this._contactM.off("change", this._contactMChangeFn);
            this._setContactsM();
            this._contactMChangeFn = this._onChangeContactM.bind(this);
            this._contactM.on("change", this._contactMChangeFn);
            chatViewManager.refeshLinkToContactsM(this.roomId);
        };
        ChatView.prototype._updateRestMessageCount = function() {
            var restMessageCount = this._chatRoomM.get("restMessageCount");
            if (restMessageCount && restMessageCount > 0) {
                this.restMessageCountWrap.visible = true;
                this.restMessageCount.text = restMessageCount;
            } else this.restMessageCountWrap.visible = false;
        };
        ChatView.prototype._updateFriendData = function() {
            var friend = this._contactM.getUserInfo();
            if (friend.name) {
                this.friendName.text = friend.name;
                this.editingName.text = friend.name;
            }
            this._hasRecentPhoto || (this.imageView.image = friend.imageUrl || "/images/chatroomlist_default_profile_pic.png");
            !this._hasRecentWord && friend.comment && (this.recentMessage.text = friend.comment);
        };
        ChatView.prototype._exitChatRoom = function() {
            var self = this;
            var dialog = Ti.UI.createAlertDialog({
                ok: 0,
                cancel: 1,
                buttonNames: [ L("cl_exitConfirmOkBtn"), L("cl_exitConfirmCancleBtn") ],
                message: L("cl_exitConfirmMessage")
            });
            dialog.addEventListener("click", function(e) {
                e.index === e.source.cancel && Ti.API.debug("The cancel button was clicked");
                e.index === e.source.ok && self._chatViewCol.exitChatRoom(self);
                dialog.removeEventListener("click", arguments.callee);
            });
            dialog.show();
        };
        ChatView.prototype._openChatView = function() {
            var roomId = this._chatRoomM.get("roomId");
            var inUserIds = this._chatRoomM.get("inUserIds");
            Ti.API.debug("open chatRoom ", roomId, inUserIds);
            chatViewManager.openView(this._chatRoomM);
        };
        return ChatView;
    }
    function _createChatViewCollection() {
        var ChatView = _defineChatView();
        var chatViewCol = {};
        chatViewCol._createdChatView = {};
        chatViewCol._orderedChatView = [];
        chatViewCol._isDrawing = false;
        chatViewCol._waitingDrawCount = 0;
        chatViewCol.isEdittingMode = false;
        chatViewCol.initialize = function(chatRoomMs, callback) {
            chatRoomMs = _.sortBy(chatRoomMs, function(chatRoomM) {
                var time = new Date(chatRoomM.get("createdAt"));
                return time.getTime();
            });
            var _tempRoomIdSet = {};
            var chatViews = [];
            for (var i = 0, max = chatRoomMs.length; max > i; ++i) {
                var chatRoomM = chatRoomMs[i];
                var roomId = chatRoomM.get("roomId");
                if (_tempRoomIdSet[roomId]) {
                    Ti.API.debug("!!!!!!!!!!!!!!!중복된 방은 지운다 !!!!!!!!!!!!!!!!!!!!!");
                    var userId = Alloy.Globals.user.get("id");
                    chatViewManager.removeController(chatRoomM);
                    chatRoomCollection.exitRooms(chatRoomM, userId);
                    continue;
                }
                var chatView = this.newChatView(chatRoomM);
                chatViews.push(chatView);
                _tempRoomIdSet[roomId] = true;
            }
            chatViews.sort(function(chatViewA, chatViewB) {
                var chatRoomMA = chatViewA._chatRoomM;
                var recentMsgA = chatRoomMA.get("recentMessage");
                recentMsgA = recentMsgA || {};
                var timeA = recentMsgA.created ? recentMsgA.created : chatRoomMA.get("createdAt");
                var chatRoomMB = chatViewB._chatRoomM;
                var recentMsgB = chatRoomMB.get("recentMessage");
                recentMsgB = recentMsgB || {};
                var timeB = recentMsgB.created ? recentMsgB.created : chatRoomMA.get("createdAt");
                timeA = new Date(timeA);
                timeB = new Date(timeB);
                if (timeA > timeB) return -1;
                if (timeB > timeA) return 1;
                return 0;
            });
            this._orderedChatView = chatViews;
            this.drawChatViews(callback);
        };
        chatViewCol.refresh = function() {
            this.drawChatViews();
        };
        chatViewCol.drawChatViews = function(callback) {
            function bottomMarginAdd() {
                var bottomMargin = Ti.UI.createView({
                    height: 100,
                    width: "100%"
                });
                $.chatListView.add(bottomMargin);
            }
            function _addChatView(chatView, isPadding) {
                $.chatListView.add(chatView);
                isPadding || (allRowCount -= 1);
                if (0 == allRowCount) {
                    Ti.API.debug("last Chatview added, callback time", allRowCount);
                    if (callback && _.isFunction(callback)) {
                        callback();
                        calback = null;
                    }
                    self._isDrawing = false;
                    self.afterDraw();
                    if (self._waitingDrawCount > 0) {
                        Ti.API.debug("Redraw order found, refresh start", self._waitingDrawCount);
                        self.refresh();
                    }
                }
            }
            var self = this;
            if (self._isDrawing) ++self._waitingDrawCount; else {
                self._isDrawing = true;
                self._waitingDrawCount = 0;
                $.chatListView.removeAllChildren();
                var allRowCount = self._orderedChatView.length;
                var restOddRowSpaceCount = 0;
                for (var i = 0, max = self._orderedChatView.length; max > i; ++i) {
                    var chatView = self._orderedChatView[i];
                    chatView.changeColor(_getRandomColor());
                    _addChatView(chatView.rootView);
                    restOddRowSpaceCount = chatView.isSingle() ? 0 : ++restOddRowSpaceCount % 2;
                    if (1 == restOddRowSpaceCount) {
                        var nextChatView = self._orderedChatView[i + 1];
                        nextChatView ? nextChatView.isSingle() && _addChatView(self._newPaddingRowView(), true) : _addChatView(self._newPaddingRowView(), true);
                    }
                }
                bottomMarginAdd();
            }
            if (0 == self._orderedChatView.length) {
                self._isDrawing = false;
                self.afterDraw();
                if (callback && _.isFunction(callback)) {
                    callback();
                    calback = null;
                }
            }
        };
        chatViewCol.afterDraw = function() {
            if (this._orderedChatView && 0 != this._orderedChatView.length) $.emptyImageWrap.visible = false; else {
                $.emptyImageWrap.visible = true;
                (Alloy.Globals.is.shortPhone || "ipad" == Titanium.Platform.osname) && ($.emptyImageView.bottom = 150);
            }
        };
        chatViewCol.reorderChatViewToTop = function(_chatView) {
            var reOrderedChatView = [];
            reOrderedChatView.push(_chatView);
            for (var i = 0, max = this._orderedChatView.length; max > i; ++i) {
                var chatView = this._orderedChatView[i];
                if (chatView.roomId == _chatView.roomId) continue;
                reOrderedChatView.push(chatView);
            }
            this._orderedChatView = reOrderedChatView;
        };
        chatViewCol.hasCreatedChatView = function(roomId) {
            return this._createdChatView[roomId] ? true : false;
        };
        chatViewCol.getExistingChatView = function(roomId) {
            return this._createdChatView[roomId] ? this._createdChatView[roomId] : null;
        };
        chatViewCol.moveChatViewToTop = function(chatView, isHalfToSingle) {
            var roomId = chatView.roomId;
            var existingChatView = this.getExistingChatView(roomId);
            if (existingChatView) {
                var topChatView = this._orderedChatView[0];
                if (topChatView) if (topChatView.roomId != roomId) {
                    this.reorderChatViewToTop(existingChatView);
                    this.refresh();
                } else {
                    Ti.API.debug("topView가 half->single일경우 제대로 그려지지않음.", topChatView.roomId, roomId);
                    isHalfToSingle && this.refresh();
                } else {
                    this._orderedChatView[0] = existingChatView;
                    this.refresh();
                }
            }
        };
        chatViewCol.exitChatRoom = function(toExitChatView) {
            Alloy.Globals.startWaiting("c_waitingMsgRemoveChatRoom");
            var toExitChatRoomMs = [];
            var toExitRoomIds = [];
            var reOrderedChatView = [];
            for (var i = 0, max = this._orderedChatView.length; max > i; ++i) {
                var chatView = this._orderedChatView[i];
                if (chatView.roomId == toExitChatView.roomId) {
                    toExitChatRoomMs.push(chatView._chatRoomM);
                    toExitRoomIds.push(chatView.roomId);
                    delete this._createdChatView[chatView.roomId];
                    chatView.remove();
                } else reOrderedChatView.push(chatView);
            }
            this._orderedChatView = reOrderedChatView;
            this.drawChatViews();
            var userId = Alloy.Globals.user.get("id");
            chatViewManager.removeController(toExitChatRoomMs);
            chatRoomCollection.exitRooms(toExitChatRoomMs, userId);
            messageCollection.removeMessages(toExitRoomIds);
            Alloy.Globals.stopWaiting();
        };
        chatViewCol.toggleEditingView = function(isFocedEdittingModeState) {
            this.isEdittingMode = this.isEdittingMode ? false : true;
            _.isBoolean(isFocedEdittingModeState) && (this.isEdittingMode = isFocedEdittingModeState);
            for (var p in this._createdChatView) {
                var chatView = this._createdChatView[p];
                chatView && chatView.toggleEditingView();
            }
        };
        chatViewCol.updateCheckedTimeFromNow = function() {
            for (var p in this._createdChatView) {
                var chatView = this._createdChatView[p];
                chatView && chatView.updateCheckedTimeFromNow();
            }
        };
        chatViewCol.refeshLinkToChatRoomM = function() {
            for (var p in this._createdChatView) {
                var chatView = this._createdChatView[p];
                chatView && chatView._refeshLinkToChatRoomM();
            }
        };
        chatViewCol.refeshLinkToContactsM = function() {
            for (var p in this._createdChatView) {
                var chatView = this._createdChatView[p];
                chatView && chatView._refeshLinkToContactsM();
            }
        };
        chatViewCol.isTopView = function(chatView) {
            var _chatView = this._orderedChatView[0] || {};
            return chatView.roomId == _chatView.roomId ? true : false;
        };
        chatViewCol.newChatView = function(chatRoomM) {
            var roomId = chatRoomM.get("roomId");
            chatRoomM.get("inUserIds");
            if (this.hasCreatedChatView(roomId)) return this._createdChatView[roomId];
            var chatView = new ChatView(chatRoomM, this);
            this._createdChatView[roomId] = chatView;
            return chatView;
        };
        chatViewCol.addChatViewToTop = function(chatRoomM) {
            var chatView = this.newChatView(chatRoomM);
            this.moveChatViewToTop(chatView);
        };
        chatViewCol._newPaddingRowView = function() {
            var rowView = $.UI.create("View", {
                classes: [ "oddPaddingRowView" ]
            });
            var innerRowView = $.UI.create("View", {
                classes: [ "oddPaddingInnerRowView" ]
            });
            var imageView = $.UI.create("ImageView", {
                classes: [ "oddPaddingImageView" ]
            });
            innerRowView.add(imageView);
            rowView.add(innerRowView);
            return rowView;
        };
        return chatViewCol;
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "chat/chatList";
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
    $.__views.centerTitle = Ti.UI.createView({
        apiName: "Ti.UI.View",
        id: "centerTitle",
        backgroundColor: "white",
        classes: []
    });
    $.__views.centerTitle && $.addTopLevelView($.__views.centerTitle);
    $.__views.emptyImageWrap = Ti.UI.createView({
        layout: "composite",
        width: Titanium.UI.FILL,
        height: Titanium.UI.FILL,
        visible: false,
        zIndex: 10,
        apiName: "Ti.UI.View",
        id: "emptyImageWrap",
        classes: []
    });
    $.__views.centerTitle.add($.__views.emptyImageWrap);
    $.__views.emptyImageView = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/chatroomlist_emptyview.png",
        apiName: "Ti.UI.ImageView",
        id: "emptyImageView",
        classes: []
    });
    $.__views.emptyImageWrap.add($.__views.emptyImageView);
    $.__views.emptyImageView2 = Ti.UI.createImageView({
        preventDefaultImage: true,
        image: "/images/chatroomlist_emptyview_txt.png",
        bottom: 83,
        apiName: "Ti.UI.ImageView",
        id: "emptyImageView2",
        classes: []
    });
    $.__views.emptyImageWrap.add($.__views.emptyImageView2);
    $.__views.chatListWrapView = Ti.UI.createView({
        layout: "composite",
        width: Titanium.UI.FILL,
        height: Titanium.UI.FILL,
        zIndex: 1,
        top: "1px",
        right: "1px",
        apiName: "Ti.UI.View",
        id: "chatListWrapView",
        classes: []
    });
    $.__views.centerTitle.add($.__views.chatListWrapView);
    $.__views.chatListView = Ti.UI.createScrollView({
        showVerticalScrollIndicator: true,
        showHorizontalScrollIndicator: false,
        layout: "horizontal",
        contentWidth: "100%",
        width: "100%",
        height: Titanium.UI.FILL,
        top: 0,
        apiName: "Ti.UI.ScrollView",
        id: "chatListView",
        classes: []
    });
    $.__views.chatListWrapView.add($.__views.chatListView);
    scrollHandler ? $.addListener($.__views.chatListView, "scroll", scrollHandler) : __defers["$.__views.chatListView!scroll!scrollHandler"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.centerTitle.title = L("c_chatList");
    var chatRoomCollection = Alloy.Collections.instance("chatRoom");
    var contactsColllection = Alloy.Collections.instance("contacts");
    var messageCollection = Alloy.Collections.instance("message");
    Alloy.Globals.chatViewManager || (Alloy.Globals.chatViewManager = Alloy.createController("chat/chatViewManager"));
    var chatViewManager = Alloy.Globals.chatViewManager;
    var chatViewCol = _createChatViewCollection();
    exports.startComplete = false;
    exports.fetchContactsCount = 0;
    exports.fetchInitialData = function(mode) {
        contactsColfetch(mode);
        chatRoomFetch();
        messageCollection.fetch({
            success: function() {}
        });
    };
    exports.rightBtn = function() {
        var editingText = L("c_edittingBtn");
        var completeText = L("c_completeBtn");
        var rightBtnOption = {
            title: editingText,
            font: {
                fontSize: 15
            }
        };
        var rightBtnFn = function(titleBtn) {
            Ti.API.debug("챗편집 Button Clicked ");
            chatViewCol.toggleEditingView();
            if (titleBtn) if (chatViewCol.isEdittingMode) {
                titleBtn.title = completeText;
                titleBtn.color = "#8351FD";
            } else {
                titleBtn.title = editingText;
                titleBtn.color = "white";
            }
        };
        return {
            centerTitle: L("c_chatList"),
            rightBtnOption: rightBtnOption,
            rightBtnFn: rightBtnFn
        };
    };
    exports.refresh = function() {
        chatViewCol.refresh();
    };
    var firstOpen = true;
    exports.openFn = function() {
        true == firstOpen ? firstOpen = false : Ti.API.debug("reopen chatListView");
        chatViewCol.toggleEditingView(false);
        chatViewCol.updateCheckedTimeFromNow();
    };
    var _isContactsReset = false, _isChatRoomsReset = false, _isMessageReset = false;
    var _fetchContactsCount = 0, _fetchChatRoomCount = 0, _fetchMessageCount = 0;
    var _fetchChatRoomLength = 0;
    contactsColllection.on("fetch", function() {
        function contactsCol2ndFetch() {
            Ti.API.debug("contactsCol2ndFetch :");
            chatViewCol.refeshLinkToContactsM();
            contactsColllection.off("fetch", arguments.callee);
        }
        _fetchContactsCount++;
        Ti.API.debug("contactsColllection event [fetch] count :", _fetchContactsCount, " / _isContactsReset :", _isContactsReset, " / time :", Alloy.Globals.moment().format(Alloy.Globals.DATE_FORMAT));
        if (!_isContactsReset && (2 == _fetchContactsCount || contactsColllection.length > 0)) {
            _isContactsReset = true;
            _firstCreateRoomViews();
            2 == _fetchContactsCount && contactsColllection.off("fetch", arguments.callee);
        }
        _isContactsReset && 2 == _fetchContactsCount && (exports.startComplete ? _.defer(contactsCol2ndFetch) : $.on("appStartProcess:complete", function() {
            _.defer(contactsCol2ndFetch);
            $.off("appStartProcess:complete", arguments.callee);
        }));
    });
    chatRoomCollection.on("fetch", function() {
        function chatRoomCol2ndFetch() {
            Ti.API.debug("chatRoomCol2ndFetch :");
            if (_fetchChatRoomLength != chatRoomCollection.length) {
                _firstCreateRoomRun = false;
                _firstCreateRoomViews();
            } else chatViewCol.refeshLinkToChatRoomM();
            chatRoomCollection.off("fetch", arguments.callee);
        }
        _fetchChatRoomCount++;
        Ti.API.debug("chatRoomCollection event [fetch] :", _fetchChatRoomCount, " / _isChatRoomsReset :", _isChatRoomsReset, " / time :", Alloy.Globals.moment().format(Alloy.Globals.DATE_FORMAT));
        if (!_isChatRoomsReset && (2 == _fetchChatRoomCount || chatRoomCollection.length > 0)) {
            _isChatRoomsReset = true;
            _fetchChatRoomLength = chatRoomCollection.length;
            _firstCreateRoomViews();
            2 == _fetchChatRoomCount && chatRoomCollection.off("fetch", arguments.callee);
        }
        _isChatRoomsReset && 2 == _fetchChatRoomCount && (exports.startComplete ? _.defer(chatRoomCol2ndFetch) : $.on("appStartProcess:complete", function() {
            _.defer(chatRoomCol2ndFetch);
            $.off("appStartProcess:complete", arguments.callee);
        }));
    });
    messageCollection.on("fetch", function() {
        _fetchMessageCount++;
        Ti.API.debug("messageCollection event [fetch] :", _fetchMessageCount, " / _isMessageReset :", _isMessageReset, " / time :", Alloy.Globals.moment().format(Alloy.Globals.DATE_FORMAT));
        if (!_isMessageReset && (1 == _fetchMessageCount || messageCollection.length > 0)) {
            _isMessageReset = true;
            _firstCreateRoomViews();
            messageCollection.off("fetch", arguments.callee);
        }
    });
    var _firstCreateRoomRun = false;
    var callbackRun = false;
    chatRoomCollection.on("add", function(chatRoomM) {
        chatViewCol.addChatViewToTop(chatRoomM);
    });
    messageCollection.on("add", _receiveMessageListener);
    var COLORS = [ "#54EE92", "#8b61ff", "#FD787C", "#F6EE76" ];
    var _restColors = [];
    $.emptyImageView.image = "ko" == Alloy.Globals.currentLanguage ? "/images/chatroomlist_emptyview.png" : "/images/chatroomlist_emptyview_en.png";
    $.emptyImageView2.image = "ko" == Alloy.Globals.currentLanguage ? "/images/chatroomlist_emptyview_txt.png" : "/images/chatroomlist_emptyview_txt_en.png";
    __defers["$.__views.chatListView!scroll!scrollHandler"] && $.addListener($.__views.chatListView, "scroll", scrollHandler);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
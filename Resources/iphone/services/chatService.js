var _ = Alloy._;

var Backbone = Alloy.Backbone;

var Q = require("q");

var messageCollection = Alloy.Collections.instance("message");

var chatRoomCollection = Alloy.Collections.instance("chatRoom");

var chatService = module.exports = {};

chatService._onReceiveMessage = function(message) {
    Ti.API.debug("chatService._onReceiveMessage :", message);
    switch (message.type) {
      case "send:message":
        if (messageCollection.get(message.id)) ; else {
            var sender = message.fromUserId;
            var newMessage = this._createMessage("receive:message", message);
            Alloy.Globals.firebaseC.sendMessageToOne(newMessage, sender);
            this._saveMessage(message, true);
        }
        break;

      case "enter:receiver":
        messageCollection.get(message.id) || this._saveMessage(message, true);
        break;

      case "receive:message":
        var messageModel = messageCollection.get(message.id);
        if (!messageModel) break;
        messageModel.set({
            isReceived: true,
            receivedTime: Date.now(),
            receiverRoomId: message.receiverRoomId || ""
        });
    }
};

chatService.sendMessage = function(messageData) {
    Ti.API.debug("chatService.sendMessage :", messageData);
    var myId = Alloy.Globals.user.get("id");
    var inUserIds = this._getInUserIds(messageData.roomId);
    var message = this._createMessage("send:message", messageData);
    Alloy.Globals.firebaseC.sendMessage(message, inUserIds, myId);
    var savedMessageModel = this._saveMessage(message, false);
    var toUserIds = _.without(inUserIds, myId);
    this._notifySendingMessage(savedMessageModel, toUserIds);
};

chatService.sendEnterReceiver = function(messageData) {
    var myId = Alloy.Globals.user.get("id");
    var inUserIds = this._getInUserIds(messageData.roomId);
    var message = this._createMessage("enter:receiver", messageData);
    Alloy.Globals.firebaseC.sendMessage(message, inUserIds, myId);
};

chatService._notifySendingMessage = function(messageModel, toUserIds) {
    setTimeout(function() {
        if (messageModel.get("isReceived")) Ti.API.debug("isReceived : not push"); else {
            var type = "chat:message";
            Ti.API.debug("message not received, push start!");
            Alloy.Globals.parsePushC && Alloy.Globals.parsePushC.push(type, messageModel.attributes, toUserIds);
        }
    }, 5e3);
};

chatService._getInUserIds = function(roomId) {
    var room = chatRoomCollection.getBy(roomId);
    return _.isEmpty(room) ? [] : room.get("inUserIds");
};

chatService._createMessage = function(type, data) {
    var fromUserId = Alloy.Globals.user.get("id");
    var newMessage = {
        type: type,
        fromUserId: fromUserId,
        created: Date.now(),
        isRead: false
    };
    switch (type) {
      case "send:message":
        newMessage.id = fromUserId + newMessage.created;
        newMessage = _.extend(newMessage, data);
        break;

      case "enter:receiver":
        newMessage.id = fromUserId + newMessage.created;
        newMessage.isRead = true;
        newMessage = _.extend(newMessage, data);
        break;

      case "receive:message":
        newMessage.id = data.id;
        Alloy.Globals.chatViewManager && Alloy.Globals.chatViewManager.currentOpenedRoomId && (newMessage.receiverRoomId = Alloy.Globals.chatViewManager.currentOpenedRoomId);
    }
    return newMessage;
};

chatService._saveMessage = function(message, isReceived) {
    Ti.API.debug("chatService._saveMessage :", message, " / isReceived :", isReceived);
    message.isReceived = isReceived;
    var messageModel = messageCollection.create(message);
    return messageModel;
};
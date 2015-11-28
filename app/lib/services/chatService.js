var _ = Alloy._;
var Backbone = Alloy.Backbone;
var Q = Alloy.Globals.Q;

var messageCollection = Alloy.Collections.instance('message');
var chatRoomCollection = Alloy.Collections.instance('chatRoom');

//초기화 과정이 필요함.
var chatService = module.exports = {};

// 응답자의 행동임.
chatService._onReceiveMessage = function (message) {
	Ti.API.debug('chatService._onReceiveMessage :', message);
	//타입확인해야함
	switch(message.type) {
		// 남이 보낸 메시지
		case "send:message" :
			// Ti.API.debug(message);
			if(messageCollection.get(message.id)) {
			}else{
				var sender = message.fromUserId;
				var newMessage = this._createMessage('receive:message', message);
				Alloy.Globals.firebaseC.sendMessageToOne(newMessage, sender);
				// //받은 메시지 이므로 isReceived를 true로 저장. newMessage는 응답메시지이고, message 저장이 맞음.
				this._saveMessage(message, true);
			}

		break;

		case "enter:receiver":
			if(messageCollection.get(message.id)) {
			}else{
				//리시버입장한당..
				this._saveMessage(message, true);
			}
		break;

		// 응답 메시지
		// 이건 단순히 메시지의 응답을 이용하여 push를 보내는 여부를 확인하는 것.
		case "receive:message" :
		// 여기서 message가  받은 메시지임. messageModel은 내가 보냈던 메시지고.
			var messageModel = messageCollection.get(message.id);
			//응답받은 메시지 id (fetch 안되있을 경우 못찾을수도있다.)
			if(!messageModel) {
				break;
			} else {
				//방이 열린상태로 보낸 메시지만 유효.
				messageModel.set({
					'isReceived': true,
					'receivedTime' : Date.now(),
					'receiverRoomId' : message.receiverRoomId || ''
				});
			}

		break;

		default: break;
	}
}

// chatRoom의 유저들에게 메시지를 보냄.
chatService.sendMessage = function (messageData) {
	Ti.API.debug('chatService.sendMessage :', messageData);
	var myId = Alloy.Globals.user.get('id');
	// 채팅방에 있는 사람.
	var inUserIds =  this._getInUserIds(messageData.roomId);

	//type에 따라 이미지메시지, 일반 텍스트 메시지 등을 구분.
	var message = this._createMessage('send:message', messageData);

	Alloy.Globals.firebaseC.sendMessage(message, inUserIds, myId);

	//message, isReceived
	var savedMessageModel = this._saveMessage(message, false);

	//1초의 지연 후 메시지 응답여부에 따른 푸쉬 알림.
	var toUserIds = _.without(inUserIds, myId);
	this._notifySendingMessage(savedMessageModel, toUserIds);
}

//저장ㅇㅇ안하고 보냄. 상대방에게만 유효해.
chatService.sendEnterReceiver = function (messageData) {
	var myId = Alloy.Globals.user.get('id');
	// 채팅방에 있는 사람.
	var inUserIds =  this._getInUserIds(messageData.roomId);
	var message = this._createMessage('enter:receiver', messageData);

	Alloy.Globals.firebaseC.sendMessage(message, inUserIds, myId);
}

//메시지를 보내고 지연후 도착여부를 확인하여 푸쉬로 알림.
chatService._notifySendingMessage = function (messageModel, toUserIds) {
	setTimeout(function() {
		if(messageModel.get('isReceived')) {
			//아무동작안함.
			Ti.API.debug('isReceived : not push')
		}else{
			var type = "chat:message";
			Ti.API.debug('message not received, push start!');
			if (Alloy.Globals.parsePushC) {
				Alloy.Globals.parsePushC.push(type, messageModel.attributes, toUserIds);
			}
		}
	},5000);
};

chatService._getInUserIds = function (roomId) {
	var room = chatRoomCollection.getBy(roomId);

	if(_.isEmpty(room)) {
		return [];
	}else{
		return room.get('inUserIds');
	}
}

//fromUser
chatService._createMessage = function (type, data) {
	var fromUserId = Alloy.Globals.user.get('id');
	//기본형태
	var newMessage = {type:type, fromUserId:fromUserId, created: Date.now(), isRead: false};

	switch(type) {
		case "send:message" :
			newMessage.id = fromUserId + newMessage.created;
			newMessage = _.extend(newMessage, data);
		break;

		case "enter:receiver" :
			newMessage.id = fromUserId + newMessage.created;
			newMessage.isRead =  true;
			newMessage = _.extend(newMessage, data);
		break;
		//
		case "receive:message" :
			//응답받은 메시지 id
			newMessage.id = data.id;
			if(Alloy.Globals.chatViewManager && Alloy.Globals.chatViewManager.currentOpenedRoomId){
				newMessage.receiverRoomId = Alloy.Globals.chatViewManager.currentOpenedRoomId;
			}
		break;

		default : break;
	}

	return newMessage;
}

//id값 부여 및, isReceived 속성 추가 하여 로컬프로퍼티로 저장.
chatService._saveMessage = function (message, isReceived) {
	Ti.API.debug('chatService._saveMessage :', message, ' / isReceived :', isReceived);
	message.isReceived = isReceived;
	var messageModel = messageCollection.create(message);
	return messageModel;
}

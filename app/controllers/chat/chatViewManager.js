var chatRoomCollection = Alloy.Collections.instance('chatRoom');

//채팅방내의 focus, close 리스너에서  할당됨. chatService에서 사용됨.
exports.currentOpenedRoomId = null;

//전역변수.0
var _chatCList = {};

//TODO[faith];여기서 채팅 chatModelM을 전달하는것이 맞음. 수정해야함. 연관된것.
exports.getOrCreate = function(chatRoomM) {
	var myId = Alloy.Globals.user.get('id');
	var roomId = chatRoomM.get('roomId');
	var inUserIds = chatRoomM.get('inUserIds');
	//컨트롤러가 없다면 만들거나 가져와서 open한다.
	return _getOrCreateController(roomId, inUserIds);
}
// roomId나 inUserIds로 chatRoom을 생성 혹은 가져온다.
// 그리고 그에 해당하는 roomView를 없다면 생성하여 open하고 있다면 있는 것을 보여준다.
exports.openView = function(chatRoomM) {
	if (Alloy.Globals.firebaseC) {
		//채팅룸 데이터 먼저 확인하고.
		Ti.API.debug('open chat room window');
		var chatC = exports.getOrCreate(chatRoomM);
		Alloy.Globals.stopWaiting();
		Alloy.Globals.openWindow(chatC);
		return chatC;
	} else {
		// firebase controller를 기다림
		Alloy.Globals.chatListC.on('firebase:ready', function() {
			//채팅룸 데이터 먼저 확인하고.
			Ti.API.debug('open chat room window');
			var chatC = exports.getOrCreate(chatRoomM);
			Alloy.Globals.stopWaiting();
			Alloy.Globals.openWindow(chatC);

			Alloy.Globals.chatListC.off('firebase:ready',arguments.callee);
		});
	}
}
exports.removeController = function(chatRoomMs){

	for(var i=0, max=chatRoomMs.length; i<max; ++i){
		var chatRoomM = chatRoomMs[i];
		var roomId = chatRoomM.get('roomId');
		var inUserIds = chatRoomM.get('inUserIds');

		var chatC = _getController(roomId, inUserIds);
		if(chatC){
			chatC.remove();
			Ti.API.debug('컨트롤러지우는것이 제대로 되는지보자.-----------------',Object.keys(_chatCList))
			delete _chatCList[roomId];
		}
	}
}
exports.refeshLinkToChatRoomM = function(roomId){
	//id로 찾기
	var findedChatC = _chatCList[roomId];
	if (findedChatC) {
		// 기존에 chatRoom에 chatRoomM 업데이트
		findedChatC.refeshLinkToChatRoomM();
	}
}
exports.refeshLinkToContactsM = function(roomId){
	//id로 찾기
	var findedChatC = _chatCList[roomId];
	if (findedChatC) {
		// 기존에 chatRoom에 chatRoomM 업데이트
		findedChatC.refeshLinkToContactsM();
	}
}

function _getController(roomId, inUserIds) {
	//id로 찾기
	var findedChatC = _chatCList[roomId];

	//inUserIds로 찾기.
	if(!findedChatC) {
		for(var p in _chatCList) {
			var curChatC = _chatCList[p];
			var curInUserIds = curChatC.inUserIds || [];
			//inUserIds와 일치하는 chatC
			if(curInUserIds.length == inUserIds.length) {
				var isEqualCount = 0;
				for(var j=0,maxJ=inUserIds.length; j<maxJ; ++j) {
					var inUserId = inUserIds[j];
					//witout으로 일치하면 제거
					if(_.contains(curInUserIds, inUserId)) {
						curInUserIds = _.without(curInUserIds, inUserId);
					}
				}
				//curInUserIds가 길이가 0이면 순서에 관계없이 일치하는 것.
				if(inUserIds.length == isEqualCount && curInUserIds.length == 0) {
					Ti.API.debug('findView', inUserIds,  curChatC.inUserIds)
					findedChatC = curChatC;
					break;
				}
			}

		}
	}else{
		Ti.API.debug('--------------이미있는 컨트롤러임.');
	}

	return findedChatC;
}

function _getOrCreateController(roomId, inUserIds) {
	//id로 찾기
	var findedChatC = _getController(roomId, inUserIds);
	//id 및 inUserIds로 못찾았을 경우 새로 생성 및 _chatCList에 캐쉬
	if(!findedChatC) {
		Ti.API.debug('=========create new chatRoomController', roomId);

		findedChatC = Alloy.createController('chat/chatRoom', {roomId:roomId, inUserIds:inUserIds});

		_chatCList[roomId] = findedChatC;
	}
	return findedChatC;
}

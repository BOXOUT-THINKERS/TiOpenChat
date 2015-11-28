
// 로긴후 파이어베이스 연결
// 대화방이 하는일이 많아져서 이제는 대화방이 다 열린다음에 firebase를 연결한다.

// 연결 후 사용될 firebaseRoot
var _fbRoot={};
var fbChatPath="";
exports.isOnline = false;

// 파이어베이스 연결 및 자신에게 할당된 경로(messages/loginUserId)에 대한 child_added 콜백 처리.
exports.listenStart = function(userId) {
	// 이미 _fbRoot가 있으면 연결되어 있는 상태겠지
	if (_.isEmpty(_fbRoot)) {
		var Firebase = (OS_IOS) ? require('com.leftlanelab.firebase') : require('services/androidFirebaseService');
		var self = this;
		fbChatPath = "messages/"+userId;

		Ti.API.debug('connect firebase : ', fbChatPath,Ti.App.Properties.getString('Firebase_AppUrl'))
		if (OS_IOS) {
			// iOS Firebase 이벤트 핸들링 코드
			_fbRoot = Firebase.new(Ti.App.Properties.getString('Firebase_AppUrl'));

			//eventType : "value", "child_added", "child_changed", "child_removed", or "child_moved."
			_fbRoot.child(fbChatPath).on('child_added',_onReceiveMessage);
		} else {
			// Android Firebase 이벤트 핸들링 코드
			_fbRoot = new Firebase('/');
			_fbRoot.connect({
				complete:function(e) {
					_fbRoot.child({
						path:fbChatPath,
						change: _onReceiveMessage,
						eventType:"child_added"
					});
				}
			});
		}
		exports.isOnline = true;
	}
}

// 다수에게 메시지 보내기.
exports.sendMessage = function (message, toUsers, excludeUserId) {
	Ti.API.debug('firabase.sendMessage :', message);
	if(!_.isArray(toUsers)) toUsers = [toUsers];

	for(var i=0,max=toUsers.length; i<max; ++i) {
		var toUserId = toUsers[i];
		//제외아이디가 아니라면 보냄.
		if(toUserId != excludeUserId) {
			exports.sendMessageToOne(message, toUserId);
		}
	}

}
//개별로 메시지 보내기.
exports.sendMessageToOne = function (message, toUserId) {
	message.toUserId = toUserId;

	var fbPath = "messages/"+toUserId;

	Ti.API.debug('message :', message, '/ toUserId :', toUserId);
	if(OS_IOS) {
		_fbRoot.child(fbPath).push(message);
	}else{
		_fbRoot.push(fbPath, message);
	}
}

// firebase 연결 관리
exports.goOnline = function () {
	if (!_.isEmpty(_fbRoot)) {
		Ti.API.debug("[Firebase] goOnline");
		exports.isOnline = true;
		_fbRoot.goOnline();
	}
}
exports.goOffline = function () {
	if (!_.isEmpty(_fbRoot)) {
		Ti.API.debug("[Firebase] goOffline");
		exports.isOnline = false;
		_fbRoot.goOffline();
	}
}

// 이벤트 핸들러
function _onReceiveMessage(data) {
	var message = (OS_IOS) ? {"val":data.val(),"key":data.name()} : JSON.parse(data);
	Ti.API.debug(message);
	// 메시지 모델에 전달
	if(OS_IOS){
		setTimeout(delayAdapter.bind(null,$, message), 100);
	}else{
		$.trigger('receive:message', message.val);
	}
	// firebase에서 레코드 삭제
	// TODO : 멀티 디바이스를 위해서는 다른 처리가 필요
	var pathVal = fbChatPath + "/" + message.key;
	if (OS_IOS) {
		_fbRoot.child(pathVal).remove();
	} else {
		_fbRoot.remove(pathVal);
	}
}
// iOS에서 발생하는 메시지 콜렉션 처리의 버그 때문에 100ms의 텀을 두고 실행 시킵니다.
// 왜 바로 실행시키면 iOS에서 문제가 생기는지 모르겠는데, javascript 엔진의 문제인것 같군요.
function delayAdapter($, message){
	$.trigger('receive:message', message.val);
}

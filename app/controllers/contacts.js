var args = arguments[0] || {};

$.container.title = L('c_friendList');
//$.friendInvite.text = L('cb_inviteFriendBtn');
$.headerTitle1.text = L('cb_profileTitle');
$.headerTitle2.text = L('cb_favoriteTitle');
$.headerTitle3.text = L('cb_friendHeaderTitle');
$.headerTitle4.text = L('cb_searchTitle');



var contactsCol = Alloy.Collections.instance('contacts');
var messageCollection = Alloy.Collections.instance('message');
var chatRoomCol = Alloy.Collections.instance('chatRoom');

var favoriteFriends = [];
var friends = [];
var unregisteredFriends = [];
var ufIndex = 0;
var scrollView = {};

var unregisteredFriendsNotDisplayCount = 0;

//설정에서 갱신되면 반영함.
Alloy.Models.instance('user').on('change:profile',drawProfileRow);

// 다시 그리기
contactsCol.on('redraw', function() {
	if (nowOpen) {
		drawContactRow();
	}
});

// fetch에서 발생함
contactsCol.on('fetch', function() {
	if (nowOpen) {
		drawContactRow();
	}
});

contactsCol.on('add',function(model) {
	// 동기화 중이 아니고 열려있으면 다시 그림
	if(!(model.get('isHidden') || model.get('isBlock')) && !Alloy.Globals.loginC.doingSyncAddress){
		if (nowOpen) {
			drawContactRow();
		}
	}
});

exports.drawContacts = function(params) {
	if (nowOpen) {
		//프로필관련 그리기.
		drawProfileRow();
		drawContactRow();
	}
};

function drawContactRow() {
	//친구관련(즐겨찾기친구, 등록된친구, 미등록친구)
	favoriteFriends = [];
	friends = [];
	unregisteredFriends = [];
	unregisteredFriendsNotDisplayCount = 0;

	contactsCol.each(function(model){
		var isFavorite = model.get('isFavorite');
		var friend = model.get('User_object_To') || false;

		var rowItem = _createFriendRow(model);
		if(!friend) {
			//등록되지 않은 친구라면.
			unregisteredFriends.push(rowItem);
		} else {
			//등록된 친구일경우. 이면서 숨김 혹은 차단 친구가 아닐경우
			if(!(model.get('isHidden') || model.get('isBlock')) ){
				//즐겨찾기친구라면
				if(isFavorite) {
					favoriteFriends.push(rowItem);
				//그냥 친구라면.
				} else {
					friends.push(rowItem);
				}
			}
		}
	});

	$.favoriteSection.setItems(favoriteFriends);
	$.friendsSection.setItems(friends);

	$.unregiteredFriendsSection.setItems([]);
	ufIndex = 0;

	listViewLoadMore();

	//스크롤 이벤트 초기화
	scrollHandler({ y: 0, type: 'scroll' });
}

function drawProfileRow() {
	// 값 변경.
	var profileRow = _createProfileRow(Alloy.Globals.user);

	$.profileSection.setItems([profileRow]);
}

function listViewLoadMore(e) {
	if (e) {
		Ti.API.debug("Marker Event Fired ufIndex :", ufIndex);

		// 친구 목록을 불러오는 도중에는 graphSearch 막기
		if (Alloy.Globals.loginC.doingSyncAddress) {
			Alloy.Globals.toast('c_doingSyncMsgFriend');
			$.listView.scrollToItem(0, 0, { animated: false } );
			// 화면에는 표시 하지 않는 등록되지 않은 친구가 있을 때
			if (unregisteredFriendsNotDisplayCount) {
				// 주소록을 다시 그림
				exports.drawContacts();
			} else {
				// 다시 마커 이벤트를 설정
				$.listView.setMarker({sectionIndex: 4, itemIndex: (ufIndex - 1)});
			}
			return;
		}
	}

	var max = ufIndex ? ufIndex + 49 : 50;
	var data = [];
	for (var i = ufIndex; i < unregisteredFriends.length; i++) {
		data.push(unregisteredFriends[i]);
		ufIndex = i + 1;
		if (i >= max) { break; }
	}
	Ti.API.debug('listViewLoadMore :', i, '/', unregisteredFriends.length);

	$.unregiteredFriendsSection.appendItems(data);

	if (ufIndex < unregisteredFriends.length) {
		Ti.API.debug('Marker Added :', (ufIndex - 1));
		$.listView.setMarker({sectionIndex: 4, itemIndex: (ufIndex - 1)});
	}
}

$.listView.addEventListener('marker', listViewLoadMore);

exports.rightBtn = function() {
	var rightBtnOption = {
		title: L("c_edittingBtn"),
		font: { fontSize: 15 }
	};
	var rightBtnFn = function () {
		Alloy.Globals.startWaiting('c_waitingMsgDefault');
		//Ti.API.debug("Right Button Clicked ");
		Alloy.Globals.openWindow('contactsBan');
	};

	return {
		'centerTitle' : L("c_friendList"),
		'rightBtnOption' : rightBtnOption,
		'rightBtnFn' : rightBtnFn
	};
};

// 열렸을 때 할일 들
var nowOpen = false;
exports.openFn = function() {
	nowOpen = true;

	//다시 뿌려보자
	exports.drawContacts();

	// 동기화중이면 메시지 하나 추가
	if (Alloy.Globals.loginC.doingSyncAddress) {
		Alloy.Globals.toast('c_doingSyncMsgFriend');
	}
}

exports.closeFn = function() {
	nowOpen = false;
	Ti.API.debug('close contactsView');
}

$.listView.addEventListener('itemclick', function(e) {
	var itemId = e.itemId;
	// me
	if(itemId == Alloy.Globals.user.get('id')) {

	}else{
		var contactM = contactsCol.get(itemId);
		var friendId = contactM.get('User_objectId_To');
		//등록된 친구라면.
		if (friendId) {
			//just chat
			var fromUser = Alloy.Globals.user.getInfo();
			_openChatRoom(contactM, fromUser, {}, true);
		}
	};

	//채팅목록, 채팅방을 열기
	function _openChatRoom(contactM, fromUser, shootInfo, isNotRequestWhere){
		var toUser = contactM ? contactM.getUserInfo() : {};
		var fromUserId = fromUser.id
		var toUserId = toUser.id
		var inUserIds = [fromUserId, toUserId];
		var roomId  = null; //지금은 알수없으니 chatRoomCol에 찾는것 위임.

		chatRoomCol.getOrCreate(roomId, inUserIds, fromUserId)
		.then(function(chatRoomM){
			var chatC = chatViewManager.getOrCreate(chatRoomM);
			//채팅방이 열려있는지, 닫혀있는지 상태에따라 다르게 행동함.
			// 열려 있지 않을때만
			if (!chatC.isOpenedChatRoom) {
				Alloy.Globals.menuC.trigger('menuclick', {
					itemId:'chatlist',
					isNotToggle:true
				});

				//chatViewManager.openView(chatRoomM);
				var openView = function() {
						chatViewManager.openView(this.chatRoomM);
					};
				openView = _.bind(openView,  { chatRoomM : chatRoomM });
				_.delay(openView, 100);
			}

		}).fail(function(error) {
			Ti.API.error(error);
		});
	}
});

//private helper method
function _createProfileRow(user) {
	var userId = user.get('id');
	var userM = user.attributes; //이거 사용시주의.
	var imageUrl =  userM.get('profileImage') ? userM.get('profileImage').url() : "/images/friendlist_profile_mine_default_img.png" ;

	return {
		template : 'rowTemplate',
		profileImage : { image: imageUrl },
		profileName : { text: userM.get('name') || ""},
		profileComment : {text: userM.get('comment')},
		commentWrapView : {visible: userM.get('comment') ? true : false },
		//그린 후 갱신하여 처리하므로 현재는 보이지않게.
		profileEtcInfoWrapView : {visible: false },
		properties : {
				itemId : userId,
		}
	}

}
function _createFriendRow(contactM) {
	var friend = contactM.get('User_object_To') || {};
	var imageUrl = friend.profileImage ? friend.profileImage.url : '/images/friendlist_profile_default_img.png';
	var locationText = '';

	return {
		template : _.isEmpty(friend) ? 'unregiteredFriendsTemplate' : 'rowTemplate',
		profileImage : { image: imageUrl },
		profileName : { text: contactM.get('fullName') || friend.name || '' },
		profileComment : {text: friend.comment || '' },
		locationText : {text: locationText || '' },

		frinedInvite : {text: L('cb_inviteFriendBtn')},

		commentWrapView : {visible: friend.comment ? true : false },
		profileEtcInfoWrapView : {visible: locationText ? true : false },
		properties : {
				itemId : contactM.id || '',
				searchableText: contactM.get('fullName') || friend.name
		}
	}
};
/////////////////////////

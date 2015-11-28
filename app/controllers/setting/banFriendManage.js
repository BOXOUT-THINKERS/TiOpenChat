var args = arguments[0] || {};

$.container.title = L('sb_banFriendTitle');

var Q = Alloy.Globals.Q;
var banContactsCol;

//////////////
$.getView().addEventListener('open', function () {
	//fetch데이터가 불러온것만 들어가게됨. 그러니 새것으로 해야함

	// Alloy.Globals.startWaiting('c_waitingMsgFriend');
	// banContactsCol.defaultFetchData = {
	// 	order : "-User_objectId_To,fullName",
	// 	where : { "User_objectId" : Alloy.Globals.user.get("id"), "isBlock" : true },
	// 	include : "User_object_To",
	// 	limit : 1000
	// };
	// banContactsCol.fetch({
	// 	success: function(){
	// 		drawBanFriend();
	// 		Alloy.Globals.stopWaiting();
	// 	},
	// 	error: function(){
	// 		Alloy.Globals.alert('verifyCodeFail');
	// 	}
 //    });

	var allContactsCol = Alloy.Collections.instance('contacts');
	var models = allContactsCol.filter(function(model){
		return (model.get('User_objectId_To') && model.get('isBlock'));
	});

	banContactsCol = Alloy.createCollection('contacts');
	banContactsCol.reset(models);
	drawBanFriend();
});
////////////

//
$.listView.addEventListener('itemclick', function(e){
	var itemId = e.itemId;
	var contactM = banContactsCol.get(itemId);


	var opts = {
		cancleBan: 0, ban: 1
	}
	if(OS_IOS){
		opts.options = [
			L('sb_cancleBanFriend'),
			L('sb_changeBlocktToHidden'),
			L('c_cancle'),
		]
	}else{
		opts.options = [
			L('sb_cancleBanFriend'),
			L('sb_changeBlocktToHidden')
		]
		opts.buttonNames = [L('c_cancle')];
	}

  	var dialog = Ti.UI.createOptionDialog(opts)

  	//사진찍거나 가져오고, 로컬 변환후.. 서버에 저장한다.
	dialog.addEventListener('click', function(e){
		//안드로이드에서 버튼이면 취소와 같음.아무동작안함.
		//아무동작하지않음.
		if(OS_IOS){
			if(e.index > 1) return;
		}else{
			if(e.button) return;
		}

		if(e.index == e.source.cancleBan){
			cancleBan(contactM);
		}
		if(e.index == e.source.ban){
			hideFriend(contactM);
		}
	});

	dialog.show();
});

//업데이트와....컬렉션에서 제거.....리스트뷰는 걍 다시그리고.
function cancleBan(contactM) {
	banContactsCol.remove(contactM, {remove:false});
	drawBanFriend();

	var tempContactM = Alloy.createModel('contacts');
	tempContactM.save({'objectId': contactM.id, 'isBlock': false}, {
			success: function (result) {
				//전체 친구목록을 다시그림.
				// var currentContactM = currentContactsCol.get(contactM.id);
				contactM.set({'isBlock': false}, {change:'false'});
			},
			error : function (error) {
				banContactsCol.add(contactM, {add:false});
				drawBanFriend();
				Alloy.Globals.alert('c_alertMsgDefault');
			}
	});
}

//블락 취소 대신 하이드..
function hideFriend(contactM) {
	banContactsCol.remove(contactM, {remove:false});
	drawBanFriend();

	var tempContactM = Alloy.createModel('contacts');
	tempContactM.save({'objectId': contactM.id, 'isHidden': true, 'isBlock': false}, {
			success: function (result) {
				//전체 친구목록에는 어차피 안보임
				contactM.set({'isHidden': true, 'isBlock': false}, {change:'false'});
			},
			error : function (error) {
				banContactsCol.add(contactM, {add:false});
				drawBanFriend();
				Alloy.Globals.alert('c_alertMsgDefault');
			}
	});
}

function drawBanFriend() {
	var items = [];
	banContactsCol.each(function(contactM){
		var friend = contactM.getUserInfo();
		items.push({
			template : "rowTemplate",
			profileImage : {
				image : friend.imageUrl || "/images/friendlist_profile_default_img.png"
			},
			profileName: {
				text : friend.name
			},
			rowRightBtnLabel : {text :L('c_manage')},
			properties : {
				itemId : contactM.id
			}
		});
	});

	$.section.setItems(items);
};

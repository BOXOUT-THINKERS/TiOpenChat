var args = arguments[0] || {};
var userM = Alloy.Models.instance('user');

$.eactEtcFont1.text = L('c_manageBanFriend');
$.eactEtcFont2.text = L('c_setBanTime');
$.eactEtcFont3.text = L('s_helpPrivate');
$.eactEtcFont4.text = L('c_setting');
$.bottomText.text = L('c_copyright');

/////////////////////
userM.on('change',updateUserData);
userM.on('change:profile',updateUserData);

// short phone (iphone4) 일때 + ipad 일때 고객센터와, 카피라잇 지움
if (Alloy.Globals.is.shortPhone || Titanium.Platform.osname == 'ipad') {
	$.helpPrivate.visible = false;
	$.helpPrivate.height = 0;

	$.bottomText.visible = false;
}

function updateUserData(){
	var userInfo = userM.getInfo();
	$.profileImage.image = userInfo.imageUrl || "/images/navidrawer_profile_pic.png";
	$.profileName.text = userInfo.name;
};



//////////////////각 버튼에따른. 호출.
//친구목록
$.contacts.addEventListener('click', function() {
	_triggerMenu('contacts');
});
//대화목록
$.chatList.addEventListener('click', function() {
	_triggerMenu('chatlist');
});


/////////////////
$.manageFriend.addEventListener('click', function() {
	_toggleMenu();
	_moveWindow('banManage');
});

$.banTime.addEventListener('click', function() {
	_toggleMenu();
	_moveWindow('notifyAndSound');
});

$.helpPrivate.addEventListener('click', function() {
	_toggleMenu();
	_moveWindow('helpPrivate')
});

//더보기..설정?
$.editProfile.addEventListener('click', function() {
	_triggerMenu('setting');
});
$.setting.addEventListener('click', function() {
	_triggerMenu('setting');
});



// private methods
function _moveWindow(controllerName) {
	var windowName = "setting/" + controllerName;
	var controller = Alloy.createController(windowName);
	Alloy.Globals.openWindow(controller);
}
function _toggleMenu(){
	$.trigger('menuclick', {isNotToggle:false});
}
function _triggerMenu(menuStr, option){
	var args = {
		itemId:menuStr,
		isNotToggle:false
	}

	if(option){
		_.extend(args, option);
	}

	$.trigger('menuclick', args);
}



//이미지 한영 변환 작업.
(function(){
	$.editProfile.image = (Alloy.Globals.currentLanguage == 'ko') ? "/images/navidrawer_profile_edit_button.png" :  "/images/navidrawer_profile_edit_button_en.png";

	$.eachImg1.image = (Alloy.Globals.currentLanguage == 'ko') ? "/images/navidrawer_friendlist_icon.png" : "/images/navidrawer_friendlist_icon_en.png"
	$.eachImg2.image = (Alloy.Globals.currentLanguage == 'ko') ? "/images/navidrawer_chatroomlist_icon.png" : "/images/navidrawer_chatroomlist_icon_en.png"
	$.eachImg3.image = (Alloy.Globals.currentLanguage == 'ko') ? "/images/navidrawer_pecking_icon.png" : "/images/navidrawer_pecking_icon_en.png"
	$.eachImg4.image = (Alloy.Globals.currentLanguage == 'ko') ? "/images/navidrawer_photo_icon.png" : "/images/navidrawer_photo_icon_en.png"
})();

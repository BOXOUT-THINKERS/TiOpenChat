$.container.title = L('s_friendManage');
$.hideFriendTitle.text = L('sb_hideFriendTitle');
$.banFriendTitle.text = L('sb_banFriendTitle');

function moveHideFriendManage() {
	var controller = Alloy.createController("setting/hideFriendManage");
	Alloy.Globals.openWindow(controller);
}

function moveBanFriendManage() {
	var controller = Alloy.createController("setting/banFriendManage");
	Alloy.Globals.openWindow(controller);
}

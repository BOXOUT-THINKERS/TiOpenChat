var args = arguments[0] || {};

$.container.title = L('s_privateAndSNS');
$.sp_banList.text = L('sp_banList');
$.sp_SNSList.text = L('sp_SNSList');
$.sp_withdrawal.text = L('sp_withdrawal');

$.getView().addEventListener('open', function () {
});

// 회원 탈퇴
function userWithdrawFn() {
	var dialog = Ti.UI.createAlertDialog({
		cancel: 1,
		buttonNames: [L('sp_confirm'), L('sp_cancle'), L('sp_help')],
		message: L('sp_message'),
		title: L('sp_title')
	});
	dialog.addEventListener('click', function(e){
		switch(e.index) {
			case 0:
				Alloy.Globals.alert("sp_alertWithdrawal");
				Alloy.Globals.loginC.withdraw();
			break;
			case 1:
				Alloy.Globals.alert("sp_alertCancle");
			break;
			case 2:
				Alloy.Globals.alert("sp_alertHelp");
			break;
		}
	});
	dialog.show();
}

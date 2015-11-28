var args = arguments[0] || {};

$.container.title = L('s_helpPrivate');
$.s_hp_question.text = L('s_hp_question');
//$.s_hp_faivoriteQuestion.text = L('s_hp_faivoriteQuestion');
$.s_hp_usingLaw.text = L('agree_usingTitle');
$.s_hp_dealWithPrivate.text = L('agree_privateTitle');
$.s_hp_withdrawal.text = L('s_hp_withdrawal');

//영어버전은 이용약관이없음. tableViewSection은 visible로 제어가 안되서 직접지움.
(!$.s_hp_usingLaw.text) ? $.tableSection.remove($.agreeUsingView) : '';

// 회원 탈퇴
function userWithdrawFn() {
	var dialog = Ti.UI.createAlertDialog({
		cancel: 1,
		buttonNames: [L('sp_confirm'), L('sp_cancle')],
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
				Alloy.Globals.toast("sp_alertCancle");
			break;
		}
	});
	dialog.show();
}

function moveAction() {
	Alloy.Globals.alert("c_alertReadyToOpen");
}

function requestByEmail() {
	var emailDialog = Ti.UI.createEmailDialog();
    emailDialog.setToRecipients(['contact@boxoutthinkers.com']);
    emailDialog.setSubject(L("s_hp_emailSubject"));
    emailDialog.setMessageBody(L("s_hp_emailContent"));


	emailDialog.addEventListener('complete',function(e) {
        if (e.result == emailDialog.SENT) {
            if (OS_IOS) {
                // android doesn't give us useful result codes.
                // it anyway shows a toast.
                Alloy.Globals.toast("c_alertMsgSendedEmail");
            }
        }else{
            Alloy.Globals.alert("c_alertMsgFailSendEmail");
            Ti.API.debug(e);
        }

    });

    emailDialog.open();
}

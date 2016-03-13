var args = arguments[0] || {};

$.agreeLabel.text = L('l_welcomeLabel');
$.tryCodeBtn.title = L('verifyCodeSendBtn');
$.verifyMsgLabel.text = L('l_verifyMsgLabel');
$.verifyFailMsgLabel.text = L('l_verifyMsgLabel_Fail');
$.retryBtn.title = L('verifyCodeResendBtn');
$.nameLabel.text = L('joinNameLabel');
$.nameMsgLabel.text = L('joinNameMsgLabel');
$.agreeMsgLabel.text = L('l_agreeLabel');
$.joinBtn.title = L('joinCompleteBtn');

// short phone (iphone4) 일때 + ipad 일때 레이아웃 조절
if (Alloy.Globals.is.shortPhone || Titanium.Platform.osname == 'ipad') {
  $.middleView1.height = 141;
  $.middleView2.height = 141;
  $.middleView3.height = 141;

  $.verifyCodeView.top = -40;
  $.nameView.top = 5;
  $.nameView.height = 65;
  $.nameMsgView.height = 30;
}

// User 객체 셋팅하는 코드. 이후 Parse의 User도 설정해줘야함. Parse.User.current에 대응하기 위해서.
var userM = Alloy.Models.instance('user');
var settingsM = Alloy.Models.instance('settings');

// 키보드 높이에 따른 레이아웃 조절
Ti.App.addEventListener('keyboardframechanged', function(e) {
  $.tryCodeBtnView.bottom = e.keyboardFrame.height;
  $.retryBtnView.bottom = e.keyboardFrame.height;
  $.agreeMsgView.bottom = e.keyboardFrame.height;
});

// 텍스트 필드 제한
var _inputLimitSize = Alloy.Globals.inputLimit.name;
$.nameLimitLabel.text = "0 / " + _inputLimitSize;
if(OS_IOS){
  //TODO[faith]:ios에서는 maxLength를 설정하면 최대길이인 상태에서.. 중간값을 변경하면 커서위치가 끝으로 이동함. 그 전 위치를 알수가 없다.
  // 그래서 현재는 위의 상황에서. 우측글씨가 사라지는 것이 보이는 현상이 존재함. 어찌해야할까..
}else{
  $.nameInput.maxLength = _inputLimitSize;
}

$.nameInput.addEventListener('change', onChangeInputField);
function onChangeInputField() {
  var curText = $.nameInput.value || '';

  if(curText.length > _inputLimitSize){
    if(OS_IOS){
      var selection = $.nameInput.getSelection() || {location : curText.length };
      var location = selection.location;
      //ios에서 값 변경시 커서가 끝으로 이동되기에 그전 위치로 변경해야한다.
      $.nameInput.value = curText.slice(0, _inputLimitSize);
      if(location < _inputLimitSize){
        $.nameInput.setSelection(location, location);
      }
    }
  }else{
    if(curText.length == _inputLimitSize) {
      $.nameLimitLabel.color = "#ff5d5d";
    }else{
      $.nameLimitLabel.color = "#bebebe";
    }

    $.nameLimitLabel.text = curText.length + " / " + _inputLimitSize;
  }
};

/**
 * 현재 국가코드 설정하기
 */
var countries = require('countries');
var countryCode = Titanium.Locale.getCurrentCountry().toLowerCase() ? Titanium.Locale.getCurrentCountry().toLowerCase() : "us";
$.localNm.text = "+" + countries[countryCode].phoneCode;
$.countryLabel.text = countries[countryCode].name;
var countryPickerValues = [];
var countryKeys = _.keys(countries);
for (i = 0; i < countryKeys.length; i++) {
  var countryKey = countryKeys[i];
  //배열로 만들고
  countryPickerValues.push([countryKey, countries[countryKey].name]);
}
//객체로 변환
countryPickerValues = _.object(countryPickerValues);
//Ti.API.debug("countryPickerValues : ", countryPickerValues);

// 국가 선택 피커
function onPopupCountryPicker(e) {
  $.phoneNm.blur();
  var columnPicker = Alloy.createWidget('danielhanold.pickerWidget', {
    id: 'countryPicker',
    outerView: $.getView(),
    hideNavBar: false,
    type: 'single-column',
    pickerValues: [countryPickerValues],
    selectedValues: [countryCode],
    onDone: function(e) {
      if(e.cancel) {
        //아무 동작이 없음.
      } else {
        //Ti.API.debug(e.data);
        countryCode = e.data[0].key;
        $.localNm.text = "+" + countries[countryCode].phoneCode;
        $.countryLabel.text = countries[countryCode].name;
      }
      $.phoneNm.focus();
    }
  });
}

// 인증코드 발송하기
var codeSendCount = 0;
var inWait = false;
var inDelay = false;
function onClickTryCode() {
  // 10초에 한번만 할 수 있게 차단
  if (inDelay) {
    Alloy.Globals.alert('tryCodeSendBetweenLimit');
    return;
  }
  inDelay = true;
  setTimeout(function(){
    inDelay = false;
  }, 1000 * 10);

  // 연속으로 3번 시도시 1분간 금지
  codeSendCount++;
  if (codeSendCount > 3) {
    if (!inWait) {
      inWait = true;
      setTimeout(function(){
        inWait = false;
        codeSendCount = 0;
      }, 1000 * 60);
    }
    Alloy.Globals.alert('tryCodeSendCountMax');
    return;
  }
  Alloy.Globals.startWaiting('verifyCodeSend');

  // Parse Cloud Code SMS Verification
  parseSMSVerification($.localNm.text, $.phoneNm.value);
}

// 인증번호 재요청
function onClickRetry() {
  // 인증번호 요청창으로 스크롤
  $.verifyCode.blur();
  $.scrollView.scrollToView($.requestView);
  $.phoneNm.focus();
}

// Parse Cloud Code를 이용해서 SMS 인증코드 전송 : 전송 전 User 처리
function parseSMSVerification(local, phone) {
  // (Iterate) phoneNm를 정규화하는 과정
  phone = (Alloy.Globals.util.getNumberOnly(phone) * 1).toString();
  var phoneNm = local + phone;

  // 폰번호 자리수 확인
  if (phone.length < 8) {
    Alloy.Globals.alert('verifyPhoneShort');
    return;
  }

  // Parse에서 쓰일 현재 User를 확인
  if (Parse.User.current()) {
    // 로그아웃 시킴
    Parse.User.logOut();
  }

  // 기존에 이 전화번호를 쓰는 유저를 찾기
  var query = new Parse.Query(Parse.User);
  query.equalTo("username", phoneNm);  // find all the women
  query.find({
    success: function(results) {
      //Ti.API.debug(results);

      // User가 있을때 바로 로그인
      if (results.length > 0) {
        // 로그인 해서 인증코드 발송
        parseSMSVerificationLoginTemp(results[0]);
      } else {
        // User 생성
        var user = new Parse.User();
        user.set("username", phoneNm);
        user.set("password", phoneNm + Ti.App.Properties.getString('Parse_PwdFix'));
        user.set("phone", phone);
        user.set("local", local);

        user.signUp(null, {
          success: function(user) {
            // Hooray! Let them use the app now.
            //Ti.API.debug(user);

            // 로그인 해서 인증코드 발송
            parseSMSVerificationLoginTemp(user);
          },
          error: function(error) {
            // Show the error message somewhere and let the user try again.
            Ti.API.error("parseSMSVerification / user create", error);

            Alloy.Globals.alert('tryAgainAlert');
          }
        });
      }
    },
    error: function(error) {
      Ti.API.error("parseSMSVerification / user query", error);

      Alloy.Globals.alert('tryAgainAlert');
    }
  });
}

// Parse.User.current() 를 쓰기 위해서 임시로 로그인 시키는 함수
function parseSMSVerificationLoginTemp(user) {
  Parse.User.logIn(user.get("username"), user.get("username") + Ti.App.Properties.getString('Parse_PwdFix'), {
    success: function(user) {
      // Do stuff after successful login.
      //Ti.API.debug(user);

      parseSMSVerificationCloudCode(user.get("local") + user.get("phone"));
    },
    error: function(error) {
      // The login failed. Check error to see why.
      Ti.API.error("parseSMSVerificationLoginTemp", error);

      Alloy.Globals.alert('tryAgainAlert');
    }
  });
}

// Parse Cloud Code를 이용해서 SMS 인증코드 전송 : Cloud Code 실행
function parseSMSVerificationCloudCode(phoneNm) {
  if (Parse.User.current()) {
    // 인증코드 전송

    var now = new Date();
    Parse.Cloud.run('sendVerificationCode', {
      "phoneNumber":phoneNm,
      "timezoneOffset": now.getTimezoneOffset(),
      "currentLanguage": Alloy.Globals.currentLanguage
    },
    {
      success: function(result) {
        //Ti.API.debug(result);
        Alloy.Globals.alert('verifyCodeSendSuccess').then(function () {
          setTimeout(function () {
            $.verifyCode.focus();
          }, 100);
        });
        // 인증코드 확인창으로 스크롤
        $.phoneNmLabel.text = phoneNm;
        $.phoneNm.blur();
        $.scrollView.scrollToView($.verifyView);
      },
      error: function(error) {
        Ti.API.error("sendVerificationCode", error);

        Alloy.Globals.alert('tryAgainAlert');
      }
    });
  }
}

// textfiled에서 입력되는 값을 확인
function onChangeVerifyCode() {
  var verifyCode = $.verifyCode.value;
  if (verifyCode.length >= 4) {
    checkVerifyCode();
  }
}

// Parse Cloud Code를 이용해서 SMS 인증코드 확인
function checkVerifyCode() {
  if (Parse.User.current()) {
    Alloy.Globals.startWaiting('verifyCodeCheck');

    // 인증코드 전송
    Parse.Cloud.run('verifyPhoneNumber', { "phoneVerificationCode":$.verifyCode.value }, {
      success: function(result) {
        $.verifyStatusImage.image = '/images/signin_check_box_selected.png';
        $.verifyFailMsgLabel.visible = false;
        $.verifyMsgLabel.visible = true;
        $.bottomLineVerifyFail.visible = false;
        $.bottomLineVerify.visible = true;

        Alloy.Globals.stopWaiting();

        //이름 입력창으로 이동
        $.verifyCode.blur();
        $.scrollView.scrollToView($.joinView);
        $.nameInput.focus();
      },
      error: function(error) {
        Ti.API.error("verifyPhoneNumber", error);

        $.verifyStatusImage.image = '/images/signin_x_box.png';
        $.verifyMsgLabel.visible = false;
        $.verifyFailMsgLabel.visible = true;
        $.bottomLineVerify.visible = false;
        $.bottomLineVerifyFail.visible = true;

        Alloy.Globals.stopWaiting();
        //Alloy.Globals.alert('verifyCodeFail');
      }
    });
  }
}

// 회원가입 완료하기
function onClickJoinComplete() {
  if(($.nameInput.value == '' || $.nameInput.value == null)){
    Alloy.Globals.alert('s_alertEmptyName');
  }else{
    var userName = $.nameInput.value;
    $.nameInput.blur();

    userNameUpdateAndLogin(userName);
  }
}
function userNameUpdateAndLogin(userName) {

  Alloy.Globals.startWaiting();
  // 회원이름 수정
  Parse.Cloud.run('userModify', {'name':userName}, {
    success: function(result) {
      //세션 토큰 저장
      Alloy.Globals.settings.set('User_sessionToken', Parse.User.current().getSessionToken()).save(null, {
        success: function (result) {
          Alloy.Globals.stopWaiting();
          // // 로그인 처리
          // userM.login();
          Alloy.Globals.loginC.requiredLogin();
        },
        error: function (error) {
          Ti.API.error("User_sessionToken save", error);

          Alloy.Globals.alert('tryAgainAlert');
        }
      });
    },
    error: function(error) {
      Ti.API.error("userModify", error);

      Alloy.Globals.alert('tryAgainAlert');
    }
  });

}

// close
Alloy.Globals.loginC.on('login:open',function(){
  $.getView().close();
});

// open event
$.getView().addEventListener('open', function() {
  $.phoneNm.focus();
});
// close event
$.getView().addEventListener('close', function() {

});

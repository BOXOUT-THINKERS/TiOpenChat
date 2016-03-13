var args = arguments[0] || {};

// User 객체 셋팅하는 코드. 이후 Parse의 User도 설정해줘야함. Parse.User.current에 대응하기 위해서.
var userM = Alloy.createModel('user');
// var settingsM = Alloy.Models.instance('settings');
// var contactsCol = Alloy.Collections.instance('contacts');

exports.doingSyncAddress = false;

// then restore or normal login, open main window
userM.on('login:init', function() {
  Ti.API.debug("User login:init : ", userM.id, userM.get("name"));
  // to singleton
  Alloy.Models.user = userM;
  // to global exist
  Alloy.Globals.user = Alloy.Models.instance('user');
  // login complete event
  $.trigger('login:user', Alloy.Globals.user);
});
// then login fail, open login view
userM.on('login:fail', function() {
  exports.requiredLogin();
});

// 외부로 드러낼 인터페이스
exports.requiredLogin = function() {
  //로그인 안되어 있으면 로그인 창 띄움.
  if(exports.isLogin()){
    Ti.API.debug("run userM.login");
    // 로그인 처리
    userM.login();

    // 메인 윈도우 열기
    Alloy.Globals.navigation.open();

    // join controller close
    $.trigger('login:open');
  }else{
    Ti.API.error("no sessiontoken, requiredLogin");
    Alloy.Globals.closeAllWindow();
    Alloy.createController('join').getView().open();
  }
};

// 로긴 여부 판단
exports.isLogin = function() {
  var loginData = Alloy.Globals.settings.get('User_sessionToken');
  var isLogin = loginData && _.size(loginData);
  //Ti.API.debug('loginData : ' + loginData);
  return isLogin;
};

// 로그아웃 처리
exports.logout = function(callback) {
  Alloy.Globals.settings.set('User_sessionToken', undefined).save();
  Alloy.Globals.user = null;

  // 로긴 이벤트 발생시킴 : parsePush 컨트롤러가 받는다.
  $.trigger('logout', userM);

  Alloy.Globals.closeAllWindow();

  _.isFunction(callback) && callback();
  Alloy.Globals.loginC.requiredLogin();

  // 메인 윈도우 닫기
  Alloy.Globals.navigation.topWindow.close();
};

// 회원 탈퇴 처리
exports.withdraw = function() {
  var user = Alloy.Globals.user;
  var withdrawUser = function(user) {
    // CC코드로 탈퇴처리
    Parse.Cloud.run('userModify', { "isWithdraw":true }, {
      success: function(result) {
        exports.logout();
      },
      error: function(error) {
        Ti.API.error("withdraw User Failed");
        Ti.API.error(error);
      }
    });
  };

  Parse.User.become(Alloy.Globals.settings.get('User_sessionToken')).then(function (user) {
    withdrawUser(user);
  }, function (error) {
    Ti.API.error(error);
  });
}

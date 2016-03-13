var Q = Alloy.Globals.Q;
var installation = Alloy.Models.instance('installation');

// iOS 용 Installation 처리용 모듈
// https://github.com/timanrebel/Parse 와 같은 형태를 이용해서 만듬
var iosPushService = module.exports = {};

// 객체 시작
iosPushService.start = function(dToken, option){
  // installation model을 저장하기
  // 필수 타입[ios] : deviceType,   deviceToken
  // 필수 타입[android] : deviceType, deviceToken, // gcm시 pushType과 gcmsenderid도.
  var args = {
    deviceType : "ios",
    appName: Ti.App.name,
    appVersion: Ti.App.version,
    appIdentifier : Ti.App.id,
    deviceToken: dToken,
    parseVersion : "rest"
  };

  return installation.save(args, option);
};

// 유저 세션 복원
iosPushService.authenticate = function (argument) {
  // void
};

// 채널 구독
iosPushService.subscribeChannel = function (channel) {
  // void
};

// 채널 구독 해지
iosPushService.unsubscribeChannel = function (channel) {
  // void
};

// 필드에 값을 저장
iosPushService.putValue = function (key, value) {
  // installation model에 값 지정해서 저장하기
  return installation.set(key, value).save();
};

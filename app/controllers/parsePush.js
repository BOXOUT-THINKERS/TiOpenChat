var ParsePush = (OS_IOS) ? require('services/iosPushService') : require('eu.rebelcorp.parse');
var userM = Alloy.Models.instance('user');
var installation = Alloy.Models.instance('installation');
var chatRoomCollection = Alloy.Collections.instance('chatRoom');


// 로긴 컨트롤러에서 발생시킨 이벤트를 처리 : 로긴
Alloy.Globals.loginC.on('login:after',function(){
  // Installation fetch
  if (Alloy.Globals.settings.get('Installation_randomId')) {
    installation.getByRandomId(Alloy.Globals.settings.get('Installation_randomId'))
      .then(function () {
        Ti.API.debug("fetched Installation : ", installation.attributes);

        Alloy.Globals.settings.set('Installation_objectId', installation.get('objectId')).save();
        // 로그인한 유저정보를 기록한다(User_objectId);
        registerLoginUserInfo();

        //////////////// default 설정값이 없는 경우만 초기화하는 부분///////////////////////////////
        // 로컬의 default 설정값 없을 경우 default 데이터 설정.
        if(Alloy.Globals.settings.get('Installation_channels_chat') === undefined){
          Ti.API.debug('settings 초기값 설정');
          //채팅알림, 공지/이벤트 알림, 방해금지시간설
          Alloy.Globals.settings.save({
            Installation_channels_chat : true,
            Installation_channels_event : true
          });
          //인스톨레이션 채널 초기화
          Alloy.Globals.parsePushC.overwriteChannels(["Chat","Event"]);

          //전체 푸쉬 알림에 대한 초기화.
          _updateUser({'isPermissionAllPush' : true, 'isUsingBanTime' : true});
        }
        ////////////////////////////////////////////////////////////////////////////////

      })
      .catch(function (error) {
        // Handle any error from all above steps
        Ti.API.error("Installation fetch Fail : " + error);

        Alloy.Globals.settings.set('Installation_randomId', undefined).save();
        Alloy.Globals.settings.set('Installation_objectId', undefined).save();
      });
  }
});

// 로긴 컨트롤러에서 발생시킨 이벤트를 처리 : 로그아웃
Alloy.Globals.loginC.on('logout',function(){
  unregisterLoginUserInfo();
});

// Installation을 등록
exports.regist = function() {
  if (OS_IOS) {
    tryRegisterPush();
  } else {
    ParsePush.start();
    ParsePush.enablePush();

    afterRegisterDevice();

    //푸쉬알림 도착에 대한 반응.
    ParsePush.addEventListener('notificationreceive', function(e) {
      receivePush(e);
    });
    //푸쉬 알림을 클릭했을 때의 반응
    ParsePush.addEventListener('notificationopen', function(e) {
      receivePush(e, true); //isClick
    });

    //앱을 켰으니 푸시를 다 지워주자
    exports.notificationClear();
  }
};
exports.put = function (key, value) {
  ParsePush.putValue(key, value);
}
exports.push = function(type, message, toUserIds) {
  var currentUser = Alloy.Globals.user.getInfo();
  var messageText = message.text ? message.text : '';

  var query = {
    userIds : toUserIds
  };

  var data = {
    title : L("c_TiOpenChat"),
    //TODO[faith] : 유저의 별칭을 보여줘야할까? 이름을보여줘야할까? 어떻게 판단해야하지?
    alert : (currentUser.name) ? currentUser.name + " : " + messageText : messageText,
    badge : "Increment",
    sound : "default",

    roomId : message.roomId
  };


  //개별처리
  //TODO[faith]: 사실. 거의 같은동작인데...개별처리라 할만한부분이있나.
  switch(type) {
    case "chat:message" :
      query.channels = ["Chat"];

      data.type= type;
      //제목
      // data.title= "메시지 알림";
      //푸쉬 알림에서 내용임
      // data.alert= messageText;
      data.fromUserId=message.fromUserId;
      // data.roomId= message.roomId;
      // data.badge= "Increment";
      // data.sound= "default";
    break;

    case "request:where" :

      data.type= type;
      //제목
      // data.title= "위치요청알림";
      //푸쉬 알림에서 내용임
      // data.alert= messageText;
      data.requestCount = message.requestCount;
      data.fromUser=message.fromUser;
      data.toUser=message.toUser;
      data.fromUserId=message.fromUser.id;
      // data.roomId= message.roomId;
      // data.badge= "Increment";
      // data.sound= "default";
    break;

    case "receive:where" :

      data.type= type;
      //제목
      // data.title= "위치요청응답";
      //푸쉬 알림에서 내용임
      // data.alert= messageText;
      data.fromUser=message.fromUser;
      data.fromUserId=message.fromUser.id;
      data.toUser=message.toUser;
      // data.roomId= message.roomId;
      // data.badge= "Increment";
      // data.sound= "default";
    break;

    default:break;
  };

  Parse.Cloud.run('sendPush',{query:query, data:data},{
    success:function(r){
      Ti.API.debug(r);
    },
    error:function(e){
      Ti.API.debug(e);
    }
  });


}

// 채널 정보 무시하고 덮어쓰기
exports.overwriteChannels = function (channels) {
  if(!_.isArray(channels)) { channels = [channels]; }

  return installation.changeChannels(channels)
    .then(function (currentChannels) {
         return currentChannels;
    });
}

// 채널 구독. 한번에 여러채널도 구독가능하게 코딩하다니 faith님 오바다
exports.subscribeChannels = function (channels) {
  if(!_.isArray(channels)) { channels = [channels]; }
  var currentChannels = installation.get("channels");
  if (!currentChannels) { currentChannels = []; }

  for(var i=0,max=channels.length; i<max; ++i) {
    var channel = channels[i];
    if(!_.contains(currentChannels, channel)) {
      currentChannels.push(channel);
    }
  }

  return installation.changeChannels(currentChannels)
    .then(function () {
         return currentChannels;
    });
}

// 채널 구독 해지. 한번에 여러채널도 구독가능하게 코딩하다니 faith님 오바다
exports.unsubscribeChannels = function (channels) {
  if(!_.isArray(channels)) { channels = [channels]; }
  var currentChannels = installation.get("channels");
  if (!currentChannels) { currentChannels = []; }

  for(var i=0,max=channels.length; i<max; ++i) {
    var channel = channels[i];
    if(_.contains(currentChannels, channel)) {
      currentChannels =  _.without(currentChannels, channel)
    }
  }

  return installation.changeChannels(currentChannels)
    .then(function () {
         return currentChannels;
    });
}

// 화면에 push 팝업을 띄워준다. 메시지로 부터
exports.popupFromMessage = function (messageModel) {
  // 화면에 push 팝업을 띄워준다. 방에 입장했다는 enter:receiver메시지는 보여주지않음.
  popupDisplay({
    roomId : messageModel.get('roomId'),
    fromUserId : messageModel.get('fromUserId'),
    content : messageModel.get('text'),
    type : messageModel.get('type'),
    requestCount : messageModel.get('requestCount'),
    thumbnailUrl : messageModel.get('thumbnailUrl'),
    location : messageModel.get('location') || {}
  });
}

exports.notificationClear = function () {
  if (OS_ANDROID) {
    ParsePush.notificationClear();
  }
}

// Parse Installation에 user정보 기록
function registerLoginUserInfo(){
  //Ti.API.debug("registerLoginUserInfo");
  //Ti.API.debug(userM.get("id"));
  if(userM.get("id")){
    ParsePush.putValue('User_objectId', userM.get("id"));
  }
}

// Parse Installation에 user정보 삭제
function unregisterLoginUserInfo(){
  ParsePush.putValue('User_objectId', '');
}

// push를 받았을 때 처리하는 부분
function receivePush(msg, isClick) {
  //체크
  if(OS_IOS){
    msg = msg.data;
    if (Alloy.Globals.appOnline) {
      //앱이 온라인 일때 온 푸시는 방을 열지 않음
      if(!Alloy.Globals.user){
        // 로긴전인 상태인데 푸시가 온경우
        $.on('parsePush:ready', function() {
          _doByReceivedPush(msg, false);
          Alloy.Globals.chatListC.off('parsePush:ready', arguments.callee);
        });
      }else{
        _doByReceivedPush(msg, false);
      }
    } else {
      //앱이 오프라인 일때 온 푸시는 그걸 눌렀을때만 푸시 콜백이 발생하므로 방을 열어준다.
      if(!Alloy.Globals.user){
        // 로긴전인 상태인데 푸시가 온경우
        $.on('parsePush:ready', function() {
          _doByReceivedPush(msg, true);
          Alloy.Globals.chatListC.off('parsePush:ready', arguments.callee);
        });
      }else{
        _doByReceivedPush(msg, true);
      }
    }
  }else{
    _doByReceivedPush(msg, isClick);
  }
  //do
}
function _doByReceivedPush(msg, isClick) {
  if(!Alloy.Globals.user) return;

  var myId = Alloy.Globals.user.get('id');

  var fromUserId = msg.fromUserId;

  var title = msg.title;
  var content = msg.alert;
  var roomId = msg.roomId;

  Ti.API.debug('receivePush :', msg.alert);
  switch(msg.type) {
    case "chat:message":
    case "request:where":
      // 눌러서 열었을 때는 방을 띄워줌,iOS는 앱이 foreground일때는 push가 쌓이지 않음
      if(isClick) {
        Ti.API.debug('open chat from notify',msg.alert);
        chatRoomCollection.getOrCreate(roomId, [myId, fromUserId], myId)
          .then(function(chatRoomM){
            Alloy.Globals.menuC.trigger('menuclick', {
              itemId:'chatlist',
              isNotToggle:true
            });

            return Alloy.Globals.chatViewManager.openView(chatRoomM);
          })
          .fail(function(error) {
            Ti.API.error(error);
          });
      }
    break;
    default:
    break;
  }

  // 화면에 push 팝업을 띄워준다.
  if(!isClick) {
    popupDisplay({
      roomId : roomId,
      fromUserId : fromUserId,
      content : content,
      type : msg.type,
      requestCount : msg.requestCount
    });
  }
}

// badge set
function setBadge(number) {
  // string이면 기존 숫자에 가감을 하고, integer면 바로 반영을 합니다.
  if( _.isString(number) ){
    number =  Ti.UI.iPhone.getAppBadge() + parseInt(number);
    number = (number<0)? 0: number;
  }
  Ti.App.fireEvent( "changeBadge", {"number": number});

  //installataion에도 badge수 저장
  installation.set('badge', number).save();
}
exports.setBadge = setBadge;

// 디바이스 등록후 해야할 일
function afterRegisterDevice(e) {
  // randomId를 이용해서 로그인 이후에 installation 객체 가져오기 위해서
  if (!Alloy.Globals.settings.get('Installation_randomId')) {
    var randomId = _.random(0, 1000000) + "" +  Date.now();
    ParsePush.putValue('randomId', randomId);
    Alloy.Globals.settings.set('Installation_randomId', randomId).save();
  }

  // Timezone 설정하는 곳 코딩해야 함
  // TODO
}

/**
 * 화면에 push 팝업을 띄워줌
 * roomId :
 * fromUserId :
 * content :
 * type : from Push ("chat:message", "request:where") / from Message ("send:message", "request:where")
 * requestCount :
 * thumbnailUrl :
 */
var beforLocation = { latitude : 0, longitude : 0 };
function popupDisplay(params) {
  // 로그인전에는 띄우지 않는다.
  if(!Alloy.Globals.user) {
    return;
  }

  // 회원정보 가져오기
  // 채팅방 정보
  var chatRoomM = chatRoomCollection.getBy(params.roomId);
  if (_.isEmpty(chatRoomM)) {
    return;
  }
  var inUsers = chatRoomM.getInUsers();
  var targetUser = _.findWhere(inUsers, { id : params.fromUserId });
  var friendInfo = {
    friend : targetUser || {}
  };
  // id : inUser.objectId,
  // name : inUser.name,
  // imageUrl :imageUrl,
  // comment : inUser.comment

  // 위치정보 일 경우 이전 위치랑 비교해서 소수점 4 이내의 변동이면 표시하지 않기
  if (params.type == "send:location") {
    if (!_.isEmpty(params.location) && params.location.latitude && params.location.longitude) {
      // 비교
      var diffLatitude = parseFloat(parseFloat(params.location.latitude).toFixed(4)) - parseFloat(parseFloat(beforLocation.latitude).toFixed(4));
      var diffLongitude = parseFloat(parseFloat(params.location.longitude).toFixed(4)) - parseFloat(parseFloat(beforLocation.longitude).toFixed(4));
      if (!diffLatitude && !diffLongitude) {
        return;
      } else {
        beforLocation = params.location;
        // 팝업 표시
        doPopupDisplay();
      }
    } else {
      //위경도가 없는 단순 주소는 표시하지 않기
      return;
    }
  } else {
    // 팝업 표시
    doPopupDisplay();
    return;
  }

  function doPopupDisplay() {
    // 팝업 표시
    Alloy.createController('pushPopup', _.extend(params, friendInfo));
  }
}

if (OS_IOS) {
  var deviceToken = null;
  // Check if the device is running iOS 8 or later

  var onRegistSuccess = function(e) {
    ParsePush.start(e.deviceToken,{
      success : function(){
        afterRegisterDevice();
      }
    });
  };

  var onRegistError = function(e){
    Alloy.Globals.alert('푸시 알림 등록을 실패했습니다.');
    Ti.API.debug(e);
  };

  var tryRegisterPush = function(args){
    args = args || {};
    if (OS_IOS && parseInt(Ti.Platform.version.split(".")[0]) >= 8) {

      // Wait for user settings to be registered before registering for push notifications
      Ti.App.iOS.addEventListener('usernotificationsettings', function registerForPush() {

        // Remove event listener once registered for push notifications
        Ti.App.iOS.removeEventListener('usernotificationsettings', registerForPush);

        Ti.Network.registerForPushNotifications({
          success: function(e){
            onRegistSuccess(e);
            _.isFunction(args.success) && args.success();
          },
          error: function(e){
            onRegistError(e);
            _.isFunction(args.error) && args.error();
          },
          callback: receivePush
        });
      });

      // Register notification types to use
      Ti.App.iOS.registerUserNotificationSettings({
        types: [
          Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,
          Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
          Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE
        ]
      });
    } else {  // For iOS 7 and earlier
      Ti.Network.registerForPushNotifications({
        // Specifies which notifications to receive
        types: [
          Ti.Network.NOTIFICATION_TYPE_BADGE,
          Ti.Network.NOTIFICATION_TYPE_ALERT,
          Ti.Network.NOTIFICATION_TYPE_SOUND
        ],
        success: function(e){
          onRegistSuccess(e);
          _.isFunction(args.success) && args.success();
        },
        error: function(e){
          onRegistError(e);
          _.isFunction(args.error) && args.error();
        },
        callback: receivePush
      });
    }
  };
}
//private helper
function _updateUser(data) {
  //로컬에 반영
  var userM = Alloy.Globals.user.attributes;
  userM.set(data, {change:false});

  //서버에 반영.
  Parse.Cloud.run('userModify', data, {
    success: function(result) {
      Ti.API.debug('parsePush:UserModify success');
    },
    error: function(error) {
      //TOOD[faith] : 이전값 저장해두었다가 되돌리는 코드가필요함.
      Ti.API.debug('parsePush:UserModify error : ', error);
    }
  });
};

// regist 강제 실행
exports.regist();

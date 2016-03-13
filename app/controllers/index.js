Alloy.Globals.navigation = $.index;
Alloy.Globals.menuC = $.menuC;
Alloy.Globals.loginC = Alloy.createController('login');

// for test code
// Alloy.createCollection('settings').cleanup();

// setting fetch
Alloy.Globals.settings = Alloy.Models.instance('settings');
Alloy.Globals.settings.fetch({
  success: function(results) {
    Ti.API.debug("settings.fetched");
    Alloy.Globals.loginC.requiredLogin();
  },
  error: function(error) {
    Ti.API.error("settings.fetched" + JSON.stringify(error));
    Alloy.Globals.loginC.requiredLogin();
  }
});;

// 초기 로딩
$.centerWindow.addEventListener('open', function(e) {
  Alloy.Globals.startWaiting('c_waitingMsgFirst');

  // 대화목록
  Alloy.Globals.chatListC = Alloy.createController('chat/chatList');
  // 초기 데이터 로딩 (연락처, 채팅방, 메시지)
  if (Alloy.Globals.user) {
    Alloy.Globals.chatListC.fetchInitialData('sync');
  } else {
    Alloy.Globals.loginC.on('login:user',function(){
      Alloy.Globals.chatListC.fetchInitialData('sync');
    });
  }

  // 대화목록 로딩 완료후에 할일 들 잔뜩
  Alloy.Globals.chatListC.on('start:complete', function() {
    // firebase 컨트롤러
    _.defer(function() {
      if (!Alloy.Globals.firebaseC) {
        Alloy.Globals.firebaseC = Alloy.createController('firebase');
        Alloy.Globals.firebaseC.on('receive:message', function(message) {
          Alloy.Globals.chatService._onReceiveMessage(message);
        });
      }
      Alloy.Globals.firebaseC.listenStart(Alloy.Globals.user.get('id'));

      _.defer(function() {
        // 채팅방에 입장해도 되는 타이밍
        Alloy.Globals.chatListC.trigger('firebase:ready');

        // Push 컨트롤러
        _.defer(function() {
          if (!Alloy.Globals.parsePushC) {
            Alloy.Globals.parsePushC = Alloy.createController('parsePush');
          }

          // 로긴 완료 이벤트 발생시킴 - 현재는 수신하는 곳이 parsePushC뿐...
          _.defer(function() {
            Alloy.Globals.loginC.trigger('login:after', Alloy.Globals.user);

            // Push 관련된 이벤트 전달
            _.defer(function() {
              Alloy.Globals.parsePushC.trigger('parsePush:ready');

              // 알림을 클릭시 처리
              _.defer(function() {
                if (OS_ANDROID) {
                  //알림을 클릭시만.
                  var notifyStr = null;
                  if(Titanium.App.Android.launchIntent && Titanium.App.Android.launchIntent.getStringExtra){
                    notifyStr = Titanium.App.Android.launchIntent.getStringExtra('com.parse.Data');
                  }

                  if (notifyStr) {
                    var msg = JSON.parse(notifyStr);
                    //백그라운드에서 알림 클릭
                    var chatRoomCollection = Alloy.Collections.instance('chatRoom');

                    if(Alloy.Globals.user && msg.roomId && msg.fromUserId){
                      var myId = Alloy.Globals.user.get('id');
                      chatRoomCollection.getOrCreate(msg.roomId, [myId, msg.fromUserId], myId)
                        .then(function(chatRoomM){
                          return Alloy.Globals.chatViewManager.openView(chatRoomM);
                        })
                        .fail(function(error) {
                          Ti.API.error(error);
                        });
                    }
                  }
                }

                //타임존오프셋설정.
                _.defer(function() {
                  var now = new Date();
                  Parse.Cloud.run('userModify', {
                    "timezoneOffset":now.getTimezoneOffset(),
                    "currentLanguage": Alloy.Globals.currentLanguage
                  });

                  // 시작 프로세스가 완전히 끝남음을 알림
                  _.defer(function() {
                    Alloy.Globals.appStartProcess = false;
                    Alloy.Globals.chatListC.startComplete = true;
                    Alloy.Globals.chatListC.trigger('appStartProcess:complete');
                    Ti.API.debug('==============================================================');
                    Ti.API.debug('실행 초기화 마무리작업끝');
                    Ti.API.debug('==============================================================');
                  });
                });
              });
            });
          });
        });
      });
    });

    Alloy.Globals.chatListC.off('start:complete',arguments.callee);
  });

  // 열자
  changeCenterView(Alloy.Globals.chatListC, 'chatlist');

  $.centerWindow.removeEventListener('open',arguments.callee);
});

// 창 전환 이벤트 처리
var addHandler = function() {
  Alloy.Globals.appOnline = true;
  if (Alloy.Globals.firebaseC) {
    Alloy.Globals.firebaseC.goOnline();
  }

  // android 앱을 켜면 푸시를 정리해주자
  if (OS_ANDROID) {
    if (Alloy.Globals.parsePushC) {
      Alloy.Globals.parsePushC.notificationClear();
    }
  }
};
var removeHandler = function() {
  Alloy.Globals.appOnline = false;
  // 대화방이 열려있는 경우를 제외하면 firebase를 offline으로 변경한다
  if (Alloy.Globals.firebaseC && !(Alloy.Globals.chatViewManager && Alloy.Globals.chatViewManager.currentOpenedRoomId)) {
    Alloy.Globals.firebaseC.goOffline();
  }

  // iOS 읽지 않은 게시물 수 만큼 뱃지 갯수 설정
  if (OS_IOS) {
    if (!_.isEmpty(Alloy.Globals.user) && Alloy.Globals.parsePushC) {
      var myId = Alloy.Globals.user.get('id');
      var models = Alloy.Collections.instance('message').where({isRead: false});
      var badgeCount = _.filter(models, function(model){
        return (model.get('fromUserId') != myId && (model.get('type') == "send:message" || model.get('type') == "request:where")) ? true : false;
      }).length;
      Alloy.Globals.parsePushC.setBadge(parseInt(badgeCount));
    }
  }
};

var Context = require('Context');

function onOpen(evt) {
  Ti.API.debug("Open Event");

  Ti.App.addEventListener('resumed', addHandler);
  Ti.App.addEventListener('paused', removeHandler);
  if (OS_ANDROID) {
    Context.on('index', this.activity);
  }
}

function onClose(evt) {
  Ti.API.debug("Close Event");

  if (OS_ANDROID) {
    Context.off(this.activity);
  }
  removeHandler();

  Ti.App.removeEventListener('resumed', addHandler);
  Ti.App.removeEventListener('paused', removeHandler);
}

// 오른쪽 버튼 설정 공통 기능
function rightBtnSet(params) {
  if (params && params.rightBtnOption && params.rightBtnFn) {
    if (OS_IOS) {
      var rightMenuView = Ti.UI.createView();
      var rightBtn = Ti.UI.createButton(params.rightBtnOption);
      rightBtn.addEventListener("click", function(e) {
        params.rightBtnFn(rightBtn);
      });
      rightMenuView.add(rightBtn);
      $.centerWindow.rightNavButton = rightMenuView;

      //중앙텍스트변경
      if(params.centerTitle){
        //타이틀
          $.centerWindow.titleControl= Ti.UI.createLabel({
            text: params.centerTitle,
            color: 'white' ,
            font: {
            fontSize: '17',
            fontFamily: 'AppleSDGothicNeo-SemiBold'
          }
        });
        Ti.API.debug('title확인',$.centerWindow.titleControl.text);
      }
    } else {
      var activity = $.centerWindow.getActivity();

      //중앙텍스트변경
      if(params.centerTitle && activity.actionBar){
        activity.actionBar.title = params.centerTitle;
        Ti.API.debug('title확인',activity.actionBar.title);
      }
      activity.onCreateOptionsMenu = function(e) {
        Ti.API.debug("Menu Redraw");
        var rightBtn = e.menu.add(params.rightBtnOption);
        rightBtn.setShowAsAction(Ti.Android.SHOW_AS_ACTION_ALWAYS);
        rightBtn.addEventListener("click", function(e) {
          params.rightBtnFn(rightBtn);
        });
      };
      activity.invalidateOptionsMenu();
    }
  }
}

var _currentViewName;
var _currentController;
function changeCenterView(controller, viewName) {
  if(_currentViewName == viewName) {
    return;
  }

  //간혹 오프라인이 될때가 있어서 처리
  addHandler();

  // 에러 방지
  try {
    // right Button 관련 처리
    if (_.isFunction(controller.rightBtn)) {
      rightBtnSet(controller.rightBtn());
    }
  } catch(e) {  }

  // 에러 방지
  try {
    // open 이벤트 명시적 처리
    if (_.isFunction(controller.openFn)) {
      controller.openFn();
    }
  } catch(e) {  }

  // 화면을 바꾸자
  $.index.setCenterView(controller.getView()); //Arg shold be View(not window)

  // 에러 방지
  try {
    // exit 이벤트 명시적 처리
    if (_.isFunction(_currentController.closeFn)) {
      _currentController.closeFn();
    }
  } catch(e) {  }

  _currentViewName = viewName;
  _currentController = controller;

  // 메모리 관리를 위해 친구목록은 지워주기
  // if (viewName != 'contacts' && Alloy.Globals.contactsC) {
  //   Alloy.Globals.contactsC = null;
  // }
}

// 안드로이드 백버튼으로 종료될 때
function indexBackButton() {
  if (OS_ANDROID) {
    Ti.API.debug("Android Back button on Index  ");

    Alloy.Globals.closeAllWindow();

    var intent = Ti.Android.createIntent({
      action: Ti.Android.ACTION_MAIN
    });
    intent.addCategory(Ti.Android.CATEGORY_HOME);
    Ti.Android.currentActivity.startActivity(intent);
  }

  return false;
}


function onMenuButtonClick(e){
  $.index.toggleLeftView();
}

function onDrawerOpen(e) {
  Ti.API.debug($.index.isLeftDrawerOpen);
}

function onDrawerClose(e) {
  Ti.API.debug($.index.isLeftDrawerOpen);
}


$.menuC.on('menuclick',function(e){

  switch(e.itemId){
    case 'contacts':
      // if (!Alloy.Globals.contactsC) {
      // }
      changeCenterView(Alloy.createController('contacts'), e.itemId);
    break;
    case 'chatlist':
      changeCenterView(Alloy.Globals.chatListC, e.itemId);
    break;
    case 'setting':
      changeCenterView(Alloy.createController('setting/setting'), e.itemId);
    break;

    default:
      // Alloy.Globals.openWindow(e.itemId);
      //$.index.openWindow(Alloy.createController(e.itemId).getView());
    break;
  }

  //직접 클릭외 이벤트 발생시 토글되지않도록메뉴열기위해 추가.
  if(!e.isNotToggle){
     $.index.toggleLeftView({animated:false}); //animated option only work on ios
  }
});

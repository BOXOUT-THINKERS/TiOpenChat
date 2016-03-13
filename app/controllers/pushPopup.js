var chatViewManager = Alloy.Globals.chatViewManager;
var chatRoomCol = Alloy.Collections.instance('chatRoom');

var args = arguments[0] || {};
var nowPopup = false;
var popUpIndex = 0;

/**
 * 화면에 push 팝업을 띄워줌
 * roomId :
 * fromUserId :
 * content :
 * type : from Push ("chat:message", "request:where") / from Message ("send:message", "request:where", "send:location", "request:where", "notify:where")
 * requestCount :
 * thumbnailUrl :
 * friend { id, name, imageUrl, comment }
 * location
 */

// 값을 셋팅한다.
$.profileImage.image = args.friend.imageUrl;
$.profileName.text = args.friend.name;
$.msgLabel.text = args.content;
if (args.thumbnailUrl) {
  // 사진이 옴
  $.msgtypeIcon.image = '/images/push_photo_badge.png';
} else if (args.type == "request:where" || args.type == "request:where") {
  // 쪼기
  $.msgtypeIcon.image = '/images/push_peck_badge.png';
} else if (args.type == "send:location") {
  // 위치정보
  $.msgtypeIcon.image = '/images/push_mappin_badge.png';
  if (args.location && args.location.address) {
    if (args.location.address.street) {
      $.msgLabel.text = args.location.address.street + L('c_locationPopupPush');
    } else if (args.location.address.city) {
      $.msgLabel.text = args.location.address.city + L('c_locationPopupPush');
    } else if (args.location.address.country) {
      $.msgLabel.text = args.location.address.country + L('c_locationPopupPush');
    }
  }
} else {
  $.msgtypeIcon.image = null;
}

// 현재 윈도우를 찾아서
var win = findCurrentWindow();
if (win) {
  popUpIndex++;

  // 화면을 연다.
  show();

  setTimeout(hide, 3000);
}

function show() {
  // 현재화면에 더한다.
  win.add($.popupView);

  // 열자
  // enterAnimation
  $.popupView.animate({
    duration: 200,
    top: 0
  },function(){
    Ti.API.debug("pushPopup Show");
  });
}

function hide() {
  var cwin = findCurrentWindow();

  // 현재창일 때만 애니메이션 표시
  if (win.id == cwin.id) {
    // exitAnimation
    try {
      $.popupView.animate({
        duration: 200,
        top: -73
      },function(){
        Ti.API.debug("pushPopup Hide");
        win.remove($.popupView);
      });
    } catch(e) {
      // 애니메이션 에러 나면 그냥 없애버림
      win.remove($.popupView);
    }
  } else {
    // 현재 윈도우와 다르면 animate없이 그냥 없애버림
    win.remove($.popupView);
  }
}

function findCurrentWindow() {
  var win = Alloy.Globals.currentWindow;
  if (_.isEmpty(win)) {
    if (OS_IOS) {
      win = Alloy.Globals.navigation.topWindow.window
    } else {
      for (var x in Alloy.Globals.navigation.topWindow.children) {
        if (Alloy.Globals.navigation.topWindow.children[x].centerView) {
          win = Alloy.Globals.navigation.topWindow.children[x].centerView;
          break;
        }
      }
    }
  }
  if (_.isEmpty(win)) {
    Ti.API.error("pushPopup : Window Not found");
    return false;
  }

  return win;
}

function openChatRoom(e) {
  if (args.roomId) {
    chatRoomCol.getOrCreate(args.roomId)
    .then(function(chatRoomM){
      chatC = chatViewManager.getOrCreate(chatRoomM);
      // 채팅창이 열려있지 않다면
      if (!chatC.isOpenedChatRoom) {
        // 현재 열린 창이 있으면 일단 닫고
        if (Alloy.Globals.currentWindow) {
          Alloy.Globals.currentWindow.close();
        }

        // 채팅 목록부터 열고
        Alloy.Globals.menuC.trigger('menuclick', {
          itemId:'chatlist',
          isNotToggle:true
        });

        //chatViewManager.openView(chatRoomM);
        var openView = function() {
            chatViewManager.openView(this.chatRoomM);
          };
        openView = _.bind(openView,  { chatRoomM : chatRoomM });
        _.delay(openView, 100);
      }
    }).fail(function(error) {
      Ti.API.error(error);
    });
  }
}

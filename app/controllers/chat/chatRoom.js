var args = arguments[0] || {};
var Q = require('q');

// $.notifyMeBtn.title = L('nm_notifyMe');
$.innerLeftText.text = L('ri_sir');
$.innerRightText.text = L('ri_pecking');
$.sendBtn.title = L('cr_send');
$.cityMsg1_1.text = L("nm_cityMsg1");
// $.cityMsg1_2.text = L("nm_cityMsg1");

/**************************************************************************************************************
 * 채팅 관련 변수
 **************************************************************************************************************/
//chatViewManager에서 chatRoom컨트롤러를 관리하기위해 아래 두가지 값을 노출하여 식별값으로 사용함.
exports.roomId      = args.roomId;
exports.inUserIds   = args.inUserIds;
var chatRoomCollection = Alloy.Collections.instance('chatRoom');
var chatRoomM = null;
exports.chatRoomM = null;
exports.refeshLinkToChatRoomM = function() {
  var refreshedChatRoomM = chatRoomCollection.getBy(exports.roomId);
  //리프레쉬된것있을경우만
  if(!_.isEmpty(refreshedChatRoomM)){
    if (chatRoomM) {
      chatRoomM.off('receive:message',messageAdded);
    }

    chatRoomM = refreshedChatRoomM
    exports.chatRoomM = chatRoomM;
    //메시지 추가 이벤트.
    chatRoomM.on('receive:message',messageAdded);
  }
};
// 초기 생성시 실행
exports.refeshLinkToChatRoomM();

var currentUser = Alloy.Globals.user.getInfo();
var currentUserId   = Alloy.Globals.user.get('id');
var chatService = Alloy.Globals.chatService;
var messageCollection = Alloy.Collections.instance('message');

var remotePhotoService = require('services/remotePhotoService');
var localPhotoService = require('services/localPhotoService');

var contactsColllection = Alloy.Collections.instance('contacts');

var _isFirstRun = true;
// 이방이 현재 열려 있는가
exports.isOpenedChatRoom = false;
// 방 오픈 후 타이밍 제어용
exports.isOpenedTiming = false;
// settimout 체크용 이방에 방문한 index
var isOpenedCount = 0;
var isSetTimeoutCount = 0;

// 포커스 이벤트 제어용
var onFocusRun = false;
// 친구설정
var friendId = _.without(exports.inUserIds, currentUserId)[0];
var friendContactM = null;
var imageUrlBefore = null;
exports.refeshLinkToContactsM = function() {
  if (friendContactM) {
    friendContactM.off('fetch', friendContactMChange);
  }

  //현재는 1:1이니 타겟은 나를제외하면 한명이됨.
  friendContactM = contactsColllection.getBy(friendId);

  friendContactMChange();
  friendContactM.on('fetch', friendContactMChange);

  function friendContactMChange() {
    if(!friendContactM.isRegister()){
      var ___friendInfo = chatRoomM.getFriendInfo(currentUserId);
      friendContactM.set('User_object_To',___friendInfo);
    };

    //방과 연관된 것 갱신
    friendInfo = friendContactM.getUserInfo();
    _updateFriendRoomData(friendInfo);

    //현재 가진 연관 메시지뷰 갱신.
    var items = $.messageSection.items;
    // Ti.API.debug('----------------change', items)
    var imageUrl = friendInfo.imageUrl ||  "/images/friendlist_profile_default_img.png";
    if (imageUrlBefore != imageUrl) {
      imageUrlBefore = imageUrl;
      for(var i=0,max=items.length; i<max; ++i){
        var item = items[i];
        if(item.friendImage && (!item.friendImage.image || item.friendImage.image != imageUrl) ) {
          item.friendImage.image = imageUrl;
          $.messageSection.updateItemAt( i, item, {animated:false} );
        }
      }
    }
  }
};
// 초기 생성시 실행
exports.refeshLinkToContactsM();

exports.delayedTextMessageRows = [];
exports.delayedEnterReceiverModel = null;
// 현재 보여지는 인덱스 정보
var listVisibleItemIndex = 0;

/**************************************************************************************************************
 * 채팅 관련 코드 코드
 **************************************************************************************************************/
 //---------------------------------키보드 및 화면전환 관련 시작
// chatView 크기를 고정된 요소를 이용하여 조절하기 위해 각 고정크기의 요소에 대한 상태를 VIEW_HEIGHT에서 유지한다.
var DEFULAT_HEIGHT = {
  keyboard:0, //keyboardframechanged 리스너에서 할당.
  chatView : $.chatView.height,
  inputMsgView : Number($.inputMsgView.height),
}
//현재 상태.
var VIEW_HEIGHT = _.clone(DEFULAT_HEIGHT);

var CONTENT_VIEW_STATE = { keyboard:false}; //chat:true 항상같으니 생략.

var keyboardFrameChanged = function(e) {
  Ti.API.debug('keyboardframechanged / e.keyboardFrame.height :', e.keyboardFrame.height);

  //처음에 값이 없을 경우는 focus,blur가 아닌 여기서 msgVIew사이즈 조절해야함.
  if(e.keyboardFrame.height > 0 && DEFULAT_HEIGHT.keyboard != e.keyboardFrame.height){
    DEFULAT_HEIGHT.keyboard = e.keyboardFrame.height;
    VIEW_HEIGHT.keyboard = e.keyboardFrame.height;

    CONTENT_VIEW_STATE.keyboard = true;
    _changeContenViewHeight();
  }
}

//var _isFirstFocusForAndroid = false; //open시마다 false해줘야함.
$.inputMsg.addEventListener('focus', function(e) {
  Ti.API.debug("inputMsg / focus event");

  //처음오픈되었을때 키보드 height 값이 없으므로 keyboardframechanged리스너에서 사이즈조절해줌.
  if(DEFULAT_HEIGHT.keyboard != 0) {
    VIEW_HEIGHT.keyboard = DEFULAT_HEIGHT.keyboard;
  }

  //이미 클릭되어있을경우. 중복막기.
  if(CONTENT_VIEW_STATE.keyboard){
  }else{
    CONTENT_VIEW_STATE.keyboard = true;
    _changeContenViewHeight();
  }
});

$.inputMsg.addEventListener('blur', function(e) {
  Ti.API.debug("inputMsg / blur event");
  //이미 해제되어있을경우. 중복막기.
  if(!CONTENT_VIEW_STATE.keyboard){
  }else{
    CONTENT_VIEW_STATE.keyboard = false;
    if(OS_IOS) { VIEW_HEIGHT.keyboard = 0;}
    _changeContenViewHeight();
  }
});

// TODO[faith]: 안드로이드에서 의도치 않은 blur가 메시지 전송, 상대 메시지 추가시에 발생한다.
// 그래서 명시적으로 호출할경우만 원하는동작하도록 변경.
function explicitBlur() {
  if (CONTENT_VIEW_STATE.keyboard) {
    $.inputMsg.blur();
  }
}

function inputFocus() {
  if (!CONTENT_VIEW_STATE.keyboard) {
    $.inputMsg.focus();
  }
}

//키보드 크기 및 고정크기인 다른 요소의 현재 height를 이용하여 chatView와 inputMsg의 위치를 조절한다.
var firstChangeKeyboardUp = false;
function _changeContenViewHeight() {
  //1.기본 레이아웃조절.
  //키보드에 따른 전체 크기조절. 안드로이드는 자동조절됨.
  if(OS_IOS){
    $.inputMsgView.bottom = VIEW_HEIGHT.keyboard;
    $.contentViewWrap.bottom = VIEW_HEIGHT.inputMsgView + VIEW_HEIGHT.keyboard;
  }else{
    $.contentViewWrap.bottom = VIEW_HEIGHT.inputMsgView;
    //안드로이드는 자동조절.
  }

  $.chatViewInnerBackgroud.backgroundColor = "#dbf1ea";
  $.chatView.height = Titanium.UI.FILL;

  // 스크롤 복원하기
  if (listVisibleItemIndex) {
    $.messageView.bottom = 0;
    $.messageView.scrollToItem(0, listVisibleItemIndex, { animated: false } );
  } else {
    messageScrolltoBottom();
  }
}
//---------------------------------키보드 및 화면전환 관련 끝
//---------------------------------스크롤관련

// 스크롤 이벤트 캐치
var offset = 0;
var isChecked = false;
var flagNowLoading = false;
function scrollEnd(e) {
  if (!isChecked && !_isFirstRun) {
    isChecked = true;
    Ti.API.debug("scrollEnd / firstVisibleItemIndex : ", e.firstVisibleItemIndex);
    if (OS_IOS) {
      listVisibleItemIndex = e.firstVisibleItemIndex + e.visibleItemCount - 1;
    } else {
      listVisibleItemIndex = e.firstVisibleItemIndex;
    }

    if(e.firstVisibleItemIndex == 0 && flagNowLoading == false) {
      flagNowLoading = true;
      // Graph Search
      var addRows = _limitedUnshiftMessagesRow();
      // 이벤트가 계속 발생하지 않게...
      if (addRows.length == 0) {
        $.messageView.removeEventListener('scrollend', scrollEnd);
      }

      if (OS_IOS) {
        listVisibleItemIndex = addRows.length + e.visibleItemCount - 1;
      } else {
        listVisibleItemIndex = addRows.length;
      }
      $.messageView.bottom = 0;
      $.messageView.scrollToItem(0, listVisibleItemIndex, { animated: false } );
    }
    isChecked = false;
  }
}
$.messageView.addEventListener('scrollend', scrollEnd);

function messageScrolltoBottom() {
  // 스크롤위치 처리
  listVisibleItemIndex = $.messageSection.items.length-1;
  //스크롤
  $.messageView.bottom = 0;
  $.messageView.scrollToItem(0, listVisibleItemIndex, {animated:false});

  // 안드로이드 포커싱 버그 때문에 키보드가 있을 때는 다시 포커스 줌
  if (OS_ANDROID && CONTENT_VIEW_STATE.keyboard) {
    $.inputMsg.focus();
  }
}
//---------------------------------스크롤관련 끝

exports.sendPhotoMessage = function (shootInfo, fileM, notificationMsg) {
  //이 경우는 외부에서 저장되어 전달된 파일이기에 추가적 정보를 저장한후에 메시지로 보낸다.
  if(fileM){
    fileM.set({
      roomId : exports.roomId,
      location : shootInfo.location,
      User_objectId : currentUserId,
      text : (notificationMsg) ? notificationMsg.text : null
    });

    _sendPhotoMessageByFileM(fileM);
    return Q();
  }

  if(shootInfo && shootInfo.photoInfo){
    var photoInfo = shootInfo.photoInfo;

    var photoBlob = photoInfo.blob;
    var imgName = photoInfo.name;
    var thumbnailBlob = localPhotoService.resizeForThumbnail(photoBlob);

    //리모트저장
    var _fileM = Alloy.createModel('file');

    return _fileM.saveBy({
        blob:photoBlob,
        thumbnailBlob:thumbnailBlob,
        name:imgName,

        roomId:exports.roomId,
        location:shootInfo.location || {},
        User_objectId:currentUserId,
        text : (notificationMsg) ? notificationMsg.text : null
    })
    .then(function(fileM) {
      _sendPhotoMessageByFileM(fileM);
    })
    .catch(function(error) {
      var message = (error.message) ? error.message : error;
      Ti.API.debug(message);
      Alloy.Globals.alert('cr_failSendPhotoMessage');
    });
  }

  //아무것도안함
  return Q();
}
function _sendPhotoMessageByFileM(fileM){
  Ti.API.debug('fileM,');
  // 메시지 보내기.
  var messageData = {
    fileId:fileM.id,
    thumbnailUrl:fileM.get('thumbnailUrl'),
    url:fileM.get('url'),
    name:fileM.get('name'),
    fileType:fileM.get('fileType'),
    roomId:fileM.get('roomId'),
    location:fileM.get('location'),
    text:fileM.get('text')
  }
  Ti.API.debug('send photo message data : ', messageData);
  chatService.sendMessage(messageData);
}
exports.sendEnterReceiver = function() {
  var msg = {
    roomId : exports.roomId,
    receiverRoomId : exports.roomId
  }
  chatService.sendEnterReceiver(msg);
}

exports.remove = function(){
  $.mainView.close();
}
//---------------------------------사진 및 카메라 관련 끝

function _updateFriendRoomData(friendInfo){
  $.friendName.text = friendInfo.name;
  $.roomTitle.text = friendInfo.name;
}

//---------------------------------메시지 컬렉션 변화에 의한 뷰의 메시지 추가 관련 시작
function messageAdded(messageModel) {
  // 특정 챗룸에 전달하니 isEqualRoom으로 확인안해도됨.
  // if(_isEqualRoom(messageModel)) {
    // 상대의 메시지 시간
    if (messageModel.get('fromUserId') != currentUserId) {
      yourLastMessageTime = messageModel.get("created");
    }

     switch(messageModel.get('type')) {
       // 남이 보낸 메시지(사진, 일반 텍스트메시)
       case "send:message":
        var row = _createMessageRow(messageModel, 'new');
        //한 행 삽입후 최신으로 이동.
        // 한번도 실행되지 않았을때는 추가하지 말자
        if (!_isFirstRun) {
          if(exports.isOpenedChatRoom){
            $.messageSection.appendItems([row], {animated:false});
            //최신위치변경.
            messageScrolltoBottom();
          }else{
            exports.delayedTextMessageRows.push(row);
          }
        }
      break;
      //리시버가 방에 들어오다.
      case "enter:receiver":

        //열려있는 경우면. 모두 읽은것으로...으로.
        if(exports.isOpenedChatRoom){
          messageModel.set({
            'isReceived': true,
            'receivedTime' : Date.now(),
            'receiverRoomId' : exports.roomId
           });
           _updateUnreadToRead(messageModel, true);
        }else{
          // 닫혀있는경우...지연시켜서해야하네.............ㅅㅂ
          exports.delayedEnterReceiverModel = messageModel;
        }


      break;
    }

    // 이 방에 온건데, 이방이 열려있지 않다면, 팝업 푸시를 보여준다.
    if (!exports.isOpenedChatRoom && messageModel.get('fromUserId') != currentUserId && messageModel.get('type') != 'enter:receiver') {
      // 1분 이내에 온것만 푸시로 띄우자 (쌓여있는거 무시하기)
      var now = new Date();
      var created = new Date(messageModel.get('created'));
      var intervalMs = now.getTime() - created.getTime();
      var intervalMin = Math.floor(intervalMs / (1000 * 60) );
      if (intervalMin < 1) {
        if (Alloy.Globals.parsePushC) {
          Alloy.Globals.parsePushC.popupFromMessage(messageModel);
        }
      }
      // 채팅리스트의 읽지 않은 메시지 갯수 업데이트
      chatRoomM.set({'restMessageCount' : chatRoomM.get('restMessageCount')+1});
    }
    // 읽음처리
    if (exports.isOpenedChatRoom) {
      messageModel.set('isRead', true).save();
    }
  // }
}
//마지막 메시지가 시스템메시지인지 판별하여, 추가하거나 갱신한다.
function _addOrUpdateSystemMessageRow(systemRow) {
  var items = $.messageSection.items;
  var lastIndex = items.length - 1;
  var lastItem = (lastIndex >= 0) ? items[lastIndex] : {};

  if(_isEqualPartial(lastItem, systemRow, ['type','fromMe'])) {
    $.messageSection.updateItemAt(lastIndex, systemRow, {animated:false} )
  }else{
    $.messageSection.appendItems([systemRow], {animated:false});
    messageScrolltoBottom();
  }
}
function _addDelayedSystemMessageRow(systemRow) {
  var items = exports.delayedTextMessageRows;
  var lastIndex = items.length - 1;
  var lastItem = (lastIndex >= 0) ? items[lastIndex] : {};

  if(_isEqualPartial(lastItem, systemRow, ['type','fromMe'])) {
    items[lastIndex] = systemRow;
  }else{
    exports.delayedTextMessageRows.push(systemRow);
  }
}
//부분적인 요소가 모두 같아야함.
function _isEqualPartial(aRow, bRow, partKeys) {
  for(var i=0,max=partKeys.length; i<max; ++i){
    var key = partKeys[i];
    //둘중에 하나라도 값은 있어야하고, 일부라도 다르면 false
    if((aRow[key] || bRow[key]) && (aRow[key] != bRow[key]) ){
      return false;
    }
  }

  //모두 같을 경우만 true
  return true;
}

//---------------------------------메시지 컬렉션 변화에 의한 뷰의 메시지 추가 관련 끝

//------------------------------------등록안된 친구에대한 추가처리 시작
//선택 박스
function _processUnregisterFriendAtOpen() {
  var opts = {
    chatAfterAddFriend: 0, banFriend: 1
  }
  if(OS_IOS){
    opts.options = [
      L('cr_chatAfterAddFriend'),
      L('cr_banFriend'),
      L('cr_justChat'),
    ]
  }else{
    opts.options = [
      L('cr_chatAfterAddFriend'),
      L('cr_banFriend')
    ]
    opts.buttonNames = [L('cr_justChat')];
  }

    var dialog = Ti.UI.createOptionDialog(opts)

    //사진찍거나 가져오고, 로컬 변환후.. 서버에 저장한다.
  dialog.addEventListener('click', function(e){
    //안드로이드에서 버튼이면 취소와 같음.아무동작안함.
    //아무동작하지않음.
    if(OS_IOS){
      if(e.index > 1) return;
    }else{
      if(e.button) return;
    }

    if(e.index == e.source.chatAfterAddFriend){
      _addUnregisterFriend();
    }
    if(e.index == e.source.banFriend){
      _banUnregitserFriend();
    }
  });

  dialog.show();

  return dialog;
}
function _addUnregisterFriend(extendData) {
  Ti.API.debug('_addUnregisterFriend');
  var frinedInfo = friendContactM.getUserInfo();
  Alloy.Globals.startWaiting('c_waitingMsgDefault');
  //서버에 저장을 위해 적당한 데이터를 설정해준고.
  var friendContactData = {
    "User_objectId" : currentUserId,
    "isUnregister" : false,
    //클라우드코드에서 User_objectId_To가있으면 무시하고, mainPhone이용하여 바인딩해줌.
    "User_objectId_To" : null,
    "mainPhone" : frinedInfo.mainPhone,
    "User_object_To" : null,
  };
  //추가데이터 있을시 합침.
  if(extendData){
    _.extend(friendContactData, extendData);
  }

  //서버에 저장한다.
  var tempContactM = Alloy.createModel('contacts');
  tempContactM.save(friendContactData, {
    success : function (e, e2) {
      //포함된 user정보가 변경되었을 수도있으니 fetch.
      friendContactM.set({'objectId':tempContactM.id},{change:false});
      friendContactM.fetch({
        urlparams: { include : "User_object_To"},
        success : function() {
          //fetch되면. 추가된 값을 저장해줘야함.
          contactsColllection.add(friendContactM);
          Alloy.Globals.stopWaiting();
        },
        error:function(e,e2){
          Ti.API.debug('_addUnregisterFriend: ',e,e2);
          Alloy.Globals.alert('c_alertMsgDefault');
        }
      });
    },
    error : function (e, e2) {
      Ti.API.debug('_addUnregisterFriend: ',e2);
      Alloy.Globals.alert('c_alertMsgDefault');
    }
  });

}
function _banUnregitserFriend() {
  _addUnregisterFriend({"isBlock":true});
  Ti.API.debug('ban');
}

//------------------------------------등록안된 친구에대한 추가처리 끝
//뷰 오픈 후 초기화
var MESSAGE_SECTION_INDEX = 0;
//$.mainView.addEventListener('open', function() {

function chatListInitial() {
  //메시지리스트 초기화
  if(_isFirstRun) {
    Ti.API.debug('---------------------------------이거한번만되야함!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

    // 역 그래프서치
    var addRows = _limitedUnshiftMessagesRow();
    // 이벤트가 계속 발생하지 않게...
    if (addRows.length == 0) {
      $.messageView.removeEventListener('scrollend', scrollEnd);
    }
  }
  // 이방에 있는 읽지 않은것 모두 읽음 처리
  isReadTrueAll();

  Ti.API.debug('open chatRoomView ', exports.roomId, exports.inUserIds, friendContactM.attributes);
}

// 이방에 있는 읽지 않은것 모두 읽음 처리
function isReadTrueAll() {
  var models = messageCollection.where({roomId: exports.roomId, isRead:false});
  for(i = models.length-1; i >= 0; i--) {
    model = models[i];
    model.set('isRead', true).save();
  }
  // 채팅리스트의 읽지 않은 메시지 갯수 업데이트
  chatRoomM.set({'restMessageCount' : 0});
}



//private method
//최신것부터 오래된것 방향으로 크기가 제한된(MaxLimitSize) 메시지들을 리스트뷰에 추가([].unshift()와 같은 행동 )한다.
//fromIndex는 추가할 메시지모델의 다음 영역을 가르킨다. (처음은 가장최신값)
var _fromIndex;
var MAX_LIMIT_SIZE = 50;
var models = {};
function _limitedUnshiftMessagesRow() {
  //_fromIndex = _fromIndex || messageCollection.length-1;

  //var models = messageCollection.models;
  if (_.isEmpty(models)) {
    models = messageCollection.where({roomId: exports.roomId});
  }
  _fromIndex = _fromIndex || models.length-1;

  var recentMsgIsReceived = false;

  var curLimitSize = MAX_LIMIT_SIZE;
  var rows = [];
  //역순. 최신 -> 구형..
  for(var i=_fromIndex,min=0; i>=min; --i) {
    model = models[i];
    /////////////// 읽은메시지인지 판단.///////////////////////
    //최신의 메시지가 isReceived메시지라면 구형..메시지도 isReceived여야한다.
    if(recentMsgIsReceived){
      !model.get('isReceived') ? model.save({'isReceived':true}) : '';
    }else{
      if(model.get('isReceived') ){
        recentMsgIsReceived = true;
      }
    }
    //////////////////읽은메시지인지 판단. 끝//////////////////////////////

    // 메시지를 리스트에 추가하기
    if(_fromIndex >= 0 && curLimitSize > 0) {
      // if(curLimitSize > 0 && _fromIndex >= 0 && model.get('type') == "send:message") {
      //   var row = _createMessageRow(model, 'old')
      //   rows.push(row);
      //   --_fromIndex;
      //   --curLimitSize;
      // }
      //
      var type = model.get('type');
      if(curLimitSize > 0 && _fromIndex >= 0 ){
        //보이는메시지일 경우.
        if(type == "send:message" || type =="request:where"){
          var row;
          if(type == "send:message"){
            row = _createMessageRow(model, 'old');
          }

          // 표시할 row가 있을 때
          if(row) {
            rows.push(row);
            --curLimitSize;
          }
        }

        // 인덱스는 무조건 줄이고
        --_fromIndex;
      }

      // 마지막 메시지 시간
      if (!yourLastMessageTime && model.get('fromUserId') != currentUserId) {
        yourLastMessageTime = model.get("created");
      }
    } else {
      // for를 그만 돌리자
      break;
    }
  }

  rows.reverse();
  //남은 row가있다면 추가한다.
  if(rows.length !=0) {
    $.messageSection.insertItemsAt(0, rows, { animated: false });

    setTimeout(function(){
      flagNowLoading = false;
    }, 100);
  }

  return rows;
}

function _createMessageRow(messageModel, timeOption) {
  var isReceived = messageModel.get('isReceived');
  var text = messageModel.get('text');
  var created = messageModel.get('created'); //모멘트
  var fromUserId = messageModel.get('fromUserId');

  var fileType = messageModel.get('fileType');
  var thumbnailUrl = messageModel.get('thumbnailUrl');
  var url = messageModel.get('url');
  var photoName = messageModel.get('name');

  var aItem = {
    properties : {}
  }
  if (OS_IOS) {
    aItem.properties.selectionStyle = Titanium.UI.iPhone.ListViewCellSelectionStyle.NONE;
  }

  //상대방이 보낸메시지. 지저분해지고있어..
  if(currentUserId != fromUserId) {
    aItem.fromMe = false;

    if(fileType){
      if(fileType =='image/jpeg'){
        aItem.content = { image:thumbnailUrl , originUrl:url, photoName:photoName };
        aItem.template = "rowLeftImageTemplate";
      }
    }else{
      aItem.template = "rowLeftTemplate";
      aItem.content = { text : text };

    }

    // 프로필 사진
    //이렇게해도되는걸까.
    var friendInfo = friendContactM.getUserInfo();
    aItem.friendImage =  { image: friendInfo.imageUrl || "/images/friendlist_profile_default_img.png" };
  //내메시지
  } else {
    aItem.fromMe = true;

    if(fileType){
      if(fileType =='image/jpeg'){
        aItem.content = { image:thumbnailUrl , originUrl:url, photoName:photoName };
        aItem.template = "rowImageTemplate";
      }
    }else{
      aItem.template = "rowTemplate";
      aItem.content = { text : text };
    }

  }

  //공통
  if(created){
    var createdTime = Alloy.Globals.moment(created).format('M[ / ]D') + '\n' + Alloy.Globals.moment(created).format('HH:mm');
    aItem.createdTime = { text : createdTime };
    aItem.created = created;
  }
  //공통
  aItem.readCount = { text : '' };
  if(!messageModel.get('isReceived')) {
    aItem.readCount.text = "\uf388"; //

    messageModel.on('change:isReceived',_updateUnreadToRead);
  }

  return aItem;
}

//단순히 현재것부터 시작하여, 읽음 표시가 발견될때까지의 그 과거것을 제거함.
// exports.unreadRecentIndex는 실제 보이는 텍스트메시지가 삽입 or 제거될 시기에 최신것으로 갱신.
function _updateUnreadToRead(messageModel, isDirectCall) {
  //Ti.API.error("=-=======================동작..........................해", messageModel.attributes, exports.roomId);
  //방이 열려있는 상태에서 온 메시지만 유효.
  var receiverRoomId = messageModel.get('receiverRoomId');
  if(receiverRoomId && (receiverRoomId == exports.roomId)){
    var receivedTime = messageModel.get('receivedTime');
    receivedTime = new Date(receivedTime);

    var items = $.messageSection.items;
      //거꾸로..
    for(var i=items.length-1,min=0; i>=min; --i){
      var item = items[i];
      var createdTime = new Date(item.created);

      // Ti.API.error(createdTime, receivedTime);
      //텍스트에 값이 있는경우까지.
      if(item.readCount) {
      // Ti.API.error(item.readCount);
        if(item.readCount.text && createdTime <= receivedTime){
          // Ti.API.error(item.readCount, "없에버려");
          //읽음표시로 업뎃.
          item.readCount.text = '';
          $.messageSection.updateItemAt( i, item, {animated:false} );
        }else{
          //내가보낸것이면서 readCount가 없다면 경우면 그 이하는 이미읽은것이라 판단하여 무시.
          if(item.fromMe){
            // Ti.API.error("=-=======================무시해..........................해");
            break;
          }
        }
      }
    }

  //실제로 읽혔을경우에만 영속성 부여.
  messageModel.save(null,{change:false});
  }else{
    // 처리안된 메시지는 다른방법을사용..
  }

  //안드로이드 once가 안되냐. 이걸로.
  if(!isDirectCall){
    messageModel.off('change:isReceived',_updateUnreadToRead);
  }
}

function _isEqualRoom(model) {
  return (model.get('roomId') == exports.roomId) ? true : false;
}

//-----------------------  public method
//메시지 보내기.
function onClickSend() {
  // 메시지 빈것이면 무시.
  var text = $.inputMsg.value;
  if(text == '' || text == undefined || text == null) return;

  var messageData = {
    text:text,
    roomId:exports.roomId,
  };

  chatService.sendMessage(messageData);
  $.inputMsg.value='';
  // 안드로이드 포커싱 버그 때문에 딜레이 줌
  if (CONTENT_VIEW_STATE.keyboard) {
    setTimeout(function(){
      $.inputMsg.focus();
    }, 100);
  }
}
//갤러리에서 선택한 사진 보내기
function onClickSendGallery() {
  localPhotoService.getPhoto()
    .then(function _successCallback(photoInfo) {
      //해당하는 사진보낼것인지 확인
      var dialog = Ti.UI.createAlertDialog({
        ok : 0,
          cancel: 1,
          buttonNames: [L('c_alertMsgOk'), L('c_cancle')],
          message: L('c_youWannaSendPhoto'),
          // title: 'Delete'
        });
        dialog.addEventListener('click', function(e){
          //취소 아무것도안함.
          if (e.index === e.source.cancel){
            return;
          }
        //실제 전송.
        if (e.index === e.source.ok){
          Alloy.Globals.toast('c_msgSendingPhoto');

          var photoBlob = localPhotoService.resize(photoInfo.blob);
          var imgName = photoInfo.name;
          var thumbnailBlob = localPhotoService.resizeForThumbnail(photoBlob);

          //리모트저장
          var _fileM = Alloy.createModel('file');

          return _fileM.saveBy({
              blob:photoBlob,
              thumbnailBlob:thumbnailBlob,
              name:imgName,
              text:L("c_photo"),
              roomId:exports.roomId,
              User_objectId:currentUserId
          })
          .then(function(fileM) {
            _sendPhotoMessageByFileM(fileM);
          })
          .catch(function(error) {
            var message = (error.message) ? error.message : error;
            Ti.API.debug(message);
            Alloy.Globals.toast('cr_failSendPhotoMessage');
          });
        }
        });
        dialog.show();

    })
    .catch(function _errorCallback(error) {
      var message = (error.message) ? error.message : error;
      Ti.API.debug(message);
      if(!error.isCancel){
        Alloy.Globals.toast(msg);
      }
    });


}

function clickThumbnail(e) {
  var itemInfo;
  if(OS_IOS){
    itemInfo = e.source;
  }else{
    var item = e.section.items[e.itemIndex];
    itemInfo = item[e.bindId];
  }

  //단순히 뷰오픈.
  var params = {
    photoUrl : itemInfo.originUrl,
    photoName : itemInfo.photoName,
    location : itemInfo.location
  }
  var photoViewerC = Alloy.createController('chat/photoViewer',params);
  photoViewerC.getView().open();

}

function backBtn() {
  $.getView().close();
}

function messageClick(e) {
  // 리스트 뷰의 아이템을 클릭시 키보드를 감춤
  explicitBlur()

  //TODO : 메시지 클릭시 메시지를 가지고 해야하는 일들 코딩 (복사, 전달 등등)
}

function onOpen(evt) {
  Ti.API.debug("ChatRoom Open Event / Start");
  // 포커스 이벤트 제어용
  onFocusRun = false;

  // 키보드 이벤트
  if (OS_IOS) {
    Ti.App.addEventListener('keyboardframechanged', keyboardFrameChanged);
  }

  // 채팅기능
  Ti.API.debug("ChatList Initial");
  chatListInitial();
  _isFirstRun = false;  // 메시지를 리스트뷰에 추가할지 확인하는 플래그기 때문에 채팅을 초기화 하고 나면 반드시 바로 초기화 해줄것

  //친구정보가 변경되었을 수 있으니 한번 갱신
  if (friendContactM.isRegister() && !Alloy.Globals.loginC.doingSyncAddress && !Alloy.Globals.appStartProcess) {
    friendContactM.fetch({ urlparams: { include : "User_object_To"} });
  }

  Ti.API.debug("ChatRoom Open Event / End");
}

function onClose(evt) {
  Ti.API.debug("ChatRoom Close Event / Start");

  exports.isOpenedChatRoom = false;
  exports.isOpenedTiming = false;
  Alloy.Globals.chatViewManager.currentOpenedRoomId = null;

  // 키보드 이벤트
  if (OS_IOS) {
    Ti.App.removeEventListener('keyboardframechanged', keyboardFrameChanged);
    CONTENT_VIEW_STATE.keyboard = false
    VIEW_HEIGHT.keyboard = 0;
  }

  //채팅리스트에 알려준다.
  Alloy.Globals.chatListC.openFn();
  //open메시지보내줌..

  Ti.API.debug("ChatRoom Close Event / End");
}

function onFocus() {
  Ti.API.debug("ChatRoom Focus Event / Start");
  exports.isOpenedChatRoom = true;
  exports.isOpenedTiming = true;
  isOpenedCount++;
  // 30초 후에 오픈 타이밍 해제하기
  setTimeout(function() {
    isSetTimeoutCount++;
    if (isOpenedCount == isSetTimeoutCount) {
      exports.isOpenedTiming = false;
      Ti.API.debug('exports.isOpenedTiming set to ', exports.isOpenedTiming, ' after 30 sec');
    } else {
      Ti.API.debug('exports.isOpenedTiming set to canceled');
    }
  }, 1000*30);
  Alloy.Globals.chatViewManager.currentOpenedRoomId = exports.roomId;
  // 가끔 꼬여서 offline 상태가 될 수 있으니, 채팅창에 들어왔을때는 강제로 online시켜주자.
  if (Alloy.Globals.firebaseC) {
    Alloy.Globals.firebaseC.goOnline();
  }
  //상대에게 알림.
  exports.sendEnterReceiver();

  if (!onFocusRun) {
    onFocusRun = true;

    // 등록안된 친구일 경우 알림(선택창)을 이용하여 추가적인 행동을 함(등록, 차단등)
    if (!friendContactM.isRegister()) {
      _processUnregisterFriendAtOpen();
    }
  }

  // 메시지 처리 안된거 달아주기
  if(!_.isEmpty(exports.delayedTextMessageRows) && exports.isOpenedChatRoom) {
    //
    var delayedTextMessageRows = _.clone(exports.delayedTextMessageRows) || [];

    var firstRow = (delayedTextMessageRows.length > 0) ? delayedTextMessageRows.shift() : null;
    //처음것은 병합하기 위해 별개로 처리.
    if(firstRow){
      $.messageSection.appendItems([firstRow], {animated:false});
    }

    //초기화
    $.messageSection.appendItems(delayedTextMessageRows, {animated:false});
    exports.delayedTextMessageRows = [];
    messageScrolltoBottom();
  }
  //처리안된.. 읽기 처리.
  if(!_.isEmpty(exports.delayedEnterReceiverModel) && exports.isOpenedChatRoom) {
    //시간비교하여 직전에 작은 것. 찾아서. isReceived를 업뎃. 그리고..메시지뷰 갱신
    var enteredTime = exports.delayedEnterReceiverModel.get('created');
    enteredTime = enteredTime ? new Date(enteredTime) : -1;

    //역순. 최신 -> 구형..
    var models = messageCollection.where({roomId: exports.roomId});
    var justBeforeModel;
    for(var i=models.length-1,min=0; i>=min; --i) {
      var model = models[i];
      var createdTime = model.get('created');
      createdTime = new Date(createdTime);

      //직전모델이면 발견.
      if(createdTime < enteredTime){
        justBeforeModel = model;
        break;
      }
    }
    //찾은걸로...........동작...해..
    if(justBeforeModel){
      justBeforeModel.set({
        'isReceived': true,
        'receivedTime' : justBeforeModel.get('created'),
        'receiverRoomId' : exports.roomId
       });
      _updateUnreadToRead(justBeforeModel, true);
    }
  }

  Ti.API.debug("ChatRoom Focus Event / End");
}

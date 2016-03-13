$.centerTitle.title = L('c_chatList');

var chatRoomCollection = Alloy.Collections.instance('chatRoom');
var contactsColllection = Alloy.Collections.instance('contacts');
var messageCollection = Alloy.Collections.instance('message');

if (!Alloy.Globals.chatViewManager) {
  Alloy.Globals.chatViewManager = Alloy.createController('chat/chatViewManager');
}
var chatViewManager = Alloy.Globals.chatViewManager;

var chatViewCol = _createChatViewCollection();

// 초기 실행 완료 여부
exports.startComplete = false;

// 주소록 fetch된 횟수 용 (2회 째가 baas로부터의 처리이므로)
exports.fetchContactsCount = 0;

// 로긴후 contacts, chatRoom, message fetch
exports.fetchInitialData =  function (mode) {
  // 주소록 먼저
  contactsColfetch(mode);

  // 채팅방 하자
  chatRoomFetch();

  messageCollection.fetch({
    success:function(){
      //Ti.API.debug('message fetching is complete', Alloy.Globals.moment().format(Alloy.Globals.DATE_FORMAT));
    }
  });
}

function contactsColfetch(mode) {
  var myId = Alloy.Globals.user.get('id');

  contactsColllection.defaultFetchData = {
    //order : "-User_objectId_To,fullName",
    order : "fullName",
    where : { "User_objectId" : myId },
    // where : { "User_objectId" : Alloy.Globals.user.get("id"), "isHidden" : { "$ne" : true }, "isBlock" : { "$ne" : true } },
    include : "User_object_To",
    limit : 1000
  };
  contactsColllection.fetch({
    initFetchWithLocalData : true,
    //localOnly : true,
    success: function(){
      exports.fetchContactsCount++;
      Ti.API.debug("Contacts Drawing before Sync / fetchContactsCount:", _fetchContactsCount);
      if (exports.fetchContactsCount == 2) {
        exports.fetchContactsCount = 0;
        // 주소록 씽크
        if (mode == 'sync') {
          if (contactsColllection.length == 0) {
            contactsColllection.syncAddressBook();
          } else {
            // 천천히 해도 된다.
            setTimeout(function() {
              contactsColllection.syncAddressBook();
            }, 1000*15);
          }
        }
      }
    },
    error: function(){
      //Alloy.Globals.alert('verifyCodeFail');
      // 다시 시도하자
      exports.fetchContactsCount = 0;
      _fetchContactsCount = 0;
      contactsColfetch(mode);
    }
  });
}

function chatRoomFetch() {
  var myId = Alloy.Globals.user.get('id');

  Ti.API.debug('chatRoom data fetching is start', Alloy.Globals.moment().format(Alloy.Globals.DATE_FORMAT));
  chatRoomCollection.fetch({
    urlparams:{  where:{"existUserIds": {"$in":[myId]} }, include : "inUsers" },
    sql:{ like:{ "existUserIds":myId } },
    initFetchWithLocalData : true,
    success:function(){
      //Ti.API.debug('chatRoom fetching is complete', Alloy.Globals.moment().format(Alloy.Globals.DATE_FORMAT));
    },
    error:function(e,e2){
      Ti.API.debug('-----------------에러가뭐냐',e,e2);
      // 다시 시도하자
      _fetchChatRoomCount = 0;
      chatRoomFetch();
    }
  });
}

// 네비게이션바 우측 버튼, 센터 텍스트관련.
exports.rightBtn = function() {
  var editingText = L("c_edittingBtn");
  var completeText = L("c_completeBtn");

  var rightBtnOption = {
    title: editingText,
    font: { fontSize: 15 }
  };
  var rightBtnFn = function (titleBtn) {
    Ti.API.debug("챗편집 Button Clicked ");

    chatViewCol.toggleEditingView();
    //rightbtn이 생성되어있는 경우.
    if(titleBtn){
      if(chatViewCol.isEdittingMode){
        titleBtn.title = completeText;
        titleBtn.color = "#8351FD";
      }else{
        titleBtn.title = editingText;
        titleBtn.color = "white";
      }
    }
  };

  return {
    'centerTitle' : L("c_chatList"),
    'rightBtnOption' : rightBtnOption,
    'rightBtnFn' : rightBtnFn
  };

};


exports.refresh = function() {
  chatViewCol.refresh();
}
// 열렸을 때 할일 들
var firstOpen = true;
exports.openFn = function() {
  if (firstOpen == true) {
    firstOpen = false;
  } else {
    Ti.API.debug('reopen chatListView');
  }
  //항상 편집모드가 아닌 일반모드로 시작한다.
  chatViewCol.toggleEditingView(false);

  //현재 시간 기준으로 타임관련 데이터를 수정.
  chatViewCol.updateCheckedTimeFromNow();
}

///////////////////////////////
//첫 로딩시에는 친구정보까지 받아진 후에 시작함. 둘의 완료 시점이 다를수있기에 아래처럼 일치시킴.
// 친구목록이 ios에서 싱크시점 후에 fetch가 되기에. 처음 fetch시점에서 가져옴.
var _isContactsReset = false, _isChatRoomsReset = false, _isMessageReset = false;
var _fetchContactsCount = 0, _fetchChatRoomCount = 0, _fetchMessageCount = 0;
var _fetchChatRoomLength = 0;
contactsColllection.on('fetch', function(){
  _fetchContactsCount++;
  Ti.API.debug('contactsColllection event [fetch] count :', _fetchContactsCount, ' / _isContactsReset :', _isContactsReset, ' / time :', Alloy.Globals.moment().format(Alloy.Globals.DATE_FORMAT));
  // 처음 로컬 fetch때 데이터가 없을 수도 있다.
  if (!_isContactsReset && (_fetchContactsCount == 2 || contactsColllection.length > 0)) {
    _isContactsReset = true;
    _firstCreateRoomViews();
    if (_fetchContactsCount == 2) {
      contactsColllection.off('fetch', arguments.callee);
    }
  }
  // 두번째 이상 fetch된것은 start:complote 이후에 동작
  if (_isContactsReset && _fetchContactsCount == 2) {
    if (!exports.startComplete) {
      $.on('appStartProcess:complete', function() {
        _.defer(contactsCol2ndFetch);
        $.off('appStartProcess:complete', arguments.callee);
      });
    } else {
      _.defer(contactsCol2ndFetch);
    }
    function contactsCol2ndFetch() {
      Ti.API.debug('contactsCol2ndFetch :');
      chatViewCol.refeshLinkToContactsM();
      contactsColllection.off('fetch', arguments.callee);
    }
  }
});
chatRoomCollection.on('fetch', function(){
  _fetchChatRoomCount++;
  Ti.API.debug('chatRoomCollection event [fetch] :', _fetchChatRoomCount, ' / _isChatRoomsReset :', _isChatRoomsReset, ' / time :', Alloy.Globals.moment().format(Alloy.Globals.DATE_FORMAT));
  // 처음 로컬 fetch때 데이터가 없을 수도 있다.
  if (!_isChatRoomsReset && (_fetchChatRoomCount == 2 || chatRoomCollection.length > 0)) {
    _isChatRoomsReset = true;
    _fetchChatRoomLength = chatRoomCollection.length;
    _firstCreateRoomViews();
    if (_fetchChatRoomCount == 2) {
      chatRoomCollection.off('fetch', arguments.callee);
    }
  }
  // 두번째 이상 fetch된것은 start:complote 이후에 동작
  if (_isChatRoomsReset && _fetchChatRoomCount == 2) {
    if (!exports.startComplete) {
      $.on('appStartProcess:complete', function() {
        _.defer(chatRoomCol2ndFetch);
        $.off('appStartProcess:complete', arguments.callee);
      });
    } else {
      _.defer(chatRoomCol2ndFetch);
    }
    function chatRoomCol2ndFetch() {
      Ti.API.debug('chatRoomCol2ndFetch :');
      // 두번째 fetch된 콜렉션 갯수가 다르면 아예 다시 그리자
      if (_fetchChatRoomLength != chatRoomCollection.length) {
        _firstCreateRoomRun = false;
        _firstCreateRoomViews();
      } else {
        chatViewCol.refeshLinkToChatRoomM();
      }
      chatRoomCollection.off('fetch', arguments.callee);
    }
  }
});
messageCollection.on('fetch', function(){
  _fetchMessageCount++;
  Ti.API.debug('messageCollection event [fetch] :', _fetchMessageCount, ' / _isMessageReset :', _isMessageReset, ' / time :', Alloy.Globals.moment().format(Alloy.Globals.DATE_FORMAT));
  // messageCollection은 로컬에서만 다룰거라 fetch 횟수는 1회다.
  if (!_isMessageReset && (_fetchMessageCount == 1 || messageCollection.length > 0)) {
    _isMessageReset = true;
    _firstCreateRoomViews();
    messageCollection.off('fetch', arguments.callee);
  }
});

var _firstCreateRoomRun = false;
var callbackRun = false;
function _firstCreateRoomViews(){
  if(_isContactsReset && _isChatRoomsReset && _isMessageReset && !_firstCreateRoomRun){
    // 중복실행 방지
    _firstCreateRoomRun = true;
    Ti.API.debug('chatlist first create is start', Alloy.Globals.moment().format(Alloy.Globals.DATE_FORMAT));
    var chatRoomMs = chatRoomCollection.models;
    chatViewCol.initialize(chatRoomMs, callbackFn);

    function callbackFn() {
      if (!callbackRun) {
        callbackRun = true;
        Ti.API.debug('chatlist first create is end', Alloy.Globals.moment().format(Alloy.Globals.DATE_FORMAT));
        Alloy.Globals.stopWaiting();

        // chatService는 이제부터 필요함
        _.defer(function() {
          if (!Alloy.Globals.chatService) {
            Alloy.Globals.chatService = require('services/chatService');
          }

          // 채팅방이 다 열렸으니 초기 동작을 수행하자
          _.defer(function() {
            Ti.API.debug('chatlist fire event [start:complete]', Alloy.Globals.moment().format(Alloy.Globals.DATE_FORMAT));
            $.trigger('start:complete');
          });
        });

      }
    }
  }
}

// 개별 응답.
chatRoomCollection.on('add', function(chatRoomM){
  chatViewCol.addChatViewToTop(chatRoomM);
});

//나에게 전송된 메시지를 받아서 각 채팅룸에 전달해줌.
messageCollection.on('add', _receiveMessageListener);

function _receiveMessageListener(messageModel) {
  Ti.API.debug('ChatList_receiveMessageListener');
  var roomId = messageModel.get('roomId');
  var chatView = chatViewCol.getExistingChatView(roomId);

  //만들어진 chatView가 없다면 만들고, chatRoomM에 메시지 도착을 알림.
  if(chatView) {
    Ti.API.debug('-----기존 방에 새메시지 추가하는경우',roomId);
    var chatRoomM = chatView._chatRoomM;
    var chatC = chatViewManager.getOrCreate(chatRoomM)
    chatRoomM.trigger('receive:message', messageModel);

    _setRecentMessage(chatRoomM, messageModel);
  }else{
    //TODO[faith]: 메시지가 여럿이 쌓여있을경우.(껏다 켰을경우.) 요청이 연속적으로 들어옴!!!!!!!!!!!!!!!!!!!!!!!!!! 고쳐야함.
    var inUserIds = [messageModel.get('fromUserId'), messageModel.get('toUserId')]
    Ti.API.debug('-----메시지로 새방(서버 혹은 새방 만드는경우.).',roomId, inUserIds);
    //대화방이 서버에 존재할경우 값을 가져오고, add 이벤트 발생시킴.
    chatRoomCollection.getOrCreate(roomId, inUserIds, messageModel.get('toUserId'))
      .then(function(chatRoomM){
        var chatC = chatViewManager.getOrCreate(chatRoomM);
        chatRoomM.trigger('receive:message', messageModel);

        //어차피 chatView만들때 메시지모델에 있는값으로 만드니...필요가없지.
        // _setRecentMessage(chatRoomM, messageModel, true);
      })
  }
}
function _setRecentMessage(chatRoomM, messageModel) {

  if(messageModel.get('type') != 'enter:receiver'){
    chatRoomM.set({'recentMessage' : messageModel.attributes});
  }
};

//////////////////////////////////////////////////////////////////
//private helper/////////////////////////////////////////////////
//민트, 보라, 빨강, 노랑
var COLORS = ["#54EE92", "#8b61ff", "#FD787C", "#F6EE76"];
var _restColors = [];
//호출시마다 네가지 색 중 한가지.를 소모함. 모두 소모시 다시 시작.
function _getRandomColor(){
  _restColors = (_restColors.length > 0) ? _restColors : _.clone(COLORS);

  var restRandomIndex = _.random(0, _restColors.length-1);

  var color = _restColors[restRandomIndex];
  _restColors = _.without(_restColors, color);

  return color;
}

// onTouchmove 이벤트 핸들러
function scrollHandler(e) {

}

/////////////////////////////////////////////////////////////////////////////////
//////////////////////////// ChatView, ChatViewCollection 클래스 정의문 ///////////
//클래스 ChatView
function _defineChatView(){

  function ChatView(chatRoomM, chatViewCol) {
    this.roomId = chatRoomM.get('roomId');

    this._chatViewCol = chatViewCol;
    this._chatRoomM = chatRoomM;

    this._hasRecentPhoto = false;
    this._hasRecentWord = false;

    //초기 필요 변수를 설정해준다.
    this._initOuterDataBinding();

    //뷰를 생성한다.
    this._parentView = $.UI.create('View',{});
    this._createRowView(false);

    //생성된 뷰에 값을 업데이트한다.
    this._updateAllData();
  };
  //public
  ChatView.prototype.isSingle = function(){
    if(this._isSingle) return true;
    else return false;
  }
  ChatView.prototype.toggleEditingView = function(){
    if(this.isEditting()){
      this.editingViewWrap.visible = true;
      this.friendName.visible = false;
      this.innerRowView.opacity = "0.3";
    }else{
      this.editingViewWrap.visible = false;
      this.friendName.visible = true;
      this.innerRowView.opacity = "1";
    }
  }
  ChatView.prototype.isEditting = function(){
    return this._chatViewCol.isEdittingMode;
  }
  ChatView.prototype.remove = function(){
    return this._unregisterListerner();
  }
  //private

  ChatView.prototype._createRowView = function (isSingle) {
    //데이터를 뽑아내고,
    this._isSingle = isSingle;

    var views = this._createSingleOrHalfRow(isSingle);
    //뷰들간의 관계는 같다.xml참고.구조를 만들어줌.
    this._constructRelation(views);

    //부모에게 뷰를 추가하기전 이미 뷰가있으면 제거후 할당.
    if(this.rootView){
      //이전뷰의 정보중, 누락될 수 있는 값을 새로만든 뷰에 할당해준다.
      views.recentMessage.text = this.recentMessage.text;
      //이전값 제거.
      this._unregisterListerner();
      this._parentView.remove(this.rootView);
    }
    _.extend(this, views);
    this._parentView.add(this.rootView);
    //그리고 필요 이벤트 리스너 바인딩
    this._registerListerner();

    //에디팅 구분.
    if(this.isEditting()){
      this.toggleEditingView();
    }
  };

  //alloy 이용해서 리소스 바로 적용하려면 $.UI.create() 이걸사용.
  ChatView.prototype._createSingleOrHalfRow = function(isSingle){
    // var color = this._color;
    Ti.API.debug('create row is single? :', isSingle);
    var views = {};
    views.rootView = $.UI.create('View',{
      classes:(isSingle) ? ["oneRowView"] : ["oddRowView"],
      zIndex:0
    });

    views.innerRowView = $.UI.create('View',{
      classes:(isSingle) ? ["innerOneRowView"] : ["innerOddRowView"],
      zIndex:0
    });

    views.imageViewWrap= $.UI.create('View',{
      classes:(isSingle) ? ["oneImageWrap"] :["oddImageWrap"],
    });

    views.imageView = $.UI.create('ImageView',{
      classes:['fillView']
    });

    var logicalDensityWidth = Ti.Platform.displayCaps.platformWidth;
    if (OS_ANDROID) {
      logicalDensityWidth = logicalDensityWidth / Ti.Platform.displayCaps.logicalDensityFactor;
    }
    if (isSingle) {
      views.imageView.width = logicalDensityWidth * 0.615;
      views.imageView.height = logicalDensityWidth * 0.615;
    } else {
      // views.imageView.width = logicalDensityWidth * 0.4775;
      views.imageView.height = logicalDensityWidth * 0.4775;
    }

    views.messageView= $.UI.create('View',{
      classes:(isSingle) ? ["oneMessageWrap"] :["oddMessageWrap"]
      // backgroundColor : color
    });
    //imageView하위 요소
    views.scaleWord= $.UI.create('Label',{
      classes:["scaleWord", "font1"]
      // text:rowData.scaleWord
    });
    views.checkedTime= $.UI.create('Label',{
      classes:["checkedTime", "font1"]
      // text:rowData.checkedTime
    });
    var fnClass = (isSingle) ? "oneFriendName" : "oddFriendName"
    views.friendName= $.UI.create('Label',{
      classes:["font4", fnClass]
      // text:rowData.name
    });

    //messageView하위 요소
    var mCountClass = (isSingle) ? "oneRightTop" : "oddBottomLeft";
    views.restMessageCountWrap = $.UI.create('View',{
      classes:["restMessageCountWrap", mCountClass]
    });
    views.restMessageCountOutline = $.UI.create('ImageView',{
      classes:["restMessageCountOutline"]
    });
    views.restMessageCount = $.UI.create('Label',{
      classes:["restMessageCount", "font2"]
      // text:rowData.restMessageCount,
      // color :  color
    });

    var recentMClass = (isSingle) ? "recentOneMessage" :"recentOddMessage";
    views.recentMessageBox = $.UI.create('View',{
      classes:[recentMClass],
    });
    views.recentMessage = $.UI.create('Label',{
      classes:["font3"],
      textAlign : Titanium.UI.TEXT_ALIGNMENT_RIGHT,
      right: 2,
      shadowColor: '#6A6A6A',
      shadowOffset: {x:0.5, y:0.5},
      shadowRadius: 3
      // text:rowData.recentMessageWord
    });

    ///////editing요소
    views.editingViewWrap = $.UI.create('View',{ classes:["editingViewWrap"]}  );
    views.editingView = $.UI.create('View',{
      classes:(isSingle) ? ["oneEditingView"] :["oddEditingView"]
    });

    views.checkingImageView = $.UI.create('ImageView',{
      classes:["checkingImageView"],
      image : (Alloy.Globals.currentLanguage == 'ko') ? "/images/chatroomlist_exit_button.png" : "/images/chatroomlist_exit_button_en.png"
    });
    views.editingName = $.UI.create('Label',{
      classes:["editingName"]
      // text:rowData.name
    });

    return views;
  }

  ChatView.prototype._constructRelation = function(views){
    //관계형성
    //내용.
    views.restMessageCountWrap.add(views.restMessageCount);
    views.restMessageCountWrap.add(views.restMessageCountOutline);

    views.recentMessageBox.add(views.recentMessage);

    views.messageView.add(views.restMessageCountWrap);
    views.messageView.add(views.recentMessageBox);

    //image는 한번감쌓음
    var shadowWrapView = $.UI.create('View',{
      classes:['fillView']
    });
    var shadowView = $.UI.create('View',{
      classes:['fillView','imageShadowWrap']
    });
    shadowWrapView.add(views.imageView);
    shadowWrapView.add(shadowView);

    views.imageViewWrap.add(shadowWrapView);
    views.imageViewWrap.add(views.scaleWord);
    views.imageViewWrap.add(views.checkedTime);
    views.imageViewWrap.add(views.friendName);

    views.innerRowView.add(views.imageViewWrap);
    views.innerRowView.add(views.messageView);

    views.rootView.add(views.innerRowView);

    //편집요소

    views.editingView.add(views.checkingImageView);
    views.editingView.add(views.editingName);

    views.editingViewWrap.add(views.editingView);
    views.rootView.add(views.editingViewWrap);

  }

  ChatView.prototype.changeColor = function(color) {
    // this._color = color;
    this.innerRowView.backgroundColor = color;
    this.messageView.backgroundColor = color;
    this.restMessageCount.color = color;
  }
  ChatView.prototype.updateCheckedTimeFromNow = function() {
    this._updateCheckedTime();
  }
  //TODO[faith]: 탐색 세번. 한번에 할 수 없을까.
  // 필요 초기 값설정.
  ChatView.prototype._initOuterDataBinding = function(){
    //ContactsM
    this._setContactsM();

    //읽지않은 숫자. 텍스트메시지 관련, 최신메시지 날짜관련.
    var restMessageCount = messageCollection.getRestMessageCount(this.roomId);
    this._chatRoomM.set({'restMessageCount': restMessageCount});

    //odd->싱글 변환하여 재 바인딩될때는 같은 값이라 change가 발생하지 않음. 그래서 아래처럼행동.
    var recentMessageInfo = messageCollection.getRecentMessageInfo(this.roomId) || {};
    recentMessageInfo.type = "send:message";
    this._chatRoomM.set({'recentMessage': recentMessageInfo });
  }

  // 뷰에 현재의 값을 갱신해준다.
  ChatView.prototype._updateAllData = function(){
    this._updateRestMessageCount();
    this._updateCheckedTime();
    // 값이 오버라이딩 되므로 순서주의
    this._updateFriendData();
    this._updateMessageData();
  }

  ChatView.prototype._unregisterListerner = function(){
    this.rootView.removeEventListener('click', this._rootViewClickFn);
    //메시지는 채팅시 chatRoomM에 set되어 이벤트를 받는다. 실제 지속성을 위한 저장은 별개로 해야함.
    this._chatRoomM.off('change:recentMessage', this._chatRoomMChangeRecentMessageFn);

    this._chatRoomM.off('change:restMessageCount', this._chatRoomMChangeRestMessageCountFn);
    // 컨택트관련된 데이터변경.
    this._contactM.off('change', this._contactMChangeFn);
  };
  ChatView.prototype._registerListerner = function(){
    //채팅방이동 리스너
    this._rootViewClickFn = this._onClickRow.bind(this);
    this.rootView.addEventListener('click', this._rootViewClickFn);
    //메시지는 채팅시 chatRoomM에 set되어 이벤트를 받는다. 실제 지속성을 위한 저장은 별개로 해야함.
    this._chatRoomMChangeRecentMessageFn = this._onReceiveRecentMessage.bind(this);
    this._chatRoomM.on('change:recentMessage', this._chatRoomMChangeRecentMessageFn);

    this._chatRoomMChangeRestMessageCountFn = this._updateRestMessageCount.bind(this);
    this._chatRoomM.on('change:restMessageCount', this._chatRoomMChangeRestMessageCountFn);

    // 컨택트관련된 데이터변경.
    this._contactMChangeFn = this._onChangeContactM.bind(this);
    this._contactM.on('change', this._contactMChangeFn);
  }

  ChatView.prototype._onClickRow = function() {
    if(this.isEditting()){
      this._exitChatRoom();
    }else{
      Alloy.Globals.startWaiting('c_waitingMsgDefault');
      this._openChatView();
    }
  };

  ChatView.prototype._onChangeContactM = function() {
    this._updateFriendData();
  }
  ChatView.prototype._onReceiveRecentMessage = function() {
    var recentMessage = this._chatRoomM.get('recentMessage') || {};
    // 메시지 타입관계없이 갱신 하는 부분.
    this._updateCheckedTime();

    ////사진, 텍스트 메시지일경우만 저장함.
    // 새 메시지 업데이트
    var type = recentMessage.type;
    // if( (type == "send:message") || (type == "request:where") || (type == "notify:where")){
      this._updateMessageData();
    // }
  }

  ///////////////////////갱신관련
  //최신 메시지를 이용하여 적절한 업데이트를 해줌.
  ChatView.prototype._updateMessageData = function (){
    var recentMessage = this._chatRoomM.get('recentMessage') || {};
    var isHalfToSingle = false;


    //텍스트 혹은 이미지를 가진 메시지일 경우에 대해서만 아래의 작업을 해줌.
    //현재는 쪼기메시지 등을 무시하는 형태임.
    // if(recentMessage.type == "send:message" || recentMessage.type == "request:where"){
      // 메시지 타입에 따라 변하는 부분.
      //최신사진 가지고있는지 여부를 정해준다. half->single 변환시 필요.
      if(recentMessage.thumbnailUrl){
        this._hasRecentPhoto = true;

        if(!this._isSingle) {
          //싱글뷰로 재생성.
          Ti.API.debug('싱글로우재생성');
          this._createRowView(true);
          this._updateAllData();
          isHalfToSingle = true;
        }
      }
      if(recentMessage.text){
        // 사용자 정보 바뀔경우 필요.
        this._hasRecentWord = true;
      }

      // // 내가 보내는 쪼기메시지일 경우는 업뎃하지 않음.
      // if(recentMessage.type == "request:where" && recentMessage.fromUserId == Alloy.Globals.user.get('id')){
      // }else{
      //값 갱신
      this._updateTextAndImage();
        //뷰의 위치 변경. 메시지를 받은경우, 최상단으로 이동되야함. 읽지않은것이라도.
        //ios에서 half->single이 정상동작안하므로 다시그려줘야함.
      Ti.API.debug('위치변경.');
      this._chatViewCol.moveChatViewToTop(this, isHalfToSingle);
      // }

    // }
  }
  ChatView.prototype._updateTextAndImage = function() {
    var recentMessage = this._chatRoomM.get('recentMessage') || {};

    if(recentMessage.thumbnailUrl){
      this.imageView.image = recentMessage.thumbnailUrl;
    }
    var text = '';
    if(recentMessage.text){
      this.recentMessage.text = recentMessage.text;
    }
  }

  ChatView.prototype._updateCheckedTime = function() {
    var recentMessage = this._chatRoomM.get('recentMessage') || {};
    if(recentMessage.created){
      var time = Alloy.Globals.moment(recentMessage.created).fromNow();
      this.checkedTime.text =time;
    }
  }

  ChatView.prototype._refeshLinkToChatRoomM = function() {
    var refreshedChatRoomM = chatRoomCollection.getBy(this.roomId);

    //있을경우만.
    if(!_.isEmpty(refreshedChatRoomM)){
      // 기존
      var restMessageCount = this._chatRoomM.get('restMessageCount');
      var recentMessage = this._chatRoomM.get('recentMessage') || {};
      this._unregisterListerner();

      // 새것
      this._chatRoomM = refreshedChatRoomM;
      this._chatRoomM.set({'restMessageCount': restMessageCount});
      this._chatRoomM.set({'recentMessage': recentMessage });
      this._registerListerner();

      // 대화방에 연결된 놈도 업데이트
      chatViewManager.refeshLinkToChatRoomM(this.roomId);

    }
  }

  ChatView.prototype._setContactsM = function() {
    //contactM을 할당함.
    var inUserIds = this._chatRoomM.get('inUserIds');
    var targetId = _.without(inUserIds, Alloy.Globals.user.get('id'));
    //TODO : 현재는 1:1이니 타겟은 나를제외하면 한명이됨.
    targetId = targetId[0];
    this._contactM = contactsColllection.getBy(targetId);
    if(!this._contactM.isRegister()){
      var myId = Alloy.Globals.user.get('id');
      var friendInfo = this._chatRoomM.getFriendInfo(myId);
      Ti.API.debug('==============없는 유저',friendInfo);
      this._contactM.set('User_object_To',friendInfo);
      Ti.API.debug('==============없는 유저',this._contactM.getUserInfo());
    };
  }

  ChatView.prototype._refeshLinkToContactsM = function() {
    // 기존
    this._contactM.off('change', this._contactMChangeFn);

    this._setContactsM();

    // 새것
    this._contactMChangeFn = this._onChangeContactM.bind(this);
    this._contactM.on('change', this._contactMChangeFn);

    // 대화방에 연결된 놈도 업데이트
    chatViewManager.refeshLinkToContactsM(this.roomId);
  }

  ChatView.prototype._updateRestMessageCount = function () {
    // 읽지 않은 메시지 개
    var restMessageCount = this._chatRoomM.get('restMessageCount');

    if(restMessageCount && restMessageCount > 0){
      this.restMessageCountWrap.visible = true;
      this.restMessageCount.text = restMessageCount;
    }else{
      this.restMessageCountWrap.visible = false;
    }
  }

  ChatView.prototype._updateFriendData = function() {
    //갱신이 좀 자주되는듯?
    var friend = this._contactM.getUserInfo();

    //갱
    if(friend.name){
      this.friendName.text = friend.name;
      this.editingName.text = friend.name;
    }
    //이때 기본값을줘야함.
    if(!this._hasRecentPhoto){
      this.imageView.image = friend.imageUrl || "/images/chatroomlist_default_profile_pic.png";
    }
    if(!this._hasRecentWord && friend.comment){
      this.recentMessage.text = friend.comment;
    }
  }
  /////////////////// 기타 필요.

  ChatView.prototype._exitChatRoom = function() {
    var self = this;
    var dialog = Ti.UI.createAlertDialog({
      ok: 0,cancel: 1,
      buttonNames: [L('cl_exitConfirmOkBtn'), L('cl_exitConfirmCancleBtn')],
      message: L('cl_exitConfirmMessage')
    });
    dialog.addEventListener('click', function(e){
      if (e.index === e.source.cancel){
        Ti.API.debug('The cancel button was clicked');
      }
      if (e.index === e.source.ok){
        self._chatViewCol.exitChatRoom(self);
      }

      dialog.removeEventListener('click', arguments.callee);
    });
    dialog.show();
  }

  ChatView.prototype._openChatView = function() {
    var roomId = this._chatRoomM.get('roomId');
    var inUserIds = this._chatRoomM.get('inUserIds');
    Ti.API.debug('open chatRoom ', roomId, inUserIds);

    chatViewManager.openView(this._chatRoomM);
  }


////////////////
  return ChatView;
}
//////////////////////////////////////////////////////////////////////////////
////////////////////// ChatViewCollection 싱글톤 인스턴스.
//TODO[faith]: 리펙토링한다면, 상태저장코드를 별개로. chatList에 속하게 만들어야함. 다른 역할..모델의 역할이 섞인것도. 분리해야됨.
// private, public구분도 올바르게..이름도..
function _createChatViewCollection(){
  var ChatView = _defineChatView();
  ///

  var chatViewCol = {};
  //
  chatViewCol._createdChatView = {};
  chatViewCol._orderedChatView = [];

  chatViewCol._isDrawing = false;
  chatViewCol._waitingDrawCount = 0;

  //
  chatViewCol.isEdittingMode = false;

  //////////////////public
  chatViewCol.initialize = function(chatRoomMs, callback){
    //오래된것으로 sort 중복된것있을경우. 오래된것을 살리고, 최근것을 지우기위해.
    // var now = Date.now();
    chatRoomMs = _.sortBy(chatRoomMs, function(chatRoomM){
      var time = new Date(chatRoomM.get('createdAt'));
      return time.getTime();
    })

    //챗뷰를 만들어야 최근메시지 등이 실제 삽입됨.
    var _tempRoomIdSet = {};
    var chatViews = [];
    for(var i = 0, max=chatRoomMs.length; max>i; ++i){
      var chatRoomM = chatRoomMs[i];
      var roomId = chatRoomM.get('roomId');

      //이미 존재하는것은 지우자.
      if(_tempRoomIdSet[roomId]){
        Ti.API.debug('!!!!!!!!!!!!!!!중복된 방은 지운다 !!!!!!!!!!!!!!!!!!!!!');
        var userId = Alloy.Globals.user.get('id');
        chatViewManager.removeController(chatRoomM);
        // chatRoomM.destroy();
        chatRoomCollection.exitRooms(chatRoomM, userId);
        continue; //같은것 무시.
      }else{
        var chatView = this.newChatView(chatRoomM);
        chatViews.push(chatView);
        _tempRoomIdSet[roomId] = true;
      }
    }

    //초기화 후 반영함.
    //재정렬필요.
    chatViews.sort(function(chatViewA, chatViewB){
      var chatRoomMA = chatViewA._chatRoomM;
      var recentMsgA = chatRoomMA.get('recentMessage');
      recentMsgA = recentMsgA || {}
      var timeA = recentMsgA.created ? recentMsgA.created : chatRoomMA.get('createdAt');

      var chatRoomMB = chatViewB._chatRoomM;
      var recentMsgB = chatRoomMB.get('recentMessage');
      recentMsgB = recentMsgB || {}
      var timeB = recentMsgB.created ? recentMsgB.created : chatRoomMA.get('createdAt');

      //서로다른 형태의 문자열, 혹은 시간이므로. 시간으로 변경해줘야함.
      timeA = new Date(timeA);
      timeB = new Date(timeB);

      if(timeA > timeB) return -1;

      if(timeA < timeB) return 1;

      return 0;
    });
    this._orderedChatView = chatViews;

    this.drawChatViews(callback);
  };
  chatViewCol.refresh = function () {
    this.drawChatViews();
  }
  chatViewCol.drawChatViews = function(callback) {
    var self = this;

    //그리기 중이라면 요청을 쌓아둔다.
    if(self._isDrawing){
      ++self._waitingDrawCount;
    }else{
      //그리기 중이 아닐경우만 그리기함..
      self._isDrawing = true;

      //현재 시점에서 그리면. 가장 최신의 요청이기에 대기자를 없엠.
      self._waitingDrawCount = 0;

      $.chatListView.removeAllChildren();

      var allRowCount = self._orderedChatView.length;
      var restOddRowSpaceCount = 0;
      for(var i = 0, max=self._orderedChatView.length; max>i; ++i){
        var chatView = self._orderedChatView[i];
        chatView.changeColor(_getRandomColor());

        _addChatView(chatView.rootView);
        //_.delay(_addChatView, 50*i, chatView.rootView);


        //rowview 삽입 후 반쪽짜리공간이있는지 판단한다.
        if(chatView.isSingle()){
          restOddRowSpaceCount = 0;
        }else{
          restOddRowSpaceCount = ((++restOddRowSpaceCount) % 2);
        }
        //restOddRowSpaceCount가 1일경우 다음공간이있다고 판단.
        if(restOddRowSpaceCount == 1){
          //다음rowView가 single이거나, 존재하지 않는다면. 반쪽짜리 패딩rowview를 삽입.
          // ++allRowCount;
          var nextChatView = self._orderedChatView[i+1];
          if(nextChatView){
            if(nextChatView.isSingle()){
              _addChatView(self._newPaddingRowView(), true);
              //_.delay(_addChatView, 50*i, self._newPaddingRowView(), true);
            }
          }else{
              _addChatView(self._newPaddingRowView(), true);
              //_.delay(_addChatView, 50*i, self._newPaddingRowView(), true);
          }
        }
      }

      //하단에 스크롤 일어날 공간 만들기
      function bottomMarginAdd() {
        var bottomMargin = Ti.UI.createView({
          height: 100,
          width: '100%'
        });
        $.chatListView.add(bottomMargin);
      }
      bottomMarginAdd();
      //_.delay(bottomMarginAdd, 50*self._orderedChatView.length);

      function _addChatView(chatView, isPadding) {
        $.chatListView.add(chatView);
        if(isPadding) {
        }else{
          allRowCount -= 1;
        }
        //마지막 뷰 추가 일 경우. 마무리작업.
        if(allRowCount == 0) {
          Ti.API.debug('last Chatview added, callback time',  allRowCount);
          //외부 콜백이 있다면 호출함.
          if(callback && _.isFunction(callback)){
            callback();
            calback = null; //한번만호출하자.
          }

          // 그리기 완료
          self._isDrawing = false;
                    self.afterDraw();
          // 그린 직후와 비교했을때 재 그리기 요청이있었다면 다시 그려준다.
          if(self._waitingDrawCount > 0){
            Ti.API.debug('Redraw order found, refresh start',  self._waitingDrawCount);
            self.refresh();
          }
        }
      }
    }


    //그릴 것이 없는 상태에서 외부 콜백이 있다면 호출함.
    if(self._orderedChatView.length == 0){
      self._isDrawing = false;
            self.afterDraw();

      if(callback && _.isFunction(callback)){
        callback();
        calback = null; //한번만호출하자.
      }
    }

  }
  //그리기 처리 완료 후 해야할 작업이 있다면 수행함.
  chatViewCol.afterDraw = function() {
    //현재 상태 확인하여. 빈상태일 경우만 emptyImage를 보여줌.
    if(!this._orderedChatView || this._orderedChatView.length == 0){
      $.emptyImageWrap.visible = true;

      // short phone (iphone4) 일때 + ipad 일때
      if (Alloy.Globals.is.shortPhone || Titanium.Platform.osname == 'ipad') {
        $.emptyImageView.bottom = 150;
      }
    }else{
      $.emptyImageWrap.visible = false;
    }

  }

  chatViewCol.reorderChatViewToTop = function (_chatView) {
    var reOrderedChatView = [];
    //최상단에 삽입후.
    reOrderedChatView.push(_chatView);
    //재정렬
    for(var i = 0, max= this._orderedChatView.length; max>i; ++i){
      var chatView = this._orderedChatView[i];
      //최상단에 이미 삽입했으므로 이건 반영된것이니 제외.
      if(chatView.roomId == _chatView.roomId) {
        continue;
      }else{
        reOrderedChatView.push(chatView);
      }
    }

    this._orderedChatView = reOrderedChatView;
  };

  // 새 row veiw를 만들어야하는지 판단.
  chatViewCol.hasCreatedChatView = function (roomId) {
    if(this._createdChatView[roomId]){
      return true;
    }else{
      return false;
    }
  }
  //
  chatViewCol.getExistingChatView = function (roomId) {
    return this._createdChatView[roomId] ? this._createdChatView[roomId] :  null;
  }

  chatViewCol.moveChatViewToTop = function (chatView, isHalfToSingle){
    var roomId = chatView.roomId;
    var existingChatView = this.getExistingChatView(roomId);
    if(existingChatView){
      //
      var topChatView = this._orderedChatView[0];

      if(!topChatView){
        this._orderedChatView[0] = existingChatView;
        this.refresh();
      }else{
        if(topChatView.roomId != roomId){
          //TODO[faith]:그리기 속도가 빠르면. ios에서 이상해짐. 그래서 refresh..에 맡김;;
          this.reorderChatViewToTop(existingChatView);
          this.refresh();
        }else{
          //같을경우. 그냥둬도되는데. ios가 제대로 half->single이라면.그려지지가않아. 이경우만 다시그리자. ios만
          Ti.API.debug('topView가 half->single일경우 제대로 그려지지않음.',topChatView.roomId, roomId);
          if(isHalfToSingle){
               this.refresh();
          }
        }
      }
    }
  }

  //TODO[faith]:chatView가 일을하고 일부분만 컬렉션이 하는것이 맞을텐데.
  chatViewCol.exitChatRoom = function(toExitChatView) {
    Alloy.Globals.startWaiting('c_waitingMsgRemoveChatRoom');

    var toExitChatRoomMs = [];
    var toExitRoomIds = [];
    var reOrderedChatView = [];

    for(var i = 0, max= this._orderedChatView.length; max>i; ++i){
      var chatView = this._orderedChatView[i];

      if(chatView.roomId == toExitChatView.roomId){
        //모델값 지우기위해 모아둠.
        toExitChatRoomMs.push(chatView._chatRoomM);
        toExitRoomIds.push(chatView.roomId);

        delete this._createdChatView[chatView.roomId];
        chatView.remove();
      }else{
        //선택되지 않은값은 순서대로 다시 모아둠.지우기위해...
        reOrderedChatView.push(chatView);
      }
    }

    //모은값으로 다시 그리기.
    this._orderedChatView = reOrderedChatView;
    this.drawChatViews();


    // 순서대로... 뷰(위에서삭제), 컨틀롤러, 컬렉션에서 모델, 서버에서 업데이트.
    var userId = Alloy.Globals.user.get('id');
    chatViewManager.removeController(toExitChatRoomMs);
    chatRoomCollection.exitRooms(toExitChatRoomMs, userId);
    messageCollection.removeMessages(toExitRoomIds);

    Alloy.Globals.stopWaiting();
  }



  ///////////////////////  private

  // chatViewCol.enableDraw = function() {
  //   this._disableDraw = false;
  // }
  // chatViewCol.disableDraw = function() {
  //   this._disableDraw = true;
  // }

  chatViewCol.toggleEditingView = function(isFocedEdittingModeState) {
    //현재 상태 토글후.
    if(this.isEdittingMode){
      this.isEdittingMode = false;
    }else{
      this.isEdittingMode = true;
    }

    //외부에서 에디팅모드를 결정하고 그것을 강제 해야할경우.
    if(_.isBoolean(isFocedEdittingModeState)){
      this.isEdittingMode = isFocedEdittingModeState;
    }

    for(var p in this._createdChatView){
      var chatView = this._createdChatView[p];
      if(chatView){
        chatView.toggleEditingView();
      }
    }
  }

  chatViewCol.updateCheckedTimeFromNow = function() {
    for(var p in this._createdChatView){
      var chatView = this._createdChatView[p];
      if(chatView){
        chatView.updateCheckedTimeFromNow();
      }
    }
  }

  // chatRoomM 다시 연결
  chatViewCol.refeshLinkToChatRoomM = function() {
    for(var p in this._createdChatView){
      var chatView = this._createdChatView[p];
      if(chatView){
        chatView._refeshLinkToChatRoomM();
      }
    }
  }

  // contactsM 다시 연결
  chatViewCol.refeshLinkToContactsM = function() {
    for(var p in this._createdChatView){
      var chatView = this._createdChatView[p];
      if(chatView){
        chatView._refeshLinkToContactsM();
      }
    }
  }

  //전체 변경.
  chatViewCol.isTopView = function (chatView) {
    var _chatView = this._orderedChatView[0] || {};

    if(chatView.roomId == _chatView.roomId){
      return true;
    }else{
      return false;
    }
  }
  ///////////// 뷰 생성관련. private
  chatViewCol.newChatView = function (chatRoomM) {
    var roomId = chatRoomM.get('roomId');
    var inUserIds = chatRoomM.get('inUserIds');
    //뷰가 이미있다면 안만듬.
    if(this.hasCreatedChatView(roomId)) return this._createdChatView[roomId];
    // 실시간 메시지 변화 반영작업
    //채팅뷰 만들때 기준이 될 row를 배정함.
    var chatView = new ChatView(chatRoomM, this);
    this._createdChatView[roomId] = chatView;
    //컨트롤러도 만들어줌.
    //chatViewManager.getOrCreate(chatRoomM);
    return chatView;
  }


  chatViewCol.addChatViewToTop = function (chatRoomM) {
    var chatView =  this.newChatView(chatRoomM);
    this.moveChatViewToTop(chatView);
  }


  //빈공간에 삽입될 반쪽짜리 rowView생성.
  chatViewCol._newPaddingRowView = function() {

    var rowView = $.UI.create('View',{
      classes:["oddPaddingRowView"]
    });
    var innerRowView = $.UI.create('View',{
      classes:["oddPaddingInnerRowView"]
    });
    var imageView = $.UI.create('ImageView',{
      classes:["oddPaddingImageView"]
    });

    innerRowView.add(imageView);
    rowView.add(innerRowView);
    return rowView;
  }
  ///////////////////
  return chatViewCol;
}


//이미지 한영 변환 작업.
// (function(){
  $.emptyImageView.image = (Alloy.Globals.currentLanguage == 'ko') ? "/images/chatroomlist_emptyview.png" : "/images/chatroomlist_emptyview_en.png";
  $.emptyImageView2.image = (Alloy.Globals.currentLanguage == 'ko') ? "/images/chatroomlist_emptyview_txt.png" : "/images/chatroomlist_emptyview_txt_en.png";

// })();

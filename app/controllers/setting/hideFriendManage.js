var args = arguments[0] || {};

$.container.title = L('sb_hideFriendTitle');


var Q = Alloy.Globals.Q;

var hideContactsCol;


//////////////
$.getView().addEventListener('open', function () {

  var allContactsCol = Alloy.Collections.instance('contacts');
  var models = allContactsCol.filter(function(model){
    return (model.get('User_objectId_To') && model.get('isHidden'));
  });

  hideContactsCol = Alloy.createCollection('contacts');
  hideContactsCol.reset(models);
  drawHideFriend();

});
////////////

//
$.listView.addEventListener('itemclick', function(e){
  var itemId = e.itemId;
  var contactM = hideContactsCol.get(itemId);


  var opts = {
    cancleBan: 0, ban: 1
  }
  if(OS_IOS){
    opts.options = [
      L('sb_cancleBanFriend'),
      L('sb_ban'),
      L('c_cancle'),
    ]
  }else{
    opts.options = [
      L('sb_cancleBanFriend'),
      L('sb_ban')
    ]
    opts.buttonNames = [L('c_cancle')];
  }

    var dialog = Ti.UI.createOptionDialog(opts)

    //사진찍거나 가져오고, 로컬 변환후.. 서버에 저장한다.
  dialog.addEventListener('click', function(e){
    //아무동작하지않음.
    if(OS_IOS){
      if(e.index > 1) return;
    }else{
      if(e.button) return;
    }

    if(e.index == e.source.cancleBan){
      cancleBan(contactM);
    }
    if(e.index == e.source.ban){
      blockFriend(contactM);
    }
  });

  dialog.show();
});

//업데이트와....컬렉션에서 제거.....리스트뷰는 걍 다시그리고.
function cancleBan(contactM) {
  hideContactsCol.remove(contactM, {remove:false});
  drawHideFriend();

  var tempContactM = Alloy.createModel('contacts');
  tempContactM.save({'objectId': contactM.id, 'isHidden': false}, {
      success: function (result) {
        contactM.set({'isHidden': false}, {change:'false'});
        //전체 친구목록을 다시그림.
        // var currentContactM = currentContactsCol.get(contactM.id);
        // currentContactM.set({'isHidden': false}, {change:'false'});
      },
      error : function (error) {
        hideContactsCol.add(contactM, {add:false});
        drawHideFriend();
        Alloy.Globals.alert('c_alertMsgDefault');
      }
  });
}

//히든은 숨기고..대신 블락을시키네.
function blockFriend(contactM) {
  hideContactsCol.remove(contactM, {remove:false});
  drawHideFriend();

  var tempContactM = Alloy.createModel('contacts');
  tempContactM.save({'objectId': contactM.id, 'isHidden': false, 'isBlock': true}, {
      success: function (result) {
        contactM.set({'isHidden': false, 'isBlock': true}, {change:'false'});
        //전체 친구목록에는 어차피 안보임
        // var currentContactM = currentContactsCol.get(contactM.id);
        // currentContactM.set({'isHidden': false, 'isBlock': true}, {change:'false'});
      },
      error : function (error) {
        hideContactsCol.add(contactM, {add:false});
        drawHideFriend();
        Alloy.Globals.alert('c_alertMsgDefault');
      }
  });
}

function drawHideFriend() {
  var items = [];
  hideContactsCol.each(function(contactM){
    var friend = contactM.getUserInfo();
    items.push({
      template : "rowTemplate",
      profileImage : {
        image : friend.imageUrl || "/images/friendlist_profile_default_img.png"
      },
      profileName: {
        text : friend.name
      },
      rowRightBtnLabel : {text :L('c_manage')},
      properties : {
        itemId : contactM.id
      }
    });
  });

  $.section.setItems(items);
};

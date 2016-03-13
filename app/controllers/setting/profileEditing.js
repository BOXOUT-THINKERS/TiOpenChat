var args = arguments[0] || {};

//name, comment 구분자.
var caseName = args.caseName;

var titleName = (caseName == "name") ? L('s_nameTitle') : L('s_commentTitle');
var inputLimitSize = (caseName == "name") ? Alloy.Globals.inputLimit.name : Alloy.Globals.inputLimit.comment;

//네비게이션 센터 타이틀 및 우측버튼 설정.
if(OS_IOS){
    $.window.title = titleName;

  var opt = _createRightBtnOption();

  var rightMenuView = Ti.UI.createView();
  var rightBtn = Ti.UI.createButton(opt.btnData);
  rightBtn.addEventListener("click", opt.onClick);
  rightMenuView.add(rightBtn);

    $.window.rightNavButton = rightMenuView;

}else{
    $.window.addEventListener('open', function() {
      var activity = $.window.getActivity();
      if (activity) {
        var opt = _createRightBtnOption();

          activity.onCreateOptionsMenu = function(e) {
              var rightBtn = e.menu.add(opt.btnData);
              rightBtn.setShowAsAction(Ti.Android.SHOW_AS_ACTION_ALWAYS);
              rightBtn.addEventListener("click", opt.onClick);
          };


          var actionBar = activity.actionBar;
          if (actionBar) {
              activity.actionBar.title = titleName;
          }
        activity.invalidateOptionsMenu();
      }
  });
}

////////////////////////////////////////
//뷰에 필요한 초기값 부여
//유저가 있는상태임.
(function(){
    var userM = Alloy.Globals.user.attributes;
    var inputText = userM.get(caseName) || "";

    var opt = _createRightBtnOption();

    //초기값부여.
    $.explanaionWord.text = titleName + L("s_explanaionWord");
    $.inputArea.value = inputText;
    if(OS_IOS){
        //TODO[faith]:ios에서는 maxLength를 설정하면 최대길이인 상태에서.. 중간값을 변경하면 커서위치가 끝으로 이동함. 그 전 위치를 알수가 없다.
        // 그래서 현재는 위의 상황에서. 우측글씨가 사라지는 것이 보이는 현상이 존재함. 어찌해야할까..
    }else{
        $.inputArea.maxLength = inputLimitSize;
    }
    onChangeInputField();

    //input이벤트.
    $.inputArea.addEventListener('change', onChangeInputField);
    //엔터. 확인.
    $.inputArea.addEventListener('return', opt.onClick);

    ///////////////////
    function onChangeInputField() {
        var curText = $.inputArea.value || '';

        Ti.API.debug(';;;;;;;;;;;;;;;;;;;;;;;', $.inputArea.getSelection())
        if(curText.length > inputLimitSize){
            if(OS_IOS){
                var selection = $.inputArea.getSelection() || {location : curText.length };
                var location = selection.location;
                //ios에서 값 변경시 커서가 끝으로 이동되기에 그전 위치로 변경해야한다.
                $.inputArea.value = curText.slice(0, inputLimitSize);
                if(location < inputLimitSize){
                    $.inputArea.setSelection(location, location);
                }
            }
        }else{
            if(curText.length == inputLimitSize) {
                $.inputLimit.color = "#ff5d5d";
            }else{
                $.inputLimit.color = "#bebebe";
            }

            $.inputLimit.text = curText.length + " / " + inputLimitSize;
        }


    };

})();



////////////// helper

function _createRightBtnOption() {
  return {
    btnData : {
      title: L("s_enter"),
      font: { fontSize: 15 }
    },
    onClick : function(){
          if(($.inputArea.value == '' || $.inputArea.value == null)){
        Alloy.Globals.alert('s_alertEmptyComment');
      }else{
        var data = {};
        data[caseName] = $.inputArea.value;

        _updateUser(data);
        $.window.close();
      }
    }
  }
};
function _updateUser(data) {
  //로컬에 반영
  var userM = Alloy.Globals.user.attributes;
  userM.set(data,{change:false});
  Alloy.Globals.user.trigger('change:profile');

  //서버에 반영.
  Parse.Cloud.run('userModify', data, {
    success: function(result) {
      Ti.API.debug('settings:UserModify');
    },
    error: function(error) {
      //TOOD[faith] : 이전값 저장해두었다가 되돌리는 코드가필요함.
      Ti.API.debug('settings:UserModify', error);
    }
  });
};

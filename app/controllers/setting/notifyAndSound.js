$.mainView.title = L('s_notifyAndSound');
$.sn_notifyPush.text = L('sn_notifyPush');
$.sn_notifyEventAndNotice.text = L('sn_notifyEventAndNotice');
$.sn_banTime.text = L('sn_banTime');
$.sn_banTimeStart.text = L('sn_banTimeStart');
$.sn_banTimeEnd.text = L('sn_banTimeEnd');

var U = Alloy.Globals.util;
var pushC = Alloy.Globals.parsePushC;
var settingsM = Alloy.Globals.settings;

//현재뷰는 로긴이후 사용할수있으니 유저정보 사용가능.
//전역변수. 방해금지시간에 실시간 값.
var banInfo = _getBanTimeInfo(Alloy.Globals.user.attributes);


// 현재 상태에대한 스위치값 설정.
(function() {
  var userM =  Alloy.Globals.user.attributes;;

  $.permission_push_switch.value = userM.get('isPermissionAllPush') || false;
  $.Installation_channels_eventSwitch.value = settingsM.get('Installation_channels_event') || false;


  //방해금지시간사용할것인지여부.
  $.isStopNoticeTimeSwitch.value = banInfo.isUsingBanTime;
  if($.isStopNoticeTimeSwitch.value){
    $.isStopNoticeTimeSubSection.visible = true;
  }else{
    $.isStopNoticeTimeSubSection.visible = false;
  }

  //방해금지 시작,끝 시각 설정.
  $.banStartTime.text = banInfo.banStartHour + " : " +banInfo.banStartMinute;
  $.banEndTime.text = banInfo.banEndHour + " : " +banInfo.banEndMinute;

})();


// 값 변경 동기화. 리스너.
(function() {
  $.permission_push_switch.addEventListener('change', function(){
    if($.permission_push_switch.value){
      _updateUser({'isPermissionAllPush':true});
    }else{
      _updateUser({'isPermissionAllPush':false});
    };
  });

  $.Installation_channels_eventSwitch.addEventListener('change', function(){
    settingsM.save({'Installation_channels_event': $.Installation_channels_eventSwitch.value});
    if($.Installation_channels_eventSwitch.value){
      pushC.subscribeChannels('Event');
    }else{
      pushC.unsubscribeChannels('Event');
    };
  });

  $.isStopNoticeTimeSwitch.addEventListener('change', function(){
    if($.isStopNoticeTimeSwitch.value){
      $.isStopNoticeTimeSubSection.visible = true;
    }else{
      $.isStopNoticeTimeSubSection.visible = false;
    }
    _updateUser({'isUsingBanTime': $.isStopNoticeTimeSwitch.value});
  });

})();


function onOpenBanStartTimePicker(e) {
  _openTimePicker([banInfo.banStartHour, banInfo.banStartMinute], function(hour, minute) {
    banInfo.banStartHour = hour;
    banInfo.banStartMinute = minute;

    $.banStartTime.text = banInfo.banStartHour + " : " +banInfo.banStartMinute;

    //업데이트
    _updateUser(banInfo);
  });
}
function onOpenBanEndTimePicker(e) {
  _openTimePicker([banInfo.banEndHour, banInfo.banEndMinute], function(hour, minute) {
    banInfo.banEndHour = hour;
    banInfo.banEndMinute = minute;

    $.banEndTime.text = banInfo.banEndHour + " : " +banInfo.banEndMinute;

    //업데이트
    _updateUser(banInfo);
  });
}


/////////////////////////////////////////////////////////////////////
// private methods

function _getBanTimeInfo(userM) {
    //방해금지시간관련
    //기본값을 0임.
    var banInfo = {
      isUsingBanTime : (userM.get('isUsingBanTime') !=undefined) ? userM.get('isUsingBanTime') : true,

      banStartHour : _.isNumber(userM.get('banStartHour')) ? userM.get('banStartHour') : 0,
      banStartMinute : _.isNumber(userM.get('banStartMinute')) ? userM.get('banStartMinute') : 0,
      banEndHour : _.isNumber(userM.get('banEndHour')) ? userM.get('banEndHour') : 0,
      banEndMinute : _.isNumber(userM.get('banEndMinute')) ? userM.get('banEndMinute') : 0
    }

    //초기 설정이 없을 경우.초기값 업뎃해줌.
    if(!_.isNumber(userM.get('banStartHour'))){
      _updateUser(banInfo);
    }
    return banInfo;
}

//
function _updateUser( data) {
  //로컬에도 변경사항 저장.
  var userM =  Alloy.Globals.user.attributes;;
  userM.set(data, {change:false});

  Parse.Cloud.run('userModify', data, {
    success: function(result) {
      Ti.API.debug('settings:UserModify');
    },
    error: function(error) {
      Ti.API.debug('settings:UserModify', error);
    }
  });
}


//타임피커를사용.
function _openTimePicker(selectedValues, doneCallback){
  var timePicker = Alloy.createWidget('danielhanold.pickerWidget', {
    id: 'myAgePicker',
    outerView: $.mainView,
    hideNavBar: false,
    type: 'time-picker',
    pickerValues:[], //의미없는..없으면 에러라서.
    pickerParams: [{
        min: 0,
        max: 23,
        diff: 1
      },
      {
        min: 0,
        max: 59,
        diff: 5
    }],
    selectedValues: selectedValues,
    onDone: function(e) {
      Ti.API.debug('click picker');

      if(e.cancel) {
        //아무 동작이 없음.
      } else {
        Ti.API.debug(e.data);
        doneCallback(e.data.low, e.data.high);
      }
    }
  });
}

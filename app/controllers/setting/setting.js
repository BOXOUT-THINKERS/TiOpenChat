$.container.title = L('c_setting');
$.s_nameTitle.text = L('s_nameTitle');
$.s_commentTitle.text = L('s_commentTitle');
$.s_notifyAndSound.text = L('s_notifyAndSound');
$.s_friendManage.text = L('s_friendManage');
$.s_connectSNS.text = L('s_connectSNS');
$.s_phone.text = L('s_phone');
// $.s_versionInfo.text = L('s_versionInfo');
$.s_helpPrivate.text = L('s_helpPrivate');

var U = Alloy.Globals.util;

var settingsM = Alloy.Globals.settings;

var localPhotoService  = require('services/localPhotoService');
var remotePhotoService = require('services/remotePhotoService');


///////////////////    컨트롤러(싱글톤) 생성 시점 초기화 시작 //////////////////////////////////////////////
//세팅에서는 네비바의 우측버튼없에기 그냥안보이는거넣음되겟.
exports.rightBtn = function() {
  //센터뷰로 변경될씨 발생됨.
  init();

  var rightBtnOption = {
    title: ""
  };
  var rightBtnFn = function () {
  };
  return {
    'centerTitle' : L("c_setting"),
    'rightBtnOption' : rightBtnOption,
    'rightBtnFn' : rightBtnFn
  };
};

//리스너 등록. 재생성없이 사용하므로 컨트롤러 생성시점에서 한번 바인딩만하면됨.
registerListerners();
function registerListerners() {
  // 스위치 변경에 대한 값 동기화
  var userM = Alloy.Globals.user;
  userM.on('change:profile', updateUserData);

  $.notifyAndSound.addEventListener('click', moveWindow.bind(null,'notifyAndSound'));
  $.banManage.addEventListener('click', moveWindow.bind(null,'banManage'));
  // $.versionInfo.addEventListener('click', moveWindow.bind(null,'versionInfo'));
  $.helpPrivate.addEventListener('click', moveWindow.bind(null,'helpPrivate'));
  // $.isSaveReceivedPhotoSwitch.addEventListener('change', function(){
  //   settingsM.save({'isSaveReceivedPhoto': $.isSaveReceivedPhotoSwitch.value});
  // });

}
///////////////////    컨트롤러 생성시점 초기화 끝 //////////////////////////////////////////////


///////////////////    컨트롤러의 뷰 오픈시점 초기화(rightBtn 생성시 호출) //////////////////////////////////////////////
function init() {
  updateUserData();
  updateSettingData();
}
///////////////////    컨트롤러의 뷰 오픈시점 초기화 끝 //////////////////////////////////////////////




function updateSettingData () {
  // 현재 상태에대한 스위치값
  // $.isSaveReceivedPhotoSwitch.value = settingsM.get('isSaveReceivedPhoto') || false;
}

function updateUserData() {
  var userM = Alloy.Globals.user.attributes || {};

  //ios에서 이벤트 리스너로 아래 호출을 할 경우. 순환참조로 죽는것같음.
  // Ti.API.debug(userM) or Ti.API.debug(userM.attributes)

  $.profileImage.image = userM.get('profileImage') ? userM.get('profileImage').url() : "/images/setting_default_profile_pic.png" ;
  $.profileName.text = userM.get('name') || "";
  $.profileComment.text = userM.get('comment') || "";
  $.phoneNumber.text = userM.get('local') + "-" + userM.get('phone');
}



////////////////////////////뷰에 직접 바인딩되는 것들.  //////////////////////////////////
// 프로퍼티 이름으로 윈도우이동..


function moveWindow(controllerName) {
  var windowName = "setting/" + controllerName;
  var controller = Alloy.createController(windowName);
  Alloy.Globals.openWindow(controller);
}

//그냥 여러개만들자.
function moveProfileEdittingForName() {
  var args = {
    caseName :"name"
  };
  var controller = Alloy.createController("setting/profileEditing", args);

  Alloy.Globals.openWindow(controller);
}
function moveProfileEdittingForComment(){
  var args = {
    caseName :"comment"
  };
  var controller = Alloy.createController("setting/profileEditing", args);

  Alloy.Globals.openWindow(controller);
}



// 팝업띄우고, 사진선택 혹은 촬영할수있도록.함
function changeProfileImage() {
  var opts = {
    byAlbum: 0, byCamera: 1
  }
  if(OS_IOS){
    opts.options = [
      L('s_selectPhotoByAlbum'),
      L('s_selectPhotoByCamera'),
      L('c_cancle'),
    ]
  }else{
    opts.options = [
      L('s_selectPhotoByAlbum'),
      L('s_selectPhotoByCamera')
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


    if(e.index == e.source.byAlbum){
      localPhotoService.getPhoto()
        .then(_successCallback)
        .catch(_errorCallback);
    }
    if(e.index == e.source.byCamera){
      localPhotoService.capturePhoto()
        .then(_successCallback)
        .catch(_errorCallback);
    }
  });

  //show
    dialog.show();

  ////
  function _successCallback(photoInfo) {
    Alloy.Globals.startWaiting();

    var photoBlob = photoInfo.blob;
    var imgName = photoInfo.name;
    var thumbnailBlob = localPhotoService.resizeForThumbnail(photoBlob);

    Ti.API.debug('capturePhoto : '+imgName);
    remotePhotoService.savePhoto(thumbnailBlob, imgName)
      .then(function(parseFile) {
        var imgPath = parseFile.url();
        Ti.API.debug('savePhoto : '+imgPath);

        Alloy.Globals.stopWaiting();
        //로컬 모델 및 서버모델에 에 반영.
        _updateUser({'profileImage':parseFile}, false);
        //TODO[faith]: 이게 반영될수있도록. 프로필변경. user저장등을 해야함.
        Ti.API.debug('remote save : ',imgPath);
      })
      .catch(function(e){
        Ti.API.debug(e);
      });
  }
  function _errorCallback(error) {
    Alloy.Globals.stopWaiting();
    var message = (error.message) ? error.message : error;
    Ti.API.debug(message);
    if(!error.isCancel){
      Alloy.Globals.toast(msg);
    }
  }
}
//////////////

//private helper
function _updateUser(data, isNotNotifyAboutChangeUser) {
  //로컬에 반영
  var userM = Alloy.Globals.user.attributes;
  userM.set(data, {change:false});

  if(!isNotNotifyAboutChangeUser) {
    Alloy.Globals.user.trigger('change:profile');
  }
  //서버에 반영.
  Parse.Cloud.run('userModify', data, {
    success: function(result) {
      Ti.API.debug('settings:UserModify success');
    },
    error: function(error) {
      //TOOD[faith] : 이전값 저장해두었다가 되돌리는 코드가필요함.
      Ti.API.debug('settings:UserModify error : ', error);
    }
  });
};



//이미지 한영 변환 작업.
// (function(){
  if((Alloy.Globals.currentLanguage != 'ko') && OS_IOS){
    $.phoneNumber.right = 18;
  }
// })();

var args = arguments[0] || {};

$.closeBtn.title = L('pv_closeBtn');

//chatViewManager에서 chatRoom컨트롤러를 관리하기위해 아래 두가지 값을 노출하여 식별값으로 사용함.
var photoUrl = args.photoUrl;
var photoName = args.photoName;
var location = args.location;


var localPhotoService  = require('services/localPhotoService');

exports.isLoadCompletePrevImage = false;
///////////////////

Ti.API.debug('photoViewer :');
//image로드 완료시점에 스피너 종료.
$.currentImage.addEventListener('load', function() {
	exports.isLoadCompletePrevImage = true;
	Alloy.Globals.stopWaiting();
});
//보여줄 이미지 설정.
$.currentImage.image = photoUrl;
$.window.addEventListener('open', function() {
	// 아직 이미지가 로드되지 않았을경우만(보통 리모트이미지) 스피너를 생성한다.
	if(!exports.isLoadCompletePrevImage){
		Alloy.Globals.startWaiting();
	}
});
//TODO[faith]:nameAndTime 보여줘야함.텍스트.

//이미지 클릭시 네비 둘. 토글
$.currentImage.addEventListener('click', function() {
	if($.topView.visible){
		$.topView.visible = false;
		$.bottomView.visible = false;
	}else{
		$.topView.visible = true;
		$.bottomView.visible = true;
	}
});
//카메라롤/갤러리에 이미지저장
$.saveBtn.addEventListener('click', function() {
	Ti.API.debug('save photo', photoUrl, photoName);

	Alloy.Globals.startWaiting();
	// var blob =  $.currentImage.toImage();
	var blob =  $.currentImage.toBlob();
	localPhotoService.saveToPhotoGallery(blob, function success(e) {
		Ti.API.debug('----photoGallery saved',e);
		Alloy.Globals.toast("ps_successSavePhoto");
		Alloy.Globals.stopWaiting();
	}, function fail(e) {
		Ti.API.debug('-----photoGallery errro',e);
		Alloy.Globals.error("ps_failSavePhoto");
		Alloy.Globals.stopWaiting();
	});
})
$.closeBtn.addEventListener('click',function() {
	$.getView().close();
	Alloy.Globals.stopWaiting();
})

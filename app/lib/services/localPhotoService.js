var Q = Alloy.Globals.Q;
/*
 * # 역할.
 *  - blob을 인자로 받아서 포토갤러리/카메라롤에 저장한다.
 *
 * # 안드로이드에서 안되는 부분(이유확인못함) - imageView.toBlob() 원하는 동작가능
 *   - Titanium.Media.saveToPhotoGallery(file)에 전달되는 파일 인자를 전달했을경우 아래경우 모두안됨.
 *     1) imageView.toImage().media
 *     2) Titanium.Filesystem.getFile(Titanium.Filesystem.applicationCacheDirectory, fileName)
 *       ;url로 리모트파일 만들었던 경우와 local에 저장된 파일을 전달했을경우도안됨.
 *     3) Titanium.Media.showCamera()의 콜백에 전달된 e.media
 *
 *   - 만약 위의 1,2,3에서 만든 file이더라도 imageView를 한번 거치면 동작함.
 *		ex) var blob = Titanium.UI.createImageView({ image: file.nativePath }).toBlob()
 */
exports.saveToPhotoGallery = function (imageBlob, successCb, failCb) {
	// On Android this method only supports saving images to the device gallery.
	Titanium.Media.saveToPhotoGallery(imageBlob, {
		success : successCb,
		error : failCb
	});
}


// 이미지를 포토, 카메라앱을 통해 가져옴.
exports.getPhoto = function() {
	var params = {
		// arrowDirection, popoverView, 이건 아이패드전용
		animated  : false,

		saveToPhotoGallery:false,//아래와 한
		allowEditing : false, //미디어 가져오고 수정할 것인지.

		showControls : true, //갤러리에도 필요하려나?
		autohide : true, //미디어 선택후 갤러리 자동숨김, ios용.
		mediaTypes : [Titanium.Media.MEDIA_TYPE_PHOTO]

	};

	return _getOrCapturePhoto('openPhotoGallery', params);
};

//TODO[faith]: overlay는 overlayCamer()이런 이름으로 빼야겠다.
// 성공시. photoData =  {blob: BLOB, name: 이미지이름(확장자포함) }
// 실패시. string message
exports.capturePhoto = function(options) {
   //TODO: 언어
	if (!Titanium.Media.isCameraSupported) { return Q.fcall(function() { throw {messsage:L('ps_failNotSuportCamera')}; }); };

	var params = {
		saveToPhotoGallery : false,
		allowEditing : false,
		transform : Ti.UI.create2DMatrix().scale(1),
		mediaTypes : [Titanium.Media.MEDIA_TYPE_PHOTO]
	}

	//TODO[faith] : promise사용한 패턴에서 2번이상 캡쳐시 deferred.resolve()..이게 전달이 안됨. 그래서 raw한 형태로 재구성..
	if(options && options.overlay && options.success) {
		//overlay사용시 설정해야함.
		_.extend(params, {
			overlay : options.overlay,
			_success : options.success,
			_error : options.error,
			animated : true,
			//기본컨트롤제거.
			showControls : false,
			autohide : false
		});

		return _capturePhotoForOverlay('showCamera', params);
	}else{
		//전체 화면으로 촬영시.
		_.extend(params, {
			showControls : true
		});
		return _getOrCapturePhoto('showCamera', params);
	}

};
// raw형태를 콜백에 직접 전달.
function _capturePhotoForOverlay(action, params) {
	if( !(action in Titanium.Media) ) {
		if(params && params._error) {
			params._error({messsage:L('ps_failNotSuportCamera')});
		}
		return;
	};


	params.success = function(event) {
			// event.media
		if(event.mediaType == Titanium.Media.MEDIA_TYPE_PHOTO) {
			var photoInfo = {
				blob : event.media,
				//TODO[faith]: 확장자가 변경되야함
				name : (OS_IOS) ? (Date.now() + ".jpg") : event.media.getFile().getName()
			}

			params._success ? params._success(photoInfo) : '';
		} else {
			params._error ? params._error({messsage:L('ps_failNotPhoto') }) : '';
		};

	};
	params.cancel = function() {
		params._error ? params._error({messsage:L('ps_failCancle'), isCancel:true }) : '';
	};
	params.error = function(error) {
		// TODO : 언어
		var msg = "";
		if (error.code == Titanium.Media.NO_CAMERA) {
			msg = L('ps_failNotSuportCamera');
		} else {
			msg = L('ps_failGetPhoto');
		}

		params._error ? params._error({messsage:msg}) : '';
	};

	Titanium.Media[action].call(Titanium.Media, params);
};



exports.resize = function(photoBlob, targetView) {
		var ImageFactory = require('ti.imagefactory');

		// Titanium.API.info(photoBlob.width);
		// Titanium.API.info(photoBlob.height);
		// Titanium.API.info(photoBlob.mimeType);
		Ti.API.debug('Original Image : ', photoBlob.width, ' * ', photoBlob.height);

		var resizedImage, croppedImage;
		if (OS_ANDROID) {
			var fhImageFactory = require("fh.imagefactory");
			var maximumSize = null;

			//이미지를 리사이즈 하면서 돌리자
			if (photoBlob.width > photoBlob.height) {
				// 가로가 길때
				var rateWH = photoBlob.width / photoBlob.height;
				var targetHeight = Alloy.Globals.ImageWidth;
				var targetWidth = targetHeight * rateWH;
				maximumSize = targetWidth;
			} else {
				// 세로가 길때
				var rateHW = photoBlob.height / photoBlob.width;
				var targetWidth = Alloy.Globals.ImageWidth;
				var targetHeight = targetWidth * rateHW;
				maximumSize = targetHeight;
			}
			var nativePath = photoBlob.nativePath;
			fhImageFactory.rotateResizeImage(nativePath, maximumSize, 100);
			resizedImage = Titanium.Filesystem.getFile(nativePath).read();
			Ti.API.debug('Resize Image : ', resizedImage.width, ' * ', resizedImage.height);
		} else {
			//촬영한 이미지 비율.
			var rateHW = photoBlob.height / photoBlob.width;

			var targetWidth = Alloy.Globals.ImageWidth;
			var targetHeight = targetWidth * rateHW
			resizedImage = ImageFactory.imageAsResized(photoBlob, {
				width : targetWidth,
				height : targetHeight
			});
			Titanium.API.info('Resize Image : ', targetWidth, ' * ', targetHeight);
		}

		// 화면에 표시된 영역 만큼만 크롭
		if(targetView){
			var cropHWRate = targetView.size.height / targetView.size.width;
			var cropWidth = targetWidth;
			var cropHeight = cropWidth * cropHWRate;
			//가짜 이미지에서는 crop범위가 클경우 자르지 않는다.
			//  Error: x + width must be <= bitmap.width()
			if(cropWidth > resizedImage.width){
				Titanium.API.info('not crop : cropWidth : ', cropWidth, '> bitmapWidth ', resizedImage.width);
				croppedImage = resizedImage;
			}else{
				croppedImage = ImageFactory.imageAsCropped(resizedImage,{
					x: 0,
					y: 0, //상단에 nav영역이 있다면 그 높이 만큼
					width: cropWidth,
					height: cropHeight
				});
				Titanium.API.info('Crop Image : ', cropWidth, ' * ', cropHeight);
			}

		}

		var imageToCompress = croppedImage || resizedImage;
		// 이미지 압축을 하자
		return  ImageFactory.compress(imageToCompress, Alloy.Globals.ImageQuality);
};

//width 기준 576
exports.resizeForThumbnail = function(photoBlob) {
	var ImageFactory = require('ti.imagefactory');
	//리사이즈 and crop
	photoBlob = photoBlob.imageAsThumbnail(Alloy.Globals.thumbWidth);

	//압축.
	return  ImageFactory.compress(photoBlob, Alloy.Globals.ImageQuality);
}

// 포토갤러리, 혹은 카메라 앱을 이용하여 가져옴.
function _getOrCapturePhoto(action, params) {
	var deferred = Q.defer();
	if( !(action in Titanium.Media) ) { return Q.fcall(function() { throw {messsage:L('ps_failNotSuportCamera')}; }); };


	params.success = function(event) {
			// event.media
		if(event.mediaType == Titanium.Media.MEDIA_TYPE_PHOTO) {
			Ti.API.debug('----------------------------------------사진촬')
      		var photoInfo = {
      			blob : event.media,
      			//TODO[faith]: 확장자가 변경되야함
      			name : (OS_IOS) ? (Date.now() + ".jpg") : event.media.getFile().getName()
      		}
			deferred.resolve(photoInfo);
		} else {
			deferred.reject({messsage:L('ps_failNotPhoto') });
		};

	};
	params.cancel = function() {
		deferred.reject({messsage:L('ps_failCancle'), isCancel:true });
	};
	params.error = function(error) {
		// TODO : 언어
		var msg = "";
		if (error.code == Titanium.Media.NO_CAMERA) {
			msg = L('ps_failNotSuportCamera');
		} else {
			msg = L('ps_failGetPhoto');
		}
		deferred.reject({messsage:msg});
	};

	Titanium.Media[action].call(Titanium.Media, params);

	return deferred.promise;

};

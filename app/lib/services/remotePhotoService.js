
var Q = Alloy.Globals.Q;

//  리모트 저장소로 Parse를 이용함.
exports.savePhoto = function(blobImage, imageName) {
	var deferred = Q.defer();

	var blobOfBase64 = Titanium.Utils.base64encode(blobImage);

	// 이름의 확장자를 이용하여 파일 타입확인함.
	var parseFile = new Parse.File(imageName, {'base64' : blobOfBase64.getText()} );
	parseFile.save().then(function(result) {
		Ti.API.debug('filesave success');
		return deferred.resolve(result);
	}).fail(function(error) {
		Ti.API.debug('filesave fail');
		return deferred.reject("파일 저장 실패");
	});

	return deferred.promise;
}

//파일이 로컬에 존재하면 그것의 path를 반환, 없다면 리모트에서 받고 path반환
//app에서 파일을 임시저장하는 위치가 dir(현재는 제한크기가있는 캐쉬 공간)
exports.getFileByUrl = function (url, fileName, dir) {
	url = url || '';
	dir = dir || Titanium.Filesystem.applicationCacheDirectory;
	fileName = fileName || Date.now();

	var deferred = Q.defer();

	var file = Titanium.Filesystem.getFile(dir, fileName);
	if(file.exists()) {
		Ti.API.debug('존재하는 파일의 filepath ',file.nativePath);
		return Q(file);
	};

	//파일이없을경우 url을이용하여 가져옴.
	var xhr = Titanium.Network.createHTTPClient({
		onload: function() {
			file.write(this.responseData); // write to the file

			Ti.API.debug('remote파일을 가져온후 로컬 filepath ',file.nativePath);
			deferred.resolve(file);
		},
		onerror : function(e) {
	        deferred.reject(e.error);
     	},
		timeout: 10000
	});

	//시작
	xhr.open('GET',url);
	xhr.send();


	return deferred.promise;
}

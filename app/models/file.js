var Q = Alloy.Globals.Q;
var remotePhotoService = require('services/remotePhotoService');

exports.definition = {
	config : {
		adapter: {
			type: "parse",
			// parseSync 에서 이걸로 만드니 주의. objectId로 값을 전달해야 model.id에 접근할 수 있다.
			idAttribute: "objectId"
		}
		// table schema and adapter information
	},

	extendModel: function(Model) {
		_.extend(Model.prototype, {
			// Extend, override or implement Backbone.Model
			_parse_class_name: "File",

			//파일 데이터를 이용하여 parse에 저장한다
			saveBy : function(fileData) {
				if(!fileData && !fileData.blob && !fileData.name){
					Alloy.Globals.alert('c_alertMsgFailSaveImage');
					return Q();
				}
				var self = this;
				var thumbnailName = 'thumbnail_'+ fileData.name;

				// 이름의 확장자를 이용하여 파일 타입확인함.
				// parsefile을 File object에 저장 위해 먼저 리모트에 저장해야함
				return Q.all([
						remotePhotoService.savePhoto(fileData.thumbnailBlob, thumbnailName),
						remotePhotoService.savePhoto(fileData.blob, fileData.name)
					])
					.then(function(args){
						Ti.API.debug('filesave length : ',args.length);
						var thumbnailParseFile = args[0];
						var parseFile = args[1];
						var deferred = Q.defer();
						// Ti.API.debug('----------------', parseFile.url())

						//TODO[faith]: parseFile을 속성으로 직접저장하면 싱크어뎁터에서 stringify에서 순환오류가 남.
						//             setting부분에서 가능했던것은 클라우드 코드를 실행하기에.
						self.set({
							thumbnailUrl:thumbnailParseFile.url(),

							url:parseFile.url(),
							name:parseFile.name(),
							roomId:fileData.roomId,
							location:fileData.location,
							User_objectId:fileData.User_objectId,
							text:fileData.text,
							fileType:'image/jpeg'
						}).save(null, {
							success:function(result) {
								Ti.API.debug(fileData.User_objectId);
								Ti.API.debug('FileM으로 저장성공.')
								//TODO[faith]:파일모델 갱신 parseFile직접 참조하도록. 섬네일과 일
								// Parse.Cloud.run('userModify', data, {
								return deferred.resolve(result);
							},
							error:function(err){
								Alloy.Globals.alert('c_alertMsgFailSaveImage');
							}
						});



						return deferred.promise;
					}).catch(function(){
						Alloy.Globals.alert('c_alertMsgFailSaveImage');
					});
			}
		});

		return Model;
	},

	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			// Extend, override or implement Backbone.Collection
			_parse_class_name: "File",
			// For Backbone v1.1.2, uncomment the following to override the
		        // fetch method to account for a breaking change in Backbone.
		        fetch: function(options) {
				options = options ? _.clone(options) : {};
				options.reset = true;
				return Backbone.Collection.prototype.fetch.call(this, options);
			}
		});

		return Collection;
	}
};

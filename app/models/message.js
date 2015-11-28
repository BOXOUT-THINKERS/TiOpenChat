exports.definition = {
	config : {
        "columns": {
            "id":"text PRIMARY KEY",
            "type":"text",
			"created":"INTEGER",
			"isRead":"INTEGER",
			"fromUserId":"text",
			"fromUser":"text",
			"toUserId":"text",
			"toUser":"text",
			"roomId":"text",
			"text":"text",
			"requestCount":"text",
			"location":"text",
			"locationType":"text",
			"fileId":"text",
			"thumbnailUrl":"text",
			"url":"text",
			"name":"text",
			"fileType":"text",
			"openLevel":"INTEGER",
			"isReceived":"INTEGER",
			"receivedTime":"INTEGER",
			"receiverRoomId":"text"
        },	// NULL, INTEGER, REAL, TEXT, BLOB
        "URL": "http://urlPathToRestAPIServer.com/api/modelname",
		"parentNode" : "",
        "debug": 0, //debug mode enabled
        "useStrictValidation":0, // validates each item if all columns are present
        "adapter" : {
            "type" : "sqlrest",
            "collection_name" : "message",
            "idAttribute" : "id",
            "deletedAttribute": ""
        },

        //optional
        "headers": { //your custom headers
			"X-Parse-Application-Id" : Ti.App.Properties.getString('Parse_AppId'),
	        "X-Parse-REST-API-Key" : Ti.App.Properties.getString('Parse_RestKey'),
	        "Content-Type" : "application/json"
        },

		"localOnly":true,

        // delete all models on fetch
        "deleteAllOnFetch" : false,
		"returnErrorResponse" : false,
		"disableSaveDataLocallyOnServerError" : false
    },
	extendModel: function(Model) {
		_.extend(Model.prototype, {
		});

		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			// For Backbone v1.1.2, uncomment the following to override the
	        // fetch method to account for a breaking change in Backbone.
	        fetch: function(options) {
				options = options ? _.clone(options) : {};
				options.reset = true;
				return Backbone.Collection.prototype.fetch.call(this, options);
			},
			comparator : function(model) {
				return model.get("created");
			},
			//채팅목록 초기화 하기위해 최신 메시지 정보를 가져온다.(최신 텍스트, 최신 이미지, 최신 받은날짜?)
			getRecentMessageInfo : function(roomId, type) {
				var models = this.where({roomId: roomId});

				var created, text, thumbnailUrl;
				//역순으로
				var lastIndex = models.length-1;
				for(var i = lastIndex,min=0; i>=min; --i){
					var model = models[i];
					var type = model.get('type');

					if(lastIndex == i){
						created = model.get('created');
					}

					//해당방과 타입이 일치하는 최신메시지.
					// if(type == 'send:message' || type == 'request:where' || type == 'notify:where'){
					text = text ? text : model.get('text');
					thumbnailUrl = thumbnailUrl ? thumbnailUrl : model.get('thumbnailUrl');
					// }
					//모두찾았으면 break;
					if(created && text && thumbnailUrl) break;
				}

				var message = {
					created: created,
					text : text,
					thumbnailUrl : thumbnailUrl

				}
				Ti.API.debug('finded recentMessage', message);
				return message;
			},
			// 방이 가지고 있는 읽지 않은 메시지 수
			getRestMessageCount : function(roomId) {
				var myId = Alloy.Globals.user.get('id');
				var models = this.where({roomId:roomId, isRead: false});
				var restMessageCount = _.filter(models, function(model){
					return (model.get('fromUserId') != myId && (model.get('type') == "send:message" || model.get('type') == "request:where")) ? true : false;
				}).length;

				return restMessageCount || 0;
			},

			removeMessages : function(roomIds) {
				Ti.API.debug('메시지삭제하는데...총 ', this.models.length);
				for(var i=0, max=roomIds.length; i<max; ++i){
					var roomId = roomIds[i];
					var messages = this.where({roomId:roomId});

					for(var p in messages){
						var message = messages[p];
						message.destroy();
						// this.remove(message);
					}
				}
				Ti.API.debug('메시지삭제하는데...총 삭제되서.', this.models.length);
			}
		});

		return Collection;
	}
};

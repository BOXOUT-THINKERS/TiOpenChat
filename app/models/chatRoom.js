var Q = Alloy.Globals.Q;

exports.definition = {
	config : {
        "columns": {
            "objectId":"text PRIMARY KEY",
            "roomId":"text",
			"inUserIds":"text",
			"existUserIds":"text",
			"inUsers":"text",
			"createdAt":"text",
			"updatedAt":"text",
			"restMessageCount":"INTEGER",
			"modified":"text"
        },	// NULL, INTEGER, REAL, TEXT, BLOB
        "URL": "https://api.parse.com/1/classes/ChatRoom",
		"parentNode" : "results",
        "debug": 0, //debug mode enabled
        "useStrictValidation":0, // validates each item if all columns are present
        "adapter" : {
            "type" : "sqlrest",
            "collection_name" : "ChatRoom",
            "idAttribute" : "objectId",
            "deletedAttribute": "",

            // optimise the amount of data transfer from remote server to app
            "addModifedToUrl" : true,
            "lastModifiedColumn": "modified"
        },

        //optional
        "headers": { //your custom headers
			"X-Parse-Application-Id" : Ti.App.Properties.getString('Parse_AppId'),
	        "X-Parse-REST-API-Key" : Ti.App.Properties.getString('Parse_RestKey'),
	        "Content-Type" : "application/json"
        },

        // delete all models on fetch
        "deleteAllOnFetch" : true,
		"returnErrorResponse" : true,
		"disableSaveDataLocallyOnServerError" : true
    },

	extendModel: function(Model) {
		_.extend(Model.prototype, {
			// Extend, override or implement Backbone.Model
			getInUsers : function() {
				var inUsers = this.get('inUsers') || {};
				var returnInUsers = [];
				for (i = 0; i < inUsers.length; i++) {
					var inUser = inUsers[i] || {};
					var imageUrl = inUser.profileImage ? inUser.profileImage.url : "";

					returnInUsers.push({
						id : inUser.objectId,
						name : inUser.name,
						imageUrl :imageUrl,
						comment : inUser.comment,
						mainPhone : inUser.username
					});
				}
				return returnInUsers;
			},
			//현재는 여럿이 아닌 한명.
			getFriendInfo : function(myId) {
		 		var inUsers = this.getInUsers();
		 		var targetUsers = _.filter(inUsers, function(inUser){
		 			return (inUser.id != myId) ? true : false;
		 		});
		 		//TODO : 현재는 1:1이니깐...
		 		friend = targetUsers[0];
		 		return friend;
			},
			//inUserIds save
			saveInUserIds : function(inUserIds) {
				// 원격에는 비동기 처리하고, 로컬은 바로 처리해서 반환
				var tempChatRoomM = Alloy.createModel('ChatRoom');
				tempChatRoomM.save(
					{'objectId': this.id, 'existUserIds' : inUserIds}
				);
				this.set({existUserIds : inUserIds});
				return this;
			}
		});

		return Model;
	},

	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			// Extend, override or implement Backbone.Collection
			// For Backbone v1.1.2, uncomment the following to override the
	        // fetch method to account for a breaking change in Backbone.
	        fetch: function(options) {
				options = options ? _.clone(options) : {};
				options.reset = true;
				return Backbone.Collection.prototype.fetch.call(this, options);
			},
			comparator : function(model) {
				var recentMsg = model.get('recentMessage');
				var time = recentMsg ? recentMsg.created : model.get('createdAt');
				return -time;
			},
			//roomId 혹은 inUserIds를 이용하여 존재하는 chatRoom을 찾는다.
			getBy : function (roomId, inUserIds) {
				//var roomId = roomId || "";
				var inUserIds = inUserIds || [];
				inUserIds = _.isArray(inUserIds) ? inUserIds : [inUserIds];

				var findedRoom;
				var models = this.models;
				for(var i=0,max=models.length; i<max; ++i) {
					var curRoom = models[i];
					var curRoomId = curRoom.get('roomId');
					var curInUserIds = curRoom.get('inUserIds') || [];

					//roomId와 일치하는 chatRoom
					if(roomId && curRoomId == roomId) {
						findedRoom = curRoom;
						break;
					}

					//inUserIds와 일치하는 chatRoom
					if(inUserIds.length && curInUserIds.length == inUserIds.length) {
						var isEqualCount = 0;
						for(var j=0,maxJ=inUserIds.length; j<maxJ; ++j) {
							var inUserId = inUserIds[j];
							//witout으로 일치하면 제거
							if(_.contains(curInUserIds, inUserId)) {
								// without이 [1,1] 에서 1을 지울경우, 같은것을 모두 지워버림.
								curInUserIds = _.without(curInUserIds, inUserId);
								++isEqualCount;
							}
						}
						//curInUserIds가 길이가 0이면 순서에 관계없이 일치하는 것.
						if(inUserIds.length == isEqualCount && curInUserIds.length == 0) {
							findedRoom = curRoom;
							break;
						}
					}
				}

				return findedRoom || {};
			},
			// chatRoom을 로컬에 있으면 가져오고, 없으면 리모트에서 fetch하고, 다시 확인한 후 없다면 새로만들어서 가져온다.
			getOrCreate : function (roomId, inUserIds, myId) {
				var deferred = Q.defer();
				var chatRoom = this.getBy(roomId, inUserIds);
				// 로컬에 있다면 반환.
				if(!_.isEmpty(chatRoom)) {
					// 로컬에 있는게 existUserIds가 inUserIds와 다를 수도 있음
					var existUserIds = chatRoom.get('existUserIds');
					if (inUserIds && existUserIds.length != inUserIds.length) {
						// 서버쪽에 inUserIds를 갱신해주자
						Ti.API.debug('로컬에서 가져온 채팅룸정보에..내 아이디 추가.',myId)
						chatRoom.saveInUserIds(inUserIds);
						// var tempChatRoomM = Alloy.createModel('ChatRoom');
						// tempChatRoomM.save(
						// 	{'objectId': chatRoom.id, 'existUserIds' : inUserIds}
						// );
						// chatRoom.set({existUserIds : inUserIds});
					}

					return Q(chatRoom);
				}

				// 없다면 fetch
				var self = this;
				//roomId와 일치하는 것.
				//var newChatRoom = Alloy.createModel('ChatRoom');
				this.fetch({
					urlparams:{
						where:{"inUserIds":{"$all":inUserIds } },
						include : "inUsers"
					},
					// Add to the collection - Don't reset it
				    add : true,
				    // lets keep the fetching under the radar
				    silent : true,
					// delete all models on fetch
			        deleteAllOnFetch : false,
					success:function(res) {
						var chatRoom = self.getBy(roomId, inUserIds);
						//return이 없을경우 {}이기에 아래처럼해줘야함.
						if (!_.isEmpty(chatRoom)) {
							//갱신 고고
							Ti.API.debug('서버에서 가져온 채팅룸정보에..내 아이디 추가.',myId)
							chatRoom.saveInUserIds(inUserIds);
							// // 로컬에 셋
							// chatRoom.set({existUserIds : inUserIds});
							// // 원격에 셋
							// var tempChatRoomM = Alloy.createModel('ChatRoom');
							// tempChatRoomM.save(
							// 	{'objectId': chatRoom.id, 'existUserIds' : inUserIds}
							// );
							// 이벤트 발생시켜서 채팅목록에 그리자
							self.trigger('add', chatRoom);

							return deferred.resolve(chatRoom);
						}else{
							// 없다면 새로 만듬.
							newChatRoom = self.createRoom(roomId, inUserIds, myId);
							deferred.resolve(newChatRoom);
						}
					},
					error:function(e,e2) {
						Ti.API.debug('채팅룸 fetch실패',e,e2);
						return deferred.reject(e);
					}
				});

				return deferred.promise;
			},
			// roomId 혹은 inUserIds로 채팅방을 생성함.
			createRoom : function (roomId, inUserIds, myId) {
				var self = this;
				Ti.API.debug('create NewRoom', roomId, inUserIds, myId)
				var roomId = !_.isEmpty(roomId) ? roomId : "room" + Date.now();
				var data = {
					//objectId로 하면 올바른 동작안함
					roomId : roomId,
					inUserIds : inUserIds,
					existUserIds : [myId]
				};
				var model = Alloy.createModel('ChatRoom');
				model.save(data,{
					error:function() {
						Ti.API.debug("fail create room in remote");
						self.remove(model);
					}
				});

				//TODO[faith] : 이때 뷰가 오픈상태가 아니라면 ios에서 문제가 생김.
				this.add(model);
				return model;
			},
			//existUserIds업데이트 후 existUserIds가 비어있다면 제거한다.
			exitRooms : function (chatRoomMs, myId) {

				for(var i=0, max=chatRoomMs.length; i<max; ++i){
					var chatRoomM = chatRoomMs[i];
					var roomId = chatRoomM.get('roomId');

					//갱신하고, 확인하여 지우기.
					var self = this;
					//roomId와 일치하는 것.
					this.fetch({
						urlparams:{
							where:{"roomId":roomId},
							include : "inUsers"
						},
						// Add to the collection - Don't reset it
					    add : true,
					    // lets keep the fetching under the radar
					    silent : true,
						// delete all models on fetch
				        deleteAllOnFetch : false,
						success:function(res) {
							// 일단 찾아놓고
							var chatRoom = self.getBy(roomId);

							// 콜렉션에서 일단 제거
							self.remove(chatRoomM);

							// 찾은게 있으면
							if (!_.isEmpty(chatRoom)) {
								var existUserIds = _.without(chatRoom.get('existUserIds'), myId);
								//
								// existUserIds 이 없더라도 지우지 않음.
								// 이유는 지웠다가 새로 생성될때 두개가 생길 가능성이 있어서 그렇다.
								//
								chatRoom.saveInUserIds(existUserIds);
								// // 로컬에 셋
								// chatRoom.set({existUserIds : existUserIds});
								// // 원격에 셋
								// var tempChatRoomM = Alloy.createModel('ChatRoom');
								// tempChatRoomM.save(
								// 	{'objectId': chatRoom.id, 'existUserIds' : existUserIds}
								// );
							}
							return true;
						},
						error:function(e,e2) {
							Ti.API.debug('채팅룸 fetch실패',e,e2);
							// 콜렉션에서 제거
							self.remove(chatRoomM);
							return false;
						}
					});
				}
			}
		});

		return Collection;
	}
};

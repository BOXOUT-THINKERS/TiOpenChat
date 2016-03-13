var Q = Alloy.Globals.Q;

exports.definition = {
  config : {
        "columns": {
            "objectId":"text PRIMARY KEY",
            "User_objectId":"text",
      "User_object":"text",
      "mainPhone":"text",
      "User_objectId_To":"text",
      "User_object_To":"text",
      "firstName":"text",
      "middleName":"text",
      "lastName":"text",
      "fullName":"text",
      "phone":"text",
      "relatedNames":"text",
      "email":"text",
      "date":"text",
      "instantMessage":"text",
      "url":"text",
      "createdAt":"text",
      "updatedAt":"text",
      "kind":"REAL",
      "address":"text",
      "isFavorite":"INTEGER",
      "isBlock":"INTEGER",
      "isHidden":"INTEGER",
      "requestCount":"INTEGER",
      "isUnregister":"INTEGER",
      "modified":"text"
        },  // NULL, INTEGER, REAL, TEXT, BLOB
        "URL": "https://api.parse.com/1/classes/Contacts",
    "parentNode" : "results",
        "debug": 0, //debug mode enabled
        "useStrictValidation":0, // validates each item if all columns are present
        "adapter" : {
            "type" : "sqlrest",
            "collection_name" : "Contacts",
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
      qSave : function (attributes) {
        // promise 사용
        return this._save(attributes);
      },
      _save : function (attributes) {
        var self = this;
        var deferred = Q.defer();
        // include된 값을 제거해서 처리 (저장할 때 에러가 남)
        var tempContactM = Alloy.createModel('contacts');
        tempContactM.save(_.extend({'objectId': this.id},attributes), {
          success: function (result) {
            self.set(attributes, {change:false});
            deferred.resolve(self);
          },
          error : function (error) {
            deferred.reject(error);
          }
        });

        return deferred.promise;
      },
      // _save : function (attributes) {
      //   var deferred = Q.defer();
      //   // include된 값을 제거해서 처리 (저장할 때 에러가 남)
      //   delete this.attributes.User_object_To;
      //   this.save(attributes, {
      //     success: function (result) {
      //       deferred.resolve(result);
      //     },
      //     error : function (error) {
      //       deferred.reject(error);
      //     }
      //   });

      //   return deferred.promise;
      // },
      increaseRequestCount : function () {
        //증가.
        var requestCount = this.get('requestCount') || 0;
        requestCount = requestCount + 1;
        this.updateRequestCount(requestCount);

        return requestCount;
      },
      saveRequestCount : function (requestCount) {
        this.updateRequestCount(requestCount);

        return requestCount;
      },
      //처음 저장 후 연속적인 요청시 지연하여 저장.
      _waitingCount : 0,
      _isUpdateBlock : false,
      updateRequestCount : function (requestCount) {
        var self = this;
        //로컬의 기본동작
        self.set({requestCount: requestCount},{change:false});

        //등록된 친구일경우만 서버값 업뎃.
        if(self.isRegister()) {
          //서버요청.
          // 요청 중이라면 카운트만올림.
          if(self._isUpdateBlock){
            ++self._waitingCount;
          }else{
            //현재 시점. 가장 최신의 요청이기에 대기자를 없엠.
            self._isUpdateBlock = true;
            self._waitingCount = 0;

            // 서버에 저장해서 유지시키자. 저장할때 User_object_To 때문에 따로 저장
            var tempContactM = Alloy.createModel('contacts');
            tempContactM.save({'objectId': self.id, 'requestCount': self.get('requestCount')}, {
              success: function (result) {
                self._isUpdateBlock = false;
                (self._waitingCount > 0) ? self.updateRequestCount(self.get('requestCount')) : '';
              },error : function (error) {
                self._isUpdateBlock = false;
                (self._waitingCount > 0) ? self.updateRequestCount(self.get('requestCount')) : '';
              }
            });
          }
        }

        //
        return requestCount;
      },
      getUserInfo : function() {
        var friend = this.get('User_object_To') || {};
        var fullname = this.get('fullName') || '';
        var isFavorite = this.get('isFavorite') || false;

        var id = friend.objectId || friend.id;
        var name = fullname || friend.name || "";
        var imageUrl = friend.profileImage ? friend.profileImage.url : "";
        imageUrl = imageUrl || friend.imageUrl;

        return {
          id : id,
          name : name,
          imageUrl : imageUrl,
          comment : friend.comment || '',
          isFavorite : isFavorite,
          //mainPhone : friend.mainPhone || this.get('mainPhone')
          mainPhone : this.get('mainPhone')
        }
      },
      //TODO[faith]:숨김친구, 블락친구, 등록되지않은 친구를 현재는 구분못함.
      isRegister : function() {
        if(this.get('isUnregister')) return false;
        else return true;
      },
      isBan : function() {
        if(this.get('isHidden') || this.get('isBlock')) return true;
        else return false;
      }
    });

    return Model;
  },

  extendCollection: function(Collection) {
    _.extend(Collection.prototype, {
      // Extend, override or implement Backbone.Collection
      // For Backbone v1.1.2, uncomment the following to override the
        // fetch method to account for a breaking change in Backbone.
      defaultFetchData : {},
      fetch: function(options) {
        options = options || {};
        options.urlparams = _.extend(this.defaultFetchData, options.urlparams || {});
        options.reset = true;
        Backbone.Collection.prototype.fetch.call(this, options);
      },
      qCreate : function (createModel) {
        // promise 사용
        return this._create(createModel);
      },

      _create : function (createModel) {
        var deferred = Q.defer();
        this.create(createModel, {
          wait: true,
          success: function (result) {
            deferred.resolve(result);
          },
          error : function (error) {
            deferred.reject(error);
          }
        });

        return deferred.promise;
      },

      syncAddressBook: function(options) {
        var thisCollection = this;

        // 권한이 있을 때 주소록 동기화 처리
        var performAddressBookFunction = function() {
          Alloy.Globals.loginC.doingSyncAddress = true;
          // var singleValue = [
          //   'recordId', 'firstName', 'middleName', 'lastName', 'fullName', 'prefix', 'suffix',
          //   'nickname', 'firstPhonetic', 'middlePhonetic', 'lastPhonetic', 'organization',
          //   'jobTitle', 'department', 'note', 'birthday', 'created', 'modified', 'kind'
          // ];
          // var multiValue = [
          //   'email', 'address', 'phone', 'instantMessage', 'relatedNames', 'date', 'url'
          // ];
          // 필요한 것만 저장하자
          var singleValue = [
            'firstName', 'middleName', 'lastName', 'fullName'
          ];
          var multiValue = [
            'email', 'phone'
          ];
          var people = Ti.Contacts.getAllPeople();
          Ti.API.debug('[SyncAddressBook] Total contacts : ', people.length, " / Fetched Collections : ", thisCollection.length);
          var createCount = 0;
          var updateCount = 0;
          //var createArrary = [];
          var updateArrary = [];
          var contactArray = [];
          var parseCreateArary = [];

          // 전화번호 정규화를 먼저 하고 하자
          for (var i=0, ilen=people.length; i<ilen; i++) {
            //Ti.API.debug('---------------------');
            var person = people[i];
            var contactsModel = new Alloy.createModel('contacts');

            // User 구분
            contactsModel.set('User_objectId', Alloy.Globals.user.get('id'));

            // 전화번호 정규화
            //Ti.API.debug(person['phone']);
            var phoneModel = new Backbone.Model(person['phone']);
            var mainPhone = "";
            if (phoneModel.get('mobile') && phoneModel.get('mobile')[0].length >= 10) {
              mainPhone = phoneModel.get('mobile')[0];
            } else if (phoneModel.get('iphone') && phoneModel.get('iphone')[0].length >= 10) {
              mainPhone = phoneModel.get('iphone')[0];
            } else if (phoneModel.get('main') && phoneModel.get('main')[0].length >= 10) {
              mainPhone = phoneModel.get('main')[0];
            } else if (phoneModel.get('home') && phoneModel.get('home')[0].length >= 10) {
              mainPhone = phoneModel.get('home')[0];
            } else if (phoneModel.get('work') && phoneModel.get('work')[0].length >= 10) {
              mainPhone = phoneModel.get('work')[0];
            } else if (phoneModel.get('other') && phoneModel.get('other')[0].length >= 10) {
              mainPhone = phoneModel.get('other')[0];
            }

            //메인으로 등록할 전화번호가 있어야 다음으로 넘어감
            if (mainPhone != "") {
              // 첫문자가 +라면 국제 번호이므로 그냥 저장하고, 아니면 국가번호를 붙여서 처리
              if (mainPhone.substring(0, 1) == "+") {
                mainPhone = "+" + (Alloy.Globals.util.getNumberOnly(mainPhone) * 1).toString();
              } else {
                mainPhone = Alloy.Globals.user.get('attributes')['local'] + (Alloy.Globals.util.getNumberOnly(mainPhone) * 1).toString();
              }
              //Ti.API.debug(mainPhone);
              if (mainPhone.length >= 12) {
                contactsModel.set('mainPhone', mainPhone);

                // 나머지 값들 처리
                for (var j=0, jlen=singleValue.length; j<jlen; j++){
                  //Ti.API.debug(singleValue[j] + ': ' + person[singleValue[j]]);
                  contactsModel.set(singleValue[j], person[singleValue[j]]);
                }
                for (var j=0, jlen=multiValue.length; j<jlen; j++){
                  //Ti.API.debug(multiValue[j] + ': ' + JSON.stringify(person[multiValue[j]]));
                  contactsModel.set(multiValue[j], JSON.stringify(person[multiValue[j]]));
                }

                contactArray.push(contactsModel.toJSON());
              }
            }
          }

          // 정렬하자
          contactArray = _.sortBy(contactArray, 'mainPhone');

          // 주소록 동기화
          var beforeMainPhone = '';
          for (var i=0, ilen=contactArray.length; i<ilen; i++) {
            //Ti.API.debug('---------------------');
            var person = contactArray[i];
            // 중복처리 방지
            if (person.mainPhone != beforeMainPhone) {
              beforeMainPhone = person.mainPhone;

              var contactsModel = new Alloy.createModel('contacts', person);

              // 기존에 있는 레코드인지 체크해서 저장
              var findModel = thisCollection.where({'User_objectId': Alloy.Globals.user.get('id'), 'mainPhone': contactsModel.get('mainPhone')})[0];
              if (findModel) {
                // 업데이트
                var cloneModel = findModel.clone();
                cloneModel.set(contactsModel.attributes);

                if (diffContactsModelData(findModel, cloneModel) == false) {
                  updateArrary.push({ model : findModel, attributes : contactsModel.attributes });
                  updateCount++;
                }
              } else {
                // 새로 등록
                //createArrary.push(contactsModel);
                parseCreateArary.push(contactsModel.attributes);
                createCount++;
              }
            }
          }
          // 순서대로 처리하기
          // function nextCreate(idx) {
          //   Ti.API.debug("Q nextCreate function idx : ", idx);
          //   if (idx > createArrary.length -1) { return Q(true); }
          //   var createModel = createArrary[idx];
          //   return thisCollection.qCreate(createModel).then(function(result) {
          //     return nextCreate(idx+ 1);
          //   }).fail(function(result) {
          //     return nextCreate(idx+ 1);
          //   });
          // }
          function nextUpdate(idx) {
            Ti.API.debug("Q nextUpdate function idx : ", idx);
            if (idx > updateArrary.length -1) { return Q(true); }
            var updateModel = updateArrary[idx].model;
            var updateAttributes = updateArrary[idx].attributes;
            return updateModel.qSave(updateAttributes).then(function(result) {
              return nextUpdate(idx+ 1);
            }).fail(function(result) {
              return nextUpdate(idx+ 1);
            });
          }
          function parseCreate(createArary) {
            var deferred = Q.defer();
            Parse.Cloud.run('createContacts', { "createArrary":createArary }, {
              success: function(result) {
                Ti.API.debug('parseCreate Sucess :', result);
                // 새친구가 있으면 다시 fetch 함
                if (result.friendCount) {
                  Ti.API.debug('parseCreate Friend Found :', result.friendCount);
                  thisCollection.fetch({
                    success: function(){
                      // 새 친구를 찾았다는 메시지 띄워주기
                      Alloy.Globals.toast('c_doingSyncMsgFindFriend');
                    },
                    error: function(){}
                  });
                }
                deferred.resolve(result);
              },
              error: function(error) {
                Ti.API.error('parseCreate Error :', error);
                deferred.resolve(error);
              }
            });

            return deferred.promise;
          }
          function parseNextCreate(idx) {
            Ti.API.debug("Q parseNextCreate function idx : ", idx);
            if (idx > parseCreateArary.length -1) { return Q(true); }
            // 친구 찾는중 메시지
            Alloy.Globals.toast(L('c_doingSyncMsgFriendCount') + idx + '/' + parseCreateArary.length);
            var count = 0;
            var createAraryGroup = [];
            // 30개씩 묶어서 처리하기
            for (var i = idx; i < parseCreateArary.length; i++) {
              idx = i;
              createAraryGroup.push(parseCreateArary[idx]);
              if (count < 29) {
                count++;
              } else {
                break;
              }
            }
            return parseCreate(createAraryGroup).then(function(result) {
              return parseNextCreate(idx+ 1);
            }).fail(function(result) {
              return parseNextCreate(idx+ 1);
            });
          }
          //nextCreate(0).then(function(){
          parseNextCreate(0).then(function() {
            nextUpdate(0).then(function() {
              Ti.API.debug('[SyncAddressBook] Success / Create : ', createCount, ' / Update : ', updateCount);
              Alloy.Globals.loginC.doingSyncAddress = false;
              Ti.API.debug("Contacts Redrawing after Sync");
              if (createCount) {
                // fetch 되고 나면 reset 이벤트가 발생 함
                thisCollection.fetch();
              } else if (updateCount) {
                // 그냥 다시 그려주기
                thisCollection.trigger('redraw');
              }
            });
          });

          // 모델 비교용
          function diffContactsModelData(model1, model2) {
            // "objectId":"text PRIMARY KEY",
                  // "User_objectId":"text",
            // "mainPhone":"text",
            // "User_objectId_To":"text",
            // "User_object_To":"text",
            // "firstName":"text",
            // "middleName":"text",
            // "lastName":"text",
            // "fullName":"text",
            // "phone":"text",
            // "relatedNames":"text",
            // "email":"text",
            // "date":"text",
            // "instantMessage":"text",
            // "url":"text",
            // "createdAt":"text",
            // "updatedAt":"text",
            // "kind":"REAL",
            // "address":"text",
            // "isFavorite":"INTEGER",
            // "isBlock":"INTEGER",
            // "isHidden":"INTEGER",
            // "requestCount":"INTEGER",
            // "isUnregister":"INTEGER",
            // "modified":"text"
            var data1 = {};
            data1.mainPhone = model1.get("mainPhone");
            data1.firstName = model1.get("firstName");
            data1.middleName = model1.get("middleName");
            data1.lastName = model1.get("lastName");
            data1.fullName = model1.get("fullName");
            data1.phone = JSON.stringify(model1.get("phone"));
            data1.email = JSON.stringify(model1.get("email"));

            var data2 = {};
            data2.mainPhone = model2.get("mainPhone");
            data2.firstName = model2.get("firstName");
            data2.middleName = model2.get("middleName");
            data2.lastName = model2.get("lastName");
            data2.fullName = model2.get("fullName");
            data2.phone = model2.get("phone");
            data2.email = model2.get("email");

            //Ti.API.debug('diffContactsModelData :', data1, data2);
            //return false
            return _.isEqual(data1, data2);
            //return true;
          }

          return true;
        };

        // 권한이 없을 때 경고 처리
        var addressBookDisallowed = function(){
          Alloy.Globals.alert('accessAddressBookFail');
          return false;
        };

        // 주소록 접근권한 요청 하기
        if (Ti.Contacts.contactsAuthorization == Ti.Contacts.AUTHORIZATION_AUTHORIZED){
          // 권한이 있을 때 주소록 동기화 처리
          return performAddressBookFunction();
        } else if (Ti.Contacts.contactsAuthorization == Ti.Contacts.AUTHORIZATION_UNKNOWN){
          Ti.Contacts.requestAuthorization(function(e){
            if (e.success) {
              // 권한이 있을 때 주소록 동기화 처리
              return performAddressBookFunction();
            } else {
              return addressBookDisallowed();
            }
          });
        } else {
          return addressBookDisallowed();
        }
      },
      //toUserId로 유저정보 찾기
      getBy : function (toUserId) {
        var models = this.models;
        for(var i=0,max=models.length; i<max; ++i) {
          var curContact = models[i];
          var userObjectIdTo = curContact.get('User_objectId_To');

          if(userObjectIdTo == toUserId){
            return curContact;
          }
        }

        var unregisterContactM = Alloy.createModel('contacts', {User_objectId_To : toUserId, isUnregister: true});
        return unregisterContactM;
      },
    });

    return Collection;
  }
};

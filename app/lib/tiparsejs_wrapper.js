const REQUEST_ATTEMPT_LIMIT = 5;
/**
 * CommonJS Module Wrapper for TiParseJSSDK
 * Get it here:
 *
 * Original Credits go to:
 * twitter: @aaronksaunders
 * https://gist.github.com/aaronksaunders/6665528
 */


var TiParse = function(_options) {


  // UPDATED TO LATEST PARSE LIBRARY
  Parse = require("TiParseJS");

  // //FACEBOOK - If you don't need facebook comment out these lines
  // TiFacebook = require('facebook');
  // TiFacebook.appid = _options.facebookAppId;
  //
  // FB = {
  //   provider : {
  //
  //     authenticate : function(_options) {
  //       var self = this;
  //       TiFacebook.forceDialogAuth = false;
  //       TiFacebook.authorize();
  //
  //       TiFacebook.addEventListener('login', function(response) {
  //
  //         if (response.success) {
  //            if (_options.success) {
  //               _options.success(self, {
  //                   id :  JSON.parse(response.data).id,
  //                   access_token : TiFacebook.accessToken,
  //                   expiration_date : (new Date(TiFacebook.expirationDate)).toJSON()
  //             });
  //
  //           }
  //         } else {
  //           if (_options.error) {
  //             _options.error(self, response);
  //           }
  //         }
  //       });
  //
  //     },
  //     restoreAuthentication : function(authData) {
  //       var authResponse;
  //       if (authData) {
  //         authResponse = {
  //           userID : authData.id,
  //           accessToken : authData.access_token,
  //           expiresIn : (Parse._parseDate(authData.expiration_date).getTime() - (new Date()).getTime()) / 1000
  //         };
  //       } else {
  //         authResponse = {
  //           userID : null,
  //           accessToken : null,
  //           expiresIn : null
  //         };
  //       }
  //       //FB.Auth.setAuthResponse(authResponse);
  //       if (!authData) {
  //         TiFacebook.logout();
  //       }
  //       return true;
  //     },
  //     getAuthType : function() {
  //       return "facebook";
  //     },
  //     deauthenticate : function() {
  //       this.restoreAuthentication(null);
  //     }
  //   },
  //   init : function() {
  //     Ti.API.debug("called FB.init()");
  //   },
  //   login : function() {
  //     Ti.API.debug("called FB.login()");
  //   },
  //   logout : function() {
  //     Ti.API.debug("called FB.logout()");
  //   }
  // };

	/**
	 Save Eventually - Work in Progress!
	 Credits to: https://github.com/francimedia/parse-js-local-storage
	 My version: https://gist.github.com/nitrag/57514857e78bb71bdf23

	 Example:
		var TestObject = Parse.Object.extend("Test");
		var testObject = new TestObject();
		testObject.set('foo', 'bar1234');

		Parse.saveEventually.save("Test", testObject);

		fires via a button click
		function saveNow(){
		    if(Ti.Network.online){
		        if(Parse.saveEventually.sendQueue())
		            Parse.saveEventually.clearQueue();
		    }
		}
	**/
	Parse.saveEventually = {
	    localStorageKey: "Parse.saveEventually.Queue",
	    initialize: function () {

	    },
	    save: function (objectType, object) {
	        this.addToQueue('save', objectType, object);
	    },
	    addToQueue: function (action, objectType, object) {
	        var queueData = this.getQueue();
	        // create queueId to avoid duplicates. Maintain previously saved data.
	        var queueId = ([objectType, object.id, object.get('hash')]).join('_');
	        var i = this.queueItemExists(queueData, queueId);
	        if(i > -1) {
	            for (var prop in queueData[i].data) {
	                if(object.get(prop) == 'undefined') {
	                   object.set(prop, queueData[i].data[prop]);
	                }
	            }
	        } else {
	            i = queueData.length;
	        }
	        queueData[i] = {
	            queueId: queueId,
	            type: objectType,
	            action: action,
	            id: object.id,
	            hash: object.get('hash'),
	            createdAt: new Date(),
	            data: object
	        };
	        this.setQueue(queueData);
	    },
	    getQueue: function () {
	    	var q = Parse.localStorage.getItem(this.localStorageKey) || null;
	        if(q && (typeof JSON.parse(q) == 'object'))
	        	return JSON.parse(q);
	        else
	        	return [];
	    },
	    setQueue: function (queueData) {
	        Parse.localStorage.setItem(this.localStorageKey, JSON.stringify(queueData));
	    },
	    clearQueue: function () {
	        Parse.localStorage.setItem(this.localStorageKey, JSON.stringify([]));
	    },
	    queueItemExists: function(queueData, queueId) {
	        for (var i = 0; i < queueData.length; i++) {
	            if(queueData[i].queueId == queueId) {
	                return i;
	            }
	        };
	        return -1;
	    },
	    countQueue: function(){
	    	return this.getQueue().length;
	    },
	    sendQueue: function () {
	        var queueData = this.getQueue();
	        if(queueData.length < 1)
	        	return false;
	        for (var i = 0; i < queueData.length; i++) {
	            var myObjectType = Parse.Object.extend(queueData[i].type);
	            // if object has a parse data id, update existing object
	            if (queueData[i].id) {
	                this.reprocess.byId(myObjectType, queueData[i]);
	            }
	            // if object has no id but a unique identifier, look for existing object, update or create new
	            else if (queueData[i].hash) {
	                this.reprocess.byHash(myObjectType, queueData[i]);
	            }
	            // else create a new object
	            else {
	                this.reprocess.create(myObjectType, queueData[i]);
	            }
	        }
	        return true;
	        // empty queue - 2do: verify queue has been sent
	        // this.clearQueue();
	    },
	    sendQueueCallback: function (myObject, queueObject) {
	        switch (queueObject.action) {
	            case 'save':
	                // queued update was overwritten by other request > do not save
	                if (typeof myObject.updatedAt != 'undefined' && myObject.updatedAt > new Date(queueObject.createdAt)) {
	                    return false;
	                }
	                myObject.save(queueObject.data, {
	                    success: function (object) {
	                        Ti.API.debug(object);
	                    },
	                    error: function (model, error) {
	                        Ti.API.error(error);
	                    }
	                });
	                break;
	            case 'delete':
	                // 2do: code to delete queued objects
	                break;
	        }
	    },
	    reprocess: {
	        create: function (myObjectType, queueObject) {
	            var myObject = new myObjectType();
	            Parse.saveEventually.sendQueueCallback(myObject, queueObject);
	        },
	        byId: function (myObjectType, queueObject) {
	            var query = new Parse.Query(myObjectType);
	            query.get(queueObject.id, {
	                success: function (myObject) {
	                    // The object was retrieved successfully.
	                    Parse.saveEventually.sendQueueCallback(myObject, queueObject);
	                },
	                error: function (myObject, error) {
	                    // The object was not retrieved successfully.
	                    // error is a Parse.Error with an error code and description.
	                }
	            });
	        },
	        byHash: function (myObjectType, queueObject) {
	            var query = new Parse.Query(myObjectType);
	            query.equalTo("hash", queueObject.hash);
	            query.find({
	                success: function (results) {
	                    // The object was retrieved successfully.
	                    if(results.length > 0) {
	                        Parse.saveEventually.sendQueueCallback(results[0], queueObject);
	                    }
	                    // The object was not found, create a new one
	                    else {
	                        Parse.saveEventually.reprocess.create(myObjectType, queueObject);
	                    }
	                },
	                error: function (myObject, error) {
	                    // The object was not retrieved successfully.
	                    // error is a Parse.Error with an error code and description.
	                }
	            });
	        }
	    }
	};

  /**
  * promise run & error helper
  * @param {Number} _options.retry : retry limit
  */
  Parse.pCloud = {
    initialize: function () {

    },
    run: function (_fnName, _arguments, _options) {
      _options || (_options = {});
      var deferred = require('q').defer();
      _options.deferred = deferred;
      // retryLeft
      _options.retryLeft = _.isNumber(_options.retry) ? _options.retry : REQUEST_ATTEMPT_LIMIT;

      // require("core").log('debug', 'Parse.hCloud.run / ' + _fnName + ' : ' + JSON.stringify(_arguments));
      this.runner(_fnName, _arguments, _options);

      return deferred.promise;
    },
    runner: function(_fnName, _arguments, _options) {
      var that = this;
      var deferred = _options.deferred;

      Parse.Cloud.run(_fnName, _arguments, {
        success: function (result) {
          // require("core").log('debug', 'Parse.hCloud.run / ' + _fnName + ' : ' + JSON.stringify(result));
          _options && _.isFunction(_options.success) && _options.success(result);
          deferred.resolve(result);
        },
        error: function (error) {
          require("core").log('error', 'Parse.hCloud.run / ' + _fnName + ' / retry left ' + _options.retryLeft + ' : ' + JSON.stringify(error));
          if (!_options.retryLeft || _options.retryLeft <= 0) {
            _options && _.isFunction(_options.error) && _options.error(error);
            deferred.reject(error);
          } else {
            // retry
            _options.retryLeft--;
            that.runner(_fnName, _arguments, _options);
          }
        }
      });
    }
  };


  //
  // Enter appropriate parameters for initializing Parse
  //
  // _options.applicationId, _options.javascriptkey);
  //
  Parse.initialize(_options.applicationId, _options.javascriptkey);
  Parse.serverURL = Ti.App.Properties.getString('Parse_ServerUrl');

  //Use Custom Server
  //Parse.serverURL = 'http://offroadtrailguide-parse.elasticbeanstalk.com';

  // //
  // // IF the appid was set for facebook then initialize facebook. if you are going
  // // to use Facebook, set the appid at the top of this file
  // //
  // if (TiFacebook.appid) {
  //   Parse.FacebookUtils.init({
  //     appId : TiFacebook.appid, // Facebook App ID
  //     status : false, // check login status
  //     cookie : true, // enable cookies to allow Parse to access the session
  //     xfbml : true // parse XFBML
  //   });
  // }


};
module.exports = TiParse;

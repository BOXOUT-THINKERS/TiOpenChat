/**
 * CommonJS Module Wrapper for TiParseJSSDK
 * Get it here:
 *
 * Original Credits go to:
 * twitter: @aaronksaunders
 * https://gist.github.com/aaronksaunders/6665528
 */


var TiParse = function(options) {


  // UPDATED TO LATEST PARSE LIBRARY
  Parse = require("TiParseJS");

  //FACEBOOK - If you don't need facebook comment out these lines
  // TiFacebook = require('facebook');
  // TiFacebook.appid = options.facebookAppId;


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


  //
  // Enter appropriate parameters for initializing Parse
  //
  // options.applicationId, options.javascriptkey);
  //
  Parse.initialize(options.applicationId, options.javascriptkey);

  //Use Custom Server
  //Parse.serverURL = 'http://offroadtrailguide-parse.elasticbeanstalk.com';

  //
  // IF the appid was set for facebook then initialize facebook. if you are going
  // to use Facebook, set the appid at the top of this file
  //
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

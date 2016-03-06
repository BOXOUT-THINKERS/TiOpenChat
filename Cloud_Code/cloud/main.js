/**
 * Properties, Modules
 */
 var _ = require('underscore');

// For SMS Verification
var twilio = require('twilio')('', '');

/**
 * Cloud Functions
 */

 // get installation using randomId
Parse.Cloud.define("getInstallationByRandomId", function(request, response) {
    var randomId = request.params.randomId || '';

    var query = new Parse.Query(Parse.Installation);
    query.equalTo("randomId", randomId);
    Parse.Cloud.useMasterKey();

    _doQuery(query);

    function _doQuery(query) {
        query.first({
            success: function(result) {
                if(result){
                    response.success(result);
                }else{
                    _doQuery(query);
                }
            },
            error: function(error) {
                console.error("Got an error " + error.code + " : " + error.message);
                response.success(error.message);
            }
        });
    }
});

// send VerificationCode using twilio
Parse.Cloud.define("sendVerificationCode", function(request, response) {
    // demo account
    if(request.params.phoneNumber.indexOf("0000") > -1) {
        var user = Parse.User.current();
        if (!user) {
            response.error();
            return;
        }
        user.set("phoneVerificationCode", 0000);
        user.set("isWithdraw", false);
        //추가 요소 저장
        user.set("timezoneOffset",request.params.timezoneOffset);
        user.set("currentLanguage", request.params.currentLanguage);
        user.save().then(function(userM) {
            response.success("Success");
        }, function(err) {
            response.error(err);
        });
    } else {
        // normal code
        var verificationCode = Math.floor(Math.random()*8999) + 1000;
    	var user = Parse.User.current();
    	user.set("phoneVerificationCode", verificationCode);
    	user.set("isWithdraw", false);

        // add info
        user.set("timezoneOffset",request.params.timezoneOffset);
        user.set("currentLanguage", request.params.currentLanguage);
    	user.save();

        var msgBody = "";
        msgBody = "TiOpenChat's Verification Code is " + verificationCode + " .";

    	twilio.sendSms({
    		From: "",
    		To: request.params.phoneNumber,
    		Body: msgBody
    	}, function(err, responseData) {
    		if (err) {
    			response.error(err);
    		} else {
    			response.success("Success");
    		}
    	});
    }
});

// verify PhoneNumber
Parse.Cloud.define("verifyPhoneNumber", function(request, response) {
	var user = Parse.User.current();
	var verificationCode = user.get("phoneVerificationCode");
	if (verificationCode == request.params.phoneVerificationCode) {
		user.set("phoneVerificationCode", 0);
		user.save().then(function(){
            response.success("Success");
        });
	} else {
		response.error("Invalid verification code.");
	}
});

// backgroundJob for user
Parse.Cloud.job("userBackgroundJob", function(request, status) {
    // Set up to modify user data
    Parse.Cloud.useMasterKey();
    var counter = 0;
    // Query for all users
    var queryUser = new Parse.Query(Parse.User);
    queryUser.notEqualTo("isWithdraw", true);	// not withdraw
    queryUser.notEqualTo("name", null);	// legal user
    queryUser.each(function(user) {
        counter += 1;
        //if (counter % 10 === 1) {
            // Set the  job's progress status
            status.message(counter + "th user processing.");
        //}

        return contactsUserPointer(user).then(function(){
            return contactsLinkJoinUser(user);
        });

        // if have my phone, but didn't link to me
        function contactsLinkJoinUser(user) {
            var query = new Parse.Query("Contacts");
    		query.equalTo("mainPhone", user.get("username"));
            query.equalTo("User_objectId_To", null);    // not link
            query.notEqualTo("isBlock", true);	// not block
    		query.include("User_object");
    		return query.each(function(contacts) {
                // join push
                var toUser = contacts.get("User_object");

                var toUserId = contacts.get("User_objectId");
                var toUserCurrentLanguage = toUser ? (toUser.get("currentLanguage") || 'en') : 'en';

                var fromUserName = contacts.get("fullName");
                var fromUserId = user.id;

                // update
    			contacts.set("User_objectId_To", user.id);
    			contacts.set("User_object_To", user);
    			return contacts.save().then(function(){
                    return _notifyNewUserToFriends(fromUserId, fromUserName, toUserId, toUserCurrentLanguage);
                });
    		});
        }

        // Contacts add User_object
        // double check, Contacts beforeSave trigger first
        function contactsUserPointer(user) {
            var query = new Parse.Query("Contacts");
            query.equalTo("User_objectId", user.id);
    		query.equalTo("User_object", null);
    		return query.each(function(contacts) {
                // update
    			contacts.set("User_object", user);
    			return contacts.save();
    		});
        }
    }).then(function() {
        // Set the job's success status
        status.success("Migration completed successfully.");
    }, function(error) {
        // Set the job's error status
        status.error("Uh oh, something went wrong.");
    });
});

// push message for new user
function _notifyNewUserToFriends(fromUserId, fromUserName, toUserId, toUserCurrentLanguage) {
    var singupText = '';
    singupText = ", joined now.";

    var data = {
        type : "new:friend",
        title : "TiOpenChat",
        alert : fromUserName + singupText,
        badge : "Increment",
        sound : "default",
        fromUserId : fromUserId,
    }
    var query = {
        userIds : [toUserId]
    }

    var promise = new Parse.Promise();
    Parse.Cloud.run('sendPush',{query:query, data:data},{
        success:function(r){
            console.log("sendPush : "+ r);
            promise.resolve();
        },
        error:function(e){
            console.error("sendPush : "+ e);
            promise.resolve();
        }
    });
    return promise;
}

// userModify
Parse.Cloud.define("userModify", function(request, response) {
	var user = Parse.User.current();
	user.set(request.params);
	user.save();

	response.success("Success");
});

// send sms using twilio
Parse.Cloud.define("sendSMS", function(request, response) {
	if (request.params.phoneNumber && request.params.messageBody) {
		twilio.sendSms({
			From: "",
			To: request.params.phoneNumber,
			Body: request.params.messageBody
		}, function(err, responseData) {
			if (err) {
				response.error(err);
			} else {
				response.success("Success");
			}
		});
	} else {
		response.error("Request Invalid");
	}
});

// send push
Parse.Cloud.define("sendPush", function (request, response) {
	var pushData = request.params.data || {};

	var query = request.params.query || {};
	var userIds = query.userIds;
	var channels = query.channels;

	var userQuery = new Parse.Query(Parse.User);
	if(userIds){
		userQuery.containedIn("objectId", userIds);
	}
	// find installation
	userQuery.find({
		success: function(results) {
			// check ban time
			var targetUserIds = [];
			for(var i=0,max=results.length; i<max; ++i){
				var user = results[i];

				// check all push
				if(!user.get('isPermissionAllPush')) continue;

				// check ban time
				if(user.get('isUsingBanTime')){
					var banStartHour = user.get('banStartHour');
					var banStartMinute = user.get('banStartMinute');
					var banEndHour = user.get('banEndHour');
					var banEndMinute = user.get('banEndMinute');
					var timezoneOffset = user.get('timezoneOffset');
					// if is all ok
					if(!_isBanTime(timezoneOffset, banStartHour, banStartMinute, banEndHour, banEndMinute)){
						targetUserIds.push(user.id);
					}
				}else{
					// not use ban time
					targetUserIds.push(user.id);
				}

			}
			// send push
			if(targetUserIds.length > 0){
				var pushQuery = new Parse.Query(Parse.Installation);

				pushQuery.containedIn("User_objectId", targetUserIds);
				if(channels){
					pushQuery.containedIn("channels", channels);
				}
				Parse.Push.send({
					where:pushQuery,
					data:pushData
				},
				{
					success: function(results) {
                        response.success(results);
					},
					error: function(error) {
						response.error(error.message);
					}
				});
			}else{
                var msg = 'find users : '+ results.length + ', but not push. because isBanTime!' + request.params;
                response.success(msg);
			}
		},
		error: function(error) {
            var msg = "Got an error " + error.code + " : " + error.message;
            console.error(msg);
			response.error(msg);
		}
	});
});

/**
 * Helper Functions
 */

// check ban time
function _isBanTime(timezoneOffset, startHour, startMinute, endHour, endMinute) {
	var currentTimeZoneOffsetInHours = timezoneOffset / 60;
	var nowTime = new Date();

	// using utc time
	var diffTime = new Date(2015, 4, 10, nowTime.getUTCHours(), nowTime.getUTCMinutes());
	diffTime.setDate(1);

    // convert local time to utc
	var banStartTime = new Date(2015, 4, 10, (startHour+currentTimeZoneOffsetInHours), startMinute);
	banStartTime.setDate(1);
	var banEndTime = new Date(2015, 4, 10, (endHour+currentTimeZoneOffsetInHours), endMinute);
	banEndTime.setDate(1);

	var isPushBlock = false;

	if (banStartTime > banEndTime) {
		// reverse
		banEndTime.setDate(banEndTime.getDate() + 1); // 4.1 14:30 + 1D = 4.2 14:30
	}

	// today cechk
	if (banStartTime <= diffTime && diffTime <= banEndTime) { // 4.2 04:30 ~ 4.2 14:30
		// in time
		isPushBlock = true;
	}

	// tommorow check
	diffTime.setDate(diffTime.getDate() + 1);	// 4.3 13:00
	if (banStartTime <= diffTime && diffTime <= banEndTime) {
		// in time
		isPushBlock = true;
	}

	return isPushBlock;
}

// contact added
Parse.Cloud.define("createContacts", function(request, response) {
	var user = Parse.User.current();
	var createArrary = request.params.createArrary;

	// do contact update
    var friendCount = 0;
    var completeCount = 0;
    var doCount = 0;
    var maxCount = createArrary.length;

    // serial start
    processUserCreate();

    // serial check
    function processUserCreate() {
        if (completeCount == maxCount) {
            response.success({ "friendCount" : friendCount });
        } else if (completeCount == doCount) {
            groupUserCreate();
        }
    }

    // serial run
    function groupUserCreate() {
        doCount = completeCount + 8;
        doCount = (doCount < maxCount) ? doCount : maxCount;
        for (var i = completeCount; i < doCount; i++) {
            nextUserCreate(i);
        }
    }

    // Contacts add
    function nextUserCreate(idx) {
        if (idx > createArrary.length -1) {
            response.success({ "friendCount" : friendCount });
        } else {
            var Contacts = Parse.Object.extend("Contacts");
            var contacts = new Contacts();

            contacts.set(createArrary[idx]);

            contacts.save().then(function(obj) {
                if (obj.get("User_objectId_To")) {
                    friendCount++;
                }
                completeCount++;
                processUserCreate();
                //nextUserCreate(createArrary, idx + 1);
            }, function(error) {
                console.error("Got an error " + error.code + " : " + error.message);
                completeCount++;
                processUserCreate();
                //nextUserCreate(createArrary, idx + 1);
            });
        }
    }
});

/**
 * tirgger
 */

Parse.Cloud.beforeSave("Contacts", function(request, response) {
    // test code
    if (request.object.get("User_objectId_To") == "test") {
        request.object.set("User_objectId_To", null);
        request.object.set("User_object_To", null);
        response.success();
    }

    // user pointer
    var user = Parse.User.current();
    if (user && user.id == request.object.get("User_objectId") && !request.object.get("User_object")) {
        request.object.set("User_object", user);
    }

    // link user
	if (request.object.get("User_objectId_To") || request.object.get("isBlock")) {
        // already linked or blocked
		response.success();
	} else {
        // add contacts link
		var query = new Parse.Query(Parse.User);
		query.equalTo("username", request.object.get("mainPhone"));
		query.notEqualTo("isWithdraw", true);	// not withdraw
		query.first({
			success: function(user) {
				if (user) {
					// check block
					var subQuery = new Parse.Query("Contacts");
					subQuery.equalTo("User_objectId", user.id);
					subQuery.equalTo("User_objectId_To", request.object.get("User_objectId"));
					subQuery.equalTo("isBlock", true);	// if block
					subQuery.first({
						success: function(contacts) {
							if (!contacts) {
								request.object.set("User_objectId_To", user.id);
								request.object.set("User_object_To", user);
                                // no name case
                                if (!request.object.get("fullName")) {
                                    request.object.set("fullName", user.get("name"));
                                }
							} else {
                                // blocked
								request.object.set("User_objectId_To", null);
								request.object.set("User_object_To", null);
							}

							response.success();
						},
						error: function(error) {
							console.error("Contacts find error " + error.code + " : " + error.message);
							request.object.set("User_objectId_To", user.id);
							request.object.set("User_object_To", user);
                            // no name case
                            if (!request.object.get("fullName")) {
                                request.object.set("fullName", user.get("name"));
                            }

							response.success();
						}
					});
				} else {
					request.object.set("User_objectId_To", null);
					request.object.set("User_object_To", null);

					response.success();
				}
			},
			error: function(error) {
				console.error("Got an error " + error.code + " : " + error.message);
				request.object.set("User_objectId_To", null);
				request.object.set("User_object_To", null);
				response.success();
			}
		});
	}
});

Parse.Cloud.afterSave("Contacts", function(request) {
    // blocked
    if (request.object.get("isBlock") && request.object.get("User_objectId")) {
        var userQuery = new Parse.Query(Parse.User);
        userQuery.get(request.object.get("User_objectId"), {
            success: function(user) {
                // remove link your contacts
                var query = new Parse.Query("Contacts");
        		query.equalTo("User_objectId", request.object.get("User_objectId_To"));
        		query.equalTo("mainPhone", user.get("username"));
        		query.find({
            			success: function(results) {
                            // normal 1 record, 2+ bug, 0 is sad
                            for (var i = 0; i < results.length; i++) {
            					var contacts = results[i];
            					// blocked me
            					if (request.object.get("isBlock")) {
            						contacts.set("User_objectId_To", null);
            						contacts.set("User_object_To", null);
            						contacts.save();
            					} else {
                                    // if not link
                                    if (!contacts.get("User_objectId_To")) {
                                        contacts.set("User_objectId_To", user.id);
                                        contacts.set("User_object_To", user);
                                        contacts.save();
                                    }
                                }
            				}
            			},
            			error: function(error) {
            				console.error("Got an error " + error.code + " : " + error.message);
            			}
        		});
            },
            error: function(object, error) {
                    console.error("[afterSave Contacts] Current user not found ");
            }
        });
    }
});

Parse.Cloud.afterSave(Parse.User, function(request) {
	// i'am withdraw
	if (request.object.get("isWithdraw")) {
		// remove link for others
		var query = new Parse.Query("Contacts");
		query.equalTo("mainPhone", request.object.get("username"));
		query.find({
			success: function(results) {
				for (var i = 0; i < results.length; i++) {
					var contacts = results[i];
					contacts.set("User_objectId_To", null);
					contacts.set("User_object_To", null);
					contacts.save();
				}
			},
			error: function(error) {
				console.error("Got an error " + error.code + " : " + error.message);
			}
		});

		// TODO : chatroom clean

		// TODO : contacts clean

        // TODO : users clean

        // TODO : installation clean

	}
});

Parse.Cloud.beforeSave("ChatRoom", function(request, response) {
    var success1 = false;
    var success2 = false;

    // inUser link
    var query = new Parse.Query(Parse.User);
	query.containedIn("objectId", request.object.get("inUserIds"));
	query.notEqualTo("isWithdraw", true);	// normal user
	query.find({
		success: function(results) {
			request.object.set("inUsers", results);

            success1 = true;
            responseSuccess();
		},
		error: function(error) {
			console.error("Got an error " + error.code + " : " + error.message);
			request.object.set("inUsers", null);

            success1 = true;
            responseSuccess();
		}
	});

    // roomId check
    var query2 = new Parse.Query("ChatRoom");
	query2.equalTo("roomId", request.object.get("roomId"));
    if (request.object.id) {
        query2.notEqualTo("objectId", request.object.id);	// not me
    }
	query2.find({
		success: function(results) {
			if (results.length > 0) {
                console.error("roomId is already exist");

                success2 = true;
                responseSuccess();
            } else {
                success2 = true;
                responseSuccess();
            }
		},
		error: function(error) {
			console.error("Got an error " + error.code + " : " + error.message);

            success2 = true;
            responseSuccess();
		}
	});

    // check
    function responseSuccess() {
        if (success1 && success2) {
            response.success();
        }
    }
});

// block delete user
Parse.Cloud.beforeDelete(Parse.User, function(request, response) {
    response.error("Error : User delete blocking.");
});

// // block delete Installation
Parse.Cloud.beforeDelete(Parse.Installation, function(request, response) {
    response.error("Error : Installation delete blocking.");
});

// User Push default
Parse.Cloud.beforeSave(Parse.User, function(request, response) {
    if (!request.object.get("isPermissionAllPush")) {
        request.object.set("isPermissionAllPush", true);
    }
    response.success();
});

// Installation Channel default
Parse.Cloud.beforeSave(Parse.Installation, function(request, response) {
    if (!request.object.get("channels")) {
        request.object.set("channels", ["Chat","Event"]);
    }
    response.success();
});

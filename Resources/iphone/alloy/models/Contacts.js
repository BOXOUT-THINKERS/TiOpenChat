var Alloy = require("alloy"), _ = require("alloy/underscore")._, model, collection;

var Q = require("q");

exports.definition = {
    config: {
        columns: {
            objectId: "text PRIMARY KEY",
            User_objectId: "text",
            User_object: "text",
            mainPhone: "text",
            User_objectId_To: "text",
            User_object_To: "text",
            firstName: "text",
            middleName: "text",
            lastName: "text",
            fullName: "text",
            phone: "text",
            relatedNames: "text",
            email: "text",
            date: "text",
            instantMessage: "text",
            url: "text",
            createdAt: "text",
            updatedAt: "text",
            kind: "REAL",
            address: "text",
            isFavorite: "INTEGER",
            isBlock: "INTEGER",
            isHidden: "INTEGER",
            requestCount: "INTEGER",
            isUnregister: "INTEGER",
            modified: "text"
        },
        URL: "https://api.parse.com/1/classes/Contacts",
        parentNode: "results",
        debug: 0,
        useStrictValidation: 0,
        adapter: {
            type: "sqlrest",
            collection_name: "Contacts",
            idAttribute: "objectId",
            deletedAttribute: "",
            addModifedToUrl: true,
            lastModifiedColumn: "modified"
        },
        headers: {
            "X-Parse-Application-Id": Ti.App.Properties.getString("Parse_AppId"),
            "X-Parse-REST-API-Key": Ti.App.Properties.getString("Parse_RestKey"),
            "Content-Type": "application/json"
        },
        deleteAllOnFetch: true,
        returnErrorResponse: true,
        disableSaveDataLocallyOnServerError: true
    },
    extendModel: function(Model) {
        _.extend(Model.prototype, {
            qSave: function(attributes) {
                return this._save(attributes);
            },
            _save: function(attributes) {
                var self = this;
                var deferred = Q.defer();
                var tempContactM = Alloy.createModel("contacts");
                tempContactM.save(_.extend({
                    objectId: this.id
                }, attributes), {
                    success: function() {
                        self.set(attributes, {
                            change: false
                        });
                        deferred.resolve(self);
                    },
                    error: function(error) {
                        deferred.reject(error);
                    }
                });
                return deferred.promise;
            },
            increaseRequestCount: function() {
                var requestCount = this.get("requestCount") || 0;
                requestCount += 1;
                this.updateRequestCount(requestCount);
                return requestCount;
            },
            saveRequestCount: function(requestCount) {
                this.updateRequestCount(requestCount);
                return requestCount;
            },
            _waitingCount: 0,
            _isUpdateBlock: false,
            updateRequestCount: function(requestCount) {
                var self = this;
                self.set({
                    requestCount: requestCount
                }, {
                    change: false
                });
                if (self.isRegister()) if (self._isUpdateBlock) ++self._waitingCount; else {
                    self._isUpdateBlock = true;
                    self._waitingCount = 0;
                    var tempContactM = Alloy.createModel("contacts");
                    tempContactM.save({
                        objectId: self.id,
                        requestCount: self.get("requestCount")
                    }, {
                        success: function() {
                            self._isUpdateBlock = false;
                            self._waitingCount > 0 ? self.updateRequestCount(self.get("requestCount")) : "";
                        },
                        error: function() {
                            self._isUpdateBlock = false;
                            self._waitingCount > 0 ? self.updateRequestCount(self.get("requestCount")) : "";
                        }
                    });
                }
                return requestCount;
            },
            getUserInfo: function() {
                var friend = this.get("User_object_To") || {};
                var fullname = this.get("fullName") || "";
                var isFavorite = this.get("isFavorite") || false;
                var id = friend.objectId || friend.id;
                var name = fullname || friend.name || "";
                var imageUrl = friend.profileImage ? friend.profileImage.url : "";
                imageUrl = imageUrl || friend.imageUrl;
                return {
                    id: id,
                    name: name,
                    imageUrl: imageUrl,
                    comment: friend.comment || "",
                    isFavorite: isFavorite,
                    mainPhone: this.get("mainPhone")
                };
            },
            isRegister: function() {
                return this.get("isUnregister") ? false : true;
            },
            isBan: function() {
                return this.get("isHidden") || this.get("isBlock") ? true : false;
            }
        });
        return Model;
    },
    extendCollection: function(Collection) {
        _.extend(Collection.prototype, {
            defaultFetchData: {},
            fetch: function(options) {
                options = options || {};
                options.urlparams = _.extend(this.defaultFetchData, options.urlparams || {});
                options.reset = true;
                Backbone.Collection.prototype.fetch.call(this, options);
            },
            qCreate: function(createModel) {
                return this._create(createModel);
            },
            _create: function(createModel) {
                var deferred = Q.defer();
                this.create(createModel, {
                    wait: true,
                    success: function(result) {
                        deferred.resolve(result);
                    },
                    error: function(error) {
                        deferred.reject(error);
                    }
                });
                return deferred.promise;
            },
            syncAddressBook: function() {
                var thisCollection = this;
                var performAddressBookFunction = function() {
                    function nextUpdate(idx) {
                        Ti.API.debug("Q nextUpdate function idx : ", idx);
                        if (idx > updateArrary.length - 1) return Q(true);
                        var updateModel = updateArrary[idx].model;
                        var updateAttributes = updateArrary[idx].attributes;
                        return updateModel.qSave(updateAttributes).then(function() {
                            return nextUpdate(idx + 1);
                        }).fail(function() {
                            return nextUpdate(idx + 1);
                        });
                    }
                    function parseCreate(createArary) {
                        var deferred = Q.defer();
                        Parse.Cloud.run("createContacts", {
                            createArrary: createArary
                        }, {
                            success: function(result) {
                                Ti.API.debug("parseCreate Sucess :", result);
                                if (result.friendCount) {
                                    Ti.API.debug("parseCreate Friend Found :", result.friendCount);
                                    thisCollection.fetch({
                                        success: function() {
                                            Alloy.Globals.toast("c_doingSyncMsgFindFriend");
                                        },
                                        error: function() {}
                                    });
                                }
                                deferred.resolve(result);
                            },
                            error: function(error) {
                                Ti.API.error("parseCreate Error :", error);
                                deferred.resolve(error);
                            }
                        });
                        return deferred.promise;
                    }
                    function parseNextCreate(idx) {
                        Ti.API.debug("Q parseNextCreate function idx : ", idx);
                        if (idx > parseCreateArary.length - 1) return Q(true);
                        Alloy.Globals.toast(L("c_doingSyncMsgFriendCount") + idx + "/" + parseCreateArary.length);
                        var count = 0;
                        var createAraryGroup = [];
                        for (var i = idx; i < parseCreateArary.length; i++) {
                            idx = i;
                            createAraryGroup.push(parseCreateArary[idx]);
                            if (!(29 > count)) break;
                            count++;
                        }
                        return parseCreate(createAraryGroup).then(function() {
                            return parseNextCreate(idx + 1);
                        }).fail(function() {
                            return parseNextCreate(idx + 1);
                        });
                    }
                    function diffContactsModelData(model1, model2) {
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
                        return _.isEqual(data1, data2);
                    }
                    Alloy.Globals.loginC.doingSyncAddress = true;
                    var singleValue = [ "firstName", "middleName", "lastName", "fullName" ];
                    var multiValue = [ "email", "phone" ];
                    var people = Ti.Contacts.getAllPeople();
                    Ti.API.debug("[SyncAddressBook] Total contacts : ", people.length, " / Fetched Collections : ", thisCollection.length);
                    var createCount = 0;
                    var updateCount = 0;
                    var updateArrary = [];
                    var contactArray = [];
                    var parseCreateArary = [];
                    for (var i = 0, ilen = people.length; ilen > i; i++) {
                        var person = people[i];
                        var contactsModel = new Alloy.createModel("contacts");
                        contactsModel.set("User_objectId", Alloy.Globals.user.get("id"));
                        var phoneModel = new Backbone.Model(person["phone"]);
                        var mainPhone = "";
                        phoneModel.get("mobile") && phoneModel.get("mobile")[0].length >= 10 ? mainPhone = phoneModel.get("mobile")[0] : phoneModel.get("iphone") && phoneModel.get("iphone")[0].length >= 10 ? mainPhone = phoneModel.get("iphone")[0] : phoneModel.get("main") && phoneModel.get("main")[0].length >= 10 ? mainPhone = phoneModel.get("main")[0] : phoneModel.get("home") && phoneModel.get("home")[0].length >= 10 ? mainPhone = phoneModel.get("home")[0] : phoneModel.get("work") && phoneModel.get("work")[0].length >= 10 ? mainPhone = phoneModel.get("work")[0] : phoneModel.get("other") && phoneModel.get("other")[0].length >= 10 && (mainPhone = phoneModel.get("other")[0]);
                        if ("" != mainPhone) {
                            mainPhone = "+" == mainPhone.substring(0, 1) ? "+" + (1 * Alloy.Globals.util.getNumberOnly(mainPhone)).toString() : Alloy.Globals.user.get("attributes")["local"] + (1 * Alloy.Globals.util.getNumberOnly(mainPhone)).toString();
                            if (mainPhone.length >= 12) {
                                contactsModel.set("mainPhone", mainPhone);
                                for (var j = 0, jlen = singleValue.length; jlen > j; j++) contactsModel.set(singleValue[j], person[singleValue[j]]);
                                for (var j = 0, jlen = multiValue.length; jlen > j; j++) contactsModel.set(multiValue[j], JSON.stringify(person[multiValue[j]]));
                                contactArray.push(contactsModel.toJSON());
                            }
                        }
                    }
                    contactArray = _.sortBy(contactArray, "mainPhone");
                    var beforeMainPhone = "";
                    for (var i = 0, ilen = contactArray.length; ilen > i; i++) {
                        var person = contactArray[i];
                        if (person.mainPhone != beforeMainPhone) {
                            beforeMainPhone = person.mainPhone;
                            var contactsModel = new Alloy.createModel("contacts", person);
                            var findModel = thisCollection.where({
                                User_objectId: Alloy.Globals.user.get("id"),
                                mainPhone: contactsModel.get("mainPhone")
                            })[0];
                            if (findModel) {
                                var cloneModel = findModel.clone();
                                cloneModel.set(contactsModel.attributes);
                                if (false == diffContactsModelData(findModel, cloneModel)) {
                                    updateArrary.push({
                                        model: findModel,
                                        attributes: contactsModel.attributes
                                    });
                                    updateCount++;
                                }
                            } else {
                                parseCreateArary.push(contactsModel.attributes);
                                createCount++;
                            }
                        }
                    }
                    parseNextCreate(0).then(function() {
                        nextUpdate(0).then(function() {
                            Ti.API.debug("[SyncAddressBook] Success / Create : ", createCount, " / Update : ", updateCount);
                            Alloy.Globals.loginC.doingSyncAddress = false;
                            Ti.API.debug("Contacts Redrawing after Sync");
                            createCount ? thisCollection.fetch() : updateCount && thisCollection.trigger("redraw");
                        });
                    });
                    return true;
                };
                var addressBookDisallowed = function() {
                    Alloy.Globals.alert("accessAddressBookFail");
                    return false;
                };
                if (Ti.Contacts.contactsAuthorization == Ti.Contacts.AUTHORIZATION_AUTHORIZED) return performAddressBookFunction();
                if (Ti.Contacts.contactsAuthorization != Ti.Contacts.AUTHORIZATION_UNKNOWN) return addressBookDisallowed();
                Ti.Contacts.requestAuthorization(function(e) {
                    return e.success ? performAddressBookFunction() : addressBookDisallowed();
                });
            },
            getBy: function(toUserId) {
                var models = this.models;
                for (var i = 0, max = models.length; max > i; ++i) {
                    var curContact = models[i];
                    var userObjectIdTo = curContact.get("User_objectId_To");
                    if (userObjectIdTo == toUserId) return curContact;
                }
                var unregisterContactM = Alloy.createModel("contacts", {
                    User_objectId_To: toUserId,
                    isUnregister: true
                });
                return unregisterContactM;
            }
        });
        return Collection;
    }
};

model = Alloy.M("contacts", exports.definition, []);

collection = Alloy.C("contacts", exports.definition, model);

exports.Model = model;

exports.Collection = collection;
function _makeQuery(params) {
    return {
        where: JSON.stringify(params)
    };
}

var Alloy = require("alloy"), _ = require("alloy/underscore")._, model, collection;

var Q = require("q");

var _ = Alloy._;

var settings = Alloy.Models.instance("settings");

exports.definition = {
    config: {
        URL: "https://api.parse.com/1/installations",
        adapter: {
            type: "restapi",
            collection_name: "Installation",
            idAttribute: "objectId"
        },
        headers: {
            "X-Parse-Application-Id": Ti.App.Properties.getString("Parse_AppId"),
            "X-Parse-REST-API-Key": Ti.App.Properties.getString("Parse_RestKey"),
            "Content-Type": "application/json"
        }
    },
    extendModel: function(Model) {
        _.extend(Model.prototype, {
            _parse_class_name: "Installation",
            getByRandomId: function(randomId) {
                var self = this;
                var deferred = Q.defer();
                randomId = randomId ? randomId.toString() : randomId;
                Parse.Cloud.run("getInstallationByRandomId", {
                    randomId: randomId
                }, {
                    success: function(_inst) {
                        if (_inst) {
                            self.set({
                                objectId: _inst.id,
                                id: _inst.id
                            }, {
                                change: false
                            });
                            self.set(_inst.attributes, {
                                change: false
                            });
                            deferred.resolve(self);
                        } else deferred.reject("not found installation by randomId: " + randomId);
                    },
                    error: function(error) {
                        return deferred.reject(error);
                    }
                });
                return deferred.promise;
            },
            changeChannels: function(channels) {
                _.isArray(channels) || (channels = [ channels ]);
                return this._save({
                    channels: channels
                });
            },
            create: function(attributes) {
                return this._save(attributes);
            },
            _save: function(attributes) {
                var self = this;
                var deferred = Q.defer();
                var tempInstallationM = Alloy.createModel("installation");
                tempInstallationM.save(_.extend({
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
            }
        });
        return Model;
    },
    extendCollection: function(Collection) {
        _.extend(Collection.prototype, {
            _parse_class_name: "Installation",
            fetch: function(options) {
                options = options ? _.clone(options) : {};
                options.reset = true;
                return Backbone.Collection.prototype.fetch.call(this, options);
            },
            getAll: function() {
                var deferred = Q.defer();
                this.fetch({
                    success: function(res) {
                        return deferred.resolve(res);
                    },
                    error: function(err) {
                        return deferred.reject(err);
                    }
                });
                return deferred.promise;
            }
        });
        return Collection;
    }
};

model = Alloy.M("installation", exports.definition, []);

collection = Alloy.C("installation", exports.definition, model);

exports.Model = model;

exports.Collection = collection;
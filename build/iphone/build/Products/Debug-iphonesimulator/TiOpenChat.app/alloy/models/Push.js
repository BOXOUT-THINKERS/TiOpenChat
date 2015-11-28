var Alloy = require("alloy"), _ = require("alloy/underscore")._, model, collection;

var Q = Alloy.Globals.Q;

var _ = Alloy._;

var settings = Alloy.Models.instance("settings");

exports.definition = {
    config: {
        URL: "https://api.parse.com/1/push",
        adapter: {
            type: "restapi",
            collection_name: "push",
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
            _parse_class_name: "push",
            send: function(data, query) {
                var self = this;
                data = data || {};
                query = query || {};
                var deferred = Q.defer();
                var sendData = {
                    data: data,
                    where: query
                };
                Ti.API.debug("pushData ;", data);
                Ti.API.debug("pushQuery ;", query);
                this.save(sendData, {
                    silent: true,
                    success: function(e) {
                        self.clear();
                        return deferred.resolve(e);
                    },
                    error: function(e) {
                        return deferred.reject(e);
                    }
                });
                return deferred.promise;
            }
        });
        return Model;
    },
    extendCollection: function(Collection) {
        _.extend(Collection.prototype, {
            _parse_class_name: "push",
            fetch: function(options) {
                options = options ? _.clone(options) : {};
                options.reset = true;
                return Backbone.Collection.prototype.fetch.call(this, options);
            }
        });
        return Collection;
    }
};

model = Alloy.M("push", exports.definition, []);

collection = Alloy.C("push", exports.definition, model);

exports.Model = model;

exports.Collection = collection;
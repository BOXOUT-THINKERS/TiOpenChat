var Alloy = require("alloy"), _ = require("alloy/underscore")._, model, collection;

var Q = Alloy.Globals.Q;

exports.definition = {
    config: {
        adapter: {
            type: "properties",
            collection_name: "settings"
        }
    },
    extendModel: function(Model) {
        _.extend(Model.prototype, {
            defaults: {
                id: "staticSettings"
            },
            saveInstallationId: function(instId) {
                return this._save({
                    Installation_objectId: instId
                });
            },
            getInstallationId: function() {
                return this.get("Installation_objectId");
            },
            _save: function(attributes) {
                var deferred = Q.defer();
                this.save(attributes, {
                    success: function(result) {
                        deferred.resolve(result);
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
            fetch: function(options) {
                options = options ? _.clone(options) : {};
                options.reset = true;
                return Backbone.Collection.prototype.fetch.call(this, options);
            },
            cleanup: function() {
                var regex = new RegExp("^(" + this.config.adapter.collection_name + ")\\-(.+)$");
                var TAP = Ti.App.Properties;
                _.each(TAP.listProperties(), function(prop) {
                    var match = prop.match(regex);
                    if (match) {
                        TAP.removeProperty(prop);
                        Ti.API.debug("deleting old model " + prop);
                    }
                });
            }
        });
        return Collection;
    }
};

model = Alloy.M("settings", exports.definition, []);

collection = Alloy.C("settings", exports.definition, model);

exports.Model = model;

exports.Collection = collection;
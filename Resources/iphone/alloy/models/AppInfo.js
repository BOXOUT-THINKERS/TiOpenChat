var Alloy = require("alloy"), _ = require("alloy/underscore")._, model, collection;

var Q = require("q");

exports.definition = {
    config: {
        adapter: {
            type: "parse",
            idAttribute: "objectId"
        }
    },
    extendModel: function(Model) {
        _.extend(Model.prototype, {
            _parse_class_name: "AppInfo"
        });
        return Model;
    },
    extendCollection: function(Collection) {
        _.extend(Collection.prototype, {
            _parse_class_name: "AppInfo",
            fetch: function(options) {
                options = options ? _.clone(options) : {};
                options.reset = true;
                return Backbone.Collection.prototype.fetch.call(this, options);
            }
        });
        return Collection;
    }
};

model = Alloy.M("appInfo", exports.definition, []);

collection = Alloy.C("appInfo", exports.definition, model);

exports.Model = model;

exports.Collection = collection;
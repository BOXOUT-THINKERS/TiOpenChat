module.exports.sync = function(method, model, options) {
    var api_version = "1";
    var methodMap = {
        create: "POST",
        update: "PUT",
        "delete": "DELETE",
        read: "GET"
    };
    var object_id = model.models ? "" : model.id;
    var class_name = model.__proto__._parse_class_name;
    class_name || Ti.API.error("Trying to use Parse adapter without _parse_class_name established.");
    var http_method = methodMap[method];
    options || (options = {});
    var url = [ "https://", "api.parse.com/", api_version, "/classes/", class_name ].join("");
    object_id && "create" != method && (url += "/" + object_id);
    var data = {};
    if (options.data || !model || "create" != method && "update" != method) options.query && "read" == method && (url += "?" + _.map(_.pairs(options.query), function(pair) {
        var key = pair[0];
        var val = pair[1];
        "where" === key && (val = JSON.stringify(val));
        return [ key, val ].join("=");
    }).join("&")); else {
        data = model.toJSON();
        delete data.createdAt;
        delete data.updatedAt;
        data = JSON.stringify(data);
    }
    return Parse._ajax(http_method, url, data, options.success, options.error);
};

module.exports.afterModelCreate = function(Model) {
    Model = Model || {};
    Model.prototype.idAttribute = "objectId";
    return Model;
};

module.exports.afterCollectionCreate = function(Collection) {
    Collection = Collection || {};
    Collection.prototype.parse = function(options) {
        data = Backbone.Collection.prototype.parse.call(this, options);
        return data.results;
    };
    return Collection;
};
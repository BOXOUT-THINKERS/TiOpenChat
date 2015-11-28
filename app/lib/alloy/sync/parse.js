/**
 * Persistence adapter for Parse
 */

module.exports.sync = function(method, model, options) {

  var api_version = "1";

  // Method to HTTP Type Map
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // get id if it is not a Backbone Collection
  var object_id = model.models? "" : model.id;

  var class_name = model.__proto__._parse_class_name;
  if (!class_name) {
    Ti.API.error("Trying to use Parse adapter without _parse_class_name established.");
  }

  // create request parameters
  var http_method = methodMap[method];
  options || (options = {});

  // use basic auth to we can just use Parse._ajax instead of
  // implementing our own to which we could pass auth headers
  // var url = [
  //   "https://",
  //   Ti.App.Properties.getString('Parse_AppId'),
  //   ":javascript-key=",
  //   Ti.App.Properties.getString('Parse_JsKey'),
  //   "@api.parse.com/",
  //   api_version,
  //   "/classes/",
  //   class_name
  // ].join('');
  var url = [
    "https://",
    "api.parse.com/",
    api_version,
    "/classes/",
    class_name
  ].join('');

  // need object for non-create
  if (object_id && method != "create") {
    url += "/" + object_id;
  }

  var data = {};
  if (!options.data && model && (method == 'create' || method == 'update')) {

    data = model.toJSON();
    delete data.createdAt; // Parse reserved word causes update to fail
    delete data.updatedAt; // Parse reserved word causes update to fail
    data = JSON.stringify(data);

  } else if (options.query && method == "read") {

    url += "?" + _.map(_.pairs(options.query), function (pair) {
      var key = pair[0];
      var val = pair[1];

      if (key === "where") {
        val = JSON.stringify(val);
      }

      return [key, val].join('=');

    }).join("&");

  }

  //Alloy.Globals.dump(http_method, url, data, options.success, options.error);
  return Parse._ajax(http_method, url, data, options.success, options.error);
};

module.exports.afterModelCreate = function(Model) {
  Model = Model || {};

  Model.prototype.idAttribute = 'objectId';

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

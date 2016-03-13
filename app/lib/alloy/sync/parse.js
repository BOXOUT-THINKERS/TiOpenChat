/**
 * Over write the _ajax function to use titanium httpclient
 *
 * @TODO Still looking for way to clean this up better
 *
 * @param {Object} method
 * @param {Object} url
 * @param {Object} data
 * @param {Object} success
 * @param {Object} error
 */
function ParseAjax(method, url, data, success, error) {
  var options = {
    success : success,
    error : error
  };

  var promise = new Parse.Promise();
  var handled = false;
  var xhr = Ti.Network.createHTTPClient({
    onload: function(e) {
      // function called in readyState DONE (4)
      //Ti.API.debug('onload called, readyState = ', this.readyState, ' and xhr.status = ', xhr);
      var response;
      try {
        response = JSON.parse(xhr.responseText);
      } catch (e) {
        promise.reject(e);
      }
      if (response) {
        promise.resolve(response, xhr.status, xhr);
      }
    },
    onerror: function(e) {
      // function called in readyState DONE (4)
      //Ti.API.debug('onerror called, readyState = ', this.readyState, ' and xhr.status = ', xhr);
      promise.reject(xhr);
    },
    ondatastream: function(e) {
      // function called as data is downloaded
      //Ti.API.debug('ondatastream called, readyState = ', this.readyState, ' and xhr.status = ', xhr);
    },
    onsendstream: function(e) {
      // function called as data is uploaded
      //Ti.API.debug('onsendstream called, readyState = ', this.readyState, ' and xhr.status = ', xhr);
    },
    timeout : 15000
  });
  xhr.open(method, url, !0);
  xhr.setRequestHeader("Content-Type", "text/plain");
  xhr.setRequestHeader('X-Parse-Application-Id', Ti.App.Properties.getString('Parse_AppId'));
  xhr.setRequestHeader('X-Parse-REST-API-Key', Ti.App.Properties.getString('Parse_RestKey'));
  if (Parse._isNode) {
    // Add a special user agent just for request from node.js.
    xhr.setRequestHeader("User-Agent",
       "Parse/" + Parse.VERSION +
       " (NodeJS " + process.versions.node + ")");
  }
  xhr.send(data);
  return promise._thenRunCallbacks(options);
}

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

    return [Ti.Network.encodeURIComponent(key), Ti.Network.encodeURIComponent(val)].join('=');

  }).join("&");

  }

  // Ti.API.debug('Request:'+method+' : '+url+' : '+JSON.stringify(options) );
  return ParseAjax(http_method, url, data, options.success, options.error);
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

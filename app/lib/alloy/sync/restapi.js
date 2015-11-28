/**
 * Rest API Adapter for Titanium Alloy
 * @author Mads Møller
 * @version 1.1.10
 * Copyright Napp ApS
 * www.napp.dk
 */

function S4() {
  return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
}

function guid() {
  return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

function InitAdapter(config) {
  return {};
}

function apiCall(_options, _callback) {
  if (Ti.Network.online) {
    var xhr = Ti.Network.createHTTPClient({
      timeout : _options.timeout || 7000
    });

    xhr.onload = function() {
      var responseJSON, success = (this.status <= 304) ? "ok" : "error", status = true, error;

      // save the eTag for future reference
      if (_options.eTagEnabled && success) {
        setETag(_options.url, xhr.getResponseHeader('ETag'));
      }

      // we dont want to parse the JSON on a empty response
      if (this.status != 304 && this.status != 204) {
        // parse JSON
        try {
          responseJSON = JSON.parse(this.responseText);
        } catch (e) {
          Ti.API.error('[REST API] apiCall PARSE ERROR: ' + e.message);
          Ti.API.error('[REST API] apiCall PARSE ERROR: ' + this.responseText);
          status = false;
          error = e.message;
        }
      }

      _callback({
        success : status,
        status : success,
        code : this.status,
        data : error,
        responseText : this.responseText || null,
        responseJSON : responseJSON || null
      });

      cleanup();
    };

    //Handle error
    xhr.onerror = function(e) {
      var responseJSON, error;
      try {
        responseJSON = JSON.parse(this.responseText);
      } catch (e) {
        error = e.message;
      }

      _callback({
        success : false,
        status : "error",
        code : this.status,
        error : e.error,
        data : error,
        responseText : this.responseText,
        responseJSON : responseJSON || null
      });

      Ti.API.error('[REST API] apiCall ERROR: ' + this.responseText);
      Ti.API.error('[REST API] apiCall ERROR CODE: ' + this.status);
      Ti.API.error('[REST API] apiCall ERROR MSG: ' + e.error);
      Ti.API.error('[REST API] apiCall ERROR URL: ' + _options.url);

      cleanup();
    };

    //Prepare the request
    xhr.open(_options.type, _options.url);

    // headers
    for (var header in _options.headers) {
      // use value or function to return value
      xhr.setRequestHeader(header, _.isFunction(_options.headers[header]) ? _options.headers[header]() : _options.headers[header]);
    }

    if (_options.beforeSend) {
      _options.beforeSend(xhr);
    }

    if (_options.eTagEnabled) {
      var etag = getETag(_options.url);
      etag && xhr.setRequestHeader('IF-NONE-MATCH', etag);
    }
    //추가
    //Ti.API.debug('Request:'+_options.type+':'+_options.url+':'+JSON.stringify(_options.headers) );

    if (_options.type != 'GET' && !_.isEmpty(_options.data)) {
      xhr.send(_options.data);
    } else {
      xhr.send();
    }
  } else {
    // we are offline
    _callback({
      success : false,
      status : "offline",
      offline : true,
      responseText : null
    });
  }

  /**
   * Clean up the request
   */
  function cleanup() {
    xhr = null;
    _options = null;
    _callback = null;
    error = null;
    responseJSON = null;
  }

}

function Sync(method, model, opts) {
  model.idAttribute = model.config.adapter.idAttribute || "id";

  // Debug mode
  var DEBUG = model.config.debug;

  // eTag enabled
  var eTagEnabled = model.config.eTagEnabled;

  // Used for custom parsing of the response data
  var parentNode = model.config.parentNode;

  // REST - CRUD
  var methodMap = {
    'create' : 'POST',
    'read' : 'GET',
    'update' : 'PUT',
    'delete' : 'DELETE'
  };

  var type = methodMap[method];
  var params = _.extend({}, opts);
  params.type = type;

  //set default headers
  params.headers = params.headers || {};

  // Send our own custom headers
  if (model.config.hasOwnProperty("headers")) {
    for (var header in model.config.headers) {
      params.headers[header] = model.config.headers[header];
    }
  }

  // We need to ensure that we have a base url.
  if (!params.url) {
    params.url = (model.config.URL || model.url());
    if (!params.url) {
      Ti.API.error("[REST API] ERROR: NO BASE URL");
      return;
    }
  }

  // Extend the provided url params with those from the model config
  if (_.isObject(params.urlparams) || model.config.URLPARAMS) {
        params.urlparams = params.urlparams || {};
    _.extend(params.urlparams, _.isFunction(model.config.URLPARAMS) ? model.config.URLPARAMS() : model.config.URLPARAMS);
  }

  // For older servers, emulate JSON by encoding the request into an HTML-form.
  if (Alloy.Backbone.emulateJSON) {
    params.contentType = 'application/x-www-form-urlencoded';
    params.processData = true;
    params.data = params.data ? {
      model : params.data
    } : {};
  }

  // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
  // And an `X-HTTP-Method-Override` header.
  if (Alloy.Backbone.emulateHTTP) {
    if (type === 'PUT' || type === 'DELETE') {
      if (Alloy.Backbone.emulateJSON)
        params.data._method = type;
      params.type = 'POST';
      params.beforeSend = function(xhr) {
        params.headers['X-HTTP-Method-Override'] = type;
      };
    }
  }

  //json data transfers
  if (!params.data && model && (method == 'create' || method == 'update')) {
      params.headers['Content-Type'] = 'application/json';
    }

  logger(DEBUG, "REST METHOD", method);

  switch(method) {
    case 'create' :
      // convert to string for API call
      params.data = JSON.stringify(model.toJSON());
      logger(DEBUG, "create options", params);

      apiCall(params, function(_response) {
        if (_response.success) {
          var data = parseJSON(DEBUG, _response, parentNode, model);

          //Rest API should return a new model id.
          if (data[model.idAttribute] === undefined) {
            //if not - create one
            data[model.idAttribute] = guid();
          }
          params.success(data, JSON.stringify(data));
          model.trigger("fetch");
          // fire event
        } else {
          params.error(_response.responseJSON, _response.responseText);
          Ti.API.error('[REST API] CREATE ERROR: ');
          Ti.API.error(_response);
        }
      });
      break;

    case 'read':
      if (model.id) {
        params.url = params.url + '/' + model.id;
      }

      if (params.search) {
        // search mode
        params.url = params.url + "/search/" + Ti.Network.encodeURIComponent(params.search);
      }


      if (params.urlparams) {
        // build url with parameters
        params.url = encodeData(params.urlparams, params.url);
      }

      if ( ! params.urlparams && params.data) {
                // If we have set optional parameters on the request we should use it
                // when params.urlparams fails/is empty.
                params.url = encodeData(params.data, params.url);
            }

      if (eTagEnabled) {
        params.eTagEnabled = true;
      }

      logger(DEBUG, "read options", params);

      apiCall(params, function(_response) {
        if (_response.success) {
          var data = parseJSON(DEBUG, _response, parentNode, model);
          var values = [];

          if (!_.isArray(data)) {
            data = [data];
          }

          var length = 0;
          for (var i in data) {
            var item = {};
            item = data[i];
            if (item[model.idAttribute] === undefined) {
              item[model.idAttribute] = guid();
            }
            values.push(item);
            length++;
          }

          params.success((length === 1) ? values[0] : values, _response.responseText);
          model.trigger("fetch");
        } else {
          params.error(model, _response.responseText);
          Ti.API.error('[REST API] READ ERROR: ');
          Ti.API.error(_response);
        }
      });
      break;

    case 'update' :
      if (!model.id) {
        params.error(null, "MISSING MODEL ID");
        Ti.API.error("[REST API] ERROR: MISSING MODEL ID");
        return;
      }

      // setup the url & data
      if (_.indexOf(params.url, "?") == -1) {
        params.url = params.url + '/' + model.id;
      } else {
        var str = params.url.split("?");
        params.url = str[0] + '/' + model.id + "?" + str[1];
      }

      if (params.urlparams) {
        params.url = encodeData(params.urlparams, params.url);
      }

      params.data = JSON.stringify(model.toJSON());

      logger(DEBUG, "update options", params);

      apiCall(params, function(_response) {
        if (_response.success) {
          var data = parseJSON(DEBUG, _response, parentNode, model);
          params.success(data, JSON.stringify(data));
          model.trigger("fetch");
        } else {
          params.error(model, _response.responseText);
          Ti.API.error('[REST API] UPDATE ERROR: ');
          Ti.API.error(_response);
        }
      });
      break;

    case 'delete' :
      if (!model.id) {
        params.error(null, "MISSING MODEL ID");
        Ti.API.error("[REST API] ERROR: MISSING MODEL ID");
        return;
      }
      if (_.indexOf(params.url, "?") == -1) {
              params.url = params.url + '/' + model.id;
            } else {
              var str = params.url.split("?");
              params.url = str[0] + '/' + model.id + "?" + str[1];
            }

      logger(DEBUG, "delete options", params);

      apiCall(params, function(_response) {
        if (_response.success) {
          var data = parseJSON(DEBUG, _response, parentNode, model);
          params.success(null, _response.responseText);
          model.trigger("fetch");
        } else {
          params.error(model, _response.responseText);
          Ti.API.error('[REST API] DELETE ERROR: ');
          Ti.API.error(_response);
        }
      });
      break;
  }

}

/////////////////////////////////////////////
// HELPERS
/////////////////////////////////////////////

function logger(DEBUG, message, data) {
  if (DEBUG) {
    Ti.API.debug("[REST API] " + message);
    if (data) {
      Ti.API.debug( typeof data === 'object' ? JSON.stringify(data, null, '\t') : data);
    }
  }
}

function parseJSON(DEBUG, _response, parentNode, model) {
  // {results :[] } 여럿은 이런형태로 받기에... 바꿔줘야함.!!
  // TODO : 그러나 ...results가 어떤값이면 어떡하지?
  var data = (_response.responseJSON.results) ? _response.responseJSON.results : _response.responseJSON;
  if (!_.isUndefined(parentNode)) {
    data = _.isFunction(parentNode) ? parentNode(data, _response, model) : traverseProperties(data, parentNode);
  }
  logger(DEBUG, "server response", _response);
  return data;
}

function traverseProperties(object, string) {
  var explodedString = string.split('.');
  for ( i = 0, l = explodedString.length; i < l; i++) {
    object = object[explodedString[i]];
  }
  return object;
}

function encodeData(obj, url) {
  var str = [];
  for (var p in obj) {
    str.push(Ti.Network.encodeURIComponent(p) + "=" + Ti.Network.encodeURIComponent(obj[p]));
  }

  if (_.indexOf(url, "?") == -1) {
    return url + "?" + str.join("&");
  } else {
    return url + "&" + str.join("&");
  }
}

/**
 * Get the ETag for the given url
 * @param {Object} url
 */
function getETag(url) {
  var obj = Ti.App.Properties.getObject("NAPP_REST_ADAPTER", {});
  var data = obj[url];
  return data || null;
}

/**
 * Set the ETag for the given url
 * @param {Object} url
 * @param {Object} eTag
 */
function setETag(url, eTag) {
  if (eTag && url) {
    var obj = Ti.App.Properties.getObject("NAPP_REST_ADAPTER", {});
    obj[url] = eTag;
    Ti.App.Properties.setObject("NAPP_REST_ADAPTER", obj);
  }
}

//we need underscore
var _ = require("alloy/underscore")._;

//until this issue is fixed: https://jira.appcelerator.org/browse/TIMOB-11752
var Alloy = require("alloy"), Backbone = Alloy.Backbone;

module.exports.sync = Sync;

module.exports.beforeModelCreate = function(config, name) {
  config = config || {};
  InitAdapter(config);
  return config;
};

module.exports.afterModelCreate = function(Model, name) {
  Model = Model || {};
  Model.prototype.config.Model = Model;
  Model.prototype.idAttribute = Model.prototype.config.adapter.idAttribute;
  return Model;
};

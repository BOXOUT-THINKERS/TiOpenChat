var TiParse = function(options) {
    FB = {
        init: function() {
            Ti.API.debug("called FB.init()");
        },
        login: function() {
            Ti.API.debug("called FB.login()");
        },
        logout: function() {
            Ti.API.debug("called FB.logout()");
        }
    };
    XMLHttpRequest = function() {
        return Ti.Network.createHTTPClient();
    };
    Ti.include("parse-1.4.2.js");
    Parse.localStorage = {
        getItem: function(key) {
            return Ti.App.Properties.getObject(Parse.localStorage.fixKey(key));
        },
        setItem: function(key, value) {
            return Ti.App.Properties.setObject(Parse.localStorage.fixKey(key), value);
        },
        removeItem: function(key) {
            return Ti.App.Properties.removeProperty(Parse.localStorage.fixKey(key));
        },
        fixKey: function(key) {
            return key.split("/").join("");
        }
    };
    Parse.initialize(options.applicationId, options.javaScriptKey);
    Parse._ajax = function(method, url, data, success, error) {
        var options = {
            success: success,
            error: error
        };
        var promise = new Parse.Promise();
        var xhr = Ti.Network.createHTTPClient({
            onload: function(e) {
                var response;
                try {
                    response = JSON.parse(xhr.responseText);
                } catch (e) {
                    promise.reject(e);
                }
                response && promise.resolve(response, xhr.status, xhr);
            },
            onerror: function() {
                promise.reject(xhr);
            },
            ondatastream: function() {},
            onsendstream: function() {},
            timeout: 15e3
        });
        xhr.open(method, url, !0);
        xhr.setRequestHeader("Content-Type", "text/plain");
        xhr.setRequestHeader("X-Parse-Application-Id", Ti.App.Properties.getString("Parse_AppId"));
        xhr.setRequestHeader("X-Parse-REST-API-Key", Ti.App.Properties.getString("Parse_RestKey"));
        Parse._isNode && xhr.setRequestHeader("User-Agent", "Parse/" + Parse.VERSION + " (NodeJS " + process.versions.node + ")");
        xhr.send(data);
        return promise._thenRunCallbacks(options);
    };
    return Parse;
};

module.exports = TiParse;
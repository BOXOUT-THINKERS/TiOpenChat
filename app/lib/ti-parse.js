var TiParse = function(options) {

	// Stub out Facebook
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

	// Parse will pick this up and use it
	XMLHttpRequest = function() {
		return Ti.Network.createHTTPClient();
	};

	Ti.include("parse-1.4.2.js");

	// over write the local storage so it works on Appcelerator
	Parse.localStorage = {
		getItem : function(key) {
			return Ti.App.Properties.getObject(Parse.localStorage.fixKey(key));
		},
		setItem : function(key, value) {
			return Ti.App.Properties.setObject(Parse.localStorage.fixKey(key), value);
		},
		removeItem : function(key, value) {
			return Ti.App.Properties.removeProperty(Parse.localStorage.fixKey(key));
		},
		//Fix Parse Keys. Parse uses a Key containing slashes "/". This is invalid for Titanium Android
		//We'll replace those slashes with underscores ""
		fixKey : function(key) {
			return key.split("/").join("");
		}
	};

	// Enter appropriate parameters for initializing Parse
	Parse.initialize(options.applicationId, options.javaScriptKey);
	//Parse.FacebookUtils.init();

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
	Parse._ajax = function(method, url, data, success, error) {
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
	};

	return Parse;
};

module.exports = TiParse;

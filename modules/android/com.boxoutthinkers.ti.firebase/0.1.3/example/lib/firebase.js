/**
 * This component handles communication and syncing with Firebase
 */

/**
 * Constructor
 */
function Firebase(ref) {
	
	var instance = Firebase.mod;
	var path = "/" + ref + "/";
	var that = this;
	
	// A static reference to the root path
	Firebase.root = path;
	
	/**
	 * Connects to a Firebase
	 * @param {Object} child Firebase path i.e. "/settings/123456"
	 * @param {Object} args {changeHandler, completeHandler}
	 */
	this.connect = function(args) {
		// The path is always prepended with this devices mac address
		Ti.API.debug("Firebase connecting to: " + path);
		var changeHandler = (args.change)?args.change:null;
		// initialize the native module
		instance.init(Firebase.config.url, Firebase.config.key, path, function(data) {
			that.isConnected = true;
			Firebase.isConnected = true;
			if (args.complete) args.complete(data);
		},changeHandler);
	};
	
	/**
	 * Listens on a child for changes
	 * @param {Object} args {child:'some/child/path', change:Function}
	 */
	this.child = function(args) {
		if (that.isConnected) {
			if (!args.path) { Ti.API.error("No child specified"); return; };
			Ti.API.debug("Adding Listener to Firebase child: " + args.path);
			var changeHandler = (args.change)?args.change:null;
			var eventType = (args.eventType)?args.eventType:"child_added child_changed child_removed child_moved";
			instance.childListener(args.path,changeHandler,eventType);
		} else {
			Ti.API.error("Tried adding a child but NOT connected");
		}
	};
	
	/**
	 * Push a new value at the paths location to the given value
	 * The propertyChange handler will also fire when this completes
	 * @param {Object} child
	 * @param {Object} value
	 */
	this.push = function(value) {
		instance.push({collection:path,data:value});
	};
	
	/**
	 * Append a new value to the child in the given location
	 * the location prepends with the child for this instance
	 * 
	 * For example, if the instance was created with 'logs' you can pass
	 * append('2014-3-6/1200', {some:value}) to add sub-folders in the child 
	 * 
	 * @param {Object} collection i.e. something/somewhere
	 * @param {Object} value {some:value}
	 */
	this.append = function(location,value) {
		var loc = path + "/" + location;
 		instance.push({collection:loc,data:value});
	};
	
	/**
	 * Updates the default root children
	 */
	this.update = function(data) {
		instance.updateChildren(path,data,null);
	};
	
	/**
	 * This is the default property change handler which should be over-ridden when
	 * connecting to Firebase
	 * @param {Object} data
	 */
	this.propertyChange = function(data) {
		Ti.API.debug('Firebase.propertyChange: ' + JSON.stringify(data));
	};
	
	/**
	 * Check if a Firebase is connected
	 */
	this.isConnected = false;
	
};

/**
 * Firebase url and api-key
 */
Firebase.config = {
	url:"https://YOUR_FIREBASE.firebaseIO.com",
	key:"SECRET_API_KEY"
};

/**
 * Connection status
 */
Firebase.isConnected = false;

/**
 * Firebase root collection node
 */
Firebase.root = Titanium.Platform.macaddress;


/**
 * Native module
 */
Firebase.mod = require('com.boxoutthinkers.ti.firebase');

/**
 * CommonJS module
 */
module.exports = Firebase;
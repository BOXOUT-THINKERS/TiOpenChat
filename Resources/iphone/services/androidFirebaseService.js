function Firebase(ref) {
    var instance = Firebase.mod;
    var path = ref;
    var that = this;
    Firebase.root = path;
    this.connect = function(args) {
        Ti.API.debug("Firebase connecting to: " + path);
        Ti.API.debug("Firebase connecting to: " + Firebase.config.url);
        Ti.API.debug("Firebase connecting to: " + Firebase.config.key);
        var changeHandler = args.change ? args.change : null;
        instance.init(Firebase.config.url, Firebase.config.key, path, function(data) {
            that.isConnected = true;
            Firebase.isConnected = true;
            args.complete && args.complete(data);
        }, changeHandler);
    };
    this.child = function(args) {
        if (that.isConnected) {
            if (!args.path) {
                Ti.API.error("No child specified");
                return;
            }
            Ti.API.debug("Adding Listener to Firebase child: " + args.path);
            var changeHandler = args.change ? args.change : null;
            var eventType = args.eventType ? args.eventType : "child_added child_changed child_removed child_moved";
            instance.childListener(args.path, changeHandler, eventType);
        } else Ti.API.error("Tried adding a child but NOT connected");
    };
    this.push = function(_path, value) {
        _path = _path || path;
        instance.push({
            collection: _path,
            data: value
        });
    };
    this.append = function(location, value) {
        var loc = path + "/" + location;
        instance.push({
            collection: loc,
            data: value
        });
    };
    this.update = function(data) {
        instance.updateChildren(path, data, null);
    };
    this.remove = function(pathVal) {
        instance.remove(pathVal);
    };
    this.propertyChange = function(data) {
        Ti.API.debug("Firebase.propertyChange: " + JSON.stringify(data));
    };
    this.goOnline = function() {
        instance.goOnline();
    };
    this.goOffline = function() {
        instance.goOffline();
    };
    this.isConnected = false;
}

Firebase.config = {
    url: Ti.App.Properties.getString("Firebase_AppUrl"),
    key: ""
};

Firebase.isConnected = false;

Firebase.root = Titanium.Platform.macaddress;

Firebase.mod = require("com.boxoutthinkers.ti.firebase");

module.exports = Firebase;
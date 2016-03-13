var Q = require("q");

var installation = Alloy.Models.instance("installation");

var iosPushService = module.exports = {};

iosPushService.start = function(dToken, option) {
    var args = {
        deviceType: "ios",
        appName: Ti.App.name,
        appVersion: Ti.App.version,
        appIdentifier: Ti.App.id,
        deviceToken: dToken,
        parseVersion: "rest"
    };
    return installation.save(args, option);
};

iosPushService.authenticate = function() {};

iosPushService.subscribeChannel = function() {};

iosPushService.unsubscribeChannel = function() {};

iosPushService.putValue = function(key, value) {
    return installation.set(key, value).save();
};
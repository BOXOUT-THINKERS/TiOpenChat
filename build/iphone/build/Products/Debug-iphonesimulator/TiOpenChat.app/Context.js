module.exports = {
    on: function(name, activity) {
        activity.onStart = function() {
            activeActivity == name && Ti.App.fireEvent("resumed");
            activeActivity = name;
        };
        activity.onStop = function() {
            activeActivity == name && Ti.App.fireEvent("paused");
        };
    },
    off: function(activity) {
        activity.onStart = null;
        activity.onStop = null;
    }
};

var activeActivity;
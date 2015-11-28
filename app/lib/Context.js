module.exports = {
	on: function(name, activity) {
		activity.onStart = function() {
			if (activeActivity == name) {
				Ti.App.fireEvent('resumed');
			}

			activeActivity = name;
		};

		activity.onStop = function() {
			if (activeActivity == name) {
				Ti.App.fireEvent('paused');
			}
		};
	},

	off: function(activity) {
		activity.onStart = null;
		activity.onStop = null;
	}
};

/**
 * @property {String} Current active Activity's name
 * @private
 */
var activeActivity;
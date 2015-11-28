var Q = Alloy.Globals.Q;


exports.definition = {
	config : {
		adapter: {
			type: "parse",
			idAttribute: "objectId"
		}
		// table schema and adapter information
	},

	extendModel: function(Model) {
		_.extend(Model.prototype, {
			_parse_class_name: "AppInfo"

		});


		return Model;
	},

	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			_parse_class_name: "AppInfo",
			// For Backbone v1.1.2, uncomment the following to override the
		        // fetch method to account for a breaking change in Backbone.
		        fetch: function(options) {
				options = options ? _.clone(options) : {};
				options.reset = true;
				return Backbone.Collection.prototype.fetch.call(this, options);
			}
		});

		return Collection;
	}
};

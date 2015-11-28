var Q = Alloy.Globals.Q;

exports.definition = {
	config: {
		adapter: {
			type: "properties",
			collection_name: "settings"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			defaults : {
				id : 'staticSettings' //id를 고정하여 id 지정 없이 singleton을 사용 가능하게 함
			},
			// extended functions and properties go here
			saveInstallationId : function (instId) {  return this._save({ 'Installation_objectId' : instId}); },
			getInstallationId : function () { return this.get('Installation_objectId'); },

			//save
			_save : function (attributes) {
				var deferred = Q.defer();
				this.save(attributes, {
					success: function (result) {
						deferred.resolve(result)
					},
					error : function (error) {
						deferred.reject(error);
					}
				});

				return deferred.promise;
			}
		});

		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			// extended functions and properties go here
			// For Backbone v1.1.2, uncomment the following to override the
		        // fetch method to account for a breaking change in Backbone.
		        fetch: function(options) {
				options = options ? _.clone(options) : {};
				options.reset = true;
				return Backbone.Collection.prototype.fetch.call(this, options);
			},
			/**
			* clean up any models from the properties db
			*/
			cleanup : function() {
				var regex = new RegExp("^(" + this.config.adapter.collection_name + ")\\-(.+)$");
				var TAP = Ti.App.Properties;
				_.each(TAP.listProperties(), function(prop) {
					var match = prop.match(regex);
					if (match) {
						TAP.removeProperty(prop);
						Ti.API.debug('deleting old model ' + prop);
					}
				});
			}
		});

		return Collection;
	}
};

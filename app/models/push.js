var Q = Alloy.Globals.Q;
var _ = Alloy._;


var settings = Alloy.Models.instance('settings');

exports.definition = {
config: {
    "URL": "https://api.parse.com/1/push",
    //"debug": 1,
    "adapter": {
        "type": "restapi",
        "collection_name": "push",
        "idAttribute": "objectId"
    },
    "headers": { // your custom headers
        "X-Parse-Application-Id" : Ti.App.Properties.getString('Parse_AppId'),
        //TODO : CFG로 가져오면 왜 대부분 값이없을까.
        "X-Parse-REST-API-Key" : Ti.App.Properties.getString('Parse_RestKey'),
        //TODO : 삭제, 쿼리시 필요. 필요한 부분만 헤더 변경할수있또
        "Content-Type" : "application/json"
    }
  },
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			_parse_class_name: "push",

			// data: {title:'title', alert:'content', 추가:'추가'}
			// query:{channels:'Chat', isTaget:true}
			send : function (data, query) {
				var self = this;
				data = data || {};
				query = query || {};

				var deferred = Q.defer();

				var sendData = {
					data : data,
					where: query
				}
				Ti.API.debug('pushData ;', data);
				Ti.API.debug('pushQuery ;', query);

				this.save( sendData, {
					silent: true,
					success: function(e) {
						//재 요청시 id가있으면 안되기에 지워줌.
						self.clear();
						return deferred.resolve(e)
					},
					error: function(e) {return deferred.reject(e)}
				});
				return deferred.promise;
			}
		});

	return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
                        // Extend, override or implement Backbone.Collection
        		_parse_class_name: "push",
                        // For Backbone v1.1.2, uncomment the following to override the
                        // fetch method to account for a breaking change in Backbone.
                        fetch: function(options) {
                                options = options ? _.clone(options) : {};
                                options.reset = true;
                                return Backbone.Collection.prototype.fetch.call(this, options);
                        }
		})
	return Collection;
	}
};


// helper

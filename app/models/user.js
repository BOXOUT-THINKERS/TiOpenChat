exports.definition = {
	config : {
		adapter: {
			type: "parse"
		}
		// table schema and adapter information
	},

	extendModel: function(Model) {
		_.extend(Model.prototype, {
			// Extend, override or implement Backbone.Model
			_parse_class_name: "users",
			login: function(options){
				var thisModel = this;
				var errorFn = function(error) {
					Ti.API.error(error);
					// 101 : invaild session
					// 209 : invaild session token
					if (error.code == '101' || error.code == '209') {
						Alloy.Globals.settings.set('User_sessionToken', undefined).save();
						Alloy.Globals.loginC.requiredLogin();
					} else {
						// 로긴을 계속 재시도
						setTimeout(loginParse, 100);
					}
				}
				var withdrawChk = function(user) {
					if (user.get("isWithdraw") == true) {
						errorFn();
					} else {
						thisModel.set(user);
					}
				}

				// 로긴 시도
				loginParse();

				function loginParse() {
					// setting 에 저장된 기존 로그인을 처리하기
					if(Alloy.Globals.settings.get('User_sessionToken')) {
						Parse.User.become(Alloy.Globals.settings.get('User_sessionToken')).then(function (user) {
							withdrawChk(user);
						}, function (error) {
							errorFn(error);
						});
					} else if(options && options.username && options.password){
						Parse.User.logIn(options.username, options.password, {
							success: function(user) {
								withdrawChk(user);
							},
							error: function(user, error) {
								errorFn(error);
							}
						});
					} else {
						Ti.API.error("User Login Faild");
						Alloy.Globals.settings.set('User_sessionToken', undefined).save();
						Alloy.Globals.loginC.requiredLogin();
					}
				}
				// options.success && options.success();
				// options.error && options.error();
			},
			//기초데이터
			getInfo : function() {
				var userM = this.attributes;

				var id = this.get('id');
				var imageUrl = userM.get('profileImage') ? userM.get('profileImage').url() : "" ;
				var name = userM.get('name') || "";

				return {
					id : id,
					name : name,
					imageUrl :imageUrl,
					comment : userM.get('comment') || ''
				}
			}
		});

		return Model;
	},

	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			// Extend, override or implement Backbone.Collection
			_parse_class_name: "users",
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

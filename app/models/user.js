exports.definition = {
  config : {
    // https://api.parse.com/1/classes/users
    "URL": "https://api.parse.com/1/users",
    //"debug": 1,
    "adapter": {
      "type": "restapi",
      "collection_name": "users",
      "idAttribute": "objectId"
    },
    "headers": { // your custom headers
      "X-Parse-Application-Id" : Ti.App.Properties.getString('Parse_AppId'),
      "X-Parse-REST-API-Key" : Ti.App.Properties.getString('Parse_RestKey'),
      "Content-Type" : "application/json"
    }
  },
  extendModel: function(Model) {
    _.extend(Model.prototype, {
      // Extend, override or implement Backbone.Model
      _parse_class_name: "users",
      save: function (attributes, options) {
        var options = options || {};
        this.set(attributes);
        Parse.Cloud.run('userModify', attributes, {
          success: function (result) {
            APP.log("debug", 'User Save Success : ' + JSON.stringify(result));
            options.success && options.success();

          },
          error: function (error) {
            APP.log("error", 'User Save Fail : ' + JSON.stringify(error));
            options.error && options.error();
          }
        });
      },
      reset: function (user) {
        Ti.API.debug('user reset : ' + user.id + ' ' + user.get("name"));
        this.clear({silent:true});  // if value changing exist to null
        this.set(_.extend({id: user.id, objectId: user.id}, user.attributes));  // change event avoid
      },
      login: function(options){
        var thisModel = this;
        var failCount = 0;
        var errorFn = function(error) {
          // 101 : invaild session
          // 209 : invaild session token
          if (error && error.code && (error.code == '101' || error.code == '209')) {
            // sessiontoken discard, login username & password
            Parse.User.logOut();
            Alloy.Globals.settings.set('User_sessionToken', undefined).save();
            options || (options = {});
            options.username = thisModel.get('username');
            options.password = thisModel.get("username") + Ti.App.Properties.getString('Parse_PwdFix');
            // retry
            Ti.API.error('Login Fail / retry using username : ' + JSON.stringify(error));
            loginParse();
          } else if (error && failCount < 3) {
            // 로긴을 계속 재시도
            failCount++;
            Ti.API.error('Login Fail / retry ' + i + ' : ' + JSON.stringify(error));
            setTimeout(loginParse, 100);
          } else {
            // fail
            Alloy.Globals.settings.set('User_sessionToken', undefined).save();
            Ti.API.error('Login Fail : ' + JSON.stringify(error));
            thisModel.trigger("login:fail");
          }
        }
        var withdrawChk = function(user) {
          Ti.API.debug("login successful, withdrawChk");
          if (user.get("isWithdraw") == true) {
            errorFn();
          } else {
            thisModel.reset(user);
            thisModel.trigger("login:init");
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
            thisModel.trigger("login:fail");
          }
        }
        // options.success && options.success();
        // options.error && options.error();
      },
      //기초데이터
      getInfo : function() {
        var id = this.get('id');
        var imageUrl = this.get('profileImage') ? this.get('profileImage').url() : "" ;
        var name = this.get('name') || "";

        return {
          id : id,
          name : name,
          imageUrl :imageUrl,
          comment : this.get('comment') || ''
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

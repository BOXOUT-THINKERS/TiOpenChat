// check app status
Alloy.Globals.appOnline = true;
Alloy.Globals.appStartProcess = true;

// Parse
require("tiparsejs_wrapper")({
  applicationId: Ti.App.Properties.getString('Parse_AppId'),
  javaScriptKey: Ti.App.Properties.getString('Parse_JsKey')
});

// modules
Alloy.Globals.currentLanguage = Titanium.Locale.getCurrentLanguage().toLowerCase().substr(0, 2) || "en";
Alloy.Globals.moment = require('momentExtend');
Alloy.Globals.moment.lang(Alloy.Globals.currentLanguage);

// loading widget
Alloy.Globals.loading = Alloy.createWidget("nl.fokkezb.loading");
Alloy.Globals.stopWaiting = function cancel() {
  Alloy.Globals.loading.hide();
};
Alloy.Globals.startWaiting = function load(msg) {
  var defaultLoadingMsg = L('c_waitingMsgDefault');
  var loadingMessage = L(msg) || defaultLoadingMsg;
  Alloy.Globals.loading.show(loadingMessage, false);
};

// toast widget
Alloy.Globals.toast = function(msg) {
    var defaultToastMsg = L('c_waitingMsgDefault');
  var toastMessage = L(msg) || defaultToastMsg;
  Alloy.createWidget('nl.fokkezb.toast', 'global', {
  }).show(toastMessage);   // same as toast.info
}
Alloy.Globals.error = function(msg) {
    var defaultToastMsg = L('c_waitingMsgDefault');
  var toastMessage = L(msg) || defaultToastMsg;
  Alloy.createWidget('nl.fokkezb.toast', 'global', {
  }).error(toastMessage);   // applies the 'error' theme
}

// for test code
// Alloy.createCollection('settings').cleanup();

// setting fetch
Alloy.Globals.settings = Alloy.Models.instance('settings');
Alloy.Globals.settings.fetch();

// default set
Ti.UI.backgroundColor = '#8B61FF';
Alloy.Globals.DATE_FORMAT = 'YYYY/MM/DD HH:mm:ss.SSS';

// image width
Alloy.Globals.ImageWidth = 1080;
// image quality
Alloy.Globals.ImageQuality = 0.8;
// thumbnail
Alloy.Globals.thumbWidth = 576;

// limit input
Alloy.Globals.inputLimit = {
  name : 10,
  comment : 30
};

// badge handle
if (OS_IOS) {
  Ti.App.addEventListener('changeBadge', function(e){
    Ti.UI.iPhone.setAppBadge(e.number);
  });
}

// Device check
(function(){
    var platformVersionInt = parseInt(Ti.Platform.version, 10);
    var platformHeight = Ti.Platform.displayCaps.platformHeight;
    Alloy.Globals.is = {
        iOS7 : (OS_IOS && platformVersionInt == 7),
        iOS8 : (OS_IOS && platformVersionInt >= 8),
        talliPhone : (OS_IOS && platformHeight == 568),
        iPhone6 : (OS_IOS && platformHeight == 667),
        iPhone6Plus : (OS_IOS && platformHeight == 736),
        shortPhone : (platformHeight < 568)
    };
})();

/** window manage Global method **/
(function(){
  var winStack = [];
  Alloy.Globals.openWindow = function(controller, args) {
    if(typeof controller === 'string') controller = Alloy.createController(controller);
    var win = controller.getView();
    Alloy.Globals.currentWindow = win;
    winStack.push(win);

    win.addEventListener('close',function(){
      Alloy.Globals.currentWindow = null;
      winStack = _.without(winStack, win);
      Ti.API.debug(arguments.callee);
      win.removeEventListener('close',arguments.callee);
    });
    Alloy.Globals.navigation.openWindow(win, args);
  };

  Alloy.Globals.closeAllWindow = function(){
    for(var i=winStack.length-1;i>=0;i--){
      winStack[i].close();
    }
  };
})();

Alloy.Globals.util = {
  zeroPad : function(n, width, z) {
    if ( typeof n == 'string') {
      n = parseInt(n);
    }
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  },
  notExist : function (o) {
    if(_.isUndefined(o) || _.isNull(o) || _.isNaN(o)) {
      return true;
    } else {
      return false;
    }
  },
  exist : function (o) {
    return !this.notExist(o);
  },
  getNumberOnly : function(val)  {
    val = new String(val);
    var regex = /[^0-9]/g;
    val = val.replace(regex, '');
    return val;
  }
};

// alerts
Alloy.Globals.alert = function(msg) {
  var Q = require('q');
  var deferred = Q.defer();

  var msg = _msg ? L(_msg, _msg) : L('c_alertMsgDefault');
  var title = _title ? L(_title, _title) : L('c_alertTitleDefault');
  var dialog = Ti.UI.createAlertDialog({
    message: msg,
    ok: L('c_alertMsgOk', "OK"),
    title: title
  });
  dialog.addEventListener('click', function(e){
    // Ti.API.info('e.index: ' + e.index);
    Alloy.Globals.stopWaiting();
    deferred.resolve(e.index);
  });
  dialog.show();

  return deferred.promise;
};

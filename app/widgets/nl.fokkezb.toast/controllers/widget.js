$.show = show;
$.hide = hide;

var parent;

(function constructor(args) {

  if (OS_ANDROID) {

    var properties = {
      message: args.message
    };

    if (args.duration) {

      // convert ms to constant
      if (args.duration !== Ti.UI.NOTIFICATION_DURATION_LONG && args.duration !== Ti.UI.NOTIFICATION_DURATION_LONG) {
        properties.duration = (args.duration > 2000) ? Ti.UI.NOTIFICATION_DURATION_LONG : Ti.UI.NOTIFICATION_DURATION_SHORT;
      } else {
        properties.duration = args.duration;
      }
    }

    $.notification.applyProperties(properties);

    $.notification.show();

  } else {

    var viewClasses = ['nlFokkezbToast_view'];
    var labelClasses = ['nlFokkezbToast_label'];

    if (args.theme) {
      viewClasses.push('nlFokkezbToast_view_' + args.theme);
      labelClasses.push('nlFokkezbToast_label_' + args.theme);
    }

    $.resetClass($.view, viewClasses);
    $.resetClass($.label, labelClasses, {
      text: args.message
    });

    parent = args.view || $.window;
    parent.add($.view);

    if (!args.view) {
      $.window.open();
    }

    show();

    // set a timeout to hide and close
    if (!args.persistent) {
      setTimeout(function() {

        hide();

      }, args.duration || 3000);
    }
  }

})(arguments[0] || {});

function show(e) {

  // enterAnimation defined in TSS
  $.view.animate(_.omit($.createStyle({
    classes: ['nlFokkezbToast_enterAnimation']
  }), 'classes'));

}

function hide(e) {

  // exitAnimation defined in TSS
  $.view.animate(_.omit($.createStyle({
    classes: ['nlFokkezbToast_exitAnimation']

  }), 'classes'), function(e) {

    if (parent === $.window) {
      $.window.close();
    }

    parent.remove($.view);

  });
}

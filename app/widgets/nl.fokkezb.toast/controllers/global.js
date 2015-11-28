var defaults = {};

(function constructor(args) {

  defaults = args;

})(arguments[0] || {});

exports.show = exports.info = function(message, opts) {

  Widget.createController('widget', _.extend(defaults, {
    message: message
  }, opts || {}));

};

exports.warning = function(message, opts) {

  exports.show(message, _.extend({
    theme: 'warning',
  }, opts || {}));
};

exports.error = function(message, opts) {

  exports.show(message, _.extend({
    theme: 'error',
    persistent: true
  }, opts || {}));
};
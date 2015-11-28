function WPATH(s) {
    var index = s.lastIndexOf("/");
    var path = -1 === index ? "kr.yostudio.drawer/" + s : s.substring(0, index) + "/kr.yostudio.drawer/" + s.substring(index + 1);
    return path;
}

function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function LeftDrawer(args) {
        args = args || {};
        this._view = {};
        this._view.scrollView = Ti.UI.createScrollableView({
            clipViews: false,
            disableBounce: true
        });
        var self = this;
        this._view.hiddenButton = Ti.UI.createView({
            width: Ti.UI.FILL,
            height: Ti.UI.FILL,
            backgroundColor: "transparent"
        });
        this._view.hiddenButton.addEventListener("click", function() {
            self.toggleLeftWindow();
        });
        this._view.hiddenButton.addEventListener("swipe", function(e) {
            "left" == e.direction && self.toggleLeftWindow();
        });
        var onChangePage = function(e) {
            if (0 == e.currentPage) {
                self._view.scrollView.left = 0;
                self._view.contentView.left = -1 * SIZE.leftViewWidth;
                self._view.scrollView.parent.add(self._view.hiddenButton);
                self.trigger("draweropen", e);
            } else {
                self._view.scrollView.left = -1 * SIZE.leftViewWidth;
                self._view.contentView.left = 0;
                self._view.scrollView.parent.remove(self._view.hiddenButton);
                self.trigger("drawerclose", e);
            }
        };
        this._view.scrollView.addEventListener("scroll", function(e) {
            self._view.bgView.opacity = (1 - e.currentPageAsFloat) * (args.maxOpacity ? args.maxOpacity : .7);
            (0 == e.currentPageAsFloat || 1 == e.currentPageAsFloat) && onChangePage({
                currentPage: e.currentPageAsFloat
            });
        });
        this._view.blankView = Ti.UI.createView({
            backgroundColor: "transparent",
            touchEnabled: false
        });
        this._view.contentView = Ti.UI.createView({
            clipMode: Titanium.UI.iOS.CLIP_MODE_DISABLED,
            backgroundColor: "transparent",
            left: 0
        });
        this._view.bgView = Ti.UI.createView({
            backgroundColor: "black",
            opacity: 0,
            left: 0
        });
        this._view.bgView.addEventListener("click", function() {
            self.toggleLeftWindow();
        });
        this._view.contentView.add(this._view.bgView);
        Object.defineProperty(this, "isLeftDrawerOpen", {
            get: function() {
                return 0 == this._view.scrollView.currentPage;
            }
        });
        Object.defineProperty(this, "touchEnabled", {
            get: function() {
                return this._view.scrollView.touchEnabled;
            },
            set: function(val) {
                this._view.scrollView.hitRect = val ? SIZE.defaultHitRect : {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                };
            }
        });
    }
    new (require("alloy/widget"))("kr.yostudio.drawer");
    this.__widgetId = "kr.yostudio.drawer";
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "widget";
    this.args = arguments[0] || {};
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    $.__views.widget = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#000",
        font: {
            fontSize: 50,
            fontWeight: "bold"
        },
        textAlign: "center",
        text: "I'm the default widget",
        id: "widget"
    });
    $.__views.widget && $.addTopLevelView($.__views.widget);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    var SIZE = {
        leftViewWidth: 263,
        leftHiddenWidth: 10,
        platformHeight: Ti.Platform.displayCaps.platformHeight,
        platformWidth: Ti.Platform.displayCaps.platformWidth
    };
    var DrawerLayout = function(args) {
        this.topWindow = Ti.UI.iOS.createNavigationWindow();
        this.drawer = new LeftDrawer(args);
        this.topWindow.add(this.drawer.getView());
    };
    DrawerLayout.prototype.add = function(view) {
        "leftView" == view.role && this.drawer.setLeftView(view);
        if ("centerWindow" == view.role) {
            this.topWindow.window = view;
            var self = this;
            view.addEventListener("focus", function() {
                self.drawer.touchEnabled = true;
            });
            view.addEventListener("blur", function() {
                self.drawer.touchEnabled = false;
            });
        }
    };
    DrawerLayout.prototype.setCenterView = function(view) {
        this.topWindow.window.removeAllChildren();
        this.topWindow.window.add(view);
        this.topWindow.window.title = view.title;
    };
    DrawerLayout.prototype.addEventListener = function() {
        var windowEvents = [ "open", "close", "focus" ];
        return function(eventName, callback) {
            _.contains(windowEvents, eventName) ? this.topWindow.addEventListener(eventName, callback) : this.drawer.addEventListener(eventName, callback);
        };
    }();
    DrawerLayout.prototype.open = function(args) {
        args = args || {};
        this.topWindow.open(args);
    };
    DrawerLayout.prototype.openWindow = function(window, options) {
        this.topWindow.openWindow(window, options);
        return;
    };
    DrawerLayout.prototype.closeWindow = function(window, options) {
        options = options || {};
        return window.close(options);
    };
    DrawerLayout.prototype.toggleLeftView = function(args) {
        this.drawer.toggleLeftWindow(args);
    };
    _.extend(LeftDrawer.prototype, Backbone.Events, {
        addEventListener: function() {
            this.on(arguments[0], arguments[1]);
        },
        toggleLeftWindow: function(args) {
            args = args || {};
            _.isUndefined(args.animated) || false !== args.animated ? this._view.scrollView.scrollToView(this._view.scrollView.views[this._view.scrollView.currentPage ? 0 : 1]) : this._view.scrollView.currentPage = this._view.scrollView.currentPage ? 0 : 1;
        },
        getView: function() {
            return this._view.scrollView;
        },
        setLeftView: function() {
            return function(view) {
                if (view.top) {
                    this._view.scrollView.top = view.top;
                    view.top = null;
                }
                SIZE.leftViewWidth = view.width || SIZE.leftViewWidth;
                SIZE.defaultHitRect = {
                    height: SIZE.platformHeight,
                    width: SIZE.leftViewWidth + SIZE.leftHiddenWidth,
                    x: 0,
                    y: 0
                };
                SIZE.expendHitRect = {
                    height: SIZE.platformHeight,
                    width: SIZE.leftViewWidth + SIZE.platformWidth,
                    x: 0,
                    y: 0
                };
                this._view.hiddenButton.applyProperties({
                    width: SIZE.platformWidth - SIZE.leftViewWidth,
                    left: SIZE.leftViewWidth
                });
                this._view.scrollView.applyProperties({
                    width: SIZE.leftViewWidth,
                    left: -1 * SIZE.leftViewWidth
                });
                view.applyProperties({
                    width: SIZE.leftViewWidth,
                    left: SIZE.leftViewWidth,
                    right: null
                });
                this._view.contentView.width = 2 * SIZE.leftViewWidth;
                this._view.contentView.add(view);
                this._view.bgView.width = 2 * SIZE.leftViewWidth + SIZE.platformWidth + SIZE.leftHiddenWidth;
                this._view.scrollView.views = [ this._view.contentView, this._view.blankView ];
                this._view.scrollView.currentPage = 1;
                this._view.scrollView.hitRect = SIZE.defaultHitRect;
            };
        }()
    });
    var drawerLayout = new DrawerLayout();
    args.children && drawerLayout.add(args.children);
    args.children && _.each(args.children, function(child) {
        drawerLayout.add(child);
    });
    _.extend(this, drawerLayout);
    $.on = drawerLayout.addEventListener;
    Object.defineProperty($, "isLeftDrawerOpen", {
        get: function() {
            return drawerLayout.drawer.isLeftDrawerOpen;
        }
    });
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
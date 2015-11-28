function WPATH(s) {
    var index = s.lastIndexOf("/");
    var path = -1 === index ? "danielhanold.pickerWidget/" + s : s.substring(0, index) + "/danielhanold.pickerWidget/" + s.substring(index + 1);
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
    function populateOptionsDialog() {
        var selectedIndex = void 0;
        pickerValueArray = _.pairs(args.pickerValues[0]);
        _.each(pickerValueArray, function(pair) {
            pickerData.push(pair[1]);
        });
        _.isArray(args.selectedValues) && !_.isEmpty(args.selectedValues) && (selectedIndex = getKeyIndexFromPairs(pickerValueArray, args.selectedValues[0]));
        optionsDialog = Ti.UI.createOptionDialog({
            options: pickerData,
            buttonNames: [ "Cancel" ],
            selectedIndex: selectedIndex
        });
        optionsDialog.show();
        optionsDialog.addEventListener("click", done);
    }
    function populatePicker() {
        switch (args.type) {
          case "single-column":
            pickerValueArray = _.pairs(args.pickerValues[0]);
            _.each(pickerValueArray, function(pair) {
                var pickerRow = Ti.UI.createPickerRow({
                    title: pair[1]
                });
                pickerData.push(pickerRow);
            });
            picker.add(pickerData);
            if (_.isArray(args.selectedValues) && !_.isEmpty(args.selectedValues)) {
                var rowIndex = getKeyIndexFromPairs(pickerValueArray, args.selectedValues[0]);
                picker.setSelectedRow(0, rowIndex, false);
            }
            break;

          case "age-range":
            args.pickerParams = args.pickerParams || {};
            args.pickerParams.min = args.pickerParams.min || 18;
            args.pickerParams.max = args.pickerParams.max || 100;
            var minAge = args.pickerParams.min;
            var maxAge = args.pickerParams.max;
            var columnParams = {
                width: void 0
            };
            var pickerColumns = [ Ti.UI.createPickerColumn(columnParams), Ti.UI.createPickerColumn(columnParams) ];
            var agesArray = _.range(minAge, maxAge + 1, 1);
            _.each(pickerColumns, function(column, index) {
                _.each(agesArray, function(age) {
                    pickerColumns[index].addRow(Ti.UI.createPickerRow({
                        title: String(age)
                    }));
                });
            });
            picker.setColumns(pickerColumns);
            _.each(pickerColumns, function(column) {
                picker.reloadColumn(column);
            });
            _.isArray(args.selectedValues) && !_.isEmpty(args.selectedValues) && _.each(args.selectedValues, function(value, columnIndex) {
                var rowIndex = _.indexOf(agesArray, Number(value));
                picker.setSelectedRow(columnIndex, rowIndex, false);
            });
            break;

          case "time-picker":
            args.pickerParams = args.pickerParams || [];
            var columnParams = {
                width: void 0
            };
            var pickerColumns = [ Ti.UI.createPickerColumn(columnParams), Ti.UI.createPickerColumn(columnParams) ];
            var ranges = [];
            _.each(args.pickerParams, function(param) {
                ranges.push(_.range(param.min, param.max + 1, param.diff || 1));
            });
            var aRange;
            _.each(pickerColumns, function(column, index) {
                aRange = ranges[index];
                _.each(aRange, function(num) {
                    pickerColumns[index].addRow(Ti.UI.createPickerRow({
                        title: String(num)
                    }));
                });
            });
            picker.setColumns(pickerColumns);
            _.each(pickerColumns, function(column) {
                picker.reloadColumn(column);
            });
            _.isArray(args.selectedValues) && !_.isEmpty(args.selectedValues) && _.each(args.selectedValues, function(value, columnIndex) {
                var rowIndex = _.indexOf(ranges[columnIndex], Number(value));
                picker.setSelectedRow(columnIndex, rowIndex, false);
            });
            break;

          case "date-picker":        }
    }
    function getSelectedRowTitle(index) {
        index = index || 0;
        return picker.getSelectedRow(index).title;
    }
    function getKeyIndexFromPairs(pairs, key) {
        pairs = pairs || [];
        key = key || null;
        var rowIndex = null;
        _.each(pairs, function(pair, index) {
            if (key == pair[0]) {
                rowIndex = index;
                return;
            }
        });
        return rowIndex;
    }
    function getKeyFromPairs(pairs, title) {
        pairs = pairs || [];
        title = title || null;
        var key = null;
        _.each(pairs, function(pair) {
            if (title == pair[1]) {
                key = pair[0];
                return;
            }
        });
        return key;
    }
    function done(e) {
        var data = null;
        var cancel = false;
        switch (args.type) {
          case "single-column":
            if (androidSpecific) {
                e = e || {};
                e.source = e.source || {};
                e.source.options = e.source.options || [];
                if (true === e.button) cancel = true; else var data = [ {
                    key: getKeyFromPairs(pickerValueArray, e.source.options[e.index]),
                    value: e.source.options[e.index]
                } ];
            } else {
                var value = getSelectedRowTitle(0);
                var key = getKeyFromPairs(pickerValueArray, value);
                var data = [ {
                    key: key,
                    value: value
                } ];
            }
            break;

          case "age-range":
            var numberLow = Number(picker.getSelectedRow(0).title);
            var numberHigh = Number(picker.getSelectedRow(1).title);
            if (numberLow >= numberHigh) {
                Ti.UI.createAlertDialog({
                    title: "Error",
                    message: "Please pick a valid age range",
                    buttonNames: [ "Ok" ]
                }).show();
                return;
            }
            if (_.isNumber(args.pickerParams.minDifference) && numberHigh - numberLow < Number(args.pickerParams.minDifference)) {
                Ti.UI.createAlertDialog({
                    title: "Error",
                    message: "Ages must be " + String(args.pickerParams.minDifference) + " years apart.",
                    buttonNames: [ "Ok" ]
                }).show();
                return;
            }
            data = {
                low: numberLow,
                high: numberHigh
            };
            break;

          case "time-picker":
            var numberHour = Number(picker.getSelectedRow(0).title);
            var numberMinute = Number(picker.getSelectedRow(1).title);
            data = {
                low: numberHour,
                high: numberMinute
            };
            break;

          case "date-picker":
            var selectedDate = picker.getValue();
            if (_.isDate(args.pickerParams.maxSelectedDate) && selectedDate > args.pickerParams.maxSelectedDate) {
                if (_.isString(args.pickerParams.maxSelectedDateErrorMessage)) var message = args.pickerParams.maxSelectedDateErrorMessage; else var message = "The date you selected is not valid";
                Ti.UI.createAlertDialog({
                    title: "Error",
                    message: message,
                    buttonNames: [ "Ok" ]
                }).show();
                return;
            }
            var age = Math.floor((Date.now() - selectedDate) / 315576e5);
            var unixMilliseconds = Math.round(selectedDate.getTime());
            var unixSeconds = Math.round(selectedDate.getTime() / 1e3);
            data = {
                date: selectedDate,
                age: age,
                unixMilliseconds: unixMilliseconds,
                unixSeconds: unixSeconds
            };
        }
        close({
            type: args.type,
            data: data,
            cancel: cancel
        });
    }
    function close(_callbackParams) {
        _callbackParams = _callbackParams || {};
        _callbackParams.type = args.type;
        _callbackParams.id = args.id || null;
        _callbackParams.data = _callbackParams.data || null;
        _callbackParams.cancel = _callbackParams.cancel || false;
        true && true === args.hideNavBar && outerView.showNavBar();
        _.isFunction(args.onDone) && args.onDone(_callbackParams);
        if (false === androidSpecific) {
            outerView.remove(overlay);
            outerView.remove(pickerView);
        }
        overlay = null;
        pickerView = null;
        picker = null;
        optionsDialog = null;
    }
    var Widget = new (require("alloy/widget"))("danielhanold.pickerWidget");
    this.__widgetId = "danielhanold.pickerWidget";
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
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    var outerView = args.outerView;
    var pickerData = [];
    var pickerValueArray = [];
    _.pairs(args.pickerValues[0]).length;
    var androidSpecific = false;
    var pickerView;
    var picker;
    var optionsDialog;
    true && true === args.hideNavBar && outerView.hideNavBar();
    if (androidSpecific) switch (args.type) {
      case "single-column":
        populateOptionsDialog();
    } else {
        var overlay = Widget.createController("overlay").getView();
        var pickerController = Widget.createController("pickerView", {
            type: args.type,
            pickerParams: args.pickerParams,
            parentFunctions: {
                close: close,
                done: done
            }
        });
        pickerView = pickerController.getView("pickerView");
        picker = pickerController.getView("picker");
        outerView.add(overlay);
        outerView.add(pickerView);
        populatePicker();
    }
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
!function(root) {
    root.Parse = root.Parse || {};
    root.Parse.VERSION = "js1.4.2";
}(this);

(function() {
    var root = this;
    var previousUnderscore = root._;
    var breaker = {};
    var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
    var push = ArrayProto.push, slice = ArrayProto.slice, concat = ArrayProto.concat, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty;
    var nativeForEach = ArrayProto.forEach, nativeMap = ArrayProto.map, nativeReduce = ArrayProto.reduce, nativeReduceRight = ArrayProto.reduceRight, nativeFilter = ArrayProto.filter, nativeEvery = ArrayProto.every, nativeSome = ArrayProto.some, nativeIndexOf = ArrayProto.indexOf, nativeLastIndexOf = ArrayProto.lastIndexOf, nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind;
    var _ = function(obj) {
        if (obj instanceof _) return obj;
        if (!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
    };
    if ("undefined" != typeof exports) {
        "undefined" != typeof module && module.exports && (exports = module.exports = _);
        exports._ = _;
    } else root._ = _;
    _.VERSION = "1.4.4";
    var each = _.each = _.forEach = function(obj, iterator, context) {
        if (null == obj) return;
        if (nativeForEach && obj.forEach === nativeForEach) obj.forEach(iterator, context); else if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; l > i; i++) if (iterator.call(context, obj[i], i, obj) === breaker) return;
        } else for (var key in obj) if (_.has(obj, key) && iterator.call(context, obj[key], key, obj) === breaker) return;
    };
    _.map = _.collect = function(obj, iterator, context) {
        var results = [];
        if (null == obj) return results;
        if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
        each(obj, function(value, index, list) {
            results[results.length] = iterator.call(context, value, index, list);
        });
        return results;
    };
    var reduceError = "Reduce of empty array with no initial value";
    _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        null == obj && (obj = []);
        if (nativeReduce && obj.reduce === nativeReduce) {
            context && (iterator = _.bind(iterator, context));
            return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
        }
        each(obj, function(value, index, list) {
            if (initial) memo = iterator.call(context, memo, value, index, list); else {
                memo = value;
                initial = true;
            }
        });
        if (!initial) throw new TypeError(reduceError);
        return memo;
    };
    _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        null == obj && (obj = []);
        if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
            context && (iterator = _.bind(iterator, context));
            return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
        }
        var length = obj.length;
        if (length !== +length) {
            var keys = _.keys(obj);
            length = keys.length;
        }
        each(obj, function(value, index, list) {
            index = keys ? keys[--length] : --length;
            if (initial) memo = iterator.call(context, memo, obj[index], index, list); else {
                memo = obj[index];
                initial = true;
            }
        });
        if (!initial) throw new TypeError(reduceError);
        return memo;
    };
    _.find = _.detect = function(obj, iterator, context) {
        var result;
        any(obj, function(value, index, list) {
            if (iterator.call(context, value, index, list)) {
                result = value;
                return true;
            }
        });
        return result;
    };
    _.filter = _.select = function(obj, iterator, context) {
        var results = [];
        if (null == obj) return results;
        if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
        each(obj, function(value, index, list) {
            iterator.call(context, value, index, list) && (results[results.length] = value);
        });
        return results;
    };
    _.reject = function(obj, iterator, context) {
        return _.filter(obj, function(value, index, list) {
            return !iterator.call(context, value, index, list);
        }, context);
    };
    _.every = _.all = function(obj, iterator, context) {
        iterator || (iterator = _.identity);
        var result = true;
        if (null == obj) return result;
        if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
        each(obj, function(value, index, list) {
            if (!(result = result && iterator.call(context, value, index, list))) return breaker;
        });
        return !!result;
    };
    var any = _.some = _.any = function(obj, iterator, context) {
        iterator || (iterator = _.identity);
        var result = false;
        if (null == obj) return result;
        if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
        each(obj, function(value, index, list) {
            if (result || (result = iterator.call(context, value, index, list))) return breaker;
        });
        return !!result;
    };
    _.contains = _.include = function(obj, target) {
        if (null == obj) return false;
        if (nativeIndexOf && obj.indexOf === nativeIndexOf) return -1 != obj.indexOf(target);
        return any(obj, function(value) {
            return value === target;
        });
    };
    _.invoke = function(obj, method) {
        var args = slice.call(arguments, 2);
        var isFunc = _.isFunction(method);
        return _.map(obj, function(value) {
            return (isFunc ? method : value[method]).apply(value, args);
        });
    };
    _.pluck = function(obj, key) {
        return _.map(obj, function(value) {
            return value[key];
        });
    };
    _.where = function(obj, attrs, first) {
        if (_.isEmpty(attrs)) return first ? null : [];
        return _[first ? "find" : "filter"](obj, function(value) {
            for (var key in attrs) if (attrs[key] !== value[key]) return false;
            return true;
        });
    };
    _.findWhere = function(obj, attrs) {
        return _.where(obj, attrs, true);
    };
    _.max = function(obj, iterator, context) {
        if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) return Math.max.apply(Math, obj);
        if (!iterator && _.isEmpty(obj)) return -1/0;
        var result = {
            computed: -1/0,
            value: -1/0
        };
        each(obj, function(value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed >= result.computed && (result = {
                value: value,
                computed: computed
            });
        });
        return result.value;
    };
    _.min = function(obj, iterator, context) {
        if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) return Math.min.apply(Math, obj);
        if (!iterator && _.isEmpty(obj)) return 1/0;
        var result = {
            computed: 1/0,
            value: 1/0
        };
        each(obj, function(value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed < result.computed && (result = {
                value: value,
                computed: computed
            });
        });
        return result.value;
    };
    _.shuffle = function(obj) {
        var rand;
        var index = 0;
        var shuffled = [];
        each(obj, function(value) {
            rand = _.random(index++);
            shuffled[index - 1] = shuffled[rand];
            shuffled[rand] = value;
        });
        return shuffled;
    };
    var lookupIterator = function(value) {
        return _.isFunction(value) ? value : function(obj) {
            return obj[value];
        };
    };
    _.sortBy = function(obj, value, context) {
        var iterator = lookupIterator(value);
        return _.pluck(_.map(obj, function(value, index, list) {
            return {
                value: value,
                index: index,
                criteria: iterator.call(context, value, index, list)
            };
        }).sort(function(left, right) {
            var a = left.criteria;
            var b = right.criteria;
            if (a !== b) {
                if (a > b || void 0 === a) return 1;
                if (b > a || void 0 === b) return -1;
            }
            return left.index < right.index ? -1 : 1;
        }), "value");
    };
    var group = function(obj, value, context, behavior) {
        var result = {};
        var iterator = lookupIterator(value || _.identity);
        each(obj, function(value, index) {
            var key = iterator.call(context, value, index, obj);
            behavior(result, key, value);
        });
        return result;
    };
    _.groupBy = function(obj, value, context) {
        return group(obj, value, context, function(result, key, value) {
            (_.has(result, key) ? result[key] : result[key] = []).push(value);
        });
    };
    _.countBy = function(obj, value, context) {
        return group(obj, value, context, function(result, key) {
            _.has(result, key) || (result[key] = 0);
            result[key]++;
        });
    };
    _.sortedIndex = function(array, obj, iterator, context) {
        iterator = null == iterator ? _.identity : lookupIterator(iterator);
        var value = iterator.call(context, obj);
        var low = 0, high = array.length;
        while (high > low) {
            var mid = low + high >>> 1;
            iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
        }
        return low;
    };
    _.toArray = function(obj) {
        if (!obj) return [];
        if (_.isArray(obj)) return slice.call(obj);
        if (obj.length === +obj.length) return _.map(obj, _.identity);
        return _.values(obj);
    };
    _.size = function(obj) {
        if (null == obj) return 0;
        return obj.length === +obj.length ? obj.length : _.keys(obj).length;
    };
    _.first = _.head = _.take = function(array, n, guard) {
        if (null == array) return void 0;
        return null == n || guard ? array[0] : slice.call(array, 0, n);
    };
    _.initial = function(array, n, guard) {
        return slice.call(array, 0, array.length - (null == n || guard ? 1 : n));
    };
    _.last = function(array, n, guard) {
        if (null == array) return void 0;
        return null == n || guard ? array[array.length - 1] : slice.call(array, Math.max(array.length - n, 0));
    };
    _.rest = _.tail = _.drop = function(array, n, guard) {
        return slice.call(array, null == n || guard ? 1 : n);
    };
    _.compact = function(array) {
        return _.filter(array, _.identity);
    };
    var flatten = function(input, shallow, output) {
        each(input, function(value) {
            _.isArray(value) ? shallow ? push.apply(output, value) : flatten(value, shallow, output) : output.push(value);
        });
        return output;
    };
    _.flatten = function(array, shallow) {
        return flatten(array, shallow, []);
    };
    _.without = function(array) {
        return _.difference(array, slice.call(arguments, 1));
    };
    _.uniq = _.unique = function(array, isSorted, iterator, context) {
        if (_.isFunction(isSorted)) {
            context = iterator;
            iterator = isSorted;
            isSorted = false;
        }
        var initial = iterator ? _.map(array, iterator, context) : array;
        var results = [];
        var seen = [];
        each(initial, function(value, index) {
            if (isSorted ? !index || seen[seen.length - 1] !== value : !_.contains(seen, value)) {
                seen.push(value);
                results.push(array[index]);
            }
        });
        return results;
    };
    _.union = function() {
        return _.uniq(concat.apply(ArrayProto, arguments));
    };
    _.intersection = function(array) {
        var rest = slice.call(arguments, 1);
        return _.filter(_.uniq(array), function(item) {
            return _.every(rest, function(other) {
                return _.indexOf(other, item) >= 0;
            });
        });
    };
    _.difference = function(array) {
        var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
        return _.filter(array, function(value) {
            return !_.contains(rest, value);
        });
    };
    _.zip = function() {
        var args = slice.call(arguments);
        var length = _.max(_.pluck(args, "length"));
        var results = new Array(length);
        for (var i = 0; length > i; i++) results[i] = _.pluck(args, "" + i);
        return results;
    };
    _.object = function(list, values) {
        if (null == list) return {};
        var result = {};
        for (var i = 0, l = list.length; l > i; i++) values ? result[list[i]] = values[i] : result[list[i][0]] = list[i][1];
        return result;
    };
    _.indexOf = function(array, item, isSorted) {
        if (null == array) return -1;
        var i = 0, l = array.length;
        if (isSorted) {
            if ("number" != typeof isSorted) {
                i = _.sortedIndex(array, item);
                return array[i] === item ? i : -1;
            }
            i = 0 > isSorted ? Math.max(0, l + isSorted) : isSorted;
        }
        if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
        for (;l > i; i++) if (array[i] === item) return i;
        return -1;
    };
    _.lastIndexOf = function(array, item, from) {
        if (null == array) return -1;
        var hasIndex = null != from;
        if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
        var i = hasIndex ? from : array.length;
        while (i--) if (array[i] === item) return i;
        return -1;
    };
    _.range = function(start, stop, step) {
        if (arguments.length <= 1) {
            stop = start || 0;
            start = 0;
        }
        step = arguments[2] || 1;
        var len = Math.max(Math.ceil((stop - start) / step), 0);
        var idx = 0;
        var range = new Array(len);
        while (len > idx) {
            range[idx++] = start;
            start += step;
        }
        return range;
    };
    _.bind = function(func, context) {
        if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
        var args = slice.call(arguments, 2);
        return function() {
            return func.apply(context, args.concat(slice.call(arguments)));
        };
    };
    _.partial = function(func) {
        var args = slice.call(arguments, 1);
        return function() {
            return func.apply(this, args.concat(slice.call(arguments)));
        };
    };
    _.bindAll = function(obj) {
        var funcs = slice.call(arguments, 1);
        0 === funcs.length && (funcs = _.functions(obj));
        each(funcs, function(f) {
            obj[f] = _.bind(obj[f], obj);
        });
        return obj;
    };
    _.memoize = function(func, hasher) {
        var memo = {};
        hasher || (hasher = _.identity);
        return function() {
            var key = hasher.apply(this, arguments);
            return _.has(memo, key) ? memo[key] : memo[key] = func.apply(this, arguments);
        };
    };
    _.delay = function(func, wait) {
        var args = slice.call(arguments, 2);
        return setTimeout(function() {
            return func.apply(null, args);
        }, wait);
    };
    _.defer = function(func) {
        return _.delay.apply(_, [ func, 1 ].concat(slice.call(arguments, 1)));
    };
    _.throttle = function(func, wait) {
        var context, args, timeout, result;
        var previous = 0;
        var later = function() {
            previous = new Date();
            timeout = null;
            result = func.apply(context, args);
        };
        return function() {
            var now = new Date();
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (0 >= remaining) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
            } else timeout || (timeout = setTimeout(later, remaining));
            return result;
        };
    };
    _.debounce = function(func, wait, immediate) {
        var timeout, result;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                immediate || (result = func.apply(context, args));
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            callNow && (result = func.apply(context, args));
            return result;
        };
    };
    _.once = function(func) {
        var memo, ran = false;
        return function() {
            if (ran) return memo;
            ran = true;
            memo = func.apply(this, arguments);
            func = null;
            return memo;
        };
    };
    _.wrap = function(func, wrapper) {
        return function() {
            var args = [ func ];
            push.apply(args, arguments);
            return wrapper.apply(this, args);
        };
    };
    _.compose = function() {
        var funcs = arguments;
        return function() {
            var args = arguments;
            for (var i = funcs.length - 1; i >= 0; i--) args = [ funcs[i].apply(this, args) ];
            return args[0];
        };
    };
    _.after = function(times, func) {
        if (0 >= times) return func();
        return function() {
            if (--times < 1) return func.apply(this, arguments);
        };
    };
    _.keys = nativeKeys || function(obj) {
        if (obj !== Object(obj)) throw new TypeError("Invalid object");
        var keys = [];
        for (var key in obj) _.has(obj, key) && (keys[keys.length] = key);
        return keys;
    };
    _.values = function(obj) {
        var values = [];
        for (var key in obj) _.has(obj, key) && values.push(obj[key]);
        return values;
    };
    _.pairs = function(obj) {
        var pairs = [];
        for (var key in obj) _.has(obj, key) && pairs.push([ key, obj[key] ]);
        return pairs;
    };
    _.invert = function(obj) {
        var result = {};
        for (var key in obj) _.has(obj, key) && (result[obj[key]] = key);
        return result;
    };
    _.functions = _.methods = function(obj) {
        var names = [];
        for (var key in obj) _.isFunction(obj[key]) && names.push(key);
        return names.sort();
    };
    _.extend = function(obj) {
        each(slice.call(arguments, 1), function(source) {
            if (source) for (var prop in source) obj[prop] = source[prop];
        });
        return obj;
    };
    _.pick = function(obj) {
        var copy = {};
        var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
        each(keys, function(key) {
            key in obj && (copy[key] = obj[key]);
        });
        return copy;
    };
    _.omit = function(obj) {
        var copy = {};
        var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
        for (var key in obj) _.contains(keys, key) || (copy[key] = obj[key]);
        return copy;
    };
    _.defaults = function(obj) {
        each(slice.call(arguments, 1), function(source) {
            if (source) for (var prop in source) null == obj[prop] && (obj[prop] = source[prop]);
        });
        return obj;
    };
    _.clone = function(obj) {
        if (!_.isObject(obj)) return obj;
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
    };
    _.tap = function(obj, interceptor) {
        interceptor(obj);
        return obj;
    };
    var eq = function(a, b, aStack, bStack) {
        if (a === b) return 0 !== a || 1 / a == 1 / b;
        if (null == a || null == b) return a === b;
        a instanceof _ && (a = a._wrapped);
        b instanceof _ && (b = b._wrapped);
        var className = toString.call(a);
        if (className != toString.call(b)) return false;
        switch (className) {
          case "[object String]":
            return a == String(b);

          case "[object Number]":
            return a != +a ? b != +b : 0 == a ? 1 / a == 1 / b : a == +b;

          case "[object Date]":
          case "[object Boolean]":
            return +a == +b;

          case "[object RegExp]":
            return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
        }
        if ("object" != typeof a || "object" != typeof b) return false;
        var length = aStack.length;
        while (length--) if (aStack[length] == a) return bStack[length] == b;
        aStack.push(a);
        bStack.push(b);
        var size = 0, result = true;
        if ("[object Array]" == className) {
            size = a.length;
            result = size == b.length;
            if (result) while (size--) if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        } else {
            var aCtor = a.constructor, bCtor = b.constructor;
            if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor)) return false;
            for (var key in a) if (_.has(a, key)) {
                size++;
                if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
            }
            if (result) {
                for (key in b) if (_.has(b, key) && !size--) break;
                result = !size;
            }
        }
        aStack.pop();
        bStack.pop();
        return result;
    };
    _.isEqual = function(a, b) {
        return eq(a, b, [], []);
    };
    _.isEmpty = function(obj) {
        if (null == obj) return true;
        if (_.isArray(obj) || _.isString(obj)) return 0 === obj.length;
        for (var key in obj) if (_.has(obj, key)) return false;
        return true;
    };
    _.isElement = function(obj) {
        return !!(obj && 1 === obj.nodeType);
    };
    _.isArray = nativeIsArray || function(obj) {
        return "[object Array]" == toString.call(obj);
    };
    _.isObject = function(obj) {
        return obj === Object(obj);
    };
    each([ "Arguments", "Function", "String", "Number", "Date", "RegExp" ], function(name) {
        _["is" + name] = function(obj) {
            return toString.call(obj) == "[object " + name + "]";
        };
    });
    _.isArguments(arguments) || (_.isArguments = function(obj) {
        return !!(obj && _.has(obj, "callee"));
    });
    "function" != typeof /./ && (_.isFunction = function(obj) {
        return "function" == typeof obj;
    });
    _.isFinite = function(obj) {
        return isFinite(obj) && !isNaN(parseFloat(obj));
    };
    _.isNaN = function(obj) {
        return _.isNumber(obj) && obj != +obj;
    };
    _.isBoolean = function(obj) {
        return true === obj || false === obj || "[object Boolean]" == toString.call(obj);
    };
    _.isNull = function(obj) {
        return null === obj;
    };
    _.isUndefined = function(obj) {
        return void 0 === obj;
    };
    _.has = function(obj, key) {
        return hasOwnProperty.call(obj, key);
    };
    _.noConflict = function() {
        root._ = previousUnderscore;
        return this;
    };
    _.identity = function(value) {
        return value;
    };
    _.times = function(n, iterator, context) {
        var accum = Array(n);
        for (var i = 0; n > i; i++) accum[i] = iterator.call(context, i);
        return accum;
    };
    _.random = function(min, max) {
        if (null == max) {
            max = min;
            min = 0;
        }
        return min + Math.floor(Math.random() * (max - min + 1));
    };
    var entityMap = {
        escape: {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;",
            "/": "&#x2F;"
        }
    };
    entityMap.unescape = _.invert(entityMap.escape);
    var entityRegexes = {
        escape: new RegExp("[" + _.keys(entityMap.escape).join("") + "]", "g"),
        unescape: new RegExp("(" + _.keys(entityMap.unescape).join("|") + ")", "g")
    };
    _.each([ "escape", "unescape" ], function(method) {
        _[method] = function(string) {
            if (null == string) return "";
            return ("" + string).replace(entityRegexes[method], function(match) {
                return entityMap[method][match];
            });
        };
    });
    _.result = function(object, property) {
        if (null == object) return null;
        var value = object[property];
        return _.isFunction(value) ? value.call(object) : value;
    };
    _.mixin = function(obj) {
        each(_.functions(obj), function(name) {
            var func = _[name] = obj[name];
            _.prototype[name] = function() {
                var args = [ this._wrapped ];
                push.apply(args, arguments);
                return result.call(this, func.apply(_, args));
            };
        });
    };
    var idCounter = 0;
    _.uniqueId = function(prefix) {
        var id = ++idCounter + "";
        return prefix ? prefix + id : id;
    };
    _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };
    var noMatch = /(.)^/;
    var escapes = {
        "'": "'",
        "\\": "\\",
        "\r": "r",
        "\n": "n",
        "	": "t",
        "\u2028": "u2028",
        "\u2029": "u2029"
    };
    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
    _.template = function(text, data, settings) {
        var render;
        settings = _.defaults({}, settings, _.templateSettings);
        var matcher = new RegExp([ (settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source ].join("|") + "|$", "g");
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset).replace(escaper, function(match) {
                return "\\" + escapes[match];
            });
            escape && (source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'");
            interpolate && (source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'");
            evaluate && (source += "';\n" + evaluate + "\n__p+='");
            index = offset + match.length;
            return match;
        });
        source += "';\n";
        settings.variable || (source = "with(obj||{}){\n" + source + "}\n");
        source = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";
        try {
            render = new Function(settings.variable || "obj", "_", source);
        } catch (e) {
            e.source = source;
            throw e;
        }
        if (data) return render(data, _);
        var template = function(data) {
            return render.call(this, data, _);
        };
        template.source = "function(" + (settings.variable || "obj") + "){\n" + source + "}";
        return template;
    };
    _.chain = function(obj) {
        return _(obj).chain();
    };
    var result = function(obj) {
        return this._chain ? _(obj).chain() : obj;
    };
    _.mixin(_);
    each([ "pop", "push", "reverse", "shift", "sort", "splice", "unshift" ], function(name) {
        var method = ArrayProto[name];
        _.prototype[name] = function() {
            var obj = this._wrapped;
            method.apply(obj, arguments);
            "shift" != name && "splice" != name || 0 !== obj.length || delete obj[0];
            return result.call(this, obj);
        };
    });
    each([ "concat", "join", "slice" ], function(name) {
        var method = ArrayProto[name];
        _.prototype[name] = function() {
            return result.call(this, method.apply(this._wrapped, arguments));
        };
    });
    _.extend(_.prototype, {
        chain: function() {
            this._chain = true;
            return this;
        },
        value: function() {
            return this._wrapped;
        }
    });
}).call(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var req = "function" == typeof require ? require : null;
    "undefined" != typeof XMLHttpRequest ? Parse.XMLHttpRequest = XMLHttpRequest : "function" == typeof require && "undefined" == typeof require.ensure && (Parse.XMLHttpRequest = req("xmlhttprequest").XMLHttpRequest);
    if ("undefined" != typeof exports && exports._) {
        Parse._ = exports._.noConflict();
        exports.Parse = Parse;
    } else Parse._ = _.noConflict();
    "undefined" != typeof $ && (Parse.$ = $);
    var EmptyConstructor = function() {};
    var inherits = function(parent, protoProps, staticProps) {
        var child;
        child = protoProps && protoProps.hasOwnProperty("constructor") ? protoProps.constructor : function() {
            parent.apply(this, arguments);
        };
        Parse._.extend(child, parent);
        EmptyConstructor.prototype = parent.prototype;
        child.prototype = new EmptyConstructor();
        protoProps && Parse._.extend(child.prototype, protoProps);
        staticProps && Parse._.extend(child, staticProps);
        child.prototype.constructor = child;
        child.__super__ = parent.prototype;
        return child;
    };
    Parse.serverURL = "https://api.parse.com";
    "undefined" != typeof process && process.versions && process.versions.node && (Parse._isNode = true);
    Parse.initialize = function(applicationId, javaScriptKey, masterKey) {
        if (masterKey) throw "Parse.initialize() was passed a Master Key, which is only allowed from within Node.js.";
        Parse._initialize(applicationId, javaScriptKey);
    };
    Parse._initialize = function(applicationId, javaScriptKey, masterKey) {
        Parse.applicationId = applicationId;
        Parse.javaScriptKey = javaScriptKey;
        Parse.masterKey = masterKey;
        Parse._useMasterKey = false;
    };
    if (Parse._isNode) {
        Parse.initialize = Parse._initialize;
        Parse.Cloud = Parse.Cloud || {};
        Parse.Cloud.useMasterKey = function() {
            Parse._useMasterKey = true;
        };
    }
    Parse._getParsePath = function(path) {
        if (!Parse.applicationId) throw "You need to call Parse.initialize before using Parse.";
        path || (path = "");
        if (!Parse._.isString(path)) throw "Tried to get a Storage path that wasn't a String.";
        "/" === path[0] && (path = path.substring(1));
        return "Parse/" + Parse.applicationId + "/" + path;
    };
    Parse._installationId = null;
    Parse._getInstallationId = function() {
        if (Parse._installationId) return Parse.Promise.as(Parse._installationId);
        var path = Parse._getParsePath("installationId");
        return Parse.Storage.getItemAsync(path).then(function(value) {
            Parse._installationId = value;
            if (!Parse._installationId || "" === Parse._installationId) {
                var hexOctet = function() {
                    return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1);
                };
                Parse._installationId = hexOctet() + hexOctet() + "-" + hexOctet() + "-" + hexOctet() + "-" + hexOctet() + "-" + hexOctet() + hexOctet() + hexOctet();
                return Parse.Storage.setItemAsync(path, Parse._installationId);
            }
            return Parse.Promise.as(Parse._installationId);
        });
    };
    Parse._parseDate = function(iso8601) {
        var regexp = new RegExp("^([0-9]{1,4})-([0-9]{1,2})-([0-9]{1,2})T([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})(.([0-9]+))?Z$");
        var match = regexp.exec(iso8601);
        if (!match) return null;
        var year = match[1] || 0;
        var month = (match[2] || 1) - 1;
        var day = match[3] || 0;
        var hour = match[4] || 0;
        var minute = match[5] || 0;
        var second = match[6] || 0;
        var milli = match[8] || 0;
        return new Date(Date.UTC(year, month, day, hour, minute, second, milli));
    };
    Parse._ajaxIE8 = function(method, url, data) {
        var promise = new Parse.Promise();
        var xdr = new XDomainRequest();
        xdr.onload = function() {
            var response;
            try {
                response = JSON.parse(xdr.responseText);
            } catch (e) {
                promise.reject(e);
            }
            response && promise.resolve(response);
        };
        xdr.onerror = xdr.ontimeout = function() {
            var fakeResponse = {
                responseText: JSON.stringify({
                    code: Parse.Error.X_DOMAIN_REQUEST,
                    error: "IE's XDomainRequest does not supply error info."
                })
            };
            promise.reject(fakeResponse);
        };
        xdr.onprogress = function() {};
        xdr.open(method, url);
        xdr.send(data);
        return promise;
    };
    Parse._useXDomainRequest = function() {
        if ("undefined" != typeof XDomainRequest) {
            if ("withCredentials" in new XMLHttpRequest()) return false;
            return true;
        }
        return false;
    };
    Parse._ajax = function(method, url, data, success, error) {
        var options = {
            success: success,
            error: error
        };
        if (Parse._useXDomainRequest()) return Parse._ajaxIE8(method, url, data)._thenRunCallbacks(options);
        var promise = new Parse.Promise();
        var attempts = 0;
        var dispatch = function() {
            var handled = false;
            var xhr = new Parse.XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (4 === xhr.readyState) {
                    if (handled) return;
                    handled = true;
                    if (xhr.status >= 200 && xhr.status < 300) {
                        var response;
                        try {
                            response = JSON.parse(xhr.responseText);
                        } catch (e) {
                            promise.reject(e);
                        }
                        response && promise.resolve(response, xhr.status, xhr);
                    } else if (xhr.status >= 500) if (++attempts < 5) {
                        var delay = Math.round(125 * Math.random() * Math.pow(2, attempts));
                        setTimeout(dispatch, delay);
                    } else promise.reject(xhr); else promise.reject(xhr);
                }
            };
            xhr.open(method, url, true);
            xhr.setRequestHeader("Content-Type", "text/plain");
            Parse._isNode && xhr.setRequestHeader("User-Agent", "Parse/" + Parse.VERSION + " (NodeJS " + process.versions.node + ")");
            xhr.send(data);
        };
        dispatch();
        return promise._thenRunCallbacks(options);
    };
    Parse._extend = function(protoProps, classProps) {
        var child = inherits(this, protoProps, classProps);
        child.extend = this.extend;
        return child;
    };
    Parse._request = function(options) {
        var route = options.route;
        var className = options.className;
        var objectId = options.objectId;
        var method = options.method;
        var useMasterKey = options.useMasterKey;
        var sessionToken = options.sessionToken;
        var dataObject = options.data;
        if (!Parse.applicationId) throw "You must specify your applicationId using Parse.initialize.";
        if (!Parse.javaScriptKey && !Parse.masterKey) throw "You must specify a key using Parse.initialize.";
        if ("batch" !== route && "classes" !== route && "events" !== route && "files" !== route && "functions" !== route && "login" !== route && "logout" !== route && "push" !== route && "requestPasswordReset" !== route && "rest_verify_analytics" !== route && "users" !== route && "jobs" !== route && "config" !== route && "sessions" !== route && "upgradeToRevocableSession" !== route) throw "Bad route: '" + route + "'.";
        var url = Parse.serverURL;
        "/" !== url.charAt(url.length - 1) && (url += "/");
        url += "1/" + route;
        className && (url += "/" + className);
        objectId && (url += "/" + objectId);
        dataObject = Parse._.clone(dataObject || {});
        if ("POST" !== method) {
            dataObject._method = method;
            method = "POST";
        }
        Parse._.isUndefined(useMasterKey) && (useMasterKey = Parse._useMasterKey);
        dataObject._ApplicationId = Parse.applicationId;
        useMasterKey ? dataObject._MasterKey = Parse.masterKey : dataObject._JavaScriptKey = Parse.javaScriptKey;
        dataObject._ClientVersion = Parse.VERSION;
        return Parse._getInstallationId().then(function(iid) {
            dataObject._InstallationId = iid;
            if (sessionToken) return Parse.Promise.as({
                _sessionToken: sessionToken
            });
            return Parse.User._currentAsync();
        }).then(function(currentUser) {
            currentUser && currentUser._sessionToken && (dataObject._SessionToken = currentUser._sessionToken);
            Parse.User._isRevocableSessionEnabled && (dataObject._RevocableSession = "1");
            var data = JSON.stringify(dataObject);
            return Parse._ajax(method, url, data);
        }).then(null, function(response) {
            var error;
            if (response && response.responseText) try {
                var errorJSON = JSON.parse(response.responseText);
                error = new Parse.Error(errorJSON.code, errorJSON.error);
            } catch (e) {
                error = new Parse.Error(Parse.Error.INVALID_JSON, "Received an error with invalid JSON from Parse: " + response.responseText);
            } else error = new Parse.Error(Parse.Error.CONNECTION_FAILED, "XMLHttpRequest failed: " + JSON.stringify(response));
            return Parse.Promise.error(error);
        });
    };
    Parse._getValue = function(object, prop) {
        if (!(object && object[prop])) return null;
        return Parse._.isFunction(object[prop]) ? object[prop]() : object[prop];
    };
    Parse._encode = function(value, seenObjects, disallowObjects) {
        var _ = Parse._;
        if (value instanceof Parse.Object) {
            if (disallowObjects) throw "Parse.Objects not allowed here";
            if (!seenObjects || _.include(seenObjects, value) || !value._hasData) return value._toPointer();
            if (!value.dirty()) {
                seenObjects = seenObjects.concat(value);
                return Parse._encode(value._toFullJSON(seenObjects), seenObjects, disallowObjects);
            }
            throw "Tried to save an object with a pointer to a new, unsaved object.";
        }
        if (value instanceof Parse.ACL) return value.toJSON();
        if (_.isDate(value)) return {
            __type: "Date",
            iso: value.toJSON()
        };
        if (value instanceof Parse.GeoPoint) return value.toJSON();
        if (_.isArray(value)) return _.map(value, function(x) {
            return Parse._encode(x, seenObjects, disallowObjects);
        });
        if (_.isRegExp(value)) return value.source;
        if (value instanceof Parse.Relation) return value.toJSON();
        if (value instanceof Parse.Op) return value.toJSON();
        if (value instanceof Parse.File) {
            if (!value.url()) throw "Tried to save an object containing an unsaved file.";
            return {
                __type: "File",
                name: value.name(),
                url: value.url()
            };
        }
        if (_.isObject(value)) {
            var output = {};
            Parse._objectEach(value, function(v, k) {
                output[k] = Parse._encode(v, seenObjects, disallowObjects);
            });
            return output;
        }
        return value;
    };
    Parse._decode = function(key, value) {
        var _ = Parse._;
        if (!_.isObject(value)) return value;
        if (_.isArray(value)) {
            Parse._arrayEach(value, function(v, k) {
                value[k] = Parse._decode(k, v);
            });
            return value;
        }
        if (value instanceof Parse.Object) return value;
        if (value instanceof Parse.File) return value;
        if (value instanceof Parse.Op) return value;
        if (value.__op) return Parse.Op._decode(value);
        if ("Pointer" === value.__type && value.className) {
            var pointer = Parse.Object._create(value.className);
            pointer._finishFetch({
                objectId: value.objectId
            }, false);
            return pointer;
        }
        if ("Object" === value.__type && value.className) {
            var className = value.className;
            delete value.__type;
            delete value.className;
            var object = Parse.Object._create(className);
            object._finishFetch(value, true);
            return object;
        }
        if ("Date" === value.__type) return Parse._parseDate(value.iso);
        if ("GeoPoint" === value.__type) return new Parse.GeoPoint({
            latitude: value.latitude,
            longitude: value.longitude
        });
        if ("ACL" === key) {
            if (value instanceof Parse.ACL) return value;
            return new Parse.ACL(value);
        }
        if ("Relation" === value.__type) {
            var relation = new Parse.Relation(null, key);
            relation.targetClassName = value.className;
            return relation;
        }
        if ("File" === value.__type) {
            var file = new Parse.File(value.name);
            file._url = value.url;
            return file;
        }
        Parse._objectEach(value, function(v, k) {
            value[k] = Parse._decode(k, v);
        });
        return value;
    };
    Parse._arrayEach = Parse._.each;
    Parse._traverse = function(object, func, seen) {
        if (object instanceof Parse.Object) {
            seen = seen || [];
            if (Parse._.indexOf(seen, object) >= 0) return;
            seen.push(object);
            Parse._traverse(object.attributes, func, seen);
            return func(object);
        }
        if (object instanceof Parse.Relation || object instanceof Parse.File) return func(object);
        if (Parse._.isArray(object)) {
            Parse._.each(object, function(child, index) {
                var newChild = Parse._traverse(child, func, seen);
                newChild && (object[index] = newChild);
            });
            return func(object);
        }
        if (Parse._.isObject(object)) {
            Parse._each(object, function(child, key) {
                var newChild = Parse._traverse(child, func, seen);
                newChild && (object[key] = newChild);
            });
            return func(object);
        }
        return func(object);
    };
    Parse._objectEach = Parse._each = function(obj, callback) {
        var _ = Parse._;
        _.isObject(obj) ? _.each(_.keys(obj), function(key) {
            callback(obj[key], key);
        }) : _.each(obj, callback);
    };
    Parse._isNullOrUndefined = function(x) {
        return Parse._.isNull(x) || Parse._.isUndefined(x);
    };
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var Storage = {
        async: false
    };
    var hasLocalStorage = "undefined" != typeof localStorage;
    if (hasLocalStorage) try {
        localStorage.setItem("supported", true);
        localStorage.removeItem("supported");
    } catch (e) {
        hasLocalStorage = false;
    }
    if (hasLocalStorage) {
        Storage.getItem = function(path) {
            return localStorage.getItem(path);
        };
        Storage.setItem = function(path, value) {
            return localStorage.setItem(path, value);
        };
        Storage.removeItem = function(path) {
            return localStorage.removeItem(path);
        };
        Storage.clear = function() {
            return localStorage.clear();
        };
    } else if ("function" == typeof require) {
        var AsyncStorage;
        try {
            AsyncStorage = eval("require('AsyncStorage')");
            Storage.async = true;
            Storage.getItemAsync = function(path) {
                var p = new Parse.Promise();
                AsyncStorage.getItem(path, function(err, value) {
                    err ? p.reject(err) : p.resolve(value);
                });
                return p;
            };
            Storage.setItemAsync = function(path, value) {
                var p = new Parse.Promise();
                AsyncStorage.setItem(path, value, function(err) {
                    err ? p.reject(err) : p.resolve(value);
                });
                return p;
            };
            Storage.removeItemAsync = function(path) {
                var p = new Parse.Promise();
                AsyncStorage.removeItem(path, function(err) {
                    err ? p.reject(err) : p.resolve();
                });
                return p;
            };
            Storage.clear = function() {
                AsyncStorage.clear();
            };
        } catch (e) {}
    }
    if (!Storage.async && !Storage.getItem) {
        var memMap = Storage.inMemoryMap = {};
        Storage.getItem = function(path) {
            if (memMap.hasOwnProperty(path)) return memMap[path];
            return null;
        };
        Storage.setItem = function(path, value) {
            memMap[path] = String(value);
        };
        Storage.removeItem = function(path) {
            delete memMap[path];
        };
        Storage.clear = function() {
            for (var key in memMap) memMap.hasOwnProperty(key) && delete memMap[key];
        };
    }
    if (!Storage.async) {
        Storage.getItemAsync = function(path) {
            return Parse.Promise.as(Storage.getItem(path));
        };
        Storage.setItemAsync = function(path, value) {
            Storage.setItem(path, value);
            return Parse.Promise.as(value);
        };
        Storage.removeItemAsync = function(path) {
            return Parse.Promise.as(Storage.removeItem(path));
        };
    }
    Parse.Storage = Storage;
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var _ = Parse._;
    Parse.Analytics = Parse.Analytics || {};
    _.extend(Parse.Analytics, {
        track: function(name, dimensions, options) {
            name = name || "";
            name = name.replace(/^\s*/, "");
            name = name.replace(/\s*$/, "");
            if (0 === name.length) throw "A name for the custom event must be provided";
            _.each(dimensions, function(val, key) {
                if (!_.isString(key) || !_.isString(val)) throw 'track() dimensions expects keys and values of type "string".';
            });
            options = options || {};
            return Parse._request({
                route: "events",
                className: name,
                method: "POST",
                data: {
                    dimensions: dimensions
                }
            })._thenRunCallbacks(options);
        }
    });
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var _ = Parse._;
    Parse.Config = function() {
        this.attributes = {};
        this._escapedAttributes = {};
    };
    Parse.Config.current = function() {
        if (Parse.Config._currentConfig) return Parse.Config._currentConfig;
        var config = new Parse.Config();
        if (Parse.Storage.async) return config;
        var configData = Parse.Storage.getItem(Parse._getParsePath(Parse.Config._CURRENT_CONFIG_KEY));
        if (configData) {
            config._finishFetch(JSON.parse(configData));
            Parse.Config._currentConfig = config;
        }
        return config;
    };
    Parse.Config.get = function(options) {
        options = options || {};
        var request = Parse._request({
            route: "config",
            method: "GET"
        });
        return request.then(function(response) {
            if (!response || !response.params) {
                var errorObject = new Parse.Error(Parse.Error.INVALID_JSON, "Config JSON response invalid.");
                return Parse.Promise.error(errorObject);
            }
            var config = new Parse.Config();
            config._finishFetch(response);
            Parse.Config._currentConfig = config;
            return config;
        })._thenRunCallbacks(options);
    };
    Parse.Config.prototype = {
        escape: function(attr) {
            var html = this._escapedAttributes[attr];
            if (html) return html;
            var val = this.attributes[attr];
            var escaped;
            escaped = Parse._isNullOrUndefined(val) ? "" : _.escape(val.toString());
            this._escapedAttributes[attr] = escaped;
            return escaped;
        },
        get: function(attr) {
            return this.attributes[attr];
        },
        _finishFetch: function(serverData) {
            this.attributes = Parse._decode(null, _.clone(serverData.params));
            Parse.Storage.async || Parse.Storage.setItem(Parse._getParsePath(Parse.Config._CURRENT_CONFIG_KEY), JSON.stringify(serverData));
        }
    };
    Parse.Config._currentConfig = null;
    Parse.Config._CURRENT_CONFIG_KEY = "currentConfig";
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var _ = Parse._;
    Parse.Error = function(code, message) {
        this.code = code;
        this.message = message;
    };
    _.extend(Parse.Error, {
        OTHER_CAUSE: -1,
        INTERNAL_SERVER_ERROR: 1,
        CONNECTION_FAILED: 100,
        OBJECT_NOT_FOUND: 101,
        INVALID_QUERY: 102,
        INVALID_CLASS_NAME: 103,
        MISSING_OBJECT_ID: 104,
        INVALID_KEY_NAME: 105,
        INVALID_POINTER: 106,
        INVALID_JSON: 107,
        COMMAND_UNAVAILABLE: 108,
        NOT_INITIALIZED: 109,
        INCORRECT_TYPE: 111,
        INVALID_CHANNEL_NAME: 112,
        PUSH_MISCONFIGURED: 115,
        OBJECT_TOO_LARGE: 116,
        OPERATION_FORBIDDEN: 119,
        CACHE_MISS: 120,
        INVALID_NESTED_KEY: 121,
        INVALID_FILE_NAME: 122,
        INVALID_ACL: 123,
        TIMEOUT: 124,
        INVALID_EMAIL_ADDRESS: 125,
        MISSING_CONTENT_TYPE: 126,
        MISSING_CONTENT_LENGTH: 127,
        INVALID_CONTENT_LENGTH: 128,
        FILE_TOO_LARGE: 129,
        FILE_SAVE_ERROR: 130,
        DUPLICATE_VALUE: 137,
        INVALID_ROLE_NAME: 139,
        EXCEEDED_QUOTA: 140,
        SCRIPT_FAILED: 141,
        VALIDATION_ERROR: 142,
        INVALID_IMAGE_DATA: 150,
        UNSAVED_FILE_ERROR: 151,
        INVALID_PUSH_TIME_ERROR: 152,
        FILE_DELETE_ERROR: 153,
        REQUEST_LIMIT_EXCEEDED: 155,
        INVALID_EVENT_NAME: 160,
        USERNAME_MISSING: 200,
        PASSWORD_MISSING: 201,
        USERNAME_TAKEN: 202,
        EMAIL_TAKEN: 203,
        EMAIL_MISSING: 204,
        EMAIL_NOT_FOUND: 205,
        SESSION_MISSING: 206,
        MUST_CREATE_USER_THROUGH_SIGNUP: 207,
        ACCOUNT_ALREADY_LINKED: 208,
        INVALID_SESSION_TOKEN: 209,
        LINKED_ID_MISSING: 250,
        INVALID_LINKED_SESSION: 251,
        UNSUPPORTED_SERVICE: 252,
        AGGREGATE_ERROR: 600,
        FILE_READ_ERROR: 601,
        X_DOMAIN_REQUEST: 602
    });
}(this);

(function() {
    var root = this;
    var Parse = root.Parse || (root.Parse = {});
    var eventSplitter = /\s+/;
    var slice = Array.prototype.slice;
    Parse.Events = {
        on: function(events, callback, context) {
            var calls, event, node, tail, list;
            if (!callback) return this;
            events = events.split(eventSplitter);
            calls = this._callbacks || (this._callbacks = {});
            event = events.shift();
            while (event) {
                list = calls[event];
                node = list ? list.tail : {};
                node.next = tail = {};
                node.context = context;
                node.callback = callback;
                calls[event] = {
                    tail: tail,
                    next: list ? list.next : node
                };
                event = events.shift();
            }
            return this;
        },
        off: function(events, callback, context) {
            var event, calls, node, tail, cb, ctx;
            if (!(calls = this._callbacks)) return;
            if (!(events || callback || context)) {
                delete this._callbacks;
                return this;
            }
            events = events ? events.split(eventSplitter) : Object.keys(calls);
            event = events.shift();
            while (event) {
                node = calls[event];
                delete calls[event];
                if (!node || !(callback || context)) {
                    event = events.shift();
                    continue;
                }
                tail = node.tail;
                node = node.next;
                while (node !== tail) {
                    cb = node.callback;
                    ctx = node.context;
                    (callback && cb !== callback || context && ctx !== context) && this.on(event, cb, ctx);
                    node = node.next;
                }
                event = events.shift();
            }
            return this;
        },
        trigger: function(events) {
            var event, node, calls, tail, args, all, rest;
            if (!(calls = this._callbacks)) return this;
            all = calls.all;
            events = events.split(eventSplitter);
            rest = slice.call(arguments, 1);
            event = events.shift();
            while (event) {
                node = calls[event];
                if (node) {
                    tail = node.tail;
                    while ((node = node.next) !== tail) node.callback.apply(node.context || this, rest);
                }
                node = all;
                if (node) {
                    tail = node.tail;
                    args = [ event ].concat(rest);
                    while ((node = node.next) !== tail) node.callback.apply(node.context || this, args);
                }
                event = events.shift();
            }
            return this;
        }
    };
    Parse.Events.bind = Parse.Events.on;
    Parse.Events.unbind = Parse.Events.off;
}).call(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var _ = Parse._;
    Parse.GeoPoint = function(arg1, arg2) {
        if (_.isArray(arg1)) {
            Parse.GeoPoint._validate(arg1[0], arg1[1]);
            this.latitude = arg1[0];
            this.longitude = arg1[1];
        } else if (_.isObject(arg1)) {
            Parse.GeoPoint._validate(arg1.latitude, arg1.longitude);
            this.latitude = arg1.latitude;
            this.longitude = arg1.longitude;
        } else if (_.isNumber(arg1) && _.isNumber(arg2)) {
            Parse.GeoPoint._validate(arg1, arg2);
            this.latitude = arg1;
            this.longitude = arg2;
        } else {
            this.latitude = 0;
            this.longitude = 0;
        }
        var self = this;
        if (this.__defineGetter__ && this.__defineSetter__) {
            this._latitude = this.latitude;
            this._longitude = this.longitude;
            this.__defineGetter__("latitude", function() {
                return self._latitude;
            });
            this.__defineGetter__("longitude", function() {
                return self._longitude;
            });
            this.__defineSetter__("latitude", function(val) {
                Parse.GeoPoint._validate(val, self.longitude);
                self._latitude = val;
            });
            this.__defineSetter__("longitude", function(val) {
                Parse.GeoPoint._validate(self.latitude, val);
                self._longitude = val;
            });
        }
    };
    Parse.GeoPoint._validate = function(latitude, longitude) {
        if (-90 > latitude) throw "Parse.GeoPoint latitude " + latitude + " < -90.0.";
        if (latitude > 90) throw "Parse.GeoPoint latitude " + latitude + " > 90.0.";
        if (-180 > longitude) throw "Parse.GeoPoint longitude " + longitude + " < -180.0.";
        if (longitude > 180) throw "Parse.GeoPoint longitude " + longitude + " > 180.0.";
    };
    Parse.GeoPoint.current = function(options) {
        var promise = new Parse.Promise();
        navigator.geolocation.getCurrentPosition(function(location) {
            promise.resolve(new Parse.GeoPoint({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            }));
        }, function(error) {
            promise.reject(error);
        });
        return promise._thenRunCallbacks(options);
    };
    Parse.GeoPoint.prototype = {
        toJSON: function() {
            Parse.GeoPoint._validate(this.latitude, this.longitude);
            return {
                __type: "GeoPoint",
                latitude: this.latitude,
                longitude: this.longitude
            };
        },
        radiansTo: function(point) {
            var d2r = Math.PI / 180;
            var lat1rad = this.latitude * d2r;
            var long1rad = this.longitude * d2r;
            var lat2rad = point.latitude * d2r;
            var long2rad = point.longitude * d2r;
            var deltaLat = lat1rad - lat2rad;
            var deltaLong = long1rad - long2rad;
            var sinDeltaLatDiv2 = Math.sin(deltaLat / 2);
            var sinDeltaLongDiv2 = Math.sin(deltaLong / 2);
            var a = sinDeltaLatDiv2 * sinDeltaLatDiv2 + Math.cos(lat1rad) * Math.cos(lat2rad) * sinDeltaLongDiv2 * sinDeltaLongDiv2;
            a = Math.min(1, a);
            return 2 * Math.asin(Math.sqrt(a));
        },
        kilometersTo: function(point) {
            return 6371 * this.radiansTo(point);
        },
        milesTo: function(point) {
            return 3958.8 * this.radiansTo(point);
        }
    };
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var _ = Parse._;
    var PUBLIC_KEY = "*";
    Parse.ACL = function(arg1) {
        var self = this;
        self.permissionsById = {};
        if (_.isObject(arg1)) if (arg1 instanceof Parse.User) {
            self.setReadAccess(arg1, true);
            self.setWriteAccess(arg1, true);
        } else {
            if (_.isFunction(arg1)) throw "Parse.ACL() called with a function.  Did you forget ()?";
            Parse._objectEach(arg1, function(accessList, userId) {
                if (!_.isString(userId)) throw "Tried to create an ACL with an invalid userId.";
                self.permissionsById[userId] = {};
                Parse._objectEach(accessList, function(allowed, permission) {
                    if ("read" !== permission && "write" !== permission) throw "Tried to create an ACL with an invalid permission type.";
                    if (!_.isBoolean(allowed)) throw "Tried to create an ACL with an invalid permission value.";
                    self.permissionsById[userId][permission] = allowed;
                });
            });
        }
    };
    Parse.ACL.prototype.toJSON = function() {
        return _.clone(this.permissionsById);
    };
    Parse.ACL.prototype._setAccess = function(accessType, userId, allowed) {
        userId instanceof Parse.User ? userId = userId.id : userId instanceof Parse.Role && (userId = "role:" + userId.getName());
        if (!_.isString(userId)) throw "userId must be a string.";
        if (!_.isBoolean(allowed)) throw "allowed must be either true or false.";
        var permissions = this.permissionsById[userId];
        if (!permissions) {
            if (!allowed) return;
            permissions = {};
            this.permissionsById[userId] = permissions;
        }
        if (allowed) this.permissionsById[userId][accessType] = true; else {
            delete permissions[accessType];
            _.isEmpty(permissions) && delete permissions[userId];
        }
    };
    Parse.ACL.prototype._getAccess = function(accessType, userId) {
        userId instanceof Parse.User ? userId = userId.id : userId instanceof Parse.Role && (userId = "role:" + userId.getName());
        var permissions = this.permissionsById[userId];
        if (!permissions) return false;
        return permissions[accessType] ? true : false;
    };
    Parse.ACL.prototype.setReadAccess = function(userId, allowed) {
        this._setAccess("read", userId, allowed);
    };
    Parse.ACL.prototype.getReadAccess = function(userId) {
        return this._getAccess("read", userId);
    };
    Parse.ACL.prototype.setWriteAccess = function(userId, allowed) {
        this._setAccess("write", userId, allowed);
    };
    Parse.ACL.prototype.getWriteAccess = function(userId) {
        return this._getAccess("write", userId);
    };
    Parse.ACL.prototype.setPublicReadAccess = function(allowed) {
        this.setReadAccess(PUBLIC_KEY, allowed);
    };
    Parse.ACL.prototype.getPublicReadAccess = function() {
        return this.getReadAccess(PUBLIC_KEY);
    };
    Parse.ACL.prototype.setPublicWriteAccess = function(allowed) {
        this.setWriteAccess(PUBLIC_KEY, allowed);
    };
    Parse.ACL.prototype.getPublicWriteAccess = function() {
        return this.getWriteAccess(PUBLIC_KEY);
    };
    Parse.ACL.prototype.getRoleReadAccess = function(role) {
        role instanceof Parse.Role && (role = role.getName());
        if (_.isString(role)) return this.getReadAccess("role:" + role);
        throw "role must be a Parse.Role or a String";
    };
    Parse.ACL.prototype.getRoleWriteAccess = function(role) {
        role instanceof Parse.Role && (role = role.getName());
        if (_.isString(role)) return this.getWriteAccess("role:" + role);
        throw "role must be a Parse.Role or a String";
    };
    Parse.ACL.prototype.setRoleReadAccess = function(role, allowed) {
        role instanceof Parse.Role && (role = role.getName());
        if (_.isString(role)) {
            this.setReadAccess("role:" + role, allowed);
            return;
        }
        throw "role must be a Parse.Role or a String";
    };
    Parse.ACL.prototype.setRoleWriteAccess = function(role, allowed) {
        role instanceof Parse.Role && (role = role.getName());
        if (_.isString(role)) {
            this.setWriteAccess("role:" + role, allowed);
            return;
        }
        throw "role must be a Parse.Role or a String";
    };
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var _ = Parse._;
    Parse.Op = function() {
        this._initialize.apply(this, arguments);
    };
    Parse.Op.prototype = {
        _initialize: function() {}
    };
    _.extend(Parse.Op, {
        _extend: Parse._extend,
        _opDecoderMap: {},
        _registerDecoder: function(opName, decoder) {
            Parse.Op._opDecoderMap[opName] = decoder;
        },
        _decode: function(json) {
            var decoder = Parse.Op._opDecoderMap[json.__op];
            return decoder ? decoder(json) : void 0;
        }
    });
    Parse.Op._registerDecoder("Batch", function(json) {
        var op = null;
        Parse._arrayEach(json.ops, function(nextOp) {
            nextOp = Parse.Op._decode(nextOp);
            op = nextOp._mergeWithPrevious(op);
        });
        return op;
    });
    Parse.Op.Set = Parse.Op._extend({
        _initialize: function(value) {
            this._value = value;
        },
        value: function() {
            return this._value;
        },
        toJSON: function() {
            return Parse._encode(this.value());
        },
        _mergeWithPrevious: function() {
            return this;
        },
        _estimate: function() {
            return this.value();
        }
    });
    Parse.Op._UNSET = {};
    Parse.Op.Unset = Parse.Op._extend({
        toJSON: function() {
            return {
                __op: "Delete"
            };
        },
        _mergeWithPrevious: function() {
            return this;
        },
        _estimate: function() {
            return Parse.Op._UNSET;
        }
    });
    Parse.Op._registerDecoder("Delete", function() {
        return new Parse.Op.Unset();
    });
    Parse.Op.Increment = Parse.Op._extend({
        _initialize: function(amount) {
            this._amount = amount;
        },
        amount: function() {
            return this._amount;
        },
        toJSON: function() {
            return {
                __op: "Increment",
                amount: this._amount
            };
        },
        _mergeWithPrevious: function(previous) {
            if (previous) {
                if (previous instanceof Parse.Op.Unset) return new Parse.Op.Set(this.amount());
                if (previous instanceof Parse.Op.Set) return new Parse.Op.Set(previous.value() + this.amount());
                if (previous instanceof Parse.Op.Increment) return new Parse.Op.Increment(this.amount() + previous.amount());
                throw "Op is invalid after previous op.";
            }
            return this;
        },
        _estimate: function(oldValue) {
            if (!oldValue) return this.amount();
            return oldValue + this.amount();
        }
    });
    Parse.Op._registerDecoder("Increment", function(json) {
        return new Parse.Op.Increment(json.amount);
    });
    Parse.Op.Add = Parse.Op._extend({
        _initialize: function(objects) {
            this._objects = objects;
        },
        objects: function() {
            return this._objects;
        },
        toJSON: function() {
            return {
                __op: "Add",
                objects: Parse._encode(this.objects())
            };
        },
        _mergeWithPrevious: function(previous) {
            if (previous) {
                if (previous instanceof Parse.Op.Unset) return new Parse.Op.Set(this.objects());
                if (previous instanceof Parse.Op.Set) return new Parse.Op.Set(this._estimate(previous.value()));
                if (previous instanceof Parse.Op.Add) return new Parse.Op.Add(previous.objects().concat(this.objects()));
                throw "Op is invalid after previous op.";
            }
            return this;
        },
        _estimate: function(oldValue) {
            return oldValue ? oldValue.concat(this.objects()) : _.clone(this.objects());
        }
    });
    Parse.Op._registerDecoder("Add", function(json) {
        return new Parse.Op.Add(Parse._decode(void 0, json.objects));
    });
    Parse.Op.AddUnique = Parse.Op._extend({
        _initialize: function(objects) {
            this._objects = _.uniq(objects);
        },
        objects: function() {
            return this._objects;
        },
        toJSON: function() {
            return {
                __op: "AddUnique",
                objects: Parse._encode(this.objects())
            };
        },
        _mergeWithPrevious: function(previous) {
            if (previous) {
                if (previous instanceof Parse.Op.Unset) return new Parse.Op.Set(this.objects());
                if (previous instanceof Parse.Op.Set) return new Parse.Op.Set(this._estimate(previous.value()));
                if (previous instanceof Parse.Op.AddUnique) return new Parse.Op.AddUnique(this._estimate(previous.objects()));
                throw "Op is invalid after previous op.";
            }
            return this;
        },
        _estimate: function(oldValue) {
            if (oldValue) {
                var newValue = _.clone(oldValue);
                Parse._arrayEach(this.objects(), function(obj) {
                    if (obj instanceof Parse.Object && obj.id) {
                        var matchingObj = _.find(newValue, function(anObj) {
                            return anObj instanceof Parse.Object && anObj.id === obj.id;
                        });
                        if (matchingObj) {
                            var index = _.indexOf(newValue, matchingObj);
                            newValue[index] = obj;
                        } else newValue.push(obj);
                    } else _.contains(newValue, obj) || newValue.push(obj);
                });
                return newValue;
            }
            return _.clone(this.objects());
        }
    });
    Parse.Op._registerDecoder("AddUnique", function(json) {
        return new Parse.Op.AddUnique(Parse._decode(void 0, json.objects));
    });
    Parse.Op.Remove = Parse.Op._extend({
        _initialize: function(objects) {
            this._objects = _.uniq(objects);
        },
        objects: function() {
            return this._objects;
        },
        toJSON: function() {
            return {
                __op: "Remove",
                objects: Parse._encode(this.objects())
            };
        },
        _mergeWithPrevious: function(previous) {
            if (previous) {
                if (previous instanceof Parse.Op.Unset) return previous;
                if (previous instanceof Parse.Op.Set) return new Parse.Op.Set(this._estimate(previous.value()));
                if (previous instanceof Parse.Op.Remove) return new Parse.Op.Remove(_.union(previous.objects(), this.objects()));
                throw "Op is invalid after previous op.";
            }
            return this;
        },
        _estimate: function(oldValue) {
            if (oldValue) {
                var newValue = _.difference(oldValue, this.objects());
                Parse._arrayEach(this.objects(), function(obj) {
                    obj instanceof Parse.Object && obj.id && (newValue = _.reject(newValue, function(other) {
                        return other instanceof Parse.Object && other.id === obj.id;
                    }));
                });
                return newValue;
            }
            return [];
        }
    });
    Parse.Op._registerDecoder("Remove", function(json) {
        return new Parse.Op.Remove(Parse._decode(void 0, json.objects));
    });
    Parse.Op.Relation = Parse.Op._extend({
        _initialize: function(adds, removes) {
            this._targetClassName = null;
            var self = this;
            var pointerToId = function(object) {
                if (object instanceof Parse.Object) {
                    if (!object.id) throw "You can't add an unsaved Parse.Object to a relation.";
                    self._targetClassName || (self._targetClassName = object.className);
                    if (self._targetClassName !== object.className) throw "Tried to create a Parse.Relation with 2 different types: " + self._targetClassName + " and " + object.className + ".";
                    return object.id;
                }
                return object;
            };
            this.relationsToAdd = _.uniq(_.map(adds, pointerToId));
            this.relationsToRemove = _.uniq(_.map(removes, pointerToId));
        },
        added: function() {
            var self = this;
            return _.map(this.relationsToAdd, function(objectId) {
                var object = Parse.Object._create(self._targetClassName);
                object.id = objectId;
                return object;
            });
        },
        removed: function() {
            var self = this;
            return _.map(this.relationsToRemove, function(objectId) {
                var object = Parse.Object._create(self._targetClassName);
                object.id = objectId;
                return object;
            });
        },
        toJSON: function() {
            var adds = null;
            var removes = null;
            var self = this;
            var idToPointer = function(id) {
                return {
                    __type: "Pointer",
                    className: self._targetClassName,
                    objectId: id
                };
            };
            var pointers = null;
            if (this.relationsToAdd.length > 0) {
                pointers = _.map(this.relationsToAdd, idToPointer);
                adds = {
                    __op: "AddRelation",
                    objects: pointers
                };
            }
            if (this.relationsToRemove.length > 0) {
                pointers = _.map(this.relationsToRemove, idToPointer);
                removes = {
                    __op: "RemoveRelation",
                    objects: pointers
                };
            }
            if (adds && removes) return {
                __op: "Batch",
                ops: [ adds, removes ]
            };
            return adds || removes || {};
        },
        _mergeWithPrevious: function(previous) {
            if (previous) {
                if (previous instanceof Parse.Op.Unset) throw "You can't modify a relation after deleting it.";
                if (previous instanceof Parse.Op.Relation) {
                    if (previous._targetClassName && previous._targetClassName !== this._targetClassName) throw "Related object must be of class " + previous._targetClassName + ", but " + this._targetClassName + " was passed in.";
                    var newAdd = _.union(_.difference(previous.relationsToAdd, this.relationsToRemove), this.relationsToAdd);
                    var newRemove = _.union(_.difference(previous.relationsToRemove, this.relationsToAdd), this.relationsToRemove);
                    var newRelation = new Parse.Op.Relation(newAdd, newRemove);
                    newRelation._targetClassName = this._targetClassName;
                    return newRelation;
                }
                throw "Op is invalid after previous op.";
            }
            return this;
        },
        _estimate: function(oldValue, object, key) {
            if (oldValue) {
                if (oldValue instanceof Parse.Relation) {
                    if (this._targetClassName) if (oldValue.targetClassName) {
                        if (oldValue.targetClassName !== this._targetClassName) throw "Related object must be a " + oldValue.targetClassName + ", but a " + this._targetClassName + " was passed in.";
                    } else oldValue.targetClassName = this._targetClassName;
                    return oldValue;
                }
                throw "Op is invalid after previous op.";
            }
            var relation = new Parse.Relation(object, key);
            relation.targetClassName = this._targetClassName;
        }
    });
    Parse.Op._registerDecoder("AddRelation", function(json) {
        return new Parse.Op.Relation(Parse._decode(void 0, json.objects), []);
    });
    Parse.Op._registerDecoder("RemoveRelation", function(json) {
        return new Parse.Op.Relation([], Parse._decode(void 0, json.objects));
    });
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var _ = Parse._;
    Parse.Relation = function(parent, key) {
        this.parent = parent;
        this.key = key;
        this.targetClassName = null;
    };
    Parse.Relation.prototype = {
        _ensureParentAndKey: function(parent, key) {
            this.parent = this.parent || parent;
            this.key = this.key || key;
            if (this.parent !== parent) throw "Internal Error. Relation retrieved from two different Objects.";
            if (this.key !== key) throw "Internal Error. Relation retrieved from two different keys.";
        },
        add: function(objects) {
            _.isArray(objects) || (objects = [ objects ]);
            var change = new Parse.Op.Relation(objects, []);
            this.parent.set(this.key, change);
            this.targetClassName = change._targetClassName;
        },
        remove: function(objects) {
            _.isArray(objects) || (objects = [ objects ]);
            var change = new Parse.Op.Relation([], objects);
            this.parent.set(this.key, change);
            this.targetClassName = change._targetClassName;
        },
        toJSON: function() {
            return {
                __type: "Relation",
                className: this.targetClassName
            };
        },
        query: function() {
            var targetClass;
            var query;
            if (this.targetClassName) {
                targetClass = Parse.Object._getSubclass(this.targetClassName);
                query = new Parse.Query(targetClass);
            } else {
                targetClass = Parse.Object._getSubclass(this.parent.className);
                query = new Parse.Query(targetClass);
                query._extraOptions.redirectClassNameForKey = this.key;
            }
            query._addCondition("$relatedTo", "object", this.parent._toPointer());
            query._addCondition("$relatedTo", "key", this.key);
            return query;
        }
    };
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var _ = Parse._;
    Parse.Promise = function() {
        this._resolved = false;
        this._rejected = false;
        this._resolvedCallbacks = [];
        this._rejectedCallbacks = [];
    };
    _.extend(Parse.Promise, {
        _isPromisesAPlusCompliant: false,
        is: function(promise) {
            return promise && promise.then && _.isFunction(promise.then);
        },
        as: function() {
            var promise = new Parse.Promise();
            promise.resolve.apply(promise, arguments);
            return promise;
        },
        error: function() {
            var promise = new Parse.Promise();
            promise.reject.apply(promise, arguments);
            return promise;
        },
        when: function(promises) {
            var objects;
            objects = promises && Parse._isNullOrUndefined(promises.length) ? arguments : promises;
            var total = objects.length;
            var hadError = false;
            var results = [];
            var errors = [];
            results.length = objects.length;
            errors.length = objects.length;
            if (0 === total) return Parse.Promise.as.apply(this, results);
            var promise = new Parse.Promise();
            var resolveOne = function() {
                total -= 1;
                0 === total && (hadError ? promise.reject(errors) : promise.resolve.apply(promise, results));
            };
            Parse._arrayEach(objects, function(object, i) {
                if (Parse.Promise.is(object)) object.then(function(result) {
                    results[i] = result;
                    resolveOne();
                }, function(error) {
                    errors[i] = error;
                    hadError = true;
                    resolveOne();
                }); else {
                    results[i] = object;
                    resolveOne();
                }
            });
            return promise;
        },
        _continueWhile: function(predicate, asyncFunction) {
            if (predicate()) return asyncFunction().then(function() {
                return Parse.Promise._continueWhile(predicate, asyncFunction);
            });
            return Parse.Promise.as();
        }
    });
    _.extend(Parse.Promise.prototype, {
        resolve: function() {
            if (this._resolved || this._rejected) throw "A promise was resolved even though it had already been " + (this._resolved ? "resolved" : "rejected") + ".";
            this._resolved = true;
            this._result = arguments;
            var results = arguments;
            Parse._arrayEach(this._resolvedCallbacks, function(resolvedCallback) {
                resolvedCallback.apply(this, results);
            });
            this._resolvedCallbacks = [];
            this._rejectedCallbacks = [];
        },
        reject: function(error) {
            if (this._resolved || this._rejected) throw "A promise was rejected even though it had already been " + (this._resolved ? "resolved" : "rejected") + ".";
            this._rejected = true;
            this._error = error;
            Parse._arrayEach(this._rejectedCallbacks, function(rejectedCallback) {
                rejectedCallback(error);
            });
            this._resolvedCallbacks = [];
            this._rejectedCallbacks = [];
        },
        then: function(resolvedCallback, rejectedCallback) {
            var promise = new Parse.Promise();
            var wrappedResolvedCallback = function() {
                var result = arguments;
                if (resolvedCallback) if (Parse.Promise._isPromisesAPlusCompliant) try {
                    result = [ resolvedCallback.apply(this, result) ];
                } catch (e) {
                    result = [ Parse.Promise.error(e) ];
                } else result = [ resolvedCallback.apply(this, result) ];
                1 === result.length && Parse.Promise.is(result[0]) ? result[0].then(function() {
                    promise.resolve.apply(promise, arguments);
                }, function(error) {
                    promise.reject(error);
                }) : promise.resolve.apply(promise, result);
            };
            var wrappedRejectedCallback = function(error) {
                var result = [];
                if (rejectedCallback) {
                    if (Parse.Promise._isPromisesAPlusCompliant) try {
                        result = [ rejectedCallback(error) ];
                    } catch (e) {
                        result = [ Parse.Promise.error(e) ];
                    } else result = [ rejectedCallback(error) ];
                    1 === result.length && Parse.Promise.is(result[0]) ? result[0].then(function() {
                        promise.resolve.apply(promise, arguments);
                    }, function(error) {
                        promise.reject(error);
                    }) : Parse.Promise._isPromisesAPlusCompliant ? promise.resolve.apply(promise, result) : promise.reject(result[0]);
                } else promise.reject(error);
            };
            var runLater = function(func) {
                func.call();
            };
            Parse.Promise._isPromisesAPlusCompliant && ("undefined" != typeof window && window.setTimeout ? runLater = function(func) {
                window.setTimeout(func, 0);
            } : "undefined" != typeof process && process.nextTick && (runLater = function(func) {
                process.nextTick(func);
            }));
            var self = this;
            if (this._resolved) runLater(function() {
                wrappedResolvedCallback.apply(self, self._result);
            }); else if (this._rejected) runLater(function() {
                wrappedRejectedCallback(self._error);
            }); else {
                this._resolvedCallbacks.push(wrappedResolvedCallback);
                this._rejectedCallbacks.push(wrappedRejectedCallback);
            }
            return promise;
        },
        always: function(callback) {
            return this.then(callback, callback);
        },
        done: function(callback) {
            return this.then(callback);
        },
        fail: function(callback) {
            return this.then(null, callback);
        },
        _thenRunCallbacks: function(optionsOrCallback, model) {
            var options;
            if (_.isFunction(optionsOrCallback)) {
                var callback = optionsOrCallback;
                options = {
                    success: function(result) {
                        callback(result, null);
                    },
                    error: function(error) {
                        callback(null, error);
                    }
                };
            } else options = _.clone(optionsOrCallback);
            options = options || {};
            return this.then(function(result) {
                options.success ? options.success.apply(this, arguments) : model && model.trigger("sync", model, result, options);
                return Parse.Promise.as.apply(Parse.Promise, arguments);
            }, function(error) {
                options.error ? _.isUndefined(model) ? options.error(error) : options.error(model, error) : model && model.trigger("error", model, error, options);
                return Parse.Promise.error(error);
            });
        },
        _continueWith: function(continuation) {
            return this.then(function() {
                return continuation(arguments, null);
            }, function(error) {
                return continuation(null, error);
            });
        }
    });
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var _ = Parse._;
    var b64Digit = function(number) {
        if (26 > number) return String.fromCharCode(65 + number);
        if (52 > number) return String.fromCharCode(97 + (number - 26));
        if (62 > number) return String.fromCharCode(48 + (number - 52));
        if (62 === number) return "+";
        if (63 === number) return "/";
        throw "Tried to encode large digit " + number + " in base64.";
    };
    var encodeBase64 = function(array) {
        var chunks = [];
        chunks.length = Math.ceil(array.length / 3);
        _.times(chunks.length, function(i) {
            var b1 = array[3 * i];
            var b2 = array[3 * i + 1] || 0;
            var b3 = array[3 * i + 2] || 0;
            var has2 = 3 * i + 1 < array.length;
            var has3 = 3 * i + 2 < array.length;
            chunks[i] = [ b64Digit(b1 >> 2 & 63), b64Digit(b1 << 4 & 48 | b2 >> 4 & 15), has2 ? b64Digit(b2 << 2 & 60 | b3 >> 6 & 3) : "=", has3 ? b64Digit(63 & b3) : "=" ].join("");
        });
        return chunks.join("");
    };
    var mimeTypes = {
        ai: "application/postscript",
        aif: "audio/x-aiff",
        aifc: "audio/x-aiff",
        aiff: "audio/x-aiff",
        asc: "text/plain",
        atom: "application/atom+xml",
        au: "audio/basic",
        avi: "video/x-msvideo",
        bcpio: "application/x-bcpio",
        bin: "application/octet-stream",
        bmp: "image/bmp",
        cdf: "application/x-netcdf",
        cgm: "image/cgm",
        "class": "application/octet-stream",
        cpio: "application/x-cpio",
        cpt: "application/mac-compactpro",
        csh: "application/x-csh",
        css: "text/css",
        dcr: "application/x-director",
        dif: "video/x-dv",
        dir: "application/x-director",
        djv: "image/vnd.djvu",
        djvu: "image/vnd.djvu",
        dll: "application/octet-stream",
        dmg: "application/octet-stream",
        dms: "application/octet-stream",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        dotx: "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
        docm: "application/vnd.ms-word.document.macroEnabled.12",
        dotm: "application/vnd.ms-word.template.macroEnabled.12",
        dtd: "application/xml-dtd",
        dv: "video/x-dv",
        dvi: "application/x-dvi",
        dxr: "application/x-director",
        eps: "application/postscript",
        etx: "text/x-setext",
        exe: "application/octet-stream",
        ez: "application/andrew-inset",
        gif: "image/gif",
        gram: "application/srgs",
        grxml: "application/srgs+xml",
        gtar: "application/x-gtar",
        hdf: "application/x-hdf",
        hqx: "application/mac-binhex40",
        htm: "text/html",
        html: "text/html",
        ice: "x-conference/x-cooltalk",
        ico: "image/x-icon",
        ics: "text/calendar",
        ief: "image/ief",
        ifb: "text/calendar",
        iges: "model/iges",
        igs: "model/iges",
        jnlp: "application/x-java-jnlp-file",
        jp2: "image/jp2",
        jpe: "image/jpeg",
        jpeg: "image/jpeg",
        jpg: "image/jpeg",
        js: "application/x-javascript",
        kar: "audio/midi",
        latex: "application/x-latex",
        lha: "application/octet-stream",
        lzh: "application/octet-stream",
        m3u: "audio/x-mpegurl",
        m4a: "audio/mp4a-latm",
        m4b: "audio/mp4a-latm",
        m4p: "audio/mp4a-latm",
        m4u: "video/vnd.mpegurl",
        m4v: "video/x-m4v",
        mac: "image/x-macpaint",
        man: "application/x-troff-man",
        mathml: "application/mathml+xml",
        me: "application/x-troff-me",
        mesh: "model/mesh",
        mid: "audio/midi",
        midi: "audio/midi",
        mif: "application/vnd.mif",
        mov: "video/quicktime",
        movie: "video/x-sgi-movie",
        mp2: "audio/mpeg",
        mp3: "audio/mpeg",
        mp4: "video/mp4",
        mpe: "video/mpeg",
        mpeg: "video/mpeg",
        mpg: "video/mpeg",
        mpga: "audio/mpeg",
        ms: "application/x-troff-ms",
        msh: "model/mesh",
        mxu: "video/vnd.mpegurl",
        nc: "application/x-netcdf",
        oda: "application/oda",
        ogg: "application/ogg",
        pbm: "image/x-portable-bitmap",
        pct: "image/pict",
        pdb: "chemical/x-pdb",
        pdf: "application/pdf",
        pgm: "image/x-portable-graymap",
        pgn: "application/x-chess-pgn",
        pic: "image/pict",
        pict: "image/pict",
        png: "image/png",
        pnm: "image/x-portable-anymap",
        pnt: "image/x-macpaint",
        pntg: "image/x-macpaint",
        ppm: "image/x-portable-pixmap",
        ppt: "application/vnd.ms-powerpoint",
        pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        potx: "application/vnd.openxmlformats-officedocument.presentationml.template",
        ppsx: "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
        ppam: "application/vnd.ms-powerpoint.addin.macroEnabled.12",
        pptm: "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
        potm: "application/vnd.ms-powerpoint.template.macroEnabled.12",
        ppsm: "application/vnd.ms-powerpoint.slideshow.macroEnabled.12",
        ps: "application/postscript",
        qt: "video/quicktime",
        qti: "image/x-quicktime",
        qtif: "image/x-quicktime",
        ra: "audio/x-pn-realaudio",
        ram: "audio/x-pn-realaudio",
        ras: "image/x-cmu-raster",
        rdf: "application/rdf+xml",
        rgb: "image/x-rgb",
        rm: "application/vnd.rn-realmedia",
        roff: "application/x-troff",
        rtf: "text/rtf",
        rtx: "text/richtext",
        sgm: "text/sgml",
        sgml: "text/sgml",
        sh: "application/x-sh",
        shar: "application/x-shar",
        silo: "model/mesh",
        sit: "application/x-stuffit",
        skd: "application/x-koan",
        skm: "application/x-koan",
        skp: "application/x-koan",
        skt: "application/x-koan",
        smi: "application/smil",
        smil: "application/smil",
        snd: "audio/basic",
        so: "application/octet-stream",
        spl: "application/x-futuresplash",
        src: "application/x-wais-source",
        sv4cpio: "application/x-sv4cpio",
        sv4crc: "application/x-sv4crc",
        svg: "image/svg+xml",
        swf: "application/x-shockwave-flash",
        t: "application/x-troff",
        tar: "application/x-tar",
        tcl: "application/x-tcl",
        tex: "application/x-tex",
        texi: "application/x-texinfo",
        texinfo: "application/x-texinfo",
        tif: "image/tiff",
        tiff: "image/tiff",
        tr: "application/x-troff",
        tsv: "text/tab-separated-values",
        txt: "text/plain",
        ustar: "application/x-ustar",
        vcd: "application/x-cdlink",
        vrml: "model/vrml",
        vxml: "application/voicexml+xml",
        wav: "audio/x-wav",
        wbmp: "image/vnd.wap.wbmp",
        wbmxl: "application/vnd.wap.wbxml",
        wml: "text/vnd.wap.wml",
        wmlc: "application/vnd.wap.wmlc",
        wmls: "text/vnd.wap.wmlscript",
        wmlsc: "application/vnd.wap.wmlscriptc",
        wrl: "model/vrml",
        xbm: "image/x-xbitmap",
        xht: "application/xhtml+xml",
        xhtml: "application/xhtml+xml",
        xls: "application/vnd.ms-excel",
        xml: "application/xml",
        xpm: "image/x-xpixmap",
        xsl: "application/xml",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        xltx: "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
        xlsm: "application/vnd.ms-excel.sheet.macroEnabled.12",
        xltm: "application/vnd.ms-excel.template.macroEnabled.12",
        xlam: "application/vnd.ms-excel.addin.macroEnabled.12",
        xlsb: "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
        xslt: "application/xslt+xml",
        xul: "application/vnd.mozilla.xul+xml",
        xwd: "image/x-xwindowdump",
        xyz: "chemical/x-xyz",
        zip: "application/zip"
    };
    var readAsync = function(file, type) {
        var promise = new Parse.Promise();
        if ("undefined" == typeof FileReader) return Parse.Promise.error(new Parse.Error(Parse.Error.FILE_READ_ERROR, "Attempted to use a FileReader on an unsupported browser."));
        var reader = new FileReader();
        reader.onloadend = function() {
            if (2 !== reader.readyState) {
                promise.reject(new Parse.Error(Parse.Error.FILE_READ_ERROR, "Error reading file."));
                return;
            }
            var dataURL = reader.result;
            var matches = /^data:([^;]*);base64,(.*)$/.exec(dataURL);
            if (!matches) {
                promise.reject(new Parse.Error(Parse.Error.FILE_READ_ERROR, "Unable to interpret data URL: " + dataURL));
                return;
            }
            promise.resolve(matches[2], type || matches[1]);
        };
        reader.readAsDataURL(file);
        return promise;
    };
    Parse.File = function(name, data, type) {
        this._name = name;
        var extension = /\.([^.]*)$/.exec(name);
        extension && (extension = extension[1].toLowerCase());
        var guessedType = type || mimeTypes[extension] || "text/plain";
        if (_.isArray(data)) this._source = Parse.Promise.as(encodeBase64(data), guessedType); else if (data && data.base64) {
            var dataUriRegexp = /^data:([a-zA-Z]*\/[a-zA-Z+.-]*);(charset=[a-zA-Z0-9\-\/\s]*,)?base64,(\S+)/;
            var matches = dataUriRegexp.exec(data.base64);
            this._source = matches && matches.length > 0 ? Parse.Promise.as(4 === matches.length ? matches[3] : matches[2], matches[1]) : Parse.Promise.as(data.base64, guessedType);
        } else if ("undefined" != typeof File && data instanceof File) this._source = readAsync(data, type); else if (_.isString(data)) throw "Creating a Parse.File from a String is not yet supported.";
    };
    Parse.File.prototype = {
        name: function() {
            return this._name;
        },
        url: function() {
            return this._url;
        },
        save: function(options) {
            options = options || {};
            var self = this;
            self._previousSave || (self._previousSave = self._source.then(function(base64, type) {
                var data = {
                    base64: base64,
                    _ContentType: type
                };
                return Parse._request({
                    route: "files",
                    className: self._name,
                    method: "POST",
                    data: data,
                    useMasterKey: options.useMasterKey
                });
            }).then(function(response) {
                self._name = response.name;
                self._url = response.url;
                return self;
            }));
            return self._previousSave._thenRunCallbacks(options);
        }
    };
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var _ = Parse._;
    Parse.Object = function(attributes, options) {
        if (_.isString(attributes)) return Parse.Object._create.apply(this, arguments);
        attributes = attributes || {};
        options && options.parse && (attributes = this.parse(attributes));
        var defaults = Parse._getValue(this, "defaults");
        defaults && (attributes = _.extend({}, defaults, attributes));
        options && options.collection && (this.collection = options.collection);
        this._serverData = {};
        this._opSetQueue = [ {} ];
        this.attributes = {};
        this._hashedJSON = {};
        this._escapedAttributes = {};
        this.cid = _.uniqueId("c");
        this.changed = {};
        this._silent = {};
        this._pending = {};
        if (!this.set(attributes, {
            silent: true
        })) throw new Error("Can't create an invalid Parse.Object");
        this.changed = {};
        this._silent = {};
        this._pending = {};
        this._hasData = true;
        this._previousAttributes = _.clone(this.attributes);
        this.initialize.apply(this, arguments);
    };
    Parse.Object.saveAll = function(list, options) {
        options = options || {};
        return Parse.Object._deepSaveAsync(list, {
            useMasterKey: options.useMasterKey
        })._thenRunCallbacks(options);
    };
    Parse.Object.destroyAll = function(list, options) {
        options = options || {};
        var triggerDestroy = function(object) {
            object.trigger("destroy", object, object.collection, options);
        };
        var errors = [];
        var destroyBatch = function(batch) {
            var promise = Parse.Promise.as();
            batch.length > 0 && (promise = promise.then(function() {
                return Parse._request({
                    route: "batch",
                    method: "POST",
                    useMasterKey: options.useMasterKey,
                    data: {
                        requests: _.map(batch, function(object) {
                            return {
                                method: "DELETE",
                                path: "/1/classes/" + object.className + "/" + object.id
                            };
                        })
                    }
                });
            }).then(function(responses) {
                Parse._arrayEach(batch, function(object, i) {
                    if (responses[i].success && options.wait) triggerDestroy(object); else if (responses[i].error) {
                        var error = new Parse.Error(responses[i].error.code, responses[i].error.error);
                        error.object = object;
                        errors.push(error);
                    }
                });
            }));
            return promise;
        };
        var promise = Parse.Promise.as();
        var batch = [];
        Parse._arrayEach(list, function(object, i) {
            object.id && options.wait || triggerDestroy(object);
            object.id && batch.push(object);
            if (20 === batch.length || i + 1 === list.length) {
                var thisBatch = batch;
                batch = [];
                promise = promise.then(function() {
                    return destroyBatch(thisBatch);
                });
            }
        });
        return promise.then(function() {
            if (0 === errors.length) return true;
            var error = new Parse.Error(Parse.Error.AGGREGATE_ERROR, "Error deleting an object in destroyAll");
            error.errors = errors;
            return Parse.Promise.error(error);
        })._thenRunCallbacks(options);
    };
    Parse.Object.fetchAll = function(list, options) {
        return Parse.Object._fetchAll(list, true)._thenRunCallbacks(options);
    };
    Parse.Object.fetchAllIfNeeded = function(list, options) {
        return Parse.Object._fetchAll(list, false)._thenRunCallbacks(options);
    };
    _.extend(Parse.Object.prototype, Parse.Events, {
        _existed: false,
        initialize: function() {},
        toJSON: function() {
            var json = this._toFullJSON();
            Parse._arrayEach([ "__type", "className" ], function(key) {
                delete json[key];
            });
            return json;
        },
        _toFullJSON: function(seenObjects) {
            var json = _.clone(this.attributes);
            Parse._objectEach(json, function(val, key) {
                json[key] = Parse._encode(val, seenObjects);
            });
            Parse._objectEach(this._operations, function(val, key) {
                json[key] = val;
            });
            _.has(this, "id") && (json.objectId = this.id);
            _.has(this, "createdAt") && (json.createdAt = _.isDate(this.createdAt) ? this.createdAt.toJSON() : this.createdAt);
            _.has(this, "updatedAt") && (json.updatedAt = _.isDate(this.updatedAt) ? this.updatedAt.toJSON() : this.updatedAt);
            json.__type = "Object";
            json.className = this.className;
            return json;
        },
        _refreshCache: function() {
            var self = this;
            if (self._refreshingCache) return;
            self._refreshingCache = true;
            Parse._objectEach(this.attributes, function(value, key) {
                if (value instanceof Parse.Object) value._refreshCache(); else if (_.isObject(value)) {
                    var objectArray = false;
                    _.isArray(value) && _.each(value, function(arrVal) {
                        if (arrVal instanceof Parse.Object) {
                            objectArray = true;
                            arrVal._refreshCache();
                        }
                    });
                    !objectArray && self._resetCacheForKey(key) && self.set(key, new Parse.Op.Set(value), {
                        silent: true
                    });
                }
            });
            delete self._refreshingCache;
        },
        dirty: function(attr) {
            this._refreshCache();
            var currentChanges = _.last(this._opSetQueue);
            if (attr) return currentChanges[attr] ? true : false;
            if (!this.id) return true;
            if (_.keys(currentChanges).length > 0) return true;
            return false;
        },
        dirtyKeys: function() {
            return _.keys(_.last(this._opSetQueue));
        },
        _toPointer: function() {
            if (!this.id) throw new Error("Can't serialize an unsaved Parse.Object");
            return {
                __type: "Pointer",
                className: this.className,
                objectId: this.id
            };
        },
        get: function(attr) {
            return this.attributes[attr];
        },
        relation: function(attr) {
            var value = this.get(attr);
            if (value) {
                if (!(value instanceof Parse.Relation)) throw "Called relation() on non-relation field " + attr;
                value._ensureParentAndKey(this, attr);
                return value;
            }
            return new Parse.Relation(this, attr);
        },
        escape: function(attr) {
            var html = this._escapedAttributes[attr];
            if (html) return html;
            var val = this.attributes[attr];
            var escaped;
            escaped = Parse._isNullOrUndefined(val) ? "" : _.escape(val.toString());
            this._escapedAttributes[attr] = escaped;
            return escaped;
        },
        has: function(attr) {
            return !Parse._isNullOrUndefined(this.attributes[attr]);
        },
        _mergeMagicFields: function(attrs) {
            var model = this;
            var specialFields = [ "id", "objectId", "createdAt", "updatedAt" ];
            Parse._arrayEach(specialFields, function(attr) {
                if (attrs[attr]) {
                    "objectId" === attr ? model.id = attrs[attr] : model[attr] = "createdAt" !== attr && "updatedAt" !== attr || _.isDate(attrs[attr]) ? attrs[attr] : Parse._parseDate(attrs[attr]);
                    delete attrs[attr];
                }
            });
        },
        _copyServerData: function(serverData) {
            var tempServerData = {};
            Parse._objectEach(serverData, function(value, key) {
                tempServerData[key] = Parse._decode(key, value);
            });
            this._serverData = tempServerData;
            this._rebuildAllEstimatedData();
            this._refreshCache();
            this._opSetQueue = [ {} ];
            this._rebuildAllEstimatedData();
        },
        _mergeFromObject: function(other) {
            if (!other) return;
            this.id = other.id;
            this.createdAt = other.createdAt;
            this.updatedAt = other.updatedAt;
            this._copyServerData(other._serverData);
            this._hasData = true;
        },
        _startSave: function() {
            this._opSetQueue.push({});
        },
        _cancelSave: function() {
            var failedChanges = _.first(this._opSetQueue);
            this._opSetQueue = _.rest(this._opSetQueue);
            var nextChanges = _.first(this._opSetQueue);
            Parse._objectEach(failedChanges, function(op, key) {
                var op1 = failedChanges[key];
                var op2 = nextChanges[key];
                op1 && op2 ? nextChanges[key] = op2._mergeWithPrevious(op1) : op1 && (nextChanges[key] = op1);
            });
            this._saving = this._saving - 1;
        },
        _finishSave: function(serverData) {
            var fetchedObjects = {};
            Parse._traverse(this.attributes, function(object) {
                object instanceof Parse.Object && object.id && object._hasData && (fetchedObjects[object.id] = object);
            });
            var savedChanges = _.first(this._opSetQueue);
            this._opSetQueue = _.rest(this._opSetQueue);
            this._applyOpSet(savedChanges, this._serverData);
            this._mergeMagicFields(serverData);
            var self = this;
            Parse._objectEach(serverData, function(value, key) {
                self._serverData[key] = Parse._decode(key, value);
                var fetched = Parse._traverse(self._serverData[key], function(object) {
                    if (object instanceof Parse.Object && fetchedObjects[object.id]) return fetchedObjects[object.id];
                });
                fetched && (self._serverData[key] = fetched);
            });
            this._rebuildAllEstimatedData();
            this._saving = this._saving - 1;
        },
        _finishFetch: function(serverData, hasData) {
            this._opSetQueue = [ {} ];
            this._mergeMagicFields(serverData);
            this._copyServerData(serverData);
            this._hasData = hasData;
        },
        _applyOpSet: function(opSet, target) {
            var self = this;
            Parse._objectEach(opSet, function(change, key) {
                target[key] = change._estimate(target[key], self, key);
                target[key] === Parse.Op._UNSET && delete target[key];
            });
        },
        _resetCacheForKey: function(key) {
            var value = this.attributes[key];
            if (!(!_.isObject(value) || value instanceof Parse.Object || value instanceof Parse.File)) {
                value = value.toJSON ? value.toJSON() : value;
                var json = JSON.stringify(value);
                if (this._hashedJSON[key] !== json) {
                    var wasSet = !!this._hashedJSON[key];
                    this._hashedJSON[key] = json;
                    return wasSet;
                }
            }
            return false;
        },
        _rebuildEstimatedDataForKey: function(key) {
            var self = this;
            delete this.attributes[key];
            this._serverData[key] && (this.attributes[key] = this._serverData[key]);
            Parse._arrayEach(this._opSetQueue, function(opSet) {
                var op = opSet[key];
                if (op) {
                    self.attributes[key] = op._estimate(self.attributes[key], self, key);
                    self.attributes[key] === Parse.Op._UNSET ? delete self.attributes[key] : self._resetCacheForKey(key);
                }
            });
        },
        _rebuildAllEstimatedData: function() {
            var self = this;
            var previousAttributes = _.clone(this.attributes);
            this.attributes = _.clone(this._serverData);
            Parse._arrayEach(this._opSetQueue, function(opSet) {
                self._applyOpSet(opSet, self.attributes);
                Parse._objectEach(opSet, function(op, key) {
                    self._resetCacheForKey(key);
                });
            });
            Parse._objectEach(previousAttributes, function(oldValue, key) {
                self.attributes[key] !== oldValue && self.trigger("change:" + key, self, self.attributes[key], {});
            });
            Parse._objectEach(this.attributes, function(newValue, key) {
                _.has(previousAttributes, key) || self.trigger("change:" + key, self, newValue, {});
            });
        },
        set: function(key, value, options) {
            var attrs;
            if (_.isObject(key) || Parse._isNullOrUndefined(key)) {
                attrs = key;
                Parse._objectEach(attrs, function(v, k) {
                    attrs[k] = Parse._decode(k, v);
                });
                options = value;
            } else {
                attrs = {};
                attrs[key] = Parse._decode(key, value);
            }
            options = options || {};
            if (!attrs) return this;
            attrs instanceof Parse.Object && (attrs = attrs.attributes);
            var self = this;
            Parse._objectEach(attrs, function(unused_value, key) {
                if (self.constructor.readOnlyAttributes && self.constructor.readOnlyAttributes[key]) throw new Error("Cannot modify readonly key: " + key);
            });
            options.unset && Parse._objectEach(attrs, function(unused_value, key) {
                attrs[key] = new Parse.Op.Unset();
            });
            var dataToValidate = _.clone(attrs);
            Parse._objectEach(dataToValidate, function(value, key) {
                if (value instanceof Parse.Op) {
                    dataToValidate[key] = value._estimate(self.attributes[key], self, key);
                    dataToValidate[key] === Parse.Op._UNSET && delete dataToValidate[key];
                }
            });
            if (!this._validate(attrs, options)) return false;
            this._mergeMagicFields(attrs);
            options.changes = {};
            var escaped = this._escapedAttributes;
            this._previousAttributes || {};
            Parse._arrayEach(_.keys(attrs), function(attr) {
                var val = attrs[attr];
                val instanceof Parse.Relation && (val.parent = self);
                val instanceof Parse.Op || (val = new Parse.Op.Set(val));
                var isRealChange = true;
                val instanceof Parse.Op.Set && _.isEqual(self.attributes[attr], val.value) && (isRealChange = false);
                if (isRealChange) {
                    delete escaped[attr];
                    options.silent ? self._silent[attr] = true : options.changes[attr] = true;
                }
                var currentChanges = _.last(self._opSetQueue);
                currentChanges[attr] = val._mergeWithPrevious(currentChanges[attr]);
                self._rebuildEstimatedDataForKey(attr);
                if (isRealChange) {
                    self.changed[attr] = self.attributes[attr];
                    options.silent || (self._pending[attr] = true);
                } else {
                    delete self.changed[attr];
                    delete self._pending[attr];
                }
            });
            options.silent || this.change(options);
            return this;
        },
        unset: function(attr, options) {
            options = options || {};
            options.unset = true;
            return this.set(attr, null, options);
        },
        increment: function(attr, amount) {
            (_.isUndefined(amount) || _.isNull(amount)) && (amount = 1);
            return this.set(attr, new Parse.Op.Increment(amount));
        },
        add: function(attr, item) {
            return this.set(attr, new Parse.Op.Add([ item ]));
        },
        addUnique: function(attr, item) {
            return this.set(attr, new Parse.Op.AddUnique([ item ]));
        },
        remove: function(attr, item) {
            return this.set(attr, new Parse.Op.Remove([ item ]));
        },
        op: function(attr) {
            return _.last(this._opSetQueue)[attr];
        },
        clear: function(options) {
            options = options || {};
            options.unset = true;
            var keysToClear = _.extend(this.attributes, this._operations);
            return this.set(keysToClear, options);
        },
        _getSaveJSON: function() {
            var json = _.clone(_.first(this._opSetQueue));
            Parse._objectEach(json, function(op, key) {
                json[key] = op.toJSON();
            });
            return json;
        },
        _canBeSerialized: function() {
            return Parse.Object._canBeSerializedAsValue(this.attributes);
        },
        fetch: function(options) {
            var self = this;
            options = options || {};
            var request = Parse._request({
                method: "GET",
                route: "classes",
                className: this.className,
                objectId: this.id,
                useMasterKey: options.useMasterKey
            });
            return request.then(function(response, status, xhr) {
                self._finishFetch(self.parse(response, status, xhr), true);
                return self;
            })._thenRunCallbacks(options, this);
        },
        save: function(arg1, arg2, arg3) {
            var attrs, current, options;
            if (_.isObject(arg1) || Parse._isNullOrUndefined(arg1)) {
                attrs = arg1;
                options = arg2;
            } else {
                attrs = {};
                attrs[arg1] = arg2;
                options = arg3;
            }
            if (!options && attrs) {
                var extra_keys = _.reject(attrs, function(value, key) {
                    return _.include([ "success", "error", "wait" ], key);
                });
                if (0 === extra_keys.length) {
                    var all_functions = true;
                    _.has(attrs, "success") && !_.isFunction(attrs.success) && (all_functions = false);
                    _.has(attrs, "error") && !_.isFunction(attrs.error) && (all_functions = false);
                    if (all_functions) return this.save(null, attrs);
                }
            }
            options = _.clone(options) || {};
            options.wait && (current = _.clone(this.attributes));
            var setOptions = _.clone(options) || {};
            setOptions.wait && (setOptions.silent = true);
            var setError;
            setOptions.error = function(model, error) {
                setError = error;
            };
            if (attrs && !this.set(attrs, setOptions)) return Parse.Promise.error(setError)._thenRunCallbacks(options, this);
            var model = this;
            model._refreshCache();
            var unsavedChildren = [];
            var unsavedFiles = [];
            Parse.Object._findUnsavedChildren(model.attributes, unsavedChildren, unsavedFiles);
            if (unsavedChildren.length + unsavedFiles.length > 0) return Parse.Object._deepSaveAsync(this.attributes, {
                useMasterKey: options.useMasterKey
            }).then(function() {
                return model.save(null, options);
            }, function(error) {
                return Parse.Promise.error(error)._thenRunCallbacks(options, model);
            });
            this._startSave();
            this._saving = (this._saving || 0) + 1;
            this._allPreviousSaves = this._allPreviousSaves || Parse.Promise.as();
            this._allPreviousSaves = this._allPreviousSaves._continueWith(function() {
                var method = model.id ? "PUT" : "POST";
                var json = model._getSaveJSON();
                var route = "classes";
                var className = model.className;
                if ("_User" === model.className && !model.id) {
                    route = "users";
                    className = null;
                }
                var request = Parse._request({
                    route: route,
                    className: className,
                    objectId: model.id,
                    method: method,
                    useMasterKey: options.useMasterKey,
                    data: json
                });
                request = request.then(function(resp, status, xhr) {
                    var serverAttrs = model.parse(resp, status, xhr);
                    options.wait && (serverAttrs = _.extend(attrs || {}, serverAttrs));
                    model._finishSave(serverAttrs);
                    options.wait && model.set(current, setOptions);
                    return model;
                }, function(error) {
                    model._cancelSave();
                    return Parse.Promise.error(error);
                })._thenRunCallbacks(options, model);
                return request;
            });
            return this._allPreviousSaves;
        },
        destroy: function(options) {
            options = options || {};
            var model = this;
            var triggerDestroy = function() {
                model.trigger("destroy", model, model.collection, options);
            };
            if (!this.id) return triggerDestroy();
            options.wait || triggerDestroy();
            var request = Parse._request({
                route: "classes",
                className: this.className,
                objectId: this.id,
                method: "DELETE",
                useMasterKey: options.useMasterKey
            });
            return request.then(function() {
                options.wait && triggerDestroy();
                return model;
            })._thenRunCallbacks(options, this);
        },
        parse: function(resp, status) {
            var output = _.clone(resp);
            _([ "createdAt", "updatedAt" ]).each(function(key) {
                output[key] && (output[key] = Parse._parseDate(output[key]));
            });
            output.updatedAt || (output.updatedAt = output.createdAt);
            status && (this._existed = 201 !== status);
            return output;
        },
        clone: function() {
            return new this.constructor(this.attributes);
        },
        isNew: function() {
            return !this.id;
        },
        change: function(options) {
            options = options || {};
            var changing = this._changing;
            this._changing = true;
            var self = this;
            Parse._objectEach(this._silent, function(attr) {
                self._pending[attr] = true;
            });
            var changes = _.extend({}, options.changes, this._silent);
            this._silent = {};
            Parse._objectEach(changes, function(unused_value, attr) {
                self.trigger("change:" + attr, self, self.get(attr), options);
            });
            if (changing) return this;
            var deleteChanged = function(value, attr) {
                self._pending[attr] || self._silent[attr] || delete self.changed[attr];
            };
            while (!_.isEmpty(this._pending)) {
                this._pending = {};
                this.trigger("change", this, options);
                Parse._objectEach(this.changed, deleteChanged);
                self._previousAttributes = _.clone(this.attributes);
            }
            this._changing = false;
            return this;
        },
        existed: function() {
            return this._existed;
        },
        hasChanged: function(attr) {
            if (!arguments.length) return !_.isEmpty(this.changed);
            return this.changed && _.has(this.changed, attr);
        },
        changedAttributes: function(diff) {
            if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
            var changed = {};
            var old = this._previousAttributes;
            Parse._objectEach(diff, function(diffVal, attr) {
                _.isEqual(old[attr], diffVal) || (changed[attr] = diffVal);
            });
            return changed;
        },
        previous: function(attr) {
            if (!arguments.length || !this._previousAttributes) return null;
            return this._previousAttributes[attr];
        },
        previousAttributes: function() {
            return _.clone(this._previousAttributes);
        },
        isValid: function() {
            return !this.validate(this.attributes);
        },
        validate: function(attrs) {
            if (_.has(attrs, "ACL") && !(attrs.ACL instanceof Parse.ACL)) return new Parse.Error(Parse.Error.OTHER_CAUSE, "ACL must be a Parse.ACL.");
            var correct = true;
            Parse._objectEach(attrs, function(unused_value, key) {
                /^[A-Za-z][0-9A-Za-z_]*$/.test(key) || (correct = false);
            });
            if (!correct) return new Parse.Error(Parse.Error.INVALID_KEY_NAME);
            return false;
        },
        _validate: function(attrs, options) {
            if (options.silent || !this.validate) return true;
            attrs = _.extend({}, this.attributes, attrs);
            var error = this.validate(attrs, options);
            if (!error) return true;
            options && options.error ? options.error(this, error, options) : this.trigger("error", this, error, options);
            return false;
        },
        getACL: function() {
            return this.get("ACL");
        },
        setACL: function(acl, options) {
            return this.set("ACL", acl, options);
        }
    });
    Parse.Object._getSubclass = function(className) {
        if (!_.isString(className)) throw "Parse.Object._getSubclass requires a string argument.";
        var ObjectClass = Parse.Object._classMap[className];
        if (!ObjectClass) {
            ObjectClass = Parse.Object.extend(className);
            Parse.Object._classMap[className] = ObjectClass;
        }
        return ObjectClass;
    };
    Parse.Object._create = function(className, attributes, options) {
        var ObjectClass = Parse.Object._getSubclass(className);
        return new ObjectClass(attributes, options);
    };
    Parse.Object._toObjectIdArray = function(list, omitObjectsWithData) {
        if (0 === list.length) return Parse.Promise.as(list);
        var error;
        var className = list[0].className;
        var objectIds = [];
        for (var i = 0; i < list.length; i++) {
            var object = list[i];
            if (className !== object.className) {
                error = new Parse.Error(Parse.Error.INVALID_CLASS_NAME, "All objects should be of the same class");
                return Parse.Promise.error(error);
            }
            if (!object.id) {
                error = new Parse.Error(Parse.Error.MISSING_OBJECT_ID, "All objects must have an ID");
                return Parse.Promise.error(error);
            }
            if (omitObjectsWithData && object._hasData) continue;
            objectIds.push(object.id);
        }
        return Parse.Promise.as(objectIds);
    };
    Parse.Object._updateWithFetchedResults = function(list, fetched, forceFetch) {
        var fetchedObjectsById = {};
        Parse._arrayEach(fetched, function(object) {
            fetchedObjectsById[object.id] = object;
        });
        for (var i = 0; i < list.length; i++) {
            var object = list[i];
            var fetchedObject = fetchedObjectsById[object.id];
            if (!fetchedObject && forceFetch) {
                var error = new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, "All objects must exist on the server");
                return Parse.Promise.error(error);
            }
            object._mergeFromObject(fetchedObject);
        }
        return Parse.Promise.as(list);
    };
    Parse.Object._fetchAll = function(list, forceFetch) {
        if (0 === list.length) return Parse.Promise.as(list);
        var omitObjectsWithData = !forceFetch;
        return Parse.Object._toObjectIdArray(list, omitObjectsWithData).then(function(objectIds) {
            var className = list[0].className;
            var query = new Parse.Query(className);
            query.containedIn("objectId", objectIds);
            query.limit = objectIds.length;
            return query.find();
        }).then(function(results) {
            return Parse.Object._updateWithFetchedResults(list, results, forceFetch);
        });
    };
    Parse.Object._classMap = {};
    Parse.Object._extend = Parse._extend;
    Parse.Object.extend = function(className, protoProps, classProps) {
        if (!_.isString(className)) {
            if (className && _.has(className, "className")) return Parse.Object.extend(className.className, className, protoProps);
            throw new Error("Parse.Object.extend's first argument should be the className.");
        }
        "User" === className && Parse.User._performUserRewrite && (className = "_User");
        protoProps = protoProps || {};
        protoProps.className = className;
        var NewClassObject = null;
        if (_.has(Parse.Object._classMap, className)) {
            var OldClassObject = Parse.Object._classMap[className];
            NewClassObject = OldClassObject._extend(protoProps, classProps);
        } else NewClassObject = this._extend(protoProps, classProps);
        NewClassObject.extend = function(arg0) {
            if (_.isString(arg0) || arg0 && _.has(arg0, "className")) return Parse.Object.extend.apply(NewClassObject, arguments);
            var newArguments = [ className ].concat(Parse._.toArray(arguments));
            return Parse.Object.extend.apply(NewClassObject, newArguments);
        };
        NewClassObject.createWithoutData = function(id) {
            var obj = new NewClassObject();
            obj.id = id;
            return obj;
        };
        Parse.Object._classMap[className] = NewClassObject;
        return NewClassObject;
    };
    Parse.Object._findUnsavedChildren = function(object, children, files) {
        Parse._traverse(object, function(object) {
            if (object instanceof Parse.Object) {
                object._refreshCache();
                object.dirty() && children.push(object);
                return;
            }
            if (object instanceof Parse.File) {
                object.url() || files.push(object);
                return;
            }
        });
    };
    Parse.Object._canBeSerializedAsValue = function(object) {
        if (object instanceof Parse.Object) return !!object.id;
        if (object instanceof Parse.File) return true;
        var canBeSerializedAsValue = true;
        _.isArray(object) ? Parse._arrayEach(object, function(child) {
            Parse.Object._canBeSerializedAsValue(child) || (canBeSerializedAsValue = false);
        }) : _.isObject(object) && Parse._objectEach(object, function(child) {
            Parse.Object._canBeSerializedAsValue(child) || (canBeSerializedAsValue = false);
        });
        return canBeSerializedAsValue;
    };
    Parse.Object._deepSaveAsync = function(object, options) {
        var unsavedChildren = [];
        var unsavedFiles = [];
        Parse.Object._findUnsavedChildren(object, unsavedChildren, unsavedFiles);
        var promise = Parse.Promise.as();
        _.each(unsavedFiles, function(file) {
            promise = promise.then(function() {
                return file.save(options);
            });
        });
        var objects = _.uniq(unsavedChildren);
        var remaining = _.uniq(objects);
        return promise.then(function() {
            return Parse.Promise._continueWhile(function() {
                return remaining.length > 0;
            }, function() {
                var batch = [];
                var newRemaining = [];
                Parse._arrayEach(remaining, function(object) {
                    if (batch.length > 20) {
                        newRemaining.push(object);
                        return;
                    }
                    object._canBeSerialized() ? batch.push(object) : newRemaining.push(object);
                });
                remaining = newRemaining;
                if (0 === batch.length) return Parse.Promise.error(new Parse.Error(Parse.Error.OTHER_CAUSE, "Tried to save a batch with a cycle."));
                var readyToStart = Parse.Promise.when(_.map(batch, function(object) {
                    return object._allPreviousSaves || Parse.Promise.as();
                }));
                var batchFinished = new Parse.Promise();
                Parse._arrayEach(batch, function(object) {
                    object._allPreviousSaves = batchFinished;
                });
                return readyToStart._continueWith(function() {
                    return Parse._request({
                        route: "batch",
                        method: "POST",
                        useMasterKey: options.useMasterKey,
                        data: {
                            requests: _.map(batch, function(object) {
                                var json = object._getSaveJSON();
                                var method = "POST";
                                var path = "/1/classes/" + object.className;
                                if (object.id) {
                                    path = path + "/" + object.id;
                                    method = "PUT";
                                }
                                object._startSave();
                                return {
                                    method: method,
                                    path: path,
                                    body: json
                                };
                            })
                        }
                    }).then(function(response, status, xhr) {
                        var error;
                        Parse._arrayEach(batch, function(object, i) {
                            if (response[i].success) object._finishSave(object.parse(response[i].success, status, xhr)); else {
                                error = error || response[i].error;
                                object._cancelSave();
                            }
                        });
                        if (error) return Parse.Promise.error(new Parse.Error(error.code, error.error));
                    }).then(function(results) {
                        batchFinished.resolve(results);
                        return results;
                    }, function(error) {
                        batchFinished.reject(error);
                        return Parse.Promise.error(error);
                    });
                });
            });
        }).then(function() {
            return object;
        });
    };
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var _ = Parse._;
    Parse.Role = Parse.Object.extend("_Role", {
        constructor: function(name, acl) {
            if (_.isString(name) && acl instanceof Parse.ACL) {
                Parse.Object.prototype.constructor.call(this, null, null);
                this.setName(name);
                this.setACL(acl);
            } else Parse.Object.prototype.constructor.call(this, name, acl);
        },
        getName: function() {
            return this.get("name");
        },
        setName: function(name, options) {
            return this.set("name", name, options);
        },
        getUsers: function() {
            return this.relation("users");
        },
        getRoles: function() {
            return this.relation("roles");
        },
        validate: function(attrs, options) {
            if ("name" in attrs && attrs.name !== this.getName()) {
                var newName = attrs.name;
                if (this.id && this.id !== attrs.objectId) return new Parse.Error(Parse.Error.OTHER_CAUSE, "A role's name can only be set before it has been saved.");
                if (!_.isString(newName)) return new Parse.Error(Parse.Error.OTHER_CAUSE, "A role's name must be a String.");
                if (!/^[0-9a-zA-Z\-_ ]+$/.test(newName)) return new Parse.Error(Parse.Error.OTHER_CAUSE, "A role's name can only contain alphanumeric characters, _, -, and spaces.");
            }
            if (Parse.Object.prototype.validate) return Parse.Object.prototype.validate.call(this, attrs, options);
            return false;
        }
    });
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var _ = Parse._;
    Parse.Collection = function(models, options) {
        options = options || {};
        options.comparator && (this.comparator = options.comparator);
        options.model && (this.model = options.model);
        options.query && (this.query = options.query);
        this._reset();
        this.initialize.apply(this, arguments);
        models && this.reset(models, {
            silent: true,
            parse: options.parse
        });
    };
    _.extend(Parse.Collection.prototype, Parse.Events, {
        model: Parse.Object,
        initialize: function() {},
        toJSON: function() {
            return this.map(function(model) {
                return model.toJSON();
            });
        },
        add: function(models, options) {
            var i, index, length, model, cid, id, cids = {}, ids = {};
            options = options || {};
            models = _.isArray(models) ? models.slice() : [ models ];
            for (i = 0, length = models.length; length > i; i++) {
                models[i] = this._prepareModel(models[i], options);
                model = models[i];
                if (!model) throw new Error("Can't add an invalid model to a collection");
                cid = model.cid;
                if (cids[cid] || this._byCid[cid]) throw new Error("Duplicate cid: can't add the same model to a collection twice");
                id = model.id;
                if (!Parse._isNullOrUndefined(id) && (ids[id] || this._byId[id])) throw new Error("Duplicate id: can't add the same model to a collection twice");
                ids[id] = model;
                cids[cid] = model;
            }
            for (i = 0; length > i; i++) {
                (model = models[i]).on("all", this._onModelEvent, this);
                this._byCid[model.cid] = model;
                model.id && (this._byId[model.id] = model);
            }
            this.length += length;
            index = Parse._isNullOrUndefined(options.at) ? this.models.length : options.at;
            this.models.splice.apply(this.models, [ index, 0 ].concat(models));
            this.comparator && this.sort({
                silent: true
            });
            if (options.silent) return this;
            for (i = 0, length = this.models.length; length > i; i++) {
                model = this.models[i];
                if (cids[model.cid]) {
                    options.index = i;
                    model.trigger("add", model, this, options);
                }
            }
            return this;
        },
        remove: function(models, options) {
            var i, l, index, model;
            options = options || {};
            models = _.isArray(models) ? models.slice() : [ models ];
            for (i = 0, l = models.length; l > i; i++) {
                model = this.getByCid(models[i]) || this.get(models[i]);
                if (!model) continue;
                delete this._byId[model.id];
                delete this._byCid[model.cid];
                index = this.indexOf(model);
                this.models.splice(index, 1);
                this.length--;
                if (!options.silent) {
                    options.index = index;
                    model.trigger("remove", model, this, options);
                }
                this._removeReference(model);
            }
            return this;
        },
        get: function(id) {
            return id && this._byId[id.id || id];
        },
        getByCid: function(cid) {
            return cid && this._byCid[cid.cid || cid];
        },
        at: function(index) {
            return this.models[index];
        },
        sort: function(options) {
            options = options || {};
            if (!this.comparator) throw new Error("Cannot sort a set without a comparator");
            var boundComparator = _.bind(this.comparator, this);
            1 === this.comparator.length ? this.models = this.sortBy(boundComparator) : this.models.sort(boundComparator);
            options.silent || this.trigger("reset", this, options);
            return this;
        },
        pluck: function(attr) {
            return _.map(this.models, function(model) {
                return model.get(attr);
            });
        },
        reset: function(models, options) {
            var self = this;
            models = models || [];
            options = options || {};
            Parse._arrayEach(this.models, function(model) {
                self._removeReference(model);
            });
            this._reset();
            this.add(models, {
                silent: true,
                parse: options.parse
            });
            options.silent || this.trigger("reset", this, options);
            return this;
        },
        fetch: function(options) {
            options = _.clone(options) || {};
            void 0 === options.parse && (options.parse = true);
            var collection = this;
            var query = this.query || new Parse.Query(this.model);
            return query.find({
                useMasterKey: options.useMasterKey
            }).then(function(results) {
                options.add ? collection.add(results, options) : collection.reset(results, options);
                return collection;
            })._thenRunCallbacks(options, this);
        },
        create: function(model, options) {
            var coll = this;
            options = options ? _.clone(options) : {};
            model = this._prepareModel(model, options);
            if (!model) return false;
            options.wait || coll.add(model, options);
            var success = options.success;
            options.success = function(nextModel, resp) {
                options.wait && coll.add(nextModel, options);
                success ? success(nextModel, resp) : nextModel.trigger("sync", model, resp, options);
            };
            model.save(null, options);
            return model;
        },
        parse: function(resp) {
            return resp;
        },
        chain: function() {
            return _(this.models).chain();
        },
        _reset: function() {
            this.length = 0;
            this.models = [];
            this._byId = {};
            this._byCid = {};
        },
        _prepareModel: function(model, options) {
            if (model instanceof Parse.Object) model.collection || (model.collection = this); else {
                var attrs = model;
                options.collection = this;
                model = new this.model(attrs, options);
                model._validate(model.attributes, options) || (model = false);
            }
            return model;
        },
        _removeReference: function(model) {
            this === model.collection && delete model.collection;
            model.off("all", this._onModelEvent, this);
        },
        _onModelEvent: function(ev, model, collection, options) {
            if (("add" === ev || "remove" === ev) && collection !== this) return;
            "destroy" === ev && this.remove(model, options);
            if (model && "change:objectId" === ev) {
                delete this._byId[model.previous("objectId")];
                this._byId[model.id] = model;
            }
            this.trigger.apply(this, arguments);
        }
    });
    var methods = [ "forEach", "each", "map", "reduce", "reduceRight", "find", "detect", "filter", "select", "reject", "every", "all", "some", "any", "include", "contains", "invoke", "max", "min", "sortBy", "sortedIndex", "toArray", "size", "first", "initial", "rest", "last", "without", "indexOf", "shuffle", "lastIndexOf", "isEmpty", "groupBy" ];
    Parse._arrayEach(methods, function(method) {
        Parse.Collection.prototype[method] = function() {
            return _[method].apply(_, [ this.models ].concat(_.toArray(arguments)));
        };
    });
    Parse.Collection.extend = Parse._extend;
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var _ = Parse._;
    Parse.View = function(options) {
        this.cid = _.uniqueId("view");
        this._configure(options || {});
        this._ensureElement();
        this.initialize.apply(this, arguments);
        this.delegateEvents();
    };
    var eventSplitter = /^(\S+)\s*(.*)$/;
    var viewOptions = [ "model", "collection", "el", "id", "attributes", "className", "tagName" ];
    _.extend(Parse.View.prototype, Parse.Events, {
        tagName: "div",
        $: function(selector) {
            return this.$el.find(selector);
        },
        initialize: function() {},
        render: function() {
            return this;
        },
        remove: function() {
            this.$el.remove();
            return this;
        },
        make: function(tagName, attributes, content) {
            var el = document.createElement(tagName);
            attributes && Parse.$(el).attr(attributes);
            content && Parse.$(el).html(content);
            return el;
        },
        setElement: function(element, delegate) {
            this.$el = Parse.$(element);
            this.el = this.$el[0];
            false !== delegate && this.delegateEvents();
            return this;
        },
        delegateEvents: function(events) {
            events = events || Parse._getValue(this, "events");
            if (!events) return;
            this.undelegateEvents();
            var self = this;
            Parse._objectEach(events, function(method, key) {
                _.isFunction(method) || (method = self[events[key]]);
                if (!method) throw new Error('Event "' + events[key] + '" does not exist');
                var match = key.match(eventSplitter);
                var eventName = match[1], selector = match[2];
                method = _.bind(method, self);
                eventName += ".delegateEvents" + self.cid;
                "" === selector ? self.$el.bind(eventName, method) : self.$el.delegate(selector, eventName, method);
            });
        },
        undelegateEvents: function() {
            this.$el.unbind(".delegateEvents" + this.cid);
        },
        _configure: function(options) {
            this.options && (options = _.extend({}, this.options, options));
            var self = this;
            _.each(viewOptions, function(attr) {
                options[attr] && (self[attr] = options[attr]);
            });
            this.options = options;
        },
        _ensureElement: function() {
            if (this.el) this.setElement(this.el, false); else {
                var attrs = Parse._getValue(this, "attributes") || {};
                this.id && (attrs.id = this.id);
                this.className && (attrs["class"] = this.className);
                this.setElement(this.make(this.tagName, attrs), false);
            }
        }
    });
    Parse.View.extend = Parse._extend;
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var _ = Parse._;
    Parse.User = Parse.Object.extend("_User", {
        _isCurrentUser: false,
        _mergeFromObject: function(other) {
            other.getSessionToken() && (this._sessionToken = other.getSessionToken());
            Parse.User.__super__._mergeFromObject.call(this, other);
        },
        _mergeMagicFields: function(attrs) {
            if (attrs.sessionToken) {
                this._sessionToken = attrs.sessionToken;
                delete attrs.sessionToken;
            }
            Parse.User.__super__._mergeMagicFields.call(this, attrs);
        },
        _cleanupAuthData: function() {
            if (!this.isCurrent()) return;
            var authData = this.get("authData");
            if (!authData) return;
            Parse._objectEach(this.get("authData"), function(value, key) {
                authData[key] || delete authData[key];
            });
        },
        _synchronizeAllAuthData: function() {
            var authData = this.get("authData");
            if (!authData) return;
            var self = this;
            Parse._objectEach(this.get("authData"), function(value, key) {
                self._synchronizeAuthData(key);
            });
        },
        _synchronizeAuthData: function(provider) {
            if (!this.isCurrent()) return;
            var authType;
            if (_.isString(provider)) {
                authType = provider;
                provider = Parse.User._authProviders[authType];
            } else authType = provider.getAuthType();
            var authData = this.get("authData");
            if (!authData || !provider) return;
            var success = provider.restoreAuthentication(authData[authType]);
            success || this._unlinkFrom(provider);
        },
        _handleSaveResult: function(makeCurrent) {
            makeCurrent && (this._isCurrentUser = true);
            this._cleanupAuthData();
            this._synchronizeAllAuthData();
            delete this._serverData.password;
            this._rebuildEstimatedDataForKey("password");
            this._refreshCache();
            (makeCurrent || this.isCurrent()) && Parse.User._saveCurrentUser(this);
        },
        _linkWith: function(provider, options) {
            var authType;
            if (_.isString(provider)) {
                authType = provider;
                provider = Parse.User._authProviders[provider];
            } else authType = provider.getAuthType();
            if (_.has(options, "authData")) {
                var authData = this.get("authData") || {};
                authData[authType] = options.authData;
                this.set("authData", authData);
                var newOptions = _.clone(options) || {};
                newOptions.success = function(model) {
                    model._handleSaveResult(true);
                    options.success && options.success.apply(this, arguments);
                };
                return this.save({
                    authData: authData
                }, newOptions);
            }
            var self = this;
            var promise = new Parse.Promise();
            provider.authenticate({
                success: function(provider, result) {
                    self._linkWith(provider, {
                        authData: result,
                        success: options.success,
                        error: options.error
                    }).then(function() {
                        promise.resolve(self);
                    });
                },
                error: function(provider, error) {
                    options.error && options.error(self, error);
                    promise.reject(error);
                }
            });
            return promise;
        },
        _unlinkFrom: function(provider, options) {
            var authType;
            if (_.isString(provider)) {
                authType = provider;
                provider = Parse.User._authProviders[provider];
            } else authType = provider.getAuthType();
            var newOptions = _.clone(options);
            var self = this;
            newOptions.authData = null;
            newOptions.success = function() {
                self._synchronizeAuthData(provider);
                options.success && options.success.apply(this, arguments);
            };
            return this._linkWith(provider, newOptions);
        },
        _isLinked: function(provider) {
            var authType;
            authType = _.isString(provider) ? provider : provider.getAuthType();
            var authData = this.get("authData") || {};
            return !!authData[authType];
        },
        _logOutWithAll: function() {
            var authData = this.get("authData");
            if (!authData) return;
            var self = this;
            Parse._objectEach(this.get("authData"), function(value, key) {
                self._logOutWith(key);
            });
        },
        _logOutWith: function(provider) {
            if (!this.isCurrent()) return;
            _.isString(provider) && (provider = Parse.User._authProviders[provider]);
            provider && provider.deauthenticate && provider.deauthenticate();
        },
        signUp: function(attrs, options) {
            var error;
            options = options || {};
            var username = attrs && attrs.username || this.get("username");
            if (!username || "" === username) {
                error = new Parse.Error(Parse.Error.OTHER_CAUSE, "Cannot sign up user with an empty name.");
                options && options.error && options.error(this, error);
                return Parse.Promise.error(error);
            }
            var password = attrs && attrs.password || this.get("password");
            if (!password || "" === password) {
                error = new Parse.Error(Parse.Error.OTHER_CAUSE, "Cannot sign up user with an empty password.");
                options && options.error && options.error(this, error);
                return Parse.Promise.error(error);
            }
            var newOptions = _.clone(options);
            newOptions.success = function(model) {
                model._handleSaveResult(true);
                options.success && options.success.apply(this, arguments);
            };
            return this.save(attrs, newOptions);
        },
        logIn: function(options) {
            var model = this;
            options = options || {};
            var request = Parse._request({
                route: "login",
                method: "GET",
                useMasterKey: options.useMasterKey,
                data: this.toJSON()
            });
            return request.then(function(resp, status, xhr) {
                var serverAttrs = model.parse(resp, status, xhr);
                model._finishFetch(serverAttrs);
                model._handleSaveResult(true);
                return model;
            })._thenRunCallbacks(options, this);
        },
        save: function(arg1, arg2, arg3) {
            var attrs, options;
            if (_.isObject(arg1) || _.isNull(arg1) || _.isUndefined(arg1)) {
                attrs = arg1;
                options = arg2;
            } else {
                attrs = {};
                attrs[arg1] = arg2;
                options = arg3;
            }
            options = options || {};
            var newOptions = _.clone(options);
            newOptions.success = function(model) {
                model._handleSaveResult(false);
                options.success && options.success.apply(this, arguments);
            };
            return Parse.Object.prototype.save.call(this, attrs, newOptions);
        },
        fetch: function(options) {
            var newOptions = options ? _.clone(options) : {};
            newOptions.success = function(model) {
                model._handleSaveResult(false);
                options && options.success && options.success.apply(this, arguments);
            };
            return Parse.Object.prototype.fetch.call(this, newOptions);
        },
        isCurrent: function() {
            return this._isCurrentUser;
        },
        getUsername: function() {
            return this.get("username");
        },
        setUsername: function(username, options) {
            return this.set("username", username, options);
        },
        setPassword: function(password, options) {
            return this.set("password", password, options);
        },
        getEmail: function() {
            return this.get("email");
        },
        setEmail: function(email, options) {
            return this.set("email", email, options);
        },
        authenticated: function() {
            return !!this._sessionToken && Parse.User.current() && Parse.User.current().id === this.id;
        },
        getSessionToken: function() {
            return this._sessionToken;
        },
        _upgradeToRevocableSession: function(options) {
            options = options || {};
            if (!Parse.User.current()) return Parse.Promise.as()._thenRunCallbacks(options);
            var currentSession = Parse.User.current().getSessionToken();
            if (Parse.Session._isRevocable(currentSession)) return Parse.Promise.as()._thenRunCallbacks(options);
            return Parse._request({
                route: "upgradeToRevocableSession",
                method: "POST",
                useMasterKey: options.useMasterKey,
                sessionToken: currentSession
            }).then(function(result) {
                var session = new Parse.Session();
                session._finishFetch(result);
                var currentUser = Parse.User.current();
                currentUser._sessionToken = session.getSessionToken();
                Parse.User._saveCurrentUser(currentUser);
            })._thenRunCallbacks(options);
        }
    }, {
        _currentUser: null,
        _currentUserMatchesDisk: false,
        _CURRENT_USER_KEY: "currentUser",
        _authProviders: {},
        _performUserRewrite: true,
        _isRevocableSessionEnabled: false,
        signUp: function(username, password, attrs, options) {
            attrs = attrs || {};
            attrs.username = username;
            attrs.password = password;
            var user = Parse.Object._create("_User");
            return user.signUp(attrs, options);
        },
        logIn: function(username, password, options) {
            var user = Parse.Object._create("_User");
            user._finishFetch({
                username: username,
                password: password
            });
            return user.logIn(options);
        },
        become: function(sessionToken, options) {
            options = options || {};
            var user = Parse.Object._create("_User");
            return Parse._request({
                route: "users",
                className: "me",
                method: "GET",
                useMasterKey: options.useMasterKey,
                sessionToken: sessionToken
            }).then(function(resp, status, xhr) {
                var serverAttrs = user.parse(resp, status, xhr);
                user._finishFetch(serverAttrs);
                user._handleSaveResult(true);
                return user;
            })._thenRunCallbacks(options, user);
        },
        logOut: function() {
            return Parse.User._currentAsync().then(function(currentUser) {
                var promise = Parse.Storage.removeItemAsync(Parse._getParsePath(Parse.User._CURRENT_USER_KEY));
                if (null !== currentUser) {
                    var currentSession = currentUser.getSessionToken();
                    Parse.Session._isRevocable(currentSession) && promise.then(function() {
                        return Parse._request({
                            route: "logout",
                            method: "POST",
                            sessionToken: currentSession
                        });
                    });
                    currentUser._logOutWithAll();
                    currentUser._isCurrentUser = false;
                }
                Parse.User._currentUserMatchesDisk = true;
                Parse.User._currentUser = null;
                return promise;
            });
        },
        requestPasswordReset: function(email, options) {
            options = options || {};
            var request = Parse._request({
                route: "requestPasswordReset",
                method: "POST",
                useMasterKey: options.useMasterKey,
                data: {
                    email: email
                }
            });
            return request._thenRunCallbacks(options);
        },
        current: function() {
            if (Parse.Storage.async) {
                Parse.User._currentAsync();
                return Parse.User._currentUser;
            }
            if (Parse.User._currentUser) return Parse.User._currentUser;
            if (Parse.User._currentUserMatchesDisk) return Parse.User._currentUser;
            Parse.User._currentUserMatchesDisk = true;
            var userData = Parse.Storage.getItem(Parse._getParsePath(Parse.User._CURRENT_USER_KEY));
            if (!userData) return null;
            Parse.User._currentUser = Parse.Object._create("_User");
            Parse.User._currentUser._isCurrentUser = true;
            var json = JSON.parse(userData);
            Parse.User._currentUser.id = json._id;
            delete json._id;
            Parse.User._currentUser._sessionToken = json._sessionToken;
            delete json._sessionToken;
            Parse.User._currentUser._finishFetch(json);
            Parse.User._currentUser._synchronizeAllAuthData();
            Parse.User._currentUser._refreshCache();
            Parse.User._currentUser._opSetQueue = [ {} ];
            return Parse.User._currentUser;
        },
        _currentAsync: function() {
            if (Parse.User._currentUser) return Parse.Promise.as(Parse.User._currentUser);
            if (Parse.User._currentUserMatchesDisk) return Parse.Promise.as(Parse.User._currentUser);
            return Parse.Storage.getItemAsync(Parse._getParsePath(Parse.User._CURRENT_USER_KEY)).then(function(userData) {
                if (!userData) return null;
                Parse.User._currentUser = Parse.Object._create("_User");
                Parse.User._currentUser._isCurrentUser = true;
                var json = JSON.parse(userData);
                Parse.User._currentUser.id = json._id;
                delete json._id;
                Parse.User._currentUser._sessionToken = json._sessionToken;
                delete json._sessionToken;
                Parse.User._currentUser._finishFetch(json);
                Parse.User._currentUser._synchronizeAllAuthData();
                Parse.User._currentUser._refreshCache();
                Parse.User._currentUser._opSetQueue = [ {} ];
                return Parse.User._currentUser;
            });
        },
        allowCustomUserClass: function(isAllowed) {
            this._performUserRewrite = !isAllowed;
        },
        enableRevocableSession: function(options) {
            options = options || {};
            Parse.User._isRevocableSessionEnabled = true;
            if (!Parse._isNode && Parse.User.current()) return Parse.User.current()._upgradeToRevocableSession(options);
            return Parse.Promise.as()._thenRunCallbacks(options);
        },
        _saveCurrentUser: function(user) {
            null !== Parse.User._currentUser && Parse.User._currentUser !== user && Parse.User.logOut();
            user._isCurrentUser = true;
            Parse.User._currentUser = user;
            Parse.User._currentUserMatchesDisk = true;
            var json = user.toJSON();
            json._id = user.id;
            json._sessionToken = user._sessionToken;
            Parse.Storage.async ? Parse.Storage.setItemAsync(Parse._getParsePath(Parse.User._CURRENT_USER_KEY), JSON.stringify(json)) : Parse.Storage.setItem(Parse._getParsePath(Parse.User._CURRENT_USER_KEY), JSON.stringify(json));
        },
        _registerAuthenticationProvider: function(provider) {
            Parse.User._authProviders[provider.getAuthType()] = provider;
            Parse.User.current() && Parse.User.current()._synchronizeAuthData(provider.getAuthType());
        },
        _logInWith: function(provider, options) {
            var user = Parse.Object._create("_User");
            return user._linkWith(provider, options);
        }
    });
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    Parse.Session = Parse.Object.extend("_Session", {
        getSessionToken: function() {
            return this._sessionToken;
        },
        _mergeMagicFields: function(attrs) {
            if (attrs.sessionToken) {
                this._sessionToken = attrs.sessionToken;
                delete attrs.sessionToken;
            }
            Parse.Session.__super__._mergeMagicFields.call(this, attrs);
        }
    }, {
        readOnlyAttributes: {
            createdWith: true,
            expiresAt: true,
            installationId: true,
            restricted: true,
            sessionToken: true,
            user: true
        },
        current: function(options) {
            options = options || {};
            var session = Parse.Object._create("_Session");
            var currentToken = Parse.User.current().getSessionToken();
            return Parse._request({
                route: "sessions",
                className: "me",
                method: "GET",
                useMasterKey: options.useMasterKey,
                sessionToken: currentToken
            }).then(function(resp, status, xhr) {
                var serverAttrs = session.parse(resp, status, xhr);
                session._finishFetch(serverAttrs);
                return session;
            })._thenRunCallbacks(options, session);
        },
        _isRevocable: function(token) {
            return token.indexOf("r:") > -1;
        },
        isCurrentSessionRevocable: function() {
            if (null !== Parse.User.current()) return Parse.Session._isRevocable(Parse.User.current().getSessionToken());
        }
    });
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var _ = Parse._;
    Parse.Query = function(objectClass) {
        _.isString(objectClass) && (objectClass = Parse.Object._getSubclass(objectClass));
        this.objectClass = objectClass;
        this.className = objectClass.prototype.className;
        this._where = {};
        this._include = [];
        this._limit = -1;
        this._skip = 0;
        this._extraOptions = {};
    };
    Parse.Query.or = function() {
        var queries = _.toArray(arguments);
        var className = null;
        Parse._arrayEach(queries, function(q) {
            _.isNull(className) && (className = q.className);
            if (className !== q.className) throw "All queries must be for the same class";
        });
        var query = new Parse.Query(className);
        query._orQuery(queries);
        return query;
    };
    Parse.Query.prototype = {
        get: function(objectId, options) {
            var self = this;
            self.equalTo("objectId", objectId);
            var firstOptions = {};
            options && _.has(options, "useMasterKey") && (firstOptions = {
                useMasterKey: options.useMasterKey
            });
            return self.first(firstOptions).then(function(response) {
                if (response) return response;
                var errorObject = new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, "Object not found.");
                return Parse.Promise.error(errorObject);
            })._thenRunCallbacks(options, null);
        },
        toJSON: function() {
            var params = {
                where: this._where
            };
            this._include.length > 0 && (params.include = this._include.join(","));
            this._select && (params.keys = this._select.join(","));
            this._limit >= 0 && (params.limit = this._limit);
            this._skip > 0 && (params.skip = this._skip);
            void 0 !== this._order && (params.order = this._order.join(","));
            Parse._objectEach(this._extraOptions, function(v, k) {
                params[k] = v;
            });
            return params;
        },
        find: function(options) {
            var self = this;
            options = options || {};
            var request = Parse._request({
                route: "classes",
                className: this.className,
                method: "GET",
                useMasterKey: options.useMasterKey,
                data: this.toJSON()
            });
            return request.then(function(response) {
                return _.map(response.results, function(json) {
                    var obj;
                    obj = response.className ? new Parse.Object(response.className) : new self.objectClass();
                    obj._finishFetch(json, true);
                    return obj;
                });
            })._thenRunCallbacks(options);
        },
        count: function(options) {
            var self = this;
            options = options || {};
            var params = this.toJSON();
            params.limit = 0;
            params.count = 1;
            var request = Parse._request({
                route: "classes",
                className: self.className,
                method: "GET",
                useMasterKey: options.useMasterKey,
                data: params
            });
            return request.then(function(response) {
                return response.count;
            })._thenRunCallbacks(options);
        },
        first: function(options) {
            var self = this;
            options = options || {};
            var params = this.toJSON();
            params.limit = 1;
            var request = Parse._request({
                route: "classes",
                className: this.className,
                method: "GET",
                useMasterKey: options.useMasterKey,
                data: params
            });
            return request.then(function(response) {
                return _.map(response.results, function(json) {
                    var obj;
                    obj = response.className ? new Parse.Object(response.className) : new self.objectClass();
                    obj._finishFetch(json, true);
                    return obj;
                })[0];
            })._thenRunCallbacks(options);
        },
        collection: function(items, options) {
            options = options || {};
            return new Parse.Collection(items, _.extend(options, {
                model: this.objectClass,
                query: this
            }));
        },
        skip: function(n) {
            this._skip = n;
            return this;
        },
        limit: function(n) {
            this._limit = n;
            return this;
        },
        equalTo: function(key, value) {
            if (_.isUndefined(value)) return this.doesNotExist(key);
            this._where[key] = Parse._encode(value);
            return this;
        },
        _addCondition: function(key, condition, value) {
            this._where[key] || (this._where[key] = {});
            this._where[key][condition] = Parse._encode(value);
            return this;
        },
        notEqualTo: function(key, value) {
            this._addCondition(key, "$ne", value);
            return this;
        },
        lessThan: function(key, value) {
            this._addCondition(key, "$lt", value);
            return this;
        },
        greaterThan: function(key, value) {
            this._addCondition(key, "$gt", value);
            return this;
        },
        lessThanOrEqualTo: function(key, value) {
            this._addCondition(key, "$lte", value);
            return this;
        },
        greaterThanOrEqualTo: function(key, value) {
            this._addCondition(key, "$gte", value);
            return this;
        },
        containedIn: function(key, values) {
            this._addCondition(key, "$in", values);
            return this;
        },
        notContainedIn: function(key, values) {
            this._addCondition(key, "$nin", values);
            return this;
        },
        containsAll: function(key, values) {
            this._addCondition(key, "$all", values);
            return this;
        },
        exists: function(key) {
            this._addCondition(key, "$exists", true);
            return this;
        },
        doesNotExist: function(key) {
            this._addCondition(key, "$exists", false);
            return this;
        },
        matches: function(key, regex, modifiers) {
            this._addCondition(key, "$regex", regex);
            modifiers || (modifiers = "");
            regex.ignoreCase && (modifiers += "i");
            regex.multiline && (modifiers += "m");
            modifiers && modifiers.length && this._addCondition(key, "$options", modifiers);
            return this;
        },
        matchesQuery: function(key, query) {
            var queryJSON = query.toJSON();
            queryJSON.className = query.className;
            this._addCondition(key, "$inQuery", queryJSON);
            return this;
        },
        doesNotMatchQuery: function(key, query) {
            var queryJSON = query.toJSON();
            queryJSON.className = query.className;
            this._addCondition(key, "$notInQuery", queryJSON);
            return this;
        },
        matchesKeyInQuery: function(key, queryKey, query) {
            var queryJSON = query.toJSON();
            queryJSON.className = query.className;
            this._addCondition(key, "$select", {
                key: queryKey,
                query: queryJSON
            });
            return this;
        },
        doesNotMatchKeyInQuery: function(key, queryKey, query) {
            var queryJSON = query.toJSON();
            queryJSON.className = query.className;
            this._addCondition(key, "$dontSelect", {
                key: queryKey,
                query: queryJSON
            });
            return this;
        },
        _orQuery: function(queries) {
            var queryJSON = _.map(queries, function(q) {
                return q.toJSON().where;
            });
            this._where.$or = queryJSON;
            return this;
        },
        _quote: function(s) {
            return "\\Q" + s.replace("\\E", "\\E\\\\E\\Q") + "\\E";
        },
        contains: function(key, value) {
            this._addCondition(key, "$regex", this._quote(value));
            return this;
        },
        startsWith: function(key, value) {
            this._addCondition(key, "$regex", "^" + this._quote(value));
            return this;
        },
        endsWith: function(key, value) {
            this._addCondition(key, "$regex", this._quote(value) + "$");
            return this;
        },
        ascending: function() {
            this._order = [];
            return this.addAscending.apply(this, arguments);
        },
        addAscending: function() {
            var self = this;
            this._order || (this._order = []);
            Parse._arrayEach(arguments, function(key) {
                Array.isArray(key) && (key = key.join());
                self._order = self._order.concat(key.replace(/\s/g, "").split(","));
            });
            return this;
        },
        descending: function() {
            this._order = [];
            return this.addDescending.apply(this, arguments);
        },
        addDescending: function() {
            var self = this;
            this._order || (this._order = []);
            Parse._arrayEach(arguments, function(key) {
                Array.isArray(key) && (key = key.join());
                self._order = self._order.concat(_.map(key.replace(/\s/g, "").split(","), function(k) {
                    return "-" + k;
                }));
            });
            return this;
        },
        near: function(key, point) {
            point instanceof Parse.GeoPoint || (point = new Parse.GeoPoint(point));
            this._addCondition(key, "$nearSphere", point);
            return this;
        },
        withinRadians: function(key, point, distance) {
            this.near(key, point);
            this._addCondition(key, "$maxDistance", distance);
            return this;
        },
        withinMiles: function(key, point, distance) {
            return this.withinRadians(key, point, distance / 3958.8);
        },
        withinKilometers: function(key, point, distance) {
            return this.withinRadians(key, point, distance / 6371);
        },
        withinGeoBox: function(key, southwest, northeast) {
            southwest instanceof Parse.GeoPoint || (southwest = new Parse.GeoPoint(southwest));
            northeast instanceof Parse.GeoPoint || (northeast = new Parse.GeoPoint(northeast));
            this._addCondition(key, "$within", {
                $box: [ southwest, northeast ]
            });
            return this;
        },
        include: function() {
            var self = this;
            Parse._arrayEach(arguments, function(key) {
                _.isArray(key) ? self._include = self._include.concat(key) : self._include.push(key);
            });
            return this;
        },
        select: function() {
            var self = this;
            this._select = this._select || [];
            Parse._arrayEach(arguments, function(key) {
                _.isArray(key) ? self._select = self._select.concat(key) : self._select.push(key);
            });
            return this;
        },
        each: function(callback, options) {
            options = options || {};
            if (this._order || this._skip || this._limit >= 0) {
                var error = "Cannot iterate on a query with sort, skip, or limit.";
                return Parse.Promise.error(error)._thenRunCallbacks(options);
            }
            new Parse.Promise();
            var query = new Parse.Query(this.objectClass);
            query._limit = options.batchSize || 100;
            query._where = _.clone(this._where);
            query._include = _.clone(this._include);
            this._select && (query._select = _.clone(this._select));
            query.ascending("objectId");
            var findOptions = {};
            _.has(options, "useMasterKey") && (findOptions.useMasterKey = options.useMasterKey);
            var finished = false;
            return Parse.Promise._continueWhile(function() {
                return !finished;
            }, function() {
                return query.find(findOptions).then(function(results) {
                    var callbacksDone = Parse.Promise.as();
                    Parse._.each(results, function(result) {
                        callbacksDone = callbacksDone.then(function() {
                            return callback(result);
                        });
                    });
                    return callbacksDone.then(function() {
                        results.length >= query._limit ? query.greaterThan("objectId", results[results.length - 1].id) : finished = true;
                    });
                });
            })._thenRunCallbacks(options);
        }
    };
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var _ = Parse._;
    var initialized = false;
    var requestedPermissions;
    var initOptions;
    var provider = {
        authenticate: function(options) {
            var self = this;
            FB.login(function(response) {
                response.authResponse ? options.success && options.success(self, {
                    id: response.authResponse.userID,
                    access_token: response.authResponse.accessToken,
                    expiration_date: new Date(1e3 * response.authResponse.expiresIn + new Date().getTime()).toJSON()
                }) : options.error && options.error(self, response);
            }, {
                scope: requestedPermissions
            });
        },
        restoreAuthentication: function(authData) {
            if (authData) {
                var authResponse = {
                    userID: authData.id,
                    accessToken: authData.access_token,
                    expiresIn: (Parse._parseDate(authData.expiration_date).getTime() - new Date().getTime()) / 1e3
                };
                var newOptions = _.clone(initOptions);
                newOptions.authResponse = authResponse;
                newOptions.status = false;
                var existingResponse = FB.getAuthResponse();
                existingResponse && existingResponse.userID !== authResponse.userID && FB.logout();
                FB.init(newOptions);
            }
            return true;
        },
        getAuthType: function() {
            return "facebook";
        },
        deauthenticate: function() {
            this.restoreAuthentication(null);
        }
    };
    Parse.FacebookUtils = {
        init: function(options) {
            if ("undefined" == typeof FB) throw "The Facebook JavaScript SDK must be loaded before calling init.";
            initOptions = _.clone(options) || {};
            if (initOptions.status && "undefined" != typeof console) {
                var warn = console.warn || console.log || function() {};
                warn.call(console, "The 'status' flag passed into FB.init, when set to true, can interfere with Parse Facebook integration, so it has been suppressed. Please call FB.getLoginStatus() explicitly if you require this behavior.");
            }
            initOptions.status = false;
            FB.init(initOptions);
            Parse.User._registerAuthenticationProvider(provider);
            initialized = true;
        },
        isLinked: function(user) {
            return user._isLinked("facebook");
        },
        logIn: function(permissions, options) {
            if (!permissions || _.isString(permissions)) {
                if (!initialized) throw "You must initialize FacebookUtils before calling logIn.";
                requestedPermissions = permissions;
                return Parse.User._logInWith("facebook", options);
            }
            var newOptions = _.clone(options) || {};
            newOptions.authData = permissions;
            return Parse.User._logInWith("facebook", newOptions);
        },
        link: function(user, permissions, options) {
            if (!permissions || _.isString(permissions)) {
                if (!initialized) throw "You must initialize FacebookUtils before calling link.";
                requestedPermissions = permissions;
                return user._linkWith("facebook", options);
            }
            var newOptions = _.clone(options) || {};
            newOptions.authData = permissions;
            return user._linkWith("facebook", newOptions);
        },
        unlink: function(user, options) {
            if (!initialized) throw "You must initialize FacebookUtils before calling unlink.";
            return user._unlinkFrom("facebook", options);
        }
    };
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var _ = Parse._;
    Parse.History = function() {
        this.handlers = [];
        _.bindAll(this, "checkUrl");
    };
    var routeStripper = /^[#\/]/;
    var isExplorer = /msie [\w.]+/;
    Parse.History.started = false;
    _.extend(Parse.History.prototype, Parse.Events, {
        interval: 50,
        getHash: function(windowOverride) {
            var loc = windowOverride ? windowOverride.location : window.location;
            var match = loc.href.match(/#(.*)$/);
            return match ? match[1] : "";
        },
        getFragment: function(fragment, forcePushState) {
            if (Parse._isNullOrUndefined(fragment)) if (this._hasPushState || forcePushState) {
                fragment = window.location.pathname;
                var search = window.location.search;
                search && (fragment += search);
            } else fragment = this.getHash();
            fragment.indexOf(this.options.root) || (fragment = fragment.substr(this.options.root.length));
            return fragment.replace(routeStripper, "");
        },
        start: function(options) {
            if (Parse.History.started) throw new Error("Parse.history has already been started");
            Parse.History.started = true;
            this.options = _.extend({}, {
                root: "/"
            }, this.options, options);
            this._wantsHashChange = false !== this.options.hashChange;
            this._wantsPushState = !!this.options.pushState;
            this._hasPushState = !!(this.options.pushState && window.history && window.history.pushState);
            var fragment = this.getFragment();
            var docMode = document.documentMode;
            var oldIE = isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || 7 >= docMode);
            if (oldIE) {
                this.iframe = Parse.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow;
                this.navigate(fragment);
            }
            this._hasPushState ? Parse.$(window).bind("popstate", this.checkUrl) : this._wantsHashChange && "onhashchange" in window && !oldIE ? Parse.$(window).bind("hashchange", this.checkUrl) : this._wantsHashChange && (this._checkUrlInterval = window.setInterval(this.checkUrl, this.interval));
            this.fragment = fragment;
            var loc = window.location;
            var atRoot = loc.pathname === this.options.root;
            if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
                this.fragment = this.getFragment(null, true);
                window.location.replace(this.options.root + "#" + this.fragment);
                return true;
            }
            if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
                this.fragment = this.getHash().replace(routeStripper, "");
                window.history.replaceState({}, document.title, loc.protocol + "//" + loc.host + this.options.root + this.fragment);
            }
            if (!this.options.silent) return this.loadUrl();
        },
        stop: function() {
            Parse.$(window).unbind("popstate", this.checkUrl).unbind("hashchange", this.checkUrl);
            window.clearInterval(this._checkUrlInterval);
            Parse.History.started = false;
        },
        route: function(route, callback) {
            this.handlers.unshift({
                route: route,
                callback: callback
            });
        },
        checkUrl: function() {
            var current = this.getFragment();
            current === this.fragment && this.iframe && (current = this.getFragment(this.getHash(this.iframe)));
            if (current === this.fragment) return false;
            this.iframe && this.navigate(current);
            this.loadUrl() || this.loadUrl(this.getHash());
        },
        loadUrl: function(fragmentOverride) {
            var fragment = this.fragment = this.getFragment(fragmentOverride);
            var matched = _.any(this.handlers, function(handler) {
                if (handler.route.test(fragment)) {
                    handler.callback(fragment);
                    return true;
                }
            });
            return matched;
        },
        navigate: function(fragment, options) {
            if (!Parse.History.started) return false;
            options && true !== options || (options = {
                trigger: options
            });
            var frag = (fragment || "").replace(routeStripper, "");
            if (this.fragment === frag) return;
            if (this._hasPushState) {
                0 !== frag.indexOf(this.options.root) && (frag = this.options.root + frag);
                this.fragment = frag;
                var replaceOrPush = options.replace ? "replaceState" : "pushState";
                window.history[replaceOrPush]({}, document.title, frag);
            } else if (this._wantsHashChange) {
                this.fragment = frag;
                this._updateHash(window.location, frag, options.replace);
                if (this.iframe && frag !== this.getFragment(this.getHash(this.iframe))) {
                    options.replace || this.iframe.document.open().close();
                    this._updateHash(this.iframe.location, frag, options.replace);
                }
            } else window.location.assign(this.options.root + fragment);
            options.trigger && this.loadUrl(fragment);
        },
        _updateHash: function(location, fragment, replace) {
            if (replace) {
                var s = location.toString().replace(/(javascript:|#).*$/, "");
                location.replace(s + "#" + fragment);
            } else location.hash = fragment;
        }
    });
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var _ = Parse._;
    Parse.Router = function(options) {
        options = options || {};
        options.routes && (this.routes = options.routes);
        this._bindRoutes();
        this.initialize.apply(this, arguments);
    };
    var namedParam = /:\w+/g;
    var splatParam = /\*\w+/g;
    var escapeRegExp = /[\-\[\]{}()+?.,\\\^\$\|#\s]/g;
    _.extend(Parse.Router.prototype, Parse.Events, {
        initialize: function() {},
        route: function(route, name, callback) {
            Parse.history = Parse.history || new Parse.History();
            _.isRegExp(route) || (route = this._routeToRegExp(route));
            callback || (callback = this[name]);
            Parse.history.route(route, _.bind(function(fragment) {
                var args = this._extractParameters(route, fragment);
                callback && callback.apply(this, args);
                this.trigger.apply(this, [ "route:" + name ].concat(args));
                Parse.history.trigger("route", this, name, args);
            }, this));
            return this;
        },
        navigate: function(fragment, options) {
            Parse.history.navigate(fragment, options);
        },
        _bindRoutes: function() {
            if (!this.routes) return;
            var routes = [];
            for (var route in this.routes) this.routes.hasOwnProperty(route) && routes.unshift([ route, this.routes[route] ]);
            for (var i = 0, l = routes.length; l > i; i++) this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
        },
        _routeToRegExp: function(route) {
            route = route.replace(escapeRegExp, "\\$&").replace(namedParam, "([^/]+)").replace(splatParam, "(.*?)");
            return new RegExp("^" + route + "$");
        },
        _extractParameters: function(route, fragment) {
            return route.exec(fragment).slice(1);
        }
    });
    Parse.Router.extend = Parse._extend;
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    var _ = Parse._;
    Parse.Cloud = Parse.Cloud || {};
    _.extend(Parse.Cloud, {
        run: function(name, data, options) {
            options = options || {};
            var request = Parse._request({
                route: "functions",
                className: name,
                method: "POST",
                useMasterKey: options.useMasterKey,
                data: Parse._encode(data, null, true)
            });
            return request.then(function(resp) {
                return Parse._decode(null, resp).result;
            })._thenRunCallbacks(options);
        }
    });
}(this);

!function(root) {
    root.Parse = root.Parse || {};
    var Parse = root.Parse;
    Parse.Installation = Parse.Object.extend("_Installation");
    Parse.Push = Parse.Push || {};
    Parse.Push.send = function(data, options) {
        options = options || {};
        data.where && (data.where = data.where.toJSON().where);
        data.push_time && (data.push_time = data.push_time.toJSON());
        data.expiration_time && (data.expiration_time = data.expiration_time.toJSON());
        if (data.expiration_time && data.expiration_interval) throw "Both expiration_time and expiration_interval can't be set";
        var request = Parse._request({
            route: "push",
            method: "POST",
            data: data,
            useMasterKey: options.useMasterKey
        });
        return request._thenRunCallbacks(options);
    };
}(this);
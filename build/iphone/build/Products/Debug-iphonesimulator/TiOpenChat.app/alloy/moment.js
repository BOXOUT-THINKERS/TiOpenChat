(function(undefined) {
    function dfl(a, b, c) {
        switch (arguments.length) {
          case 2:
            return null != a ? a : b;

          case 3:
            return null != a ? a : null != b ? b : c;

          default:
            throw new Error("Implement me");
        }
    }
    function defaultParsingFlags() {
        return {
            empty: false,
            unusedTokens: [],
            unusedInput: [],
            overflow: -2,
            charsLeftOver: 0,
            nullInput: false,
            invalidMonth: null,
            invalidFormat: false,
            userInvalidated: false,
            iso: false
        };
    }
    function deprecate(msg, fn) {
        function printMsg() {
            false === moment.suppressDeprecationWarnings && "undefined" != typeof console && console.warn && console.warn("Deprecation warning: " + msg);
        }
        var firstTime = true;
        return extend(function() {
            if (firstTime) {
                printMsg();
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }
    function padToken(func, count) {
        return function(a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func, period) {
        return function(a) {
            return this.lang().ordinal(func.call(this, a), period);
        };
    }
    function Language() {}
    function Moment(config) {
        checkOverflow(config);
        extend(this, config);
    }
    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration), years = normalizedInput.year || 0, quarters = normalizedInput.quarter || 0, months = normalizedInput.month || 0, weeks = normalizedInput.week || 0, days = normalizedInput.day || 0, hours = normalizedInput.hour || 0, minutes = normalizedInput.minute || 0, seconds = normalizedInput.second || 0, milliseconds = normalizedInput.millisecond || 0;
        this._milliseconds = +milliseconds + 1e3 * seconds + 6e4 * minutes + 36e5 * hours;
        this._days = +days + 7 * weeks;
        this._months = +months + 3 * quarters + 12 * years;
        this._data = {};
        this._bubble();
    }
    function extend(a, b) {
        for (var i in b) b.hasOwnProperty(i) && (a[i] = b[i]);
        b.hasOwnProperty("toString") && (a.toString = b.toString);
        b.hasOwnProperty("valueOf") && (a.valueOf = b.valueOf);
        return a;
    }
    function cloneMoment(m) {
        var i, result = {};
        for (i in m) m.hasOwnProperty(i) && momentProperties.hasOwnProperty(i) && (result[i] = m[i]);
        return result;
    }
    function absRound(number) {
        return 0 > number ? Math.ceil(number) : Math.floor(number);
    }
    function leftZeroFill(number, targetLength, forceSign) {
        var output = "" + Math.abs(number), sign = number >= 0;
        while (output.length < targetLength) output = "0" + output;
        return (sign ? forceSign ? "+" : "" : "-") + output;
    }
    function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds, days = duration._days, months = duration._months;
        updateOffset = null == updateOffset ? true : updateOffset;
        milliseconds && mom._d.setTime(+mom._d + milliseconds * isAdding);
        days && rawSetter(mom, "Date", rawGetter(mom, "Date") + days * isAdding);
        months && rawMonthSetter(mom, rawGetter(mom, "Month") + months * isAdding);
        updateOffset && moment.updateOffset(mom, days || months);
    }
    function isArray(input) {
        return "[object Array]" === Object.prototype.toString.call(input);
    }
    function isDate(input) {
        return "[object Date]" === Object.prototype.toString.call(input) || input instanceof Date;
    }
    function compareArrays(array1, array2, dontConvert) {
        var i, len = Math.min(array1.length, array2.length), lengthDiff = Math.abs(array1.length - array2.length), diffs = 0;
        for (i = 0; len > i; i++) (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) && diffs++;
        return diffs + lengthDiff;
    }
    function normalizeUnits(units) {
        if (units) {
            var lowered = units.toLowerCase().replace(/(.)s$/, "$1");
            units = unitAliases[units] || camelFunctions[lowered] || lowered;
        }
        return units;
    }
    function normalizeObjectUnits(inputObject) {
        var normalizedProp, prop, normalizedInput = {};
        for (prop in inputObject) if (inputObject.hasOwnProperty(prop)) {
            normalizedProp = normalizeUnits(prop);
            normalizedProp && (normalizedInput[normalizedProp] = inputObject[prop]);
        }
        return normalizedInput;
    }
    function makeList(field) {
        var count, setter;
        if (0 === field.indexOf("week")) {
            count = 7;
            setter = "day";
        } else {
            if (0 !== field.indexOf("month")) return;
            count = 12;
            setter = "month";
        }
        moment[field] = function(format, index) {
            var i, getter, method = moment.fn._lang[field], results = [];
            if ("number" == typeof format) {
                index = format;
                format = undefined;
            }
            getter = function(i) {
                var m = moment().utc().set(setter, i);
                return method.call(moment.fn._lang, m, format || "");
            };
            if (null != index) return getter(index);
            for (i = 0; count > i; i++) results.push(getter(i));
            return results;
        };
    }
    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion, value = 0;
        0 !== coercedNumber && isFinite(coercedNumber) && (value = coercedNumber >= 0 ? Math.floor(coercedNumber) : Math.ceil(coercedNumber));
        return value;
    }
    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }
    function weeksInYear(year, dow, doy) {
        return weekOfYear(moment([ year, 11, 31 + dow - doy ]), dow, doy).week;
    }
    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }
    function isLeapYear(year) {
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
    }
    function checkOverflow(m) {
        var overflow;
        if (m._a && -2 === m._pf.overflow) {
            overflow = m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH : m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE : m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR : m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE : m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND : m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND : -1;
            m._pf._overflowDayOfYear && (YEAR > overflow || overflow > DATE) && (overflow = DATE);
            m._pf.overflow = overflow;
        }
    }
    function isValid(m) {
        if (null == m._isValid) {
            m._isValid = !isNaN(m._d.getTime()) && m._pf.overflow < 0 && !m._pf.empty && !m._pf.invalidMonth && !m._pf.nullInput && !m._pf.invalidFormat && !m._pf.userInvalidated;
            m._strict && (m._isValid = m._isValid && 0 === m._pf.charsLeftOver && 0 === m._pf.unusedTokens.length);
        }
        return m._isValid;
    }
    function normalizeLanguage(key) {
        return key ? key.toLowerCase().replace("_", "-") : key;
    }
    function makeAs(input, model) {
        return model._isUTC ? moment(input).zone(model._offset || 0) : moment(input).local();
    }
    function loadLang(key, values) {
        values.abbr = key;
        languages[key] || (languages[key] = new Language());
        languages[key].set(values);
        return languages[key];
    }
    function unloadLang(key) {
        delete languages[key];
    }
    function getLangDefinition(key) {
        var j, lang, next, split, i = 0, get = function(k) {
            if (!languages[k] && hasModule) try {
                loadLang(k, require("alloy/moment/lang/" + k));
            } catch (e) {
                return moment.fn._lang;
            }
            return languages[k];
        };
        if (!key) return moment.fn._lang;
        if (!isArray(key)) {
            lang = get(key);
            if (lang) return lang;
            key = [ key ];
        }
        while (i < key.length) {
            split = normalizeLanguage(key[i]).split("-");
            j = split.length;
            next = normalizeLanguage(key[i + 1]);
            next = next ? next.split("-") : null;
            while (j > 0) {
                lang = get(split.slice(0, j).join("-"));
                if (lang) return lang;
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) break;
                j--;
            }
            i++;
        }
        return moment.fn._lang;
    }
    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) return input.replace(/^\[|\]$/g, "");
        return input.replace(/\\/g, "");
    }
    function makeFormatFunction(format) {
        var i, length, array = format.match(formattingTokens);
        for (i = 0, length = array.length; length > i; i++) array[i] = formatTokenFunctions[array[i]] ? formatTokenFunctions[array[i]] : removeFormattingTokens(array[i]);
        return function(mom) {
            var output = "";
            for (i = 0; length > i; i++) output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            return output;
        };
    }
    function formatMoment(m, format) {
        if (!m.isValid()) return m.lang().invalidDate();
        format = expandFormat(format, m.lang());
        formatFunctions[format] || (formatFunctions[format] = makeFormatFunction(format));
        return formatFunctions[format](m);
    }
    function expandFormat(format, lang) {
        function replaceLongDateFormatTokens(input) {
            return lang.longDateFormat(input) || input;
        }
        var i = 5;
        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }
        return format;
    }
    function getParseRegexForToken(token, config) {
        var a, strict = config._strict;
        switch (token) {
          case "Q":
            return parseTokenOneDigit;

          case "DDDD":
            return parseTokenThreeDigits;

          case "YYYY":
          case "GGGG":
          case "gggg":
            return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;

          case "Y":
          case "G":
          case "g":
            return parseTokenSignedNumber;

          case "YYYYYY":
          case "YYYYY":
          case "GGGGG":
          case "ggggg":
            return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;

          case "S":
            if (strict) return parseTokenOneDigit;

          case "SS":
            if (strict) return parseTokenTwoDigits;

          case "SSS":
            if (strict) return parseTokenThreeDigits;

          case "DDD":
            return parseTokenOneToThreeDigits;

          case "MMM":
          case "MMMM":
          case "dd":
          case "ddd":
          case "dddd":
            return parseTokenWord;

          case "a":
          case "A":
            return getLangDefinition(config._l)._meridiemParse;

          case "X":
            return parseTokenTimestampMs;

          case "Z":
          case "ZZ":
            return parseTokenTimezone;

          case "T":
            return parseTokenT;

          case "SSSS":
            return parseTokenDigits;

          case "MM":
          case "DD":
          case "YY":
          case "GG":
          case "gg":
          case "HH":
          case "hh":
          case "mm":
          case "ss":
          case "ww":
          case "WW":
            return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;

          case "M":
          case "D":
          case "d":
          case "H":
          case "h":
          case "m":
          case "s":
          case "w":
          case "W":
          case "e":
          case "E":
            return parseTokenOneOrTwoDigits;

          case "Do":
            return parseTokenOrdinal;

          default:
            a = new RegExp(regexpEscape(unescapeFormat(token.replace("\\", "")), "i"));
            return a;
        }
    }
    function timezoneMinutesFromString(string) {
        string = string || "";
        var possibleTzMatches = string.match(parseTokenTimezone) || [], tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [], parts = (tzChunk + "").match(parseTimezoneChunker) || [ "-", 0, 0 ], minutes = +(60 * parts[1]) + toInt(parts[2]);
        return "+" === parts[0] ? -minutes : minutes;
    }
    function addTimeToArrayFromToken(token, input, config) {
        var a, datePartArray = config._a;
        switch (token) {
          case "Q":
            null != input && (datePartArray[MONTH] = 3 * (toInt(input) - 1));
            break;

          case "M":
          case "MM":
            null != input && (datePartArray[MONTH] = toInt(input) - 1);
            break;

          case "MMM":
          case "MMMM":
            a = getLangDefinition(config._l).monthsParse(input);
            null != a ? datePartArray[MONTH] = a : config._pf.invalidMonth = input;
            break;

          case "D":
          case "DD":
            null != input && (datePartArray[DATE] = toInt(input));
            break;

          case "Do":
            null != input && (datePartArray[DATE] = toInt(parseInt(input, 10)));
            break;

          case "DDD":
          case "DDDD":
            null != input && (config._dayOfYear = toInt(input));
            break;

          case "YY":
            datePartArray[YEAR] = moment.parseTwoDigitYear(input);
            break;

          case "YYYY":
          case "YYYYY":
          case "YYYYYY":
            datePartArray[YEAR] = toInt(input);
            break;

          case "a":
          case "A":
            config._isPm = getLangDefinition(config._l).isPM(input);
            break;

          case "H":
          case "HH":
          case "h":
          case "hh":
            datePartArray[HOUR] = toInt(input);
            break;

          case "m":
          case "mm":
            datePartArray[MINUTE] = toInt(input);
            break;

          case "s":
          case "ss":
            datePartArray[SECOND] = toInt(input);
            break;

          case "S":
          case "SS":
          case "SSS":
          case "SSSS":
            datePartArray[MILLISECOND] = toInt(1e3 * ("0." + input));
            break;

          case "X":
            config._d = new Date(1e3 * parseFloat(input));
            break;

          case "Z":
          case "ZZ":
            config._useUTC = true;
            config._tzm = timezoneMinutesFromString(input);
            break;

          case "dd":
          case "ddd":
          case "dddd":
            a = getLangDefinition(config._l).weekdaysParse(input);
            if (null != a) {
                config._w = config._w || {};
                config._w["d"] = a;
            } else config._pf.invalidWeekday = input;
            break;

          case "w":
          case "ww":
          case "W":
          case "WW":
          case "d":
          case "e":
          case "E":
            token = token.substr(0, 1);

          case "gggg":
          case "GGGG":
          case "GGGGG":
            token = token.substr(0, 2);
            if (input) {
                config._w = config._w || {};
                config._w[token] = toInt(input);
            }
            break;

          case "gg":
          case "GG":
            config._w = config._w || {};
            config._w[token] = moment.parseTwoDigitYear(input);
        }
    }
    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, lang;
        w = config._w;
        if (null != w.GG || null != w.W || null != w.E) {
            dow = 1;
            doy = 4;
            weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);
            week = dfl(w.W, 1);
            weekday = dfl(w.E, 1);
        } else {
            lang = getLangDefinition(config._l);
            dow = lang._week.dow;
            doy = lang._week.doy;
            weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);
            week = dfl(w.w, 1);
            if (null != w.d) {
                weekday = w.d;
                dow > weekday && ++week;
            } else weekday = null != w.e ? w.e + dow : dow;
        }
        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);
        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }
    function dateFromConfig(config) {
        var i, date, currentDate, yearToUse, input = [];
        if (config._d) return;
        currentDate = currentDateArray(config);
        config._w && null == config._a[DATE] && null == config._a[MONTH] && dayOfYearFromWeekInfo(config);
        if (config._dayOfYear) {
            yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);
            config._dayOfYear > daysInYear(yearToUse) && (config._pf._overflowDayOfYear = true);
            date = makeUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }
        for (i = 0; 3 > i && null == config._a[i]; ++i) config._a[i] = input[i] = currentDate[i];
        for (;7 > i; i++) config._a[i] = input[i] = null == config._a[i] ? 2 === i ? 1 : 0 : config._a[i];
        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
        null != config._tzm && config._d.setUTCMinutes(config._d.getUTCMinutes() + config._tzm);
    }
    function dateFromObject(config) {
        var normalizedInput;
        if (config._d) return;
        normalizedInput = normalizeObjectUnits(config._i);
        config._a = [ normalizedInput.year, normalizedInput.month, normalizedInput.day, normalizedInput.hour, normalizedInput.minute, normalizedInput.second, normalizedInput.millisecond ];
        dateFromConfig(config);
    }
    function currentDateArray(config) {
        var now = new Date();
        return config._useUTC ? [ now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() ] : [ now.getFullYear(), now.getMonth(), now.getDate() ];
    }
    function makeDateFromStringAndFormat(config) {
        if (config._f === moment.ISO_8601) {
            parseISO(config);
            return;
        }
        config._a = [];
        config._pf.empty = true;
        var i, parsedInput, tokens, token, skipped, lang = getLangDefinition(config._l), string = "" + config._i, stringLength = string.length, totalParsedInputLength = 0;
        tokens = expandFormat(config._f, lang).match(formattingTokens) || [];
        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                skipped.length > 0 && config._pf.unusedInput.push(skipped);
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            if (formatTokenFunctions[token]) {
                parsedInput ? config._pf.empty = false : config._pf.unusedTokens.push(token);
                addTimeToArrayFromToken(token, parsedInput, config);
            } else config._strict && !parsedInput && config._pf.unusedTokens.push(token);
        }
        config._pf.charsLeftOver = stringLength - totalParsedInputLength;
        string.length > 0 && config._pf.unusedInput.push(string);
        config._isPm && config._a[HOUR] < 12 && (config._a[HOUR] += 12);
        false === config._isPm && 12 === config._a[HOUR] && (config._a[HOUR] = 0);
        dateFromConfig(config);
        checkOverflow(config);
    }
    function unescapeFormat(s) {
        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function(matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        });
    }
    function regexpEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    }
    function makeDateFromStringAndArray(config) {
        var tempConfig, bestMoment, scoreToBeat, i, currentScore;
        if (0 === config._f.length) {
            config._pf.invalidFormat = true;
            config._d = new Date(0/0);
            return;
        }
        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = extend({}, config);
            tempConfig._pf = defaultParsingFlags();
            tempConfig._f = config._f[i];
            makeDateFromStringAndFormat(tempConfig);
            if (!isValid(tempConfig)) continue;
            currentScore += tempConfig._pf.charsLeftOver;
            currentScore += 10 * tempConfig._pf.unusedTokens.length;
            tempConfig._pf.score = currentScore;
            if (null == scoreToBeat || scoreToBeat > currentScore) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }
        extend(config, bestMoment || tempConfig);
    }
    function parseISO(config) {
        var i, l, string = config._i, match = isoRegex.exec(string);
        if (match) {
            config._pf.iso = true;
            for (i = 0, l = isoDates.length; l > i; i++) if (isoDates[i][1].exec(string)) {
                config._f = isoDates[i][0] + (match[6] || " ");
                break;
            }
            for (i = 0, l = isoTimes.length; l > i; i++) if (isoTimes[i][1].exec(string)) {
                config._f += isoTimes[i][0];
                break;
            }
            string.match(parseTokenTimezone) && (config._f += "Z");
            makeDateFromStringAndFormat(config);
        } else config._isValid = false;
    }
    function makeDateFromString(config) {
        parseISO(config);
        if (false === config._isValid) {
            delete config._isValid;
            moment.createFromInputFallback(config);
        }
    }
    function makeDateFromInput(config) {
        var input = config._i, matched = aspNetJsonRegex.exec(input);
        if (input === undefined) config._d = new Date(); else if (matched) config._d = new Date(+matched[1]); else if ("string" == typeof input) makeDateFromString(config); else if (isArray(input)) {
            config._a = input.slice(0);
            dateFromConfig(config);
        } else isDate(input) ? config._d = new Date(+input) : "object" == typeof input ? dateFromObject(config) : "number" == typeof input ? config._d = new Date(input) : moment.createFromInputFallback(config);
    }
    function makeDate(y, m, d, h, M, s, ms) {
        var date = new Date(y, m, d, h, M, s, ms);
        1970 > y && date.setFullYear(y);
        return date;
    }
    function makeUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        1970 > y && date.setUTCFullYear(y);
        return date;
    }
    function parseWeekday(input, language) {
        if ("string" == typeof input) if (isNaN(input)) {
            input = language.weekdaysParse(input);
            if ("number" != typeof input) return null;
        } else input = parseInt(input, 10);
        return input;
    }
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
        return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }
    function relativeTime(milliseconds, withoutSuffix, lang) {
        var seconds = round(Math.abs(milliseconds) / 1e3), minutes = round(seconds / 60), hours = round(minutes / 60), days = round(hours / 24), years = round(days / 365), args = seconds < relativeTimeThresholds.s && [ "s", seconds ] || 1 === minutes && [ "m" ] || minutes < relativeTimeThresholds.m && [ "mm", minutes ] || 1 === hours && [ "h" ] || hours < relativeTimeThresholds.h && [ "hh", hours ] || 1 === days && [ "d" ] || days <= relativeTimeThresholds.dd && [ "dd", days ] || days <= relativeTimeThresholds.dm && [ "M" ] || days < relativeTimeThresholds.dy && [ "MM", round(days / 30) ] || 1 === years && [ "y" ] || [ "yy", years ];
        args[2] = withoutSuffix;
        args[3] = milliseconds > 0;
        args[4] = lang;
        return substituteTimeAgo.apply({}, args);
    }
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var adjustedMoment, end = firstDayOfWeekOfYear - firstDayOfWeek, daysToDayOfWeek = firstDayOfWeekOfYear - mom.day();
        daysToDayOfWeek > end && (daysToDayOfWeek -= 7);
        end - 7 > daysToDayOfWeek && (daysToDayOfWeek += 7);
        adjustedMoment = moment(mom).add("d", daysToDayOfWeek);
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var daysToAdd, dayOfYear, d = makeUTCDate(year, 0, 1).getUTCDay();
        d = 0 === d ? 7 : d;
        weekday = null != weekday ? weekday : firstDayOfWeek;
        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (firstDayOfWeek > d ? 7 : 0);
        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;
        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ? dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }
    function makeMoment(config) {
        var input = config._i, format = config._f;
        if (null === input || format === undefined && "" === input) return moment.invalid({
            nullInput: true
        });
        "string" == typeof input && (config._i = input = getLangDefinition().preparse(input));
        if (moment.isMoment(input)) {
            config = cloneMoment(input);
            config._d = new Date(+input._d);
        } else format ? isArray(format) ? makeDateFromStringAndArray(config) : makeDateFromStringAndFormat(config) : makeDateFromInput(config);
        return new Moment(config);
    }
    function pickBy(fn, moments) {
        var res, i;
        1 === moments.length && isArray(moments[0]) && (moments = moments[0]);
        if (!moments.length) return moment();
        res = moments[0];
        for (i = 1; i < moments.length; ++i) moments[i][fn](res) && (res = moments[i]);
        return res;
    }
    function rawMonthSetter(mom, value) {
        var dayOfMonth;
        if ("string" == typeof value) {
            value = mom.lang().monthsParse(value);
            if ("number" != typeof value) return mom;
        }
        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d["set" + (mom._isUTC ? "UTC" : "") + "Month"](value, dayOfMonth);
        return mom;
    }
    function rawGetter(mom, unit) {
        return mom._d["get" + (mom._isUTC ? "UTC" : "") + unit]();
    }
    function rawSetter(mom, unit, value) {
        return "Month" === unit ? rawMonthSetter(mom, value) : mom._d["set" + (mom._isUTC ? "UTC" : "") + unit](value);
    }
    function makeAccessor(unit, keepTime) {
        return function(value) {
            if (null != value) {
                rawSetter(this, unit, value);
                moment.updateOffset(this, keepTime);
                return this;
            }
            return rawGetter(this, unit);
        };
    }
    function makeDurationGetter(name) {
        moment.duration.fn[name] = function() {
            return this._data[name];
        };
    }
    function makeDurationAsGetter(name, factor) {
        moment.duration.fn["as" + name] = function() {
            return +this / factor;
        };
    }
    function makeGlobal(shouldDeprecate) {
        if ("undefined" != typeof ender) return;
        oldGlobalMoment = globalScope.moment;
        globalScope.moment = shouldDeprecate ? deprecate("Accessing Moment through the global scope is deprecated, and will be removed in an upcoming release.", moment) : moment;
    }
    var moment, oldGlobalMoment, i, VERSION = "2.7.0", globalScope = "undefined" != typeof global ? global : this, round = Math.round, YEAR = 0, MONTH = 1, DATE = 2, HOUR = 3, MINUTE = 4, SECOND = 5, MILLISECOND = 6, languages = {}, momentProperties = {
        _isAMomentObject: null,
        _i: null,
        _f: null,
        _l: null,
        _strict: null,
        _tzm: null,
        _isUTC: null,
        _offset: null,
        _pf: null,
        _lang: null
    }, hasModule = "undefined" != typeof module && module.exports, aspNetJsonRegex = /^\/?Date\((\-?\d+)/i, aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/, isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/, formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g, localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g, parseTokenOneOrTwoDigits = /\d\d?/, parseTokenOneToThreeDigits = /\d{1,3}/, parseTokenOneToFourDigits = /\d{1,4}/, parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, parseTokenDigits = /\d+/, parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, parseTokenT = /T/i, parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, parseTokenOrdinal = /\d{1,2}/, parseTokenOneDigit = /\d/, parseTokenTwoDigits = /\d\d/, parseTokenThreeDigits = /\d{3}/, parseTokenFourDigits = /\d{4}/, parseTokenSixDigits = /[+-]?\d{6}/, parseTokenSignedNumber = /[+-]?\d+/, isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/, isoFormat = "YYYY-MM-DDTHH:mm:ssZ", isoDates = [ [ "YYYYYY-MM-DD", /[+-]\d{6}-\d{2}-\d{2}/ ], [ "YYYY-MM-DD", /\d{4}-\d{2}-\d{2}/ ], [ "GGGG-[W]WW-E", /\d{4}-W\d{2}-\d/ ], [ "GGGG-[W]WW", /\d{4}-W\d{2}/ ], [ "YYYY-DDD", /\d{4}-\d{3}/ ] ], isoTimes = [ [ "HH:mm:ss.SSSS", /(T| )\d\d:\d\d:\d\d\.\d+/ ], [ "HH:mm:ss", /(T| )\d\d:\d\d:\d\d/ ], [ "HH:mm", /(T| )\d\d:\d\d/ ], [ "HH", /(T| )\d\d/ ] ], parseTimezoneChunker = /([\+\-]|\d\d)/gi, unitMillisecondFactors = ("Date|Hours|Minutes|Seconds|Milliseconds".split("|"), 
    {
        Milliseconds: 1,
        Seconds: 1e3,
        Minutes: 6e4,
        Hours: 36e5,
        Days: 864e5,
        Months: 2592e6,
        Years: 31536e6
    }), unitAliases = {
        ms: "millisecond",
        s: "second",
        m: "minute",
        h: "hour",
        d: "day",
        D: "date",
        w: "week",
        W: "isoWeek",
        M: "month",
        Q: "quarter",
        y: "year",
        DDD: "dayOfYear",
        e: "weekday",
        E: "isoWeekday",
        gg: "weekYear",
        GG: "isoWeekYear"
    }, camelFunctions = {
        dayofyear: "dayOfYear",
        isoweekday: "isoWeekday",
        isoweek: "isoWeek",
        weekyear: "weekYear",
        isoweekyear: "isoWeekYear"
    }, formatFunctions = {}, relativeTimeThresholds = {
        s: 45,
        m: 45,
        h: 22,
        dd: 25,
        dm: 45,
        dy: 345
    }, ordinalizeTokens = "DDD w W M D d".split(" "), paddedTokens = "M D H h m s w W".split(" "), formatTokenFunctions = {
        M: function() {
            return this.month() + 1;
        },
        MMM: function(format) {
            return this.lang().monthsShort(this, format);
        },
        MMMM: function(format) {
            return this.lang().months(this, format);
        },
        D: function() {
            return this.date();
        },
        DDD: function() {
            return this.dayOfYear();
        },
        d: function() {
            return this.day();
        },
        dd: function(format) {
            return this.lang().weekdaysMin(this, format);
        },
        ddd: function(format) {
            return this.lang().weekdaysShort(this, format);
        },
        dddd: function(format) {
            return this.lang().weekdays(this, format);
        },
        w: function() {
            return this.week();
        },
        W: function() {
            return this.isoWeek();
        },
        YY: function() {
            return leftZeroFill(this.year() % 100, 2);
        },
        YYYY: function() {
            return leftZeroFill(this.year(), 4);
        },
        YYYYY: function() {
            return leftZeroFill(this.year(), 5);
        },
        YYYYYY: function() {
            var y = this.year(), sign = y >= 0 ? "+" : "-";
            return sign + leftZeroFill(Math.abs(y), 6);
        },
        gg: function() {
            return leftZeroFill(this.weekYear() % 100, 2);
        },
        gggg: function() {
            return leftZeroFill(this.weekYear(), 4);
        },
        ggggg: function() {
            return leftZeroFill(this.weekYear(), 5);
        },
        GG: function() {
            return leftZeroFill(this.isoWeekYear() % 100, 2);
        },
        GGGG: function() {
            return leftZeroFill(this.isoWeekYear(), 4);
        },
        GGGGG: function() {
            return leftZeroFill(this.isoWeekYear(), 5);
        },
        e: function() {
            return this.weekday();
        },
        E: function() {
            return this.isoWeekday();
        },
        a: function() {
            return this.lang().meridiem(this.hours(), this.minutes(), true);
        },
        A: function() {
            return this.lang().meridiem(this.hours(), this.minutes(), false);
        },
        H: function() {
            return this.hours();
        },
        h: function() {
            return this.hours() % 12 || 12;
        },
        m: function() {
            return this.minutes();
        },
        s: function() {
            return this.seconds();
        },
        S: function() {
            return toInt(this.milliseconds() / 100);
        },
        SS: function() {
            return leftZeroFill(toInt(this.milliseconds() / 10), 2);
        },
        SSS: function() {
            return leftZeroFill(this.milliseconds(), 3);
        },
        SSSS: function() {
            return leftZeroFill(this.milliseconds(), 3);
        },
        Z: function() {
            var a = -this.zone(), b = "+";
            if (0 > a) {
                a = -a;
                b = "-";
            }
            return b + leftZeroFill(toInt(a / 60), 2) + ":" + leftZeroFill(toInt(a) % 60, 2);
        },
        ZZ: function() {
            var a = -this.zone(), b = "+";
            if (0 > a) {
                a = -a;
                b = "-";
            }
            return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
        },
        z: function() {
            return this.zoneAbbr();
        },
        zz: function() {
            return this.zoneName();
        },
        X: function() {
            return this.unix();
        },
        Q: function() {
            return this.quarter();
        }
    }, lists = [ "months", "monthsShort", "weekdays", "weekdaysShort", "weekdaysMin" ];
    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + "o"] = ordinalizeToken(formatTokenFunctions[i], i);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);
    extend(Language.prototype, {
        set: function(config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                "function" == typeof prop ? this[i] = prop : this["_" + i] = prop;
            }
        },
        _months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        months: function(m) {
            return this._months[m.month()];
        },
        _monthsShort: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        monthsShort: function(m) {
            return this._monthsShort[m.month()];
        },
        monthsParse: function(monthName) {
            var i, mom, regex;
            this._monthsParse || (this._monthsParse = []);
            for (i = 0; 12 > i; i++) {
                if (!this._monthsParse[i]) {
                    mom = moment.utc([ 2e3, i ]);
                    regex = "^" + this.months(mom, "") + "|^" + this.monthsShort(mom, "");
                    this._monthsParse[i] = new RegExp(regex.replace(".", ""), "i");
                }
                if (this._monthsParse[i].test(monthName)) return i;
            }
        },
        _weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        weekdays: function(m) {
            return this._weekdays[m.day()];
        },
        _weekdaysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        weekdaysShort: function(m) {
            return this._weekdaysShort[m.day()];
        },
        _weekdaysMin: "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
        weekdaysMin: function(m) {
            return this._weekdaysMin[m.day()];
        },
        weekdaysParse: function(weekdayName) {
            var i, mom, regex;
            this._weekdaysParse || (this._weekdaysParse = []);
            for (i = 0; 7 > i; i++) {
                if (!this._weekdaysParse[i]) {
                    mom = moment([ 2e3, 1 ]).day(i);
                    regex = "^" + this.weekdays(mom, "") + "|^" + this.weekdaysShort(mom, "") + "|^" + this.weekdaysMin(mom, "");
                    this._weekdaysParse[i] = new RegExp(regex.replace(".", ""), "i");
                }
                if (this._weekdaysParse[i].test(weekdayName)) return i;
            }
        },
        _longDateFormat: {
            LT: "h:mm A",
            L: "MM/DD/YYYY",
            LL: "MMMM D YYYY",
            LLL: "MMMM D YYYY LT",
            LLLL: "dddd, MMMM D YYYY LT"
        },
        longDateFormat: function(key) {
            var output = this._longDateFormat[key];
            if (!output && this._longDateFormat[key.toUpperCase()]) {
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function(val) {
                    return val.slice(1);
                });
                this._longDateFormat[key] = output;
            }
            return output;
        },
        isPM: function(input) {
            return "p" === (input + "").toLowerCase().charAt(0);
        },
        _meridiemParse: /[ap]\.?m?\.?/i,
        meridiem: function(hours, minutes, isLower) {
            return hours > 11 ? isLower ? "pm" : "PM" : isLower ? "am" : "AM";
        },
        _calendar: {
            sameDay: "[Today at] LT",
            nextDay: "[Tomorrow at] LT",
            nextWeek: "dddd [at] LT",
            lastDay: "[Yesterday at] LT",
            lastWeek: "[Last] dddd [at] LT",
            sameElse: "L"
        },
        calendar: function(key, mom) {
            var output = this._calendar[key];
            return "function" == typeof output ? output.apply(mom) : output;
        },
        _relativeTime: {
            future: "in %s",
            past: "%s ago",
            s: "a few seconds",
            m: "a minute",
            mm: "%d minutes",
            h: "an hour",
            hh: "%d hours",
            d: "a day",
            dd: "%d days",
            M: "a month",
            MM: "%d months",
            y: "a year",
            yy: "%d years"
        },
        relativeTime: function(number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return "function" == typeof output ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
        },
        pastFuture: function(diff, output) {
            var format = this._relativeTime[diff > 0 ? "future" : "past"];
            return "function" == typeof format ? format(output) : format.replace(/%s/i, output);
        },
        ordinal: function(number) {
            return this._ordinal.replace("%d", number);
        },
        _ordinal: "%d",
        preparse: function(string) {
            return string;
        },
        postformat: function(string) {
            return string;
        },
        week: function(mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        },
        _week: {
            dow: 0,
            doy: 6
        },
        _invalidDate: "Invalid date",
        invalidDate: function() {
            return this._invalidDate;
        }
    });
    moment = function(input, format, lang, strict) {
        var c;
        if ("boolean" == typeof lang) {
            strict = lang;
            lang = undefined;
        }
        c = {};
        c._isAMomentObject = true;
        c._i = input;
        c._f = format;
        c._l = lang;
        c._strict = strict;
        c._isUTC = false;
        c._pf = defaultParsingFlags();
        return makeMoment(c);
    };
    moment.suppressDeprecationWarnings = false;
    moment.createFromInputFallback = deprecate("moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release. Please refer to https://github.com/moment/moment/issues/1407 for more info.", function(config) {
        config._d = new Date(config._i);
    });
    moment.min = function() {
        var args = [].slice.call(arguments, 0);
        return pickBy("isBefore", args);
    };
    moment.max = function() {
        var args = [].slice.call(arguments, 0);
        return pickBy("isAfter", args);
    };
    moment.utc = function(input, format, lang, strict) {
        var c;
        if ("boolean" == typeof lang) {
            strict = lang;
            lang = undefined;
        }
        c = {};
        c._isAMomentObject = true;
        c._useUTC = true;
        c._isUTC = true;
        c._l = lang;
        c._i = input;
        c._f = format;
        c._strict = strict;
        c._pf = defaultParsingFlags();
        return makeMoment(c).utc();
    };
    moment.unix = function(input) {
        return moment(1e3 * input);
    };
    moment.duration = function(input, key) {
        var sign, ret, parseIso, duration = input, match = null;
        if (moment.isDuration(input)) duration = {
            ms: input._milliseconds,
            d: input._days,
            M: input._months
        }; else if ("number" == typeof input) {
            duration = {};
            key ? duration[key] = input : duration.milliseconds = input;
        } else if (match = aspNetTimeSpanJsonRegex.exec(input)) {
            sign = "-" === match[1] ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = isoDurationRegex.exec(input))) {
            sign = "-" === match[1] ? -1 : 1;
            parseIso = function(inp) {
                var res = inp && parseFloat(inp.replace(",", "."));
                return (isNaN(res) ? 0 : res) * sign;
            };
            duration = {
                y: parseIso(match[2]),
                M: parseIso(match[3]),
                d: parseIso(match[4]),
                h: parseIso(match[5]),
                m: parseIso(match[6]),
                s: parseIso(match[7]),
                w: parseIso(match[8])
            };
        }
        ret = new Duration(duration);
        moment.isDuration(input) && input.hasOwnProperty("_lang") && (ret._lang = input._lang);
        return ret;
    };
    moment.version = VERSION;
    moment.defaultFormat = isoFormat;
    moment.ISO_8601 = function() {};
    moment.momentProperties = momentProperties;
    moment.updateOffset = function() {};
    moment.relativeTimeThreshold = function(threshold, limit) {
        if (relativeTimeThresholds[threshold] === undefined) return false;
        relativeTimeThresholds[threshold] = limit;
        return true;
    };
    moment.lang = function(key, values) {
        var r;
        if (!key) return moment.fn._lang._abbr;
        if (values) loadLang(normalizeLanguage(key), values); else if (null === values) {
            unloadLang(key);
            key = "en";
        } else languages[key] || getLangDefinition(key);
        r = moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
        return r._abbr;
    };
    moment.langData = function(key) {
        key && key._lang && key._lang._abbr && (key = key._lang._abbr);
        return getLangDefinition(key);
    };
    moment.isMoment = function(obj) {
        return obj instanceof Moment || null != obj && obj.hasOwnProperty("_isAMomentObject");
    };
    moment.isDuration = function(obj) {
        return obj instanceof Duration;
    };
    for (i = lists.length - 1; i >= 0; --i) makeList(lists[i]);
    moment.normalizeUnits = function(units) {
        return normalizeUnits(units);
    };
    moment.invalid = function(flags) {
        var m = moment.utc(0/0);
        null != flags ? extend(m._pf, flags) : m._pf.userInvalidated = true;
        return m;
    };
    moment.parseZone = function() {
        return moment.apply(null, arguments).parseZone();
    };
    moment.parseTwoDigitYear = function(input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2e3);
    };
    extend(moment.fn = Moment.prototype, {
        clone: function() {
            return moment(this);
        },
        valueOf: function() {
            return +this._d + 6e4 * (this._offset || 0);
        },
        unix: function() {
            return Math.floor(+this / 1e3);
        },
        toString: function() {
            return this.clone().lang("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
        },
        toDate: function() {
            return this._offset ? new Date(+this) : this._d;
        },
        toISOString: function() {
            var m = moment(this).utc();
            return 0 < m.year() && m.year() <= 9999 ? formatMoment(m, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]") : formatMoment(m, "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
        },
        toArray: function() {
            var m = this;
            return [ m.year(), m.month(), m.date(), m.hours(), m.minutes(), m.seconds(), m.milliseconds() ];
        },
        isValid: function() {
            return isValid(this);
        },
        isDSTShifted: function() {
            if (this._a) return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
            return false;
        },
        parsingFlags: function() {
            return extend({}, this._pf);
        },
        invalidAt: function() {
            return this._pf.overflow;
        },
        utc: function() {
            return this.zone(0);
        },
        local: function() {
            this.zone(0);
            this._isUTC = false;
            return this;
        },
        format: function(inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.lang().postformat(output);
        },
        add: function(input, val) {
            var dur;
            dur = "string" == typeof input && "string" == typeof val ? moment.duration(isNaN(+val) ? +input : +val, isNaN(+val) ? val : input) : "string" == typeof input ? moment.duration(+val, input) : moment.duration(input, val);
            addOrSubtractDurationFromMoment(this, dur, 1);
            return this;
        },
        subtract: function(input, val) {
            var dur;
            dur = "string" == typeof input && "string" == typeof val ? moment.duration(isNaN(+val) ? +input : +val, isNaN(+val) ? val : input) : "string" == typeof input ? moment.duration(+val, input) : moment.duration(input, val);
            addOrSubtractDurationFromMoment(this, dur, -1);
            return this;
        },
        diff: function(input, units, asFloat) {
            var diff, output, that = makeAs(input, this), zoneDiff = 6e4 * (this.zone() - that.zone());
            units = normalizeUnits(units);
            if ("year" === units || "month" === units) {
                diff = 432e5 * (this.daysInMonth() + that.daysInMonth());
                output = 12 * (this.year() - that.year()) + (this.month() - that.month());
                output += (this - moment(this).startOf("month") - (that - moment(that).startOf("month"))) / diff;
                output -= 6e4 * (this.zone() - moment(this).startOf("month").zone() - (that.zone() - moment(that).startOf("month").zone())) / diff;
                "year" === units && (output /= 12);
            } else {
                diff = this - that;
                output = "second" === units ? diff / 1e3 : "minute" === units ? diff / 6e4 : "hour" === units ? diff / 36e5 : "day" === units ? (diff - zoneDiff) / 864e5 : "week" === units ? (diff - zoneDiff) / 6048e5 : diff;
            }
            return asFloat ? output : absRound(output);
        },
        from: function(time, withoutSuffix) {
            return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
        },
        fromNow: function(withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },
        calendar: function(time) {
            var now = time || moment(), sod = makeAs(now, this).startOf("day"), diff = this.diff(sod, "days", true), format = -6 > diff ? "sameElse" : -1 > diff ? "lastWeek" : 0 > diff ? "lastDay" : 1 > diff ? "sameDay" : 2 > diff ? "nextDay" : 7 > diff ? "nextWeek" : "sameElse";
            return this.format(this.lang().calendar(format, this));
        },
        isLeapYear: function() {
            return isLeapYear(this.year());
        },
        isDST: function() {
            return this.zone() < this.clone().month(0).zone() || this.zone() < this.clone().month(5).zone();
        },
        day: function(input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (null != input) {
                input = parseWeekday(input, this.lang());
                return this.add({
                    d: input - day
                });
            }
            return day;
        },
        month: makeAccessor("Month", true),
        startOf: function(units) {
            units = normalizeUnits(units);
            switch (units) {
              case "year":
                this.month(0);

              case "quarter":
              case "month":
                this.date(1);

              case "week":
              case "isoWeek":
              case "day":
                this.hours(0);

              case "hour":
                this.minutes(0);

              case "minute":
                this.seconds(0);

              case "second":
                this.milliseconds(0);
            }
            "week" === units ? this.weekday(0) : "isoWeek" === units && this.isoWeekday(1);
            "quarter" === units && this.month(3 * Math.floor(this.month() / 3));
            return this;
        },
        endOf: function(units) {
            units = normalizeUnits(units);
            return this.startOf(units).add("isoWeek" === units ? "week" : units, 1).subtract("ms", 1);
        },
        isAfter: function(input, units) {
            units = "undefined" != typeof units ? units : "millisecond";
            return +this.clone().startOf(units) > +moment(input).startOf(units);
        },
        isBefore: function(input, units) {
            units = "undefined" != typeof units ? units : "millisecond";
            return +this.clone().startOf(units) < +moment(input).startOf(units);
        },
        isSame: function(input, units) {
            units = units || "ms";
            return +this.clone().startOf(units) === +makeAs(input, this).startOf(units);
        },
        min: deprecate("moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548", function(other) {
            other = moment.apply(null, arguments);
            return this > other ? this : other;
        }),
        max: deprecate("moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548", function(other) {
            other = moment.apply(null, arguments);
            return other > this ? this : other;
        }),
        zone: function(input, keepTime) {
            var offset = this._offset || 0;
            if (null == input) return this._isUTC ? offset : this._d.getTimezoneOffset();
            "string" == typeof input && (input = timezoneMinutesFromString(input));
            Math.abs(input) < 16 && (input = 60 * input);
            this._offset = input;
            this._isUTC = true;
            if (offset !== input) if (!keepTime || this._changeInProgress) addOrSubtractDurationFromMoment(this, moment.duration(offset - input, "m"), 1, false); else if (!this._changeInProgress) {
                this._changeInProgress = true;
                moment.updateOffset(this, true);
                this._changeInProgress = null;
            }
            return this;
        },
        zoneAbbr: function() {
            return this._isUTC ? "UTC" : "";
        },
        zoneName: function() {
            return this._isUTC ? "Coordinated Universal Time" : "";
        },
        parseZone: function() {
            this._tzm ? this.zone(this._tzm) : "string" == typeof this._i && this.zone(this._i);
            return this;
        },
        hasAlignedHourOffset: function(input) {
            input = input ? moment(input).zone() : 0;
            return (this.zone() - input) % 60 === 0;
        },
        daysInMonth: function() {
            return daysInMonth(this.year(), this.month());
        },
        dayOfYear: function(input) {
            var dayOfYear = round((moment(this).startOf("day") - moment(this).startOf("year")) / 864e5) + 1;
            return null == input ? dayOfYear : this.add("d", input - dayOfYear);
        },
        quarter: function(input) {
            return null == input ? Math.ceil((this.month() + 1) / 3) : this.month(3 * (input - 1) + this.month() % 3);
        },
        weekYear: function(input) {
            var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;
            return null == input ? year : this.add("y", input - year);
        },
        isoWeekYear: function(input) {
            var year = weekOfYear(this, 1, 4).year;
            return null == input ? year : this.add("y", input - year);
        },
        week: function(input) {
            var week = this.lang().week(this);
            return null == input ? week : this.add("d", 7 * (input - week));
        },
        isoWeek: function(input) {
            var week = weekOfYear(this, 1, 4).week;
            return null == input ? week : this.add("d", 7 * (input - week));
        },
        weekday: function(input) {
            var weekday = (this.day() + 7 - this.lang()._week.dow) % 7;
            return null == input ? weekday : this.add("d", input - weekday);
        },
        isoWeekday: function(input) {
            return null == input ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
        },
        isoWeeksInYear: function() {
            return weeksInYear(this.year(), 1, 4);
        },
        weeksInYear: function() {
            var weekInfo = this._lang._week;
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
        },
        get: function(units) {
            units = normalizeUnits(units);
            return this[units]();
        },
        set: function(units, value) {
            units = normalizeUnits(units);
            "function" == typeof this[units] && this[units](value);
            return this;
        },
        lang: function(key) {
            if (key === undefined) return this._lang;
            this._lang = getLangDefinition(key);
            return this;
        }
    });
    moment.fn.millisecond = moment.fn.milliseconds = makeAccessor("Milliseconds", false);
    moment.fn.second = moment.fn.seconds = makeAccessor("Seconds", false);
    moment.fn.minute = moment.fn.minutes = makeAccessor("Minutes", false);
    moment.fn.hour = moment.fn.hours = makeAccessor("Hours", true);
    moment.fn.date = makeAccessor("Date", true);
    moment.fn.dates = deprecate("dates accessor is deprecated. Use date instead.", makeAccessor("Date", true));
    moment.fn.year = makeAccessor("FullYear", true);
    moment.fn.years = deprecate("years accessor is deprecated. Use year instead.", makeAccessor("FullYear", true));
    moment.fn.days = moment.fn.day;
    moment.fn.months = moment.fn.month;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;
    moment.fn.quarters = moment.fn.quarter;
    moment.fn.toJSON = moment.fn.toISOString;
    extend(moment.duration.fn = Duration.prototype, {
        _bubble: function() {
            var seconds, minutes, hours, years, milliseconds = this._milliseconds, days = this._days, months = this._months, data = this._data;
            data.milliseconds = milliseconds % 1e3;
            seconds = absRound(milliseconds / 1e3);
            data.seconds = seconds % 60;
            minutes = absRound(seconds / 60);
            data.minutes = minutes % 60;
            hours = absRound(minutes / 60);
            data.hours = hours % 24;
            days += absRound(hours / 24);
            data.days = days % 30;
            months += absRound(days / 30);
            data.months = months % 12;
            years = absRound(months / 12);
            data.years = years;
        },
        weeks: function() {
            return absRound(this.days() / 7);
        },
        valueOf: function() {
            return this._milliseconds + 864e5 * this._days + this._months % 12 * 2592e6 + 31536e6 * toInt(this._months / 12);
        },
        humanize: function(withSuffix) {
            var difference = +this, output = relativeTime(difference, !withSuffix, this.lang());
            withSuffix && (output = this.lang().pastFuture(difference, output));
            return this.lang().postformat(output);
        },
        add: function(input, val) {
            var dur = moment.duration(input, val);
            this._milliseconds += dur._milliseconds;
            this._days += dur._days;
            this._months += dur._months;
            this._bubble();
            return this;
        },
        subtract: function(input, val) {
            var dur = moment.duration(input, val);
            this._milliseconds -= dur._milliseconds;
            this._days -= dur._days;
            this._months -= dur._months;
            this._bubble();
            return this;
        },
        get: function(units) {
            units = normalizeUnits(units);
            return this[units.toLowerCase() + "s"]();
        },
        as: function(units) {
            units = normalizeUnits(units);
            return this["as" + units.charAt(0).toUpperCase() + units.slice(1) + "s"]();
        },
        lang: moment.fn.lang,
        toIsoString: function() {
            var years = Math.abs(this.years()), months = Math.abs(this.months()), days = Math.abs(this.days()), hours = Math.abs(this.hours()), minutes = Math.abs(this.minutes()), seconds = Math.abs(this.seconds() + this.milliseconds() / 1e3);
            if (!this.asSeconds()) return "P0D";
            return (this.asSeconds() < 0 ? "-" : "") + "P" + (years ? years + "Y" : "") + (months ? months + "M" : "") + (days ? days + "D" : "") + (hours || minutes || seconds ? "T" : "") + (hours ? hours + "H" : "") + (minutes ? minutes + "M" : "") + (seconds ? seconds + "S" : "");
        }
    });
    for (i in unitMillisecondFactors) if (unitMillisecondFactors.hasOwnProperty(i)) {
        makeDurationAsGetter(i, unitMillisecondFactors[i]);
        makeDurationGetter(i.toLowerCase());
    }
    makeDurationAsGetter("Weeks", 6048e5);
    moment.duration.fn.asMonths = function() {
        return (+this - 31536e6 * this.years()) / 2592e6 + 12 * this.years();
    };
    moment.lang("en", {
        ordinal: function(number) {
            var b = number % 10, output = 1 === toInt(number % 100 / 10) ? "th" : 1 === b ? "st" : 2 === b ? "nd" : 3 === b ? "rd" : "th";
            return number + output;
        }
    });
    if (hasModule) {
        moment.lang(Ti.Locale.getCurrentLanguage());
        module.exports = moment;
    } else if ("function" == typeof define && define.amd) {
        define("moment", function(require, exports, module) {
            module.config && module.config() && true === module.config().noGlobal && (globalScope.moment = oldGlobalMoment);
            return moment;
        });
        makeGlobal(true);
    } else makeGlobal();
}).call(this);
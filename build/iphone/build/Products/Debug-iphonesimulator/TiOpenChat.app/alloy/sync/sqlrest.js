function Migrator(config, transactionDb) {
    this.db = transactionDb;
    this.dbname = config.adapter.db_name;
    this.table = config.adapter.collection_name;
    this.idAttribute = config.adapter.idAttribute;
    this.column = function(name) {
        var parts = name.split(/\s+/), type = parts[0];
        switch (type.toLowerCase()) {
          case "string":
          case "varchar":
          case "date":
          case "datetime":
            Ti.API.warn('"' + type + '" is not a valid sqlite field, using TEXT instead');

          case "text":
            type = "TEXT";
            break;

          case "int":
          case "tinyint":
          case "smallint":
          case "bigint":
          case "boolean":
            Ti.API.warn('"' + type + '" is not a valid sqlite field, using INTEGER instead');

          case "integer":
            type = "INTEGER";
            break;

          case "double":
          case "float":
          case "decimal":
          case "number":
            Ti.API.warn('"' + name + '" is not a valid sqlite field, using REAL instead');

          case "real":
            type = "REAL";
            break;

          case "blob":
            type = "BLOB";
            break;

          case "null":
            type = "NULL";
            break;

          default:
            type = "TEXT";
        }
        parts[0] = type;
        return parts.join(" ");
    };
    this.createTable = function(config) {
        var columns = [], found = !1;
        for (var k in config.columns) {
            k === this.idAttribute && (found = !0);
            columns.push(k + " " + this.column(config.columns[k]));
        }
        !found && this.idAttribute === ALLOY_ID_DEFAULT && columns.push(ALLOY_ID_DEFAULT + " TEXT");
        var sql = "CREATE TABLE IF NOT EXISTS " + this.table + " ( " + columns.join(",") + ")";
        this.db.execute(sql);
    };
    this.createIndex = function(config) {
        for (var i in config) {
            var columns = [];
            columns.push(config[i]);
            var sql = "CREATE INDEX IF NOT EXISTS " + i + " ON '" + this.table + "' (" + columns.join(",") + ")";
            this.db.execute(sql);
        }
    };
    this.dropTable = function() {
        this.db.execute("DROP TABLE IF EXISTS " + this.table);
    };
    this.insertRow = function(columnValues) {
        var columns = [], values = [], qs = [], found = !1;
        for (var key in columnValues) {
            key === this.idAttribute && (found = !0);
            columns.push(key);
            values.push(columnValues[key]);
            qs.push("?");
        }
        if (!found && this.idAttribute === ALLOY_ID_DEFAULT) {
            columns.push(this.idAttribute);
            values.push(guid());
            qs.push("?");
        }
        this.db.execute("INSERT INTO " + this.table + " (" + columns.join(",") + ") VALUES (" + qs.join(",") + ");", values);
    };
    this.deleteRow = function(columns) {
        var sql = "DELETE FROM " + this.table, keys = _.keys(columns), len = keys.length, conditions = [], values = [];
        len && (sql += " WHERE ");
        for (var i = 0; len > i; i++) {
            conditions.push(keys[i] + " = ?");
            values.push(columns[keys[i]]);
        }
        sql += conditions.join(" AND ");
        this.db.execute(sql, values);
    };
}

function apiCall(_options, _callback) {
    function cleanup() {
        xhr = null;
        _options = null;
        _callback = null;
        error = null;
        responseJSON = null;
    }
    if (Ti.Network.online && !_options.localOnly) {
        var xhr = Ti.Network.createHTTPClient({
            timeout: _options.timeout,
            cache: _options.cache,
            validatesSecureCertificate: _options.validatesSecureCertificate
        });
        xhr.onload = function() {
            var responseJSON, error, success = this.status <= 304 ? "ok" : "error", status = true;
            _options.eTagEnabled && success && setETag(_options.url, xhr.getResponseHeader("ETag"));
            if (304 != this.status && 204 != this.status) try {
                responseJSON = JSON.parse(this.responseText);
            } catch (e) {
                Ti.API.error("[SQL REST API] apiCall PARSE ERROR: " + e.message);
                Ti.API.error("[SQL REST API] apiCall PARSE ERROR: " + this.responseText);
                status = false;
                error = e.message;
            }
            _callback({
                success: status,
                status: success,
                code: this.status,
                data: error,
                responseText: this.responseText || null,
                responseJSON: responseJSON || null
            });
            cleanup();
        };
        xhr.onerror = function(err) {
            var responseJSON, error;
            try {
                responseJSON = JSON.parse(this.responseText);
            } catch (e) {
                error = e.message;
            }
            _callback({
                success: false,
                status: "error",
                code: this.status,
                error: err.error,
                data: error,
                responseText: this.responseText,
                responseJSON: responseJSON || null
            });
            Ti.API.error("[SQL REST API] apiCall ERROR: " + this.responseText);
            Ti.API.error("[SQL REST API] apiCall ERROR CODE: " + this.status);
            Ti.API.error("[SQL REST API] apiCall ERROR MSG: " + err.error);
            Ti.API.error("[SQL REST API] apiCall ERROR URL: " + _options.url);
            cleanup();
        };
        xhr.open(_options.type, _options.url);
        for (var header in _options.headers) xhr.setRequestHeader(header, _.isFunction(_options.headers[header]) ? _options.headers[header]() : _options.headers[header]);
        _options.beforeSend && _options.beforeSend(xhr);
        if (_options.eTagEnabled) {
            var etag = getETag(_options.url);
            etag && xhr.setRequestHeader("IF-NONE-MATCH", etag);
        }
        xhr.send(_options.data);
    } else _callback({
        success: false,
        responseText: null,
        offline: true,
        localOnly: _options.localOnly
    });
}

function Sync(method, model, opts) {
    function saveData(data) {
        function iteration(data, i, createQuery) {
            i || (i = 0);
            createQuery = createQuery || [];
            _.isUndefined(data[i][model.deletedAttribute]) || true != data[i][model.deletedAttribute] ? -1 != _.indexOf(currentModels, data[i][model.idAttribute]) ? updateSQL(data[i]) : createQuery = createSQL(data[i], createQuery) : deleteSQL(data[i][model.idAttribute]);
            ++i < data.length ? _.defer(iteration, data, i, createQuery) : _.defer(function() {
                if (createQuery) {
                    db = Ti.Database.open(dbName);
                    db.execute("BEGIN;");
                    _.each(createQuery, function(query) {
                        try {
                            db.execute(query.sqlInsert, query.values);
                        } catch (e) {}
                    });
                    db.execute("COMMIT;");
                    db.close();
                }
                deferred.resolve();
            });
        }
        data || isCollection || (data = model.toJSON());
        if (!data) return;
        if (_.isArray(data)) {
            var currentModels = sqlCurrentModels();
            var deferred = Q.defer();
            _.defer(iteration, data);
            return deferred.promise;
        }
        if (_.isUndefined(data[model.deletedAttribute]) || true != data[model.deletedAttribute]) return 1 == sqlFindItem(data[model.idAttribute]).length ? updateSQL(data) : createSQL(data);
        deleteSQL(data[model.idAttribute]);
    }
    function createSQL(data, createQuery) {
        var attrObj = {};
        logger(DEBUG, "createSQL data:", data);
        data ? attrObj = data : isCollection ? Ti.API.error("[SQL REST API] Its a collection - error !") : attrObj = model.toJSON();
        if (!attrObj[model.idAttribute]) if (model.idAttribute === ALLOY_ID_DEFAULT) {
            attrObj.id = guid();
            attrObj[model.idAttribute] = attrObj.id;
        } else attrObj[model.idAttribute] = null;
        if (params.useStrictValidation) for (var c in columns) {
            if (c == model.idAttribute) continue;
            if (!_.contains(_.keys(attrObj), c)) {
                Ti.API.error("[SQL REST API] ITEM NOT VALID - REASON: " + c + " is not present");
                return;
            }
        }
        var names = [], values = [], q = [];
        for (var k in columns) {
            names.push(k);
            values.push(_.isObject(attrObj[k]) ? JSON.stringify(attrObj[k]) : attrObj[k]);
            q.push("?");
        }
        params.lastModifiedColumn && _.isUndefined(params.disableLastModified) && (values[_.indexOf(names, params.lastModifiedColumn)] = params.lastModifiedDateFormat ? moment().format(params.lastModifiedDateFormat) : moment().lang("en").zone("GMT").format("ddd, D MMM YYYY HH:mm:ss ZZ"));
        var sqlInsert = "INSERT INTO " + table + " (" + names.join(",") + ") VALUES (" + q.join(",") + ");";
        if (createQuery) {
            createQuery.push({
                sqlInsert: sqlInsert,
                values: values
            });
            return createQuery;
        }
        db = Ti.Database.open(dbName);
        db.execute("BEGIN;");
        db.execute(sqlInsert, values);
        if (null === model.id) {
            var sqlId = "SELECT last_insert_rowid();";
            var rs = db.execute(sqlId);
            if (rs.isValidRow()) {
                model.id = rs.field(0);
                attrObj[model.idAttribute] = model.id;
            } else Ti.API.warn("Unable to get ID from database for model: " + model.toJSON());
        }
        db.execute("COMMIT;");
        db.close();
        return attrObj;
    }
    function readSQL(data) {
        if (DEBUG) {
            Ti.API.debug("[SQL REST API] readSQL");
            logger(DEBUG, "\n******************************\nCollection total BEFORE read from db: " + model.length + " models\n******************************");
        }
        var sql = opts.query || "SELECT * FROM " + table;
        if (params.returnExactServerResponse && data) {
            opts.sql = opts.sql || {};
            opts.sql.where = opts.sql.where || {};
            if (_.isEmpty(data)) opts.sql.where[model.idAttribute] = "1=2"; else {
                var ids = [];
                _.each(data, function(element) {
                    ids.push(element[model.idAttribute]);
                });
                opts.sql.where[model.idAttribute] = ids;
            }
        }
        db = Ti.Database.open(dbName);
        if (opts.query) if (opts.query.params) var rs = db.execute(opts.query.sql, opts.query.params); else var rs = db.execute(opts.query.sql); else {
            if (opts.data) {
                opts.sql = opts.sql || {};
                opts.sql.where = opts.sql.where || {};
                _.extend(opts.sql.where, opts.data);
            }
            var sql = _buildQuery(table, opts.sql || opts);
            logger(DEBUG, "SQL QUERY: " + sql);
            var rs = db.execute(sql);
        }
        var len = 0, values = [];
        while (rs.isValidRow()) {
            var o = {};
            var fc = 0;
            fc = _.isFunction(rs.fieldCount) ? rs.fieldCount() : rs.fieldCount;
            _.times(fc, function(c) {
                var fn = rs.fieldName(c);
                var text = rs.fieldByName(fn);
                o[fn] = text;
                if (text && _.isString(text) && /^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) try {
                    o[fn] = JSON.parse(text);
                } catch (e) {}
            });
            values.push(o);
            if (isCollection && !params.add) {
                var m = new model.config.Model(o);
                model.models.push(m);
            }
            len++;
            rs.next();
        }
        rs.close();
        db.close();
        isCollection && !params.add && (model.length = len);
        logger(DEBUG, "\n******************************\n readSQL db read complete: " + len + " models \n******************************");
        resp = 1 === len ? values[0] : values;
        return resp;
    }
    function updateSQL(data) {
        var attrObj = {};
        logger(DEBUG, "updateSQL data: ", data);
        data ? attrObj = data : isCollection ? Ti.API.error("Its a collection - error!") : attrObj = model.toJSON();
        var names = [], values = [], q = [];
        for (var k in columns) if (!_.isUndefined(attrObj[k])) {
            names.push(k + "=?");
            values.push(_.isObject(attrObj[k]) ? JSON.stringify(attrObj[k]) : attrObj[k]);
            q.push("?");
        }
        params.lastModifiedColumn && _.isUndefined(params.disableLastModified) && (values[_.indexOf(names, params.lastModifiedColumn + "=?")] = params.lastModifiedDateFormat ? moment().format(params.lastModifiedDateFormat) : moment().lang("en").zone("GMT").format("YYYY-MM-DD HH:mm:ss ZZ"));
        var sql = "UPDATE " + table + " SET " + names.join(",") + " WHERE " + model.idAttribute + "=?";
        values.push(attrObj[model.idAttribute]);
        logger(DEBUG, "updateSQL sql query: " + sql);
        logger(DEBUG, "updateSQL values: ", values);
        db = Ti.Database.open(dbName);
        db.execute(sql, values);
        db.close();
        return attrObj;
    }
    function deleteSQL(id) {
        var sql = "DELETE FROM " + table + " WHERE " + model.idAttribute + "=?";
        db = Ti.Database.open(dbName);
        db.execute(sql, id || model.id);
        db.close();
        model.id = null;
        return model.toJSON();
    }
    function deleteAllSQL() {
        var sql = "DELETE FROM " + table;
        db = Ti.Database.open(dbName);
        db.execute(sql);
        db.close();
    }
    function deleteBasedOnSQL(obj) {
        if (!_.isObject(obj)) {
            Ti.API.error("[SQL REST API] deleteBasedOnSQL :: Error no object provided");
            return;
        }
        var sql = _buildQuery(table, obj, "DELETE");
        db = Ti.Database.open(dbName);
        db.execute(sql);
        db.close();
    }
    function sqlCurrentModels() {
        var sql = "SELECT " + model.idAttribute + " FROM " + table;
        db = Ti.Database.open(dbName);
        var rs = db.execute(sql);
        var output = [];
        while (rs.isValidRow()) {
            output.push(rs.fieldByName(model.idAttribute));
            rs.next();
        }
        rs.close();
        db.close();
        return output;
    }
    function sqlFindItem(_id) {
        if (_.isUndefined(_id)) return [];
        var sql = "SELECT " + model.idAttribute + " FROM " + table + " WHERE " + model.idAttribute + "=?";
        db = Ti.Database.open(dbName);
        var rs = db.execute(sql, _id);
        var output = [];
        while (rs.isValidRow()) {
            output.push(rs.fieldByName(model.idAttribute));
            rs.next();
        }
        rs.close();
        db.close();
        return output;
    }
    function sqlLastModifiedItem() {
        if (params.singleModelRequest || !isCollection) var sql = "SELECT " + params.lastModifiedColumn + " FROM " + table + " WHERE " + params.lastModifiedColumn + " IS NOT NULL AND " + model.idAttribute + "=" + params.singleModelRequest + " ORDER BY " + params.lastModifiedColumn + " DESC LIMIT 0,1"; else var sql = "SELECT " + params.lastModifiedColumn + " FROM " + table + " WHERE " + params.lastModifiedColumn + " IS NOT NULL ORDER BY " + params.lastModifiedColumn + " DESC LIMIT 0,1";
        db = Ti.Database.open(dbName);
        rs = db.execute(sql);
        var output = null;
        rs.isValidRow() && (output = rs.field(0));
        rs.close();
        db.close();
        return output;
    }
    function parseJSON(_response, parentNode) {
        var data = _response.responseJSON;
        _.isUndefined(parentNode) || (data = _.isFunction(parentNode) ? parentNode(data) : traverseProperties(data, parentNode));
        logger(DEBUG, "server response: ", data);
        return data;
    }
    var db, table = model.config.adapter.collection_name, columns = model.config.columns, dbName = model.config.adapter.db_name || ALLOY_DB_DEFAULT, resp = null;
    model.idAttribute = model.config.adapter.idAttribute || "id";
    model.deletedAttribute = model.config.adapter.deletedAttribute || "is_deleted";
    var DEBUG = opts.debug || model.config.debug;
    var isCollection = model instanceof Backbone.Collection ? true : false;
    var singleModelRequest = null;
    if (model.config.adapter.lastModifiedColumn) {
        opts.sql && opts.sql.where && (singleModelRequest = opts.sql.where[model.idAttribute]);
        !singleModelRequest && opts.data && opts.data[model.idAttribute] && (singleModelRequest = opts.data[model.idAttribute]);
    }
    var params = _.extend({}, opts);
    _.defaults(params, {
        lastModifiedColumn: model.config.adapter.lastModifiedColumn,
        addModifedToUrl: model.config.adapter.addModifedToUrl,
        lastModifiedDateFormat: model.config.adapter.lastModifiedDateFormat,
        singleModelRequest: singleModelRequest,
        eTagEnabled: model.config.eTagEnabled,
        parentNode: model.config.parentNode,
        useStrictValidation: model.config.useStrictValidation,
        initFetchWithLocalData: model.config.initFetchWithLocalData,
        localOnly: model.config.localOnly,
        deleteAllOnFetch: model.config.deleteAllOnFetch,
        deleteSQLOnFetch: model.config.deleteSQLOnFetch,
        disableSaveDataLocallyOnServerError: model.config.disableSaveDataLocallyOnServerError,
        returnErrorResponse: model.config.returnErrorResponse,
        requestparams: model.config.requestparams,
        timeout: 7e3,
        cache: false,
        validatesSecureCertificate: false
    });
    var methodMap = {
        create: "POST",
        read: "GET",
        update: "PUT",
        "delete": "DELETE"
    };
    var type = methodMap[method];
    params.type = type;
    params.headers = params.headers || {};
    for (var header in params.headers) params.headers[header] = _.isFunction(params.headers[header]) ? params.headers[header]() : params.headers[header];
    if (model.config.hasOwnProperty("headers")) for (var header in model.config.headers) params.headers[header] || (params.headers[header] = _.isFunction(model.config.headers[header]) ? model.config.headers[header]() : model.config.headers[header]);
    if (!params.url) {
        model.config.URL = _.isFunction(model.config.URL) ? model.config.URL() : model.config.URL;
        params.url = model.config.URL || model.url();
        if (!params.url) {
            Ti.API.error("[SQL REST API] ERROR: NO BASE URL");
            return;
        }
    }
    if (params.lastModifiedColumn && _.isUndefined(params.disableLastModified)) {
        params.lastModifiedValue = null;
        try {
            params.lastModifiedValue = sqlLastModifiedItem();
        } catch (e) {
            logger(DEBUG, "LASTMOD SQL FAILED: ");
        }
        params.lastModifiedValue && (params.headers["If-Modified-Since"] = params.lastModifiedValue);
    }
    if (_.isObject(params.urlparams) || model.config.URLPARAMS) {
        _.isUndefined(params.urlparams) && (params.urlparams = {});
        _.extend(params.urlparams, _.isFunction(model.config.URLPARAMS) ? model.config.URLPARAMS() : model.config.URLPARAMS);
    }
    _.each(params.requestparams, function(value, key) {
        params.url = params.url.replace("{" + key + "}", value ? escape(value) : "", "gi");
    });
    if (Alloy.Backbone.emulateJSON) {
        params.contentType = "application/x-www-form-urlencoded";
        params.processData = true;
        params.data = params.data ? {
            model: params.data
        } : {};
    }
    if (Alloy.Backbone.emulateHTTP && ("PUT" === type || "DELETE" === type)) {
        Alloy.Backbone.emulateJSON && (params.data._method = type);
        params.type = "POST";
        params.beforeSend = function() {
            params.headers["X-HTTP-Method-Override"] = type;
        };
    }
    params.headers["Content-Type"] = "application/json";
    logger(DEBUG, "REST METHOD: " + method);
    switch (method) {
      case "create":
        params.data = JSON.stringify(model.toJSON());
        logger(DEBUG, "create options", params);
        apiCall(params, function(_response) {
            if (_response.success) {
                var data = parseJSON(_response, params.parentNode);
                resp = saveData(data);
                _.isFunction(params.success) && params.success(resp);
            } else {
                !_response.localOnly && params.disableSaveDataLocallyOnServerError ? logger(DEBUG, "NOTICE: The data is not being saved locally") : resp = saveData();
                _.isUndefined(_response.offline) ? _.isFunction(params.error) && params.error(params.returnErrorResponse ? _response : resp) : _.isFunction(params.success) && params.success(resp);
            }
        });
        break;

      case "read":
        !isCollection && model.id && (params.url = params.url + "/" + model.id);
        if (params.search) {
            params.returnExactServerResponse = true;
            params.url = params.url + "/search/" + Ti.Network.encodeURIComponent(params.search);
        }
        params.urlparams && (params.url = encodeData(params.urlparams, params.url));
        if (params.lastModifiedColumn && params.addModifedToUrl && params.lastModifiedValue) {
            var obj = {};
            obj[params.lastModifiedColumn] = params.lastModifiedValue;
            params.url = encodeData(obj, params.url);
        }
        logger(DEBUG, "read options", params);
        if (!params.localOnly && params.initFetchWithLocalData) {
            resp = readSQL();
            _.isFunction(params.success) && params.success(resp);
            model.trigger("fetch", {
                serverData: false
            });
        }
        apiCall(params, function(_response) {
            function successFn() {
                resp = readSQL(data);
                _.isFunction(params.success) && params.success(resp);
                model.trigger("fetch");
            }
            if (_response.success) if (304 != _response.code) {
                params.deleteAllOnFetch && deleteAllSQL();
                params.deleteSQLOnFetch && deleteBasedOnSQL(params.deleteSQLOnFetch);
                var data = parseJSON(_response, params.parentNode);
                params.localOnly ? successFn() : saveData(data).then(successFn);
            } else successFn(); else {
                !params.localOnly && params.initFetchWithLocalData || (resp = readSQL());
                if (_.isUndefined(_response.offline)) _.isFunction(params.error) && params.error(params.returnErrorResponse ? _response : resp); else {
                    _.isFunction(params.success) && params.success(resp);
                    model.trigger("fetch");
                }
            }
        });
        break;

      case "update":
        if (!model.id) {
            params.error(null, "MISSING MODEL ID");
            Ti.API.error("[SQL REST API] ERROR: MISSING MODEL ID");
            return;
        }
        if (-1 == _.indexOf(params.url, "?")) params.url = params.url + "/" + model.id; else {
            var str = params.url.split("?");
            params.url = str[0] + "/" + model.id + "?" + str[1];
        }
        params.urlparams && (params.url = encodeData(params.urlparams, params.url));
        params.data = JSON.stringify(model.toJSON());
        logger(DEBUG, "update options", params);
        apiCall(params, function(_response) {
            if (_response.success) {
                var data = parseJSON(_response, params.parentNode);
                resp = saveData(data);
                _.isFunction(params.success) && params.success(resp);
            } else {
                !_response.localOnly && params.disableSaveDataLocallyOnServerError ? logger(DEBUG, "NOTICE: The data is not being saved locally") : resp = saveData();
                _.isUndefined(_response.offline) ? _.isFunction(params.error) && params.error(params.returnErrorResponse ? _response : resp) : _.isFunction(params.success) && params.success(resp);
            }
        });
        break;

      case "delete":
        if (!model.id) {
            params.error(null, "MISSING MODEL ID");
            Ti.API.error("[SQL REST API] ERROR: MISSING MODEL ID");
            return;
        }
        params.url = params.url + "/" + model.id;
        logger(DEBUG, "delete options", params);
        apiCall(params, function(_response) {
            if (_response.success) {
                {
                    parseJSON(_response, params.parentNode);
                }
                resp = deleteSQL();
                _.isFunction(params.success) && params.success(resp);
            } else {
                !_response.localOnly && params.disableSaveDataLocallyOnServerError ? logger(DEBUG, "NOTICE: The data is not being deleted locally") : resp = deleteSQL();
                _.isUndefined(_response.offline) ? _.isFunction(params.error) && params.error(params.returnErrorResponse ? _response : resp) : _.isFunction(params.success) && params.success(resp);
            }
        });
    }
}

function encodeData(obj, url) {
    var _serialize = function(obj, prefix) {
        var str = [];
        for (var p in obj) if (obj.hasOwnProperty(p)) {
            var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
            str.push("object" == typeof v ? _serialize(v, k) : Ti.Network.encodeURIComponent(k) + "=" + Ti.Network.encodeURIComponent(v));
        }
        return str.join("&");
    };
    return url + (-1 === _.indexOf(url, "?") ? "?" : "&") + _serialize(obj);
}

function _valueType(value) {
    if ("string" == typeof value) return "'" + value + "'";
    if ("boolean" == typeof value) return value ? 1 : 0;
    return value;
}

function _buildQuery(table, opts, operation) {
    var sql = operation || "SELECT *";
    if (opts.select) {
        sql = "SELECT ";
        sql += _.isArray(opts.select) ? opts.select.join(", ") : opts.select;
    }
    sql += " FROM " + table;
    if (opts.where && !_.isEmpty(opts.where)) {
        var where;
        if (_.isArray(opts.where)) where = opts.where.join(" AND "); else if ("object" == typeof opts.where) {
            where = [];
            where = whereBuilder(where, opts.where);
            where = where.join(" AND ");
        } else where = opts.where;
        sql += " WHERE " + where;
    } else sql += " WHERE 1=1";
    if (opts.wherenot && !_.isEmpty(opts.wherenot)) {
        var wherenot;
        if (_.isArray(opts.wherenot)) wherenot = opts.wherenot.join(" AND "); else if ("object" == typeof opts.wherenot) {
            wherenot = [];
            wherenot = whereBuilder(wherenot, opts.wherenot, " != ");
            wherenot = wherenot.join(" AND ");
        } else wherenot = opts.wherenot;
        sql += " AND " + wherenot;
    }
    if (opts.like) {
        var like;
        if ("object" == typeof opts.like) {
            like = [];
            _.each(opts.like, function(value, f) {
                like.push(f + ' LIKE "%' + value + '%"');
            });
            like = like.join(" AND ");
            sql += " AND " + like;
        }
    }
    if (opts.likeor) {
        var likeor;
        if ("object" == typeof opts.likeor) {
            likeor = [];
            _.each(opts.likeor, function(value, f) {
                likeor.push(f + ' LIKE "%' + value + '%"');
            });
            likeor = likeor.join(" OR ");
            sql += " AND " + likeor;
        }
    }
    opts.union && (sql += " UNION " + _buildQuery(opts.union));
    opts.unionAll && (sql += " UNION ALL " + _buildQuery(opts.unionAll));
    opts.intersect && (sql += " INTERSECT " + _buildQuery(opts.intersect));
    opts.except && (sql += " EXCEPT " + _buildQuery(opts.EXCEPT));
    if (opts.orderBy) {
        var order;
        order = _.isArray(opts.orderBy) ? opts.orderBy.join(", ") : opts.orderBy;
        sql += " ORDER BY " + order;
    }
    if (opts.limit) {
        sql += " LIMIT " + opts.limit;
        opts.offset && (sql += " OFFSET " + opts.offset);
    }
    return sql;
}

function whereBuilder(where, data, operator) {
    var whereOperator = operator || " = ";
    _.each(data, function(v, f) {
        if (_.isArray(v)) {
            var innerWhere = [];
            _.each(v, function(value) {
                innerWhere.push(f + whereOperator + _valueType(value));
            });
            where.push(innerWhere.join(" OR "));
        } else _.isObject(v) ? where = whereBuilder(where, v, whereOperator) : where.push(f + whereOperator + _valueType(v));
    });
    return where;
}

function traverseProperties(object, string) {
    var explodedString = string.split(".");
    for (i = 0, l = explodedString.length; l > i; i++) object = object[explodedString[i]];
    return object;
}

function GetMigrationFor(dbname, table) {
    var mid = null;
    var db = Ti.Database.open(dbname);
    db.execute("CREATE TABLE IF NOT EXISTS migrations (latest TEXT, model TEXT);");
    var rs = db.execute("SELECT latest FROM migrations where model = ?;", table);
    if (rs.isValidRow()) var mid = rs.field(0) + "";
    rs.close();
    db.close();
    return mid;
}

function Migrate(Model) {
    var migrations = Model.migrations || [];
    var lastMigration = {};
    migrations.length && migrations[migrations.length - 1](lastMigration);
    var config = Model.prototype.config;
    config.adapter.db_name || (config.adapter.db_name = ALLOY_DB_DEFAULT);
    var migrator = new Migrator(config);
    var targetNumber = "undefined" == typeof config.adapter.migration || null === config.adapter.migration ? lastMigration.id : config.adapter.migration;
    if ("undefined" == typeof targetNumber || null === targetNumber) {
        var tmpDb = Ti.Database.open(config.adapter.db_name);
        migrator.db = tmpDb;
        migrator.createTable(config);
        tmpDb.close();
        return;
    }
    targetNumber += "";
    var currentNumber = GetMigrationFor(config.adapter.db_name, config.adapter.collection_name);
    var direction;
    if (currentNumber === targetNumber) return;
    if (currentNumber && currentNumber > targetNumber) {
        direction = 0;
        migrations.reverse();
    } else direction = 1;
    db = Ti.Database.open(config.adapter.db_name);
    migrator.db = db;
    db.execute("BEGIN;");
    if (migrations.length) for (var i = 0; i < migrations.length; i++) {
        var migration = migrations[i];
        var context = {};
        migration(context);
        if (direction) {
            if (context.id > targetNumber) break;
            if (context.id <= currentNumber) continue;
        } else {
            if (context.id <= targetNumber) break;
            if (context.id > currentNumber) continue;
        }
        var funcName = direction ? "up" : "down";
        _.isFunction(context[funcName]) && context[funcName](migrator);
    } else migrator.createTable(config);
    db.execute("DELETE FROM migrations where model = ?", config.adapter.collection_name);
    db.execute("INSERT INTO migrations VALUES (?,?)", targetNumber, config.adapter.collection_name);
    db.execute("COMMIT;");
    db.close();
    migrator.db = null;
}

function installDatabase(config) {
    var dbFile = config.adapter.db_file;
    var table = config.adapter.collection_name;
    var rx = /(^|.*\/)([^\/]+)\.[^\/]+$/;
    var match = dbFile.match(rx);
    if (null === match) throw 'Invalid sql database filename "' + dbFile + '"';
    config.adapter.db_name = config.adapter.db_name || match[2];
    var dbName = config.adapter.db_name;
    Ti.API.debug('Installing sql database "' + dbFile + '" with name "' + dbName + '"');
    var db = Ti.Database.install(dbFile, dbName);
    if (false === config.adapter.remoteBackup && true) {
        Ti.API.debug('iCloud "do not backup" flag set for database "' + dbFile + '"');
        db.file.setRemoteBackup(false);
    }
    var rs = db.execute('pragma table_info("' + table + '");');
    var cName, cType, columns = {};
    if (rs) {
        while (rs.isValidRow()) {
            cName = rs.fieldByName("name");
            cType = rs.fieldByName("type");
            columns[cName] = cType;
            cName !== ALLOY_ID_DEFAULT || config.adapter.idAttribute || (config.adapter.idAttribute = ALLOY_ID_DEFAULT);
            rs.next();
        }
        rs.close();
    } else {
        {
            config.adapter.idAttribute ? config.adapter.idAttribute : ALLOY_ID_DEFAULT;
        }
        for (var k in config.columns) {
            cName = k;
            cType = config.columns[k];
            cName !== ALLOY_ID_DEFAULT || config.adapter.idAttribute ? k === config.adapter.idAttribute && (cType += " UNIQUE") : config.adapter.idAttribute = ALLOY_ID_DEFAULT;
            columns[cName] = cType;
        }
    }
    config.columns = columns;
    if (config.adapter.idAttribute) {
        if (!_.contains(_.keys(config.columns), config.adapter.idAttribute)) throw 'config.adapter.idAttribute "' + config.adapter.idAttribute + '" not found in list of columns for table "' + table + '"\ncolumns: [' + _.keys(config.columns).join(",") + "]";
    } else {
        Ti.API.info('No config.adapter.idAttribute specified for table "' + table + '"');
        Ti.API.info('Adding "' + ALLOY_ID_DEFAULT + '" to uniquely identify rows');
        var fullStrings = [], colStrings = [];
        _.each(config.columns, function(type, name) {
            colStrings.push(name);
            fullStrings.push(name + " " + type);
        });
        var colsString = colStrings.join(",");
        db.execute("ALTER TABLE " + table + " RENAME TO " + table + "_temp;");
        db.execute("CREATE TABLE " + table + "(" + fullStrings.join(",") + "," + ALLOY_ID_DEFAULT + " TEXT UNIQUE);");
        db.execute("INSERT INTO " + table + "(" + colsString + "," + ALLOY_ID_DEFAULT + ") SELECT " + colsString + ",CAST(_ROWID_ AS TEXT) FROM " + table + "_temp;");
        db.execute("DROP TABLE " + table + "_temp;");
        config.columns[ALLOY_ID_DEFAULT] = "TEXT UNIQUE";
        config.adapter.idAttribute = ALLOY_ID_DEFAULT;
    }
    db.close();
}

function getParam(name) {
    return _.isUndefined(params[name]) ? name : params[name];
}

function logger(DEBUG, message, data) {
    if (DEBUG) {
        Ti.API.debug("[SQL REST API] " + message);
        data && Ti.API.debug("object" == typeof data ? JSON.stringify(data, null, "	") : data);
    }
}

function getETag(url) {
    var obj = Ti.App.Properties.getObject("NAPP_RESTSQL_ADAPTER", {});
    var data = obj[url];
    return data || null;
}

function setETag(url, eTag) {
    if (eTag && url) {
        var obj = Ti.App.Properties.getObject("NAPP_RESTSQL_ADAPTER", {});
        obj[url] = eTag;
        Ti.App.Properties.setObject("NAPP_RESTSQL_ADAPTER", obj);
    }
}

function S4() {
    return (65536 * (1 + Math.random()) | 0).toString(16).substring(1);
}

function guid() {
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

var _ = require("alloy/underscore")._, Alloy = require("alloy"), Backbone = Alloy.Backbone, moment = require("alloy/moment");

var Q = require("q");

var ALLOY_DB_DEFAULT = "_alloy_";

var ALLOY_ID_DEFAULT = "alloy_id";

var cache = {
    config: {},
    Model: {},
    URL: null
};

module.exports.beforeModelCreate = function(config, name) {
    if (cache.config[name]) return cache.config[name];
    if ("mobileweb" === Ti.Platform.osname || "undefined" == typeof Ti.Database) throw "No support for Titanium.Database in MobileWeb environment.";
    config.adapter.db_file && installDatabase(config);
    if (!config.adapter.idAttribute) {
        Ti.API.info('No config.adapter.idAttribute specified for table "' + config.adapter.collection_name + '"');
        Ti.API.info('Adding "' + ALLOY_ID_DEFAULT + '" to uniquely identify rows');
        config.columns[ALLOY_ID_DEFAULT] = "TEXT UNIQUE";
        config.adapter.idAttribute = ALLOY_ID_DEFAULT;
    }
    cache.config[name] = config;
    return config;
};

module.exports.afterModelCreate = function(Model, name) {
    if (cache.Model[name]) return cache.Model[name];
    Model || (Model = {});
    Model.prototype.config.Model = Model;
    Model.prototype.idAttribute = Model.prototype.config.adapter.idAttribute;
    Migrate(Model);
    cache.Model[name] = Model;
    return Model;
};

module.exports.sync = Sync;
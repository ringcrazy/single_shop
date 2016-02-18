/**
 *@json-parse.js json-parse
 *
 * @author zhangjian
 * @date 2013.06.28
 * @version 1.0.5
 */
Mo.define('json-parse', function (M) {
    M.namespace("JSON");
    var _transChar = null,
    _method = null,
    wJSON = M.config.win.JSON;
    if (wJSON) {
        M.JSON = wJSON;
        return;
    }

    _transChar =   {
        '\b' : '\\b',
        '\t' : '\\t',
        '\n' : '\\n',
        '\f' : '\\f',
        '\r' : '\\r',
        '"' : '\\"',
        '\\' : '\\\\'
    };

    _method = {
        'boolean2str' : function (x) {
            return String(x);
        },
        "number2str" : function (x) {
            return isFinite(x) ? String(x) : 'null';
        },
        "string2str" : function (x) {
            if (/["\\\x00-\x1f]/.test(x)) {
                x = x.replace(/([\x00-\x1f\\"])/g, function (a, b) {
                        var c = _transChar[b];
                        if (c) {
                            return c;
                        }
                        c = b.charCodeAt();
                        return '\\u00' +
                        Math.floor(c / 16).toString(16) +
                        (c % 16).toString(16);
                    });
            }
            return '"' + x + '"';
        },
        "object2str" : function (x) {
            if (x) {
                var a = [],
                b,
                f,
                i,
                l,
                v;
                if (x instanceof Array) {
                    a[0] = '[';
                    l = x.length;
                    for (i = 0; i < l; i += 1) {
                        v = x[i];
                        f = _method[((typeof v) + "2str")];
                        if (f) {
                            v = f(v);
                            if (M.Lang.isString(v)) {
                                if (b) {
                                    a[a.length] = ',';
                                }
                                a[a.length] = v;
                                b = true;
                            }
                        }
                    }
                    a[a.length] = ']';
                } else if (x instanceof Object) {
                    a[0] = '{';
                    for (i in x) {
                        v = x[i];
                        f = _method[((typeof v) + "2str")];
                        if (f) {
                            v = f(v);
                            if (M.Lang.isString(v)) {
                                if (b) {
                                    a[a.length] = ',';
                                }
                                a.push(_method.string2str(i), ':', v);
                                b = true;
                            }
                        }
                    }
                    a[a.length] = '}';
                } else {
                    return '';
                }
                return a.join('');
            }
            return '';
        }
    };
    M.extend(M.JSON, {
            /**
             * 将文本解析成对象
             * @class JSON
             * @static
             * @for JSON
             * @public
             * @method parse
             * <p>M.JSON.parse(jsonstring)</p>
             */
			 
            parse : function (text) {
                try {
                    return !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(
                            text.replace(/"(\\.|[^"\\])*"/g, ''))) &&
                    eval('(' + text + ')');
                } catch (e) {
                    return false;
                }
            },
            /**
             * 将对象转换成文本
             * @class JSON
             * @static
             * @for JSON
             * @public
             * @method stringify
             * <p>M.JSON.stringify(object)</p>
             */
            stringify : function (v) {
                var f = _method[((typeof v) + "2str")];
                if (f) {
                    v = f(v);
                    if (M.Lang.isString(v)) {
                        return v;
                    }
                }
                return null;
            }
        });


});

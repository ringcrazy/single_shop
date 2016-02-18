/**
 * 种子入口
 */
(function(win, undef) {
    var mo = function() {
            var m = this,
                instanceOf = function(o, type) {
                    return (o && o.hasOwnProperty && (o instanceof type));
                };
            if (!instanceOf(m, mo)) {
                m = new mo();
            } else {
                m._init();
            }
            m.instanceOf = instanceOf;
            return m;
        },
        guid = (new Date()).getTime(),
        EMPTY = '',
        NAME = 'moui',
        readyList = [],
        NO_ARGS = [],
        config = {
            win: win,
            doc: document,
            prefix: 'id'
        },
        STRING = 'string',
        FUNC = 'function',
        LOADING = 'loading',
        OBJ = 'object',
        ARRAY = 'array',
        NTYPE = 'nodeType',
        TOSTRING = Object.prototype.toString,
        ObjectCreate = Object.create,
        emptyFn = function() {},
        TYPES = {
            'undefined': 'undefined',
            'number': 'number',
            'boolean': 'boolean',
            'string': STRING,
            '[object Function]': FUNC,
            '[object RegExp]': 'regex',
            '[object Array]': ARRAY,
            '[object Date]': 'date',
            '[object Error]': 'error'
        },
        instances = {},
        M, Lang, loader,
        /**
         * 将属性或方法从一个对象复制到另一个对象
         * @param  {String} [p] 属性或方法
         * @param  {Object} [target] 目标对象
         * @param  {Object} [source] 源对象
         * @param  {Boolean} [ov] 是否强制覆盖
         * @return {Null}
         */
        _apply = function(p, target, source, ov) {
            if (ov || !(p in target)) {
                target[p] = source[p];
            }
        },
        getType = function(o) {
            if (typeof o === OBJ && !!o && o.nodeType !== undefined) {
                if (o.nodeType === 3) {
                    return (/\S/).test(o.nodeValue) ? 'textnode' : 'whitespace';
                } else {
                    return 'element';
                }
            } else {
                return TYPES[typeof o] || TYPES[TOSTRING.call(o)] || (o ? OBJ : 'NULL');
            }
        },
        proto;

    mo.Mods = {};

    /** @lends M*/
    proto = {
        namespace: function() {
            var a = arguments,
                o = this,
                i = 0,
                j, d, arg, PERIOD = '.';
            for (; i < a.length; i++) {
                // d = ('' + a[i]).split('.');
                arg = a[i];
                if (arg.indexOf(PERIOD)) {
                    d = arg.split(PERIOD);
                    for (j = (d[0] == 'M') ? 1 : 0; j < d.length; j++) {
                        o[d[j]] = o[d[j]] || {};
                        o = o[d[j]];
                    }
                } else {
                    o[arg] = o[arg] || {};
                }
            }
            return o;
        },
        each: function(o, handle, ctx) {
            var length, i;
            if (!o || !getType(handle) === FUNC) {
                return;
            }
            if (getType(o) === ARRAY) {
                for (i = 0, length = o.length; i < length; i++) {
                    if (handle.call(ctx || o[i], o[i], i) === false) {
                        break;
                    }
                }

            } else {
                for (i in o) {
                    if (handle.call(ctx || o[i], o[i], i) === false) {
                        break;
                    }
                }
            }
        },
        config: config,
        _init: function() {
            var m = this;
            //M._excuteFn(mod.fn)
            m.constructor = Mo;
            //加载依赖的核心组件
            // m._attach(config.core);

            m.id = this.stamp(m);
            instances[m.id] = m;
        },
        getType: getType,
        UA: (function() {
            //设备类型检测 from YUI 3.10.1
            var numberify = function(s) {
                    var c = 0;
                    return parseFloat(s.replace(/\./g,
                        function() {
                            return (c++ === 1) ? '' : '.';
                        }));
                },

                win = window || null,

                nav = win && win.navigator,

                o = {
                    ie: 0,
                    opera: 0,
                    gecko: 0,
                    webkit: 0,
                    safari: 0,
                    chrome: 0,
                    mobile: null,
                    air: 0,
                    ipad: 0,
                    iphone: 0,
                    ipod: 0,
                    ios: null,
                    android: 0,
                    os: null,
                    touchEnabled: false,
                    weixin: 0
                },

                ua = nav && nav.userAgent,
                loc = win && win.location,
                href = loc && loc.href,
                m;

            o.userAgent = ua;

            if (ua) {

                if ((/windows|win32/i).test(ua)) {
                    o.os = 'windows';
                } else if ((/macintosh|mac_powerpc/i).test(ua)) {
                    o.os = 'macintosh';
                } else if ((/android/i).test(ua)) {
                    o.os = 'android';
                } else if ((/symbos/i).test(ua)) {
                    o.os = 'symbos';
                } else if ((/linux/i).test(ua)) {
                    o.os = 'linux';
                } else if ((/rhino/i).test(ua)) {
                    o.os = 'rhino';
                }

                // Modern KHTML browsers should qualify as Safari X-Grade
                if ((/KHTML/).test(ua)) {
                    o.webkit = 1;
                }
                if ((/IEMobile|XBLWP7/).test(ua)) {
                    o.mobile = 'windows';
                }
                if ((/Fennec/).test(ua)) {
                    o.mobile = 'gecko';
                }
                if ((/MicroMessenger/i).test(ua)){
                    o.weixin = 1;
                }
                // Modern WebKit browsers are at least X-Grade
                m = ua.match(/AppleWebKit\/([^\s]*)/);
                if (m && m[1]) {
                    o.webkit = numberify(m[1]);
                    o.safari = o.webkit;

                    if (/PhantomJS/.test(ua)) {
                        m = ua.match(/PhantomJS\/([^\s]*)/);
                        if (m && m[1]) {
                            o.phantomjs = numberify(m[1]);
                        }
                    }

                    // Mobile browser check
                    if (/ Mobile\//.test(ua) || (/iPad|iPod|iPhone/).test(ua)) {
                        o.mobile = 'Apple'; // iPhone or iPod Touch

                        m = ua.match(/OS ([^\s]*)/);
                        if (m && m[1]) {
                            m = numberify(m[1].replace('_', '.'));
                        }
                        o.ios = m;
                        o.os = 'ios';
                        o.ipad = o.ipod = o.iphone = 0;

                        m = ua.match(/iPad|iPod|iPhone/);
                        if (m && m[0]) {
                            o[m[0].toLowerCase()] = o.ios;
                        }
                    }

                    m = ua.match(/(Chrome|CrMo|CriOS)\/([^\s]*)/);
                    if (m && m[1] && m[2]) {
                        o.chrome = numberify(m[2]); // Chrome
                        o.safari = 0; //Reset safari back to 0
                        if (m[1] === 'CrMo') {
                            o.mobile = 'chrome';
                        }
                    } else {
                        m = ua.match(/AdobeAIR\/([^\s]*)/);
                        if (m) {
                            o.air = m[0]; // Adobe AIR 1.0 or better
                        }
                    }
                }

                if (!o.webkit) { // not webkit
                    // @todo check Opera/8.01 (J2ME/MIDP; Opera Mini/2.0.4509/1316; fi; U; ssr)
                    if (/Opera/.test(ua)) {
                        m = ua.match(/Opera[\s\/]([^\s]*)/);
                        if (m && m[1]) {
                            o.opera = numberify(m[1]);
                        }
                        m = ua.match(/Version\/([^\s]*)/);
                        if (m && m[1]) {
                            o.opera = numberify(m[1]); // opera 10+
                        }

                        if (/Opera Mobi/.test(ua)) {
                            o.mobile = 'opera';
                            m = ua.replace('Opera Mobi', '').match(/Opera ([^\s]*)/);
                            if (m && m[1]) {
                                o.opera = numberify(m[1]);
                            }
                        }
                        m = ua.match(/Opera Mini[^;]*/);

                        if (m) {
                            o.mobile = m[0]; // ex: Opera Mini/2.0.4509/1316
                        }
                    } else { // not opera or webkit
                        m = ua.match(/MSIE\s([^;]*)/);
                        if (m && m[1]) {
                            o.ie = numberify(m[1]);
                        } else { // not opera, webkit, or ie
                            m = ua.match(/Gecko\/([^\s]*)/);
                            if (m) {
                                o.gecko = 1; // Gecko detected, look for revision
                                m = ua.match(/rv:([^\s\)]*)/);
                                if (m && m[1]) {
                                    o.gecko = numberify(m[1]);
                                    if (/Mobile|Tablet/.test(ua)) {
                                        o.mobile = "ffos";
                                    }
                                }
                            }
                        }
                    }
                }
            }
            //Check for known properties to tell if touch events are enabled on this device or if
            //the number of MSPointer touchpoints on this device is greater than 0.
            if (win && nav && !(o.chrome && o.chrome < 6)) {
                o.touchEnabled = (("ontouchstart" in win) || (("msMaxTouchPoints" in nav) && (nav.msMaxTouchPoints > 0)));
            }

            //It was a parsed UA, do not assign the global value.

            return o;
        }()),
        /**
         * log封装
         * @param  {String} [t] 类型
         * @param  {String} [msg] 消息
         * @return {Null}
         */
        log: function (t, msg) {
            if (!window.console) {
                return;
            }
            var arg = arguments,
                arg_call = [],
                i, log;
            if (arg.length === 1 || !console[t]) {
                log = console.log;
                if (arg.length === 1) {
                    msg = t;
                    arg_call = [msg];
                    t = undefined;
                } else {
                    arg_call = [t, msg];
                }
            } else if (console[t]) {
                log = console[t];
                for (i = 1; i < arg.length; i++) {
                    arg_call.push(arg[i]);
                }
            }
            if (this.UA.ie) {
                t = t || 'M.log:';
                console.log(t, msg);
            } else {
                try{
                    log.apply(console, arg_call);
                }catch(errpr){
                    t = t || 'M.log:';
                    console.log(t, msg);
                }
            }
        },
        /*
         * 返回当前时间，毫秒.
         * @return {String} 当前时间
         * @method now
         */
        now: Date.now || function() {
            return +new Date();
        },
        /*
         * 生成全局唯一ID.
         * @param {String} [pre] guid的前缀
         * @return {String} 返回guid
         */
        guid: function(pre) {
            var id = NAME + '_' + (++guid);
            return (pre) ? (pre + id) : id;
        },
        /**
         * 获取节点标识
         * @param {String} [o] 节点或字符串
         * @param {Boolean} [readOnly] 是否为只读
         * @return {String} 返回标识
         */
        stamp: function(o, readOnly) {
            var uid;
            if (!o) return o;

            // IE generates its own unique ID for dom nodes
            // The uniqueID property of a document node returns a new ID
            if (o.uniqueID && o[NTYPE] && o[NTYPE] !== 9) {
                uid = o.uniqueID;
            } else {
                uid = (typeof o === STRING) ? o : o.id;
            }

            if (!uid) {
                uid = this.guid();
                if (!readOnly) {
                    try {
                        o.id = uid;
                    } catch (e) {
                        uid = null;
                    }
                }
            }
            return uid;
        },
        /**
         * 将两个对象混合
         * @param {String} [r] 目标对象
         * @param {String} [s] 源对象
         * @param {String} [ov] 是否强制覆盖目标对象的属性或方法
         * @param {String} [wl] 选择需要覆盖的属性或方法
         */
        mix: function(r, s, ov, wl) {
            if (!s || !r) return r;
            if (ov === undef) ov = true;
            var i = 0,
                p, len;

            if (wl && (len = wl.length)) {
                for (; i < len; i++) {
                    p = wl[i];
                    if (p in s) {
                        _apply(p, r, s, ov);
                    }
                }
            } else {
                for (p in s) {
                    _apply(p, r, s, ov);
                }
            }
            return r;
        },
        /**
         *将第二个对象合并到一个新的对象上,并返回
         *@param {object} arguments 将所有参数合并
         *@return {object} 返回merge后的新对象
         */
        merge: function() {
            var a = arguments,
                o = {},
                i, l = a.length;
            for (i = 0; i < l; i = i + 1) {
                a[i] = (typeof a[i] === OBJ) ? a[i] : {};
                mo.mix(o, a[i], true);
            }
            return o;
        },
        /**
         * 继承方法
         *@param {string} r
         *@param {string} s
         *@param {string} px prototype属性
         *@param {string} sx 要增加的新属性
         *@return 返回新对象或方法
         */
        extend: function(r, s, px, sx) {
            if (!s || !r) return r;
            var sp = s.prototype,
                rp;


            // add prototype chain
            if (typeof s === FUNC) {
                rp = this.create(sp, r);
                r.prototype = this.mix(rp, r.prototype);
                //chain r's constrator
                r.superclass = this.create(sp, s);
            }
            if (typeof s === OBJ) {
                this.mix(r.prototype || r, s);
            }
            //新增原型属性
            if (px) {
                M.mix(rp, px);
            }
            //新加入属性
            if (sx) {
                M.mix(r, sx);
            }

            return r;
        },
        /**
         *  对setInterval和setTimeout封装
         * @param  {Int} [when] 延迟时间
         * @param  {Object} [o] 对象
         * @param  {Function} [fn] 方法，如果是字符串，会调用o的对应方法
         * @param  {Array} [data] 回调给回调方法的参数
         * @param  {Boolean} [periodic] 是否为定时循环调用
         * @return {Object} 
         */
        later: function(when, o, fn, data, periodic) {
            when = when || 0;
            data = (!M.Lang.isUndefined(data)) ? M.Array.toArray(data) : NO_ARGS;
            o = o || M.config.win || M;

            var cancelled = false,
                method = (o && M.Lang.isString(fn)) ? o[fn] : fn,
                wrapper = function() {
                    if (!cancelled) {
                        if (!method.apply) {
                            method(data[0], data[1], data[2], data[3]);
                        } else {
                            method.apply(o, data || NO_ARGS);
                        }
                    }
                },
                id = (periodic) ? setInterval(wrapper, when) : setTimeout(wrapper, when);

            return {
                id: id,
                interval: periodic,
                cancel: function() {
                    cancelled = true;
                    if (this.interval) {
                        clearInterval(id);
                    } else {
                        clearTimeout(id);
                    }
                }
            };
        },
        /**
         * 创建一个具有指定原型且可选择性地包含指定属性的对象
         * 对Object.create的封装兼容
         * 
         * @param  {Object} [proto] prototype
         * @param  {Object} [c] 扩展的方法
         * @return {Object} 一个具有指定的内部原型且包含指定的属性（如果有）的新对象。
         */
        create: function(proto, c) {
            var newPrototype;
            if (ObjectCreate) {
                newPrototype = ObjectCreate(proto);
            } else {
                emptyFn.prototype = proto;
                newPrototype = new emptyFn();
            }
            newPrototype.constructor = c;
            return newPrototype;
        },
        /*注册模块
         *@param name {string} 组件名称
         *@param f {function} 组件实现函数
         */
        define: function(name, f) {
            //TODO判断名称是否符合命名规则
            //如果已经注册，则警告
            //如果设置了版本号,则
            mo.Mods[name] = {};
            var mod = mo.Mods[name];
            //正在加载的模块
            if (!mod) {
                log('warn', name + ' has not been registered!    (没有通过Mo.addModule注册)');
                return;
            }
            if (mod.executed) {
                log('warn', name + ' has been registered!');
            }
            mod.fn = f;
            mod.executed = true;
            mod.status = 'success';
            M._excuteFn(mod.fn);
        },
        /**
         *@param cbl {function} 依赖加载完毕后要执行的函数
         *@param [version] {string} 依赖加载完毕后要执行的函数
         */
        ready: function(cbl) {
            cbl(M);
        },
        /**
         *@description  在沙箱中执行函数
         *@method _excuteFn
         *@param f {function}函数
         */
        _excuteFn: function(f) {
            //TODO 每次new一个或者clone一个
            var m = this;
            if (f == undef) {
                m.log('warn', '_excuteFn: f is undefined');
                return false;
            }
            try {
                f.apply(m, [m]);
                return true;
            } catch (error) {
                //TODO 如果是调试，则抛出异常，并设置标识符，尝试加载一次
                debugger
                m.log('warn', 'there is a error in _ex cuteFn!', error);
                throw error;
            }
        }
    };
    mo.prototype = proto;
    for (var prop in proto) {
        if (proto.hasOwnProperty(prop)) {
            mo[prop] = proto[prop];
        }
    }

    win.Mo = mo;
    M = new Mo();
    window.$res = {tpls:{}};
    window.$addTpl = function(cpt, name, content){
        window.$res.tpls[cpt] = window.$res.tpls[cpt] || {};
        window.$res.tpls[cpt][name] = content;
    };    
}(this)); 
/**
 * 扩展对象
 * @memberOf M
 * @class Object
 */
/**
 * 常用方法封装
 * @memberOf M
 * @namespace Lang
 */
/**
 * 常用方法封装
 * @memberOf M.Lang
 * @namespace Escape
 */
Mo.define('lang', function(M) {

    M.namespace('Array');
    M.namespace('Object');

    (function() {
        try {
            localStorage.test = 1;
        } catch (error) {
            window.localStorage = {};
        }
        //
    }());


    var getType = M.getType,
        ARRAY = 'array',
        BOOLEAN = 'boolean',
        DATE = 'date',
        ERROR = 'error',
        ELEMENT = 'element',
        FUNCTION = 'function',
        NODETYPE = 'nodeType',
        NUMBER = 'number',
        NULL = 'null',
        OBJECT = 'object',
        REGEX = 'regexp',
        STRING = 'string',
        UNDEFINED = undefined,
        TOSTRING = Object.prototype.toString,
        HASOWN = Object.prototype.hasOwnProperty,
        TRIMREGEX = /^\s+|\s+$/g,

        isError = {
            'false': function(d) {
                return !d
            }
        },
         /**
          * 验证一个变量是否存在
          * @param  {anything}  bol 要验证的变量
          * @param  {Function}  s   验证为true时的回调函数
          * @param  {Function}  f   验证为false时的回调函数
          * @return {Boolean}     返回验证的变量
          */
        isType = function(bol, s, f) {
            if (bol) {
                if (s) {
                    s();
                }
            } else {
                if (f) {
                    f();
                }
            }
            return bol;
        },
        _templayer;
    /**
     * @lends M.Lang
     */
    M.Lang = {
        /**
         * 模板缓存层
         * @param  {String} n 模板
         */
        templayer: function(n) {
            _templayer = M.one('#mo_temporal_layer');
            if (!_templayer) {
                _templayer = M.Node.create('<div id="mo_temporal_layer"></div>')
                M.one('body').append(_templayer);
            }
            M.Lang.templayer = function(n1) {
                _templayer.append(n1);
            }
            M.Lang.templayer(n);
        },
        /**
         * 去除字符串两端的空白
         * @param {String} str 文本
         * @return {String}
         **/
        trim: function(s){
            if(String.prototype.trim){
                return (s && s.trim) ? s.trim() : s;
            }else{
                try {
                    return s.replace(TRIMREGEX, '');
                } catch (e) {
                    return s;
                }
            }

        },
        /**
         * 克隆
         * @param  {Anthing} o      克隆源对象
         * @param  {Boolean} [safe]   是否启用安全模式
         * @param  {Function} [fn]      检测被克隆对象上的属性需要满足的函数
         * @param  {Objecr} [c]      fn函数运行的环境
         * @return {Anthing}        克隆对象
         */
        clone: function(o, safe, fn, c) {
            var o2, stamp;

            if (!L.isObject(o) || M.instanceOf(o, Mo) || (o.addEventListener || o.attachEvent)) {
                return o;
            }
            switch (getType(o)) {
                case 'date':
                    return new Date(o);
                case 'regexp':
                    // if we do this we need to set the flags too
                    // return new RegExp(o.source);
                    return o;
                case 'function':
                    // o2 = Y.bind(o, owner);
                    // break;
                    return o;
                case 'array':
                    o2 = [];
                    break;
                default:
                    o2 = {};
            }

            M.each(o, function(v, k) {
                if ((k || k === 0) && (!fn || (fn.call(c || this, v, k, this, o) !== false))) {
                    //if (k !== CLONE_MARKER) {
                    if (k == 'prototype') {
                        // skip the prototype
                        // } else if (o[k] === o) {
                        //     this[k] = this;
                    } else {
                        this[k] = L.clone(v, safe, fn, c);
                    }
                    //}
                }
            }, o2);

            return o2;
        },
         /**
          * 验证传入的值是否是为真
          * @param  {String}   data 需要验证的数据
          * @param  {Function | String} fn   自定义验证函数|或指定函数，可用默认方法false
          * @param  {String}   msg  错误时提示消息
          * @param  {Function}   cbl  通过验证时运行的方法
          * @return {Boolean}        判断结果
          */
        verify: function(data, fn, msg, cbl) {
            //
            //verify(data,'false',cbl)
            //verify(data,'msg',cbl)
            var args = arguments;
            //if (args.length === 3 || L.isString(fn)) {
            if (args.length === 3) {
                cbl = msg;
                msg = fn;
                fn = 'false';
            }
            cbl = cbl || function() {};
            if (isError[fn](data)) {
                M.log('error', msg);
                M.log('info', data);
                return false;
            } else {
                cbl();
                return true;
            }
        },
        /**
         * 解析a=b&c=d
         * @param  {String} data 源字符串
         * @return {Object}      解析后的对象
         */
        getDataValue: function(data) {
            if (!data) {
                return {};
            } else {
                var value = {};
                data = data.split("&");
                var key, val;

                for (var i = 0, m = data.length; i < m; i++) {
                    data[i] = data[i].split("=");
                    key = data[i][0];
                    val = data[i][1];
                    value[key] = val == 'true' ? true : (val == 'false' ? false : val);
                    if (value[key] - 0 == value[key]) {
                        value[key] = value[key] - 0;
                    }
                }
            }
            return value;
        },
        /**
         *提取URL中参数
         *@param {string} url URL
         *@return {object} 参数的键值对对象
         */
        getUrlParam: function(url) {
            var regx = /[&|\?](\w*?)=([^&\?#]+)/g;
            return (function(o) {
                var result = null,
                    hash = {};
                result = regx.exec(o);
                while (result) {
                    hash[result[1]] = result[2];
                    result = regx.exec(o);
                }
                return hash;
            })(url);
        },
        /*
         *分析aa?dd=cc&&bb=rr
         *@param {string} url URL
         *@return {object} 对象
         */
        parseUrl:function(string){
            var regx = /[&|\?](\w*?)=([^&\?#]+)/g;
            var regn = /([\/|\w]*?)\?/;
            return (function(o) {
                var result = null,
                    hash = {};
                hash.params = {};
                result = regx.exec(o);
                if(regn.exec(o)){
                    hash.hash = regn.exec(o)[1];
                }else{
                    hash.hash = o;
                }
                while (result) {
                    hash.params[result[1]] = result[2];
                    result = regx.exec(o);
                }
                return hash;
            })(string);
        },
        /**
         * 根据URL返回host
         * @param  {String} path 源URL字符串
         * @return {String}      URL的HOST部分
         */
        getUrlHost: function(path) {
            var a = document.createElement("a"),
                host;
            a.href = path;
            var m = a.href.match(/(?:https?\:)?(?:\/\/)?([a-z,A-Z.,\-,0-9]+)(?:\:(\d+)?)?/)
            host = {
                hostname: m[1] || a.hostname,
                host: (m[1] + (m[2] ? ':' + m[2] : '')) || a.host
            };
            a = null;
            return host;
        },

        /**
         * 遍历对象的属性，如果某属性是方法，这执行该方法，并根据返回值对该属性重新赋值
         * @param  {Object} obj 源对象
         * @param  {everything} ctx 执行参数
         * @return {Object}     遍历后的对象
         */
        exeObjValue: function(obj, ctx) {
            var o = {};
            M.each(obj, function(item, key) {
                o[key] = L.isFunction(item) ? item(ctx) : item;
            });
            return o;
        },
        /**
         * 设置对象的值
         * @param {Object} o    目标对象
         * @param {String} path 属性路径 
         * @param {Everything} val  属性值
         * @example
         * setObjValue(node,'a.b','c');
         * alert(node.a.b) //输出 c
         */
        setObjValue: function(o, path, val) {
            var i,
                p = path.split('.'),
                l = p.length,
                ref = o;

            if (p.length > 0) {
                for (i = 0; ref !== UNDEFINED && i < l - 1; i++) {
                    if (!ref[p[i]]) {
                        ref[p[i]] = {};
                    }
                    ref = ref[p[i]]
                }
                ref[p[i]] = val;
            }

            return o;
        },
        /**
         * 通过字符串获取对象对应属性的值
         * @param  {Obejct} o    源对象
         * @param  {String} path 属性字符串路径
         * @return {Everything}      值
         */
        getObjValue: function(o, path) {
            if (!L.isObject(o)) {
                return UNDEFINED;
            }

            var i,
                p = path.split('.'),
                l = p.length;

            for (i = 0; i < l; i++) {
                if (o !== UNDEFINED) {
                    o = o[p[i]];
                } else {
                    return UNDEFINED;
                }
            }

            return o;
        },
        /**
        * 计算中文文本长度方法
        * @param {string} string 文本
        * @return {number} 返回中文文本长度
        */
        getChStringLen: function(string) {
            return string.replace(/[^\u00-\uFF]/g, "**").length;
        },
        /**
         * 判断是否是数组
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是数组返回true,
         */
        isArray: function(o, s, f) {
            return isType(getType(o) === ARRAY, s, f);
        },
        /**
         * 判断是否为真
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是真返回true,
         */
        isTrue: function(o, s, f) {
            return isType(!!o, s, f);
        },
        /**
         * 判断是否为布尔型
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是布尔型返回true,
         */
        isBoolean: function(o, s, f) {
            return isType(typeof o === BOOLEAN,
                s, f);
            // return typeof o === BOOLEAN;
        },
        /**
         * 判断是否为函数
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是函数返回true,
         */
        isFunction: function(o, s, f) {
            return isType(getType(o) === FUNCTION,
                s, f);
            // return getType(o) === FUNCTION;
        },
        /**
         * 判断是否为时间
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是时间返回true,
         */
        isDate: function(o, s, f) {
            return isType(getType(o) === DATE && o.toString() !== 'Invalid Date' && !isNaN(o),
                s, f);
            // return getType(o) === DATE && o.toString() !== 'Invalid Date' && !isNaN(o);
        },
        /**
         * 判断是否为数字
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是数字返回true,
         */
        isNumber: function(o, s, f) {
            return isType(typeof o === NUMBER && isFinite(o),
                s, f);
            // return typeof o === NUMBER && isFinite(o);
        },
        /**
         * 判断是否为空
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是空返回true,
         */
        isNull: function(o, s, f) {
            return isType(o === null,
                s, f);
            // return o === null;
        },
        /**
         * 判断是否为字符串
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是字符串返回true,
         */
        isString: function(o, s, f) {
            return isType(typeof o === STRING,
                s, f);
            // return typeof o === STRING;
        },
        /**
         * 判断是否为Undefined
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是Undefined返回true,
         */
        isUndefined: function(o, s, f) {
            return isType(typeof o === 'undefined',
                s, f);
        },
        /**
         * 判断是否为Object
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是Object返回true,
         */
        isObject: function(o, s, f) {
            var t = typeof o;
            return isType(o && t === OBJECT,
                s, f);
        },
        /**
         * 判断是否为空的Object
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是空的Object返回true,
         */
        isEmptyObject: function(o, s, f) {
            var b = true;
            for (var p in o) {
                return false;
            }
            return isType(b, s, f);

        },
        /**
         * 判断是否为节点
         * @param  {everything}  o 要判断的参数
         * @param  {Function}  [s] 满足的话运行的函数
         * @param  {Function}  [f] 失败的话运行的函数
         * @return {Boolean}     是节点返回true,
         */
        isNode: function(el, s, f) {
            var t;
            return isType(el && typeof el === OBJECT && (t = el[NODETYPE]) && (t == 1 || t == 9), s, f);
        },
        /**
         * 对字符串进行encodeUrl编码
         * @param  {String} o 目标字符串
         * @return {String}   编码后的字符串
         */
        encodeUrl: function(o) {
            if (!o) {
                return "";
            }
            var ret = [];
            M.each(o, function(val, key) {
                ret.push(key + '=' + encodeURIComponent(val));
            });
            return ret.join('&');
        }
    };


    var L = M.Lang,
        /**
         * @lends M.Object
         */
        MObject = {
            keys: function(O) {
                var keys = [],
                    key;
                for (key in O) {
                    keys.push(key);
                }
                return keys;
            },
            /**
             * 只实现简单的obj长度换算
             * @param  {Object} O 要计算长度Object
             * @return {Int}   obj的长度
             */
            size: function(O) {
                return MObject.keys(O).length;
            }
        };

    

    //Escape方法 用于替换html标记，防止xss
    var HTML_CHARS = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;',
            '`': '&#x60;'
        },
        /**
         * @lends M.Lang.Escape
         */
        Escape = {
            /**
             * 将html转义，转移规则为HTML_CHARS
             * @param  {String} string 需要转义的字符串
             * @return {String}        转义后的字符串
             */
            html: function(string) {
                return (string + '').replace(/[&<>"'\/']/g, Escape._htmlReplacer);
            },

            /**
             * 匹配转义规则
             * @param {String} match 符号
             * @return {String} 对应的转义字符
             * @static
             * @protected
             */
            _htmlReplacer: function(match) {
                return HTML_CHARS[match];
            },
            /**
             * 返回移除了任何 HTML 或 XML 标签的字符串
             * @param {String} str 原始字符串
             * @return {String}   返回过滤后的字符串
             */
            stripTags: function(str) {
                return str.replace(/<\/?[^>]+>/gi, '');
            },
            /**
             * 返回过滤后的html文本
             * @param {String} str 原始字符串
             * @return {String} 返回过滤后的字符串
             */
            stripHTML: function(str) {
                return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/\&/g, '&amp;');
            },
            /**
             * 返回移除了任何script块的字符串
             * @param {String} str   原始字符串
             * @return {String}      返回过滤后的字符串
             */
            stripScripts: function(str) {
                return str.replace(new RegExp('<script[^>]*>([\\S\\s]*?)<\/script>', 'img'), '');
            }
        };
    /**
     * @lends M.Lang
     */
    var MTime = {
        /**
         * 根据一个日期获取当日是第几周
         * @param  {Date} date 目标日期
         * @return {Number}     周数
         */
        getWeekIndex: function(date) {
            if (!M.Lang.isDate(date)) {
                M.log('error', 'M.Lang.getWeekIndex： param "dete" is not a dateobject');
                return;
            }
            var firstDay = new Date([date.getFullYear(), 1, 1].join('/'));
            //第一天是周几
            var firstDayOfWeek = firstDay.getDay();
            //好秒差
            var subMillisends = (date - firstDay) / 86400000 /*好秒差24*60*60*1000*/ + ((firstDayOfWeek === 0 ? 0 : (firstDayOfWeek))); //1000*60

            return Math.ceil(subMillisends / 7);
        },
        /**
         * 根据周数获取日期范围
         * @param  {Number} year      目标年分
         * @param  {Number} weekIndex 周数
         * @return {Obejct}           日期范围
         * 
         */
        getWeekOfRange: function(year, weekIndex) {
            var firstDate = new Date(year, 0, 1);
            var firstDay = firstDate.getDay();
            var sDate = new Date(firstDate - firstDay * 86400000 + (weekIndex - 1) * 604800000);
            var eDate = new Date(sDate - 10 + 604800000);

            return {
                sdate: sDate,
                edate: eDate,
                start: {
                    year: sDate.getFullYear(),
                    month: sDate.getMonth() + 1,
                    date: sDate.getDate()
                },
                end: {
                    year: eDate.getFullYear(),
                    month: eDate.getMonth() + 1,
                    date: eDate.getDate()
                }
            }
        }
    };
    /**
     * @lends M.Lang
     */
    var MUserAgent = {
        isCool: function() {
            var ua = M.UA;
            if (ua.ios || ua.iphone || ua.ipad || ua.ipod) {
                return true;
            }
            return false;
        }

    }

    M.Lang.Escape = Escape;


    M.extend(M.Object, MObject);
    M.extend(M.Lang, MTime);
    M.extend(M.Lang, MUserAgent);

}); 
/**
 * 扩展数组方法
 * @memberOf M
 * @namespace Array
 */
Mo.define('array', function(M) {
    var L = M.Lang;
	M.Array = {};
    /**
     * @lends M.Array
     */
    var MArray = {
        //继承至M.each
        each: M.each,
        /**
        * 数组去重操作的方法
        * @param {Array} a 需要去重的数组
        * @return {Array} 返回去重之后的数组
        * @example
        * ###js
        * var a = M.Array.dedupe(['a','a','b','b']);
        * console.log(a) //['a','b'];
        */
        dedupe: function(a) {
            var hash = {},
                results = [],
                i,
                item,
                len,
                hasOwn = HASOWN;

            for (i = 0, len = a.length; i < len; ++i) {
                item = a[i];
                if (!hasOwn.call(hash, item)) {
                    hash[item] = 1;
                    results.push(item);
                }
            }
            return results;
        },

        /**
         * 查找元素所处数组中的位置
         * @param {String} item 需要查找的元素
         * @param {Array} arr 元素是否包含的数组
         * @return {Number} 返回元素所处数组位置
         *
         * @example
         * ###js
         * var array = ['a','b',c];
         * var index = M.Array.indexOf('a',array);
         * console.log(index) //0
         */
        indexOf: Array.indexOf ?
            function(item, arr) {
                return Array.indexOf(arr, item);
            } : function(item, arr) {
                if (!arr) return;
                for (var i = 0, len = arr.length; i < len; ++i) {
                    if (arr[i] === item) {
                        return i;
                    }
                }
                return -1;
            },
        /**
         * 判断元素是否包含在数组中
         * @param {String} item 需要查找的元素
         * @param {Array} arr 元素是否包含的数组
         * @return {Boolean} 返回元素是否包含
         * @example
         * ###js
         * var array = ['a','b','c'];
         * var bo = M.Array.inArray('a',array);
         * console.log(boolean); //true
         */
        inArray: function(item, arr) {
            return MArray.indexOf(item, arr) > -1;
        },


        /**
         * 将序列化对象转化为数组的方法
         * @param {Object} arr 序列化的对象
         * @return {Array} 返回序列化后的新数组
         * @example
         * var cc = {'a':0,'b':1,'c':2};
         * var a = M.Array.toArray(cc);
         * console.log(a); //[0,1,2];
         */
        toArray: function(arr) {
            var r = [],
                i = 0,
                arr = arr || [],
                len = arr.length;
            if (L.isArray(arr)) return arr;
            for (; i < len; i++) {
                r[i] = arr[i];
            }
            return r;
        },
        /**
        *替换数组中的item,只匹配第一个
        *@param {value} oldItem  要替换的数值
        *@param {Array} newItem  新的数值
        *@param {value} arr  需要操作的数组
        *@example
        * ###JS
        * var a = ['a','b','c','a'];
        * M.Array.replaceArray('a','f',a);
        * console.log(a) //['f','b','c','a']
        */
       
        replaceArray: function(oldItem, newItem, arr) {
            for (var i = 0, m = arr.length; i < m; i++) {
                if (arr[i] == oldItem) {
                    arr.splice(i, 1, newItem);
                    break;
                }
            }
            return arr;
        },
        /**
         *删除数组中的item
         *@param {value} item 要删除的数值
         *@param {Array} arr 需要操作的数组
         *@param {Function} [fn] 数组元素需要满足的函数 参数：当前元素，要删除的元素，当前元素索引 返回值为布尔
         *@param {Boolean} [all] 是否匹配全部
         *@example
         * ###js
         * var a = [1,2,3,1];
         * M.Array.removeArray(1,a);
         * console.log(b)//[2,3,1];
         * ###js
         * var a = [1,2,3,1];
         * M.Array.removeArray(1,a,,true);
         * console.log(a)//[2,3];
         * ###js
         * var a = [1,2,3,1];
         * M.Array.removeArray(0,a,function(nitem,item,i){
         *     if(i==1){
         *         reutrn true;
         *     }
         * });
         * console.log(a)//[1,3,1];
         */
        removeArray: function(item, arr, fn, all) {
            var l = arr.length;
            for (var i = 0, m = l; i < m; i++) {
                if (arr[i] == item || fn && fn(arr[i], item, i)) {
                    arr.splice(i, 1);
                    if (all) {
                        if (i < l - 1) {
                            i--;
                        }
                        continue;
                    } else {
                        break;
                    }
                }
            }
        },
        /**
         *两个数组转化为键值对应的对象的方法
         *@example

            M.Array.hash(['a', 'b', 'c'], ['foo', 'bar']);
            // => {a: 'foo', b: 'bar', c: true}

         *@param {String[]} keys 用于构成对象的key序列.
         *@param {Array} [values] 用于构成对象value的数组.
         *@return {Object} 返回以第一个数组为key，第二个数组为值的对象,长度小于key序列时对应值为true.
        */
        hash: function(keys, values) {
            var hash = {},
                vlen = (values && values.length) || 0,
                i, len;

            for (i = 0, len = keys.length; i < len; ++i) {
                if (i in keys) {
                    hash[keys[i]] = vlen > i && i in values ? values[i] : true;
                }
            }
            return hash;
        },

        /**
         *测试对象是否为数组或类数组或两者都不属于的方法
         *@method test
         *@param {Object} obj 待测试的对象.
         *@return {Number} A 返回结果显示:

           * 0: 既不是数组也不是类数组.
           * 1: 数组.
           * 2: 类数组.
         */
        test: function(obj) {
            var result = 0;

            if (L.isArray(obj)) {
                result = 1;
            } else if (L.isObject(obj)) {
                try {
                    // indexed, but no tagName (element) or scrollTo/document (window. From DOM.isWindow test which we can't use here),
                    // or functions without apply/call (Safari
                    // HTMLElementCollection bug).
                    if ('length' in obj && !obj.tagName && !(obj.scrollTo && obj.document) && !obj.apply) {
                        result = 2;
                    }
                } catch (ex) {}
            }

            return result;
        },
        /**
         * 将多维混合数组展开成1维数组
         * @param  {Array} arr 目标数组
         * @return {Array}    返回展开后的数组
         * @example
         * var a = [[1,2,3],[4,5],6];
         * var b = M.Array.flatten(a);
         * console.log(b);//[1,2,3,4,5,6];
         */
        flatten: function(arr) {
            for (var r = [], i = 0, l = arr.length; i < l; ++i) 
            {
                if(MArray.test(arr[i])){
                    var b = MArray.flatten(arr[i]);
                    r = r.concat(b);
                }else{
                    r[r.length] = arr[i]
                }

            }
            return r
        },
        /**
         * 按照一定规则过滤数组
         * @param  {Array} arr   目标数组
         * @param  {Function} fun   过滤函数，需要返回true或false
         * @param  {Object} thisp 函数内的指针，可为空
         * @return {Array}       过滤后的数组
         */
        filter: function(arr, fun, thisp) {

            if (arr == null)
                throw new TypeError();

            var t = Object(arr);
            var len = t.length >>> 0;
            if (typeof fun != "function") {
                throw new TypeError();
            }

            var res = [];
            var thisp = arguments[1];
            for (var i = 0; i < len; i++) {
                if (i in t) {
                    var val = t[i]; // in case fun mutates this
                    if (fun.call(thisp, val, i, t))
                        res.push(val);
                }
            }

            return res;
        },

        // ES5 15.4.4.19
        // http://es5.github.com/#x15.4.4.19
        // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
        map: function map(arr, callback, thisArg) {

            var T, A, k;

            if (arr == null) {
                throw new TypeError(" this is null or not defined");
            }

            // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
            var O = Object(arr);

            // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0;

            // 4. If IsCallable(callback) is false, throw a TypeError exception.
            // See: http://es5.github.com/#x9.11
            if (typeof callback !== "function") {
                throw new TypeError(callback + " is not a function");
            }

            // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
            if (thisArg) {
                T = thisArg;
            }

            // 6. Let A be a new array created as if by the expression new Array(len) where Array is
            // the standard built-in constructor with that name and len is the value of len.
            A = new Array(len);

            // 7. Let k be 0
            k = 0;

            // 8. Repeat, while k < len
            while (k < len) {

                var kValue, mappedValue;

                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                if (k in O) {

                    // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                    kValue = O[k];

                    // ii. Let mappedValue be the result of calling the Call internal method of callback
                    // with T as the this value and argument list containing kValue, k, and O.
                    mappedValue = callback.call(T, kValue, k, O);

                    // iii. Call the DefineOwnProperty internal method of A with arguments
                    // Pk, Property Descriptor {Value: mappedValue, : true, Enumerable: true, Configurable: true},
                    // and false.

                    // In browsers that support Object.defineProperty, use the following:
                    // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });

                    // For best browser support, use the following:
                    A[k] = mappedValue;
                }
                // d. Increase k by 1.
                k++;
            }

            // 9. return A
            return A;
        }

    };
	M.extend(M.Array, MArray);
}); 
Mo.define('base', function(M) {
    var L = M.Lang,
        VALUE = 'value',
        DATA_KEY = '_$data';
    /**
     * 基础类，实现get,set方法
     * @constructor M.Base
     */
    function Base() {}

    
    M.extend(Base, /** @lends M.Base.prototype */{
        /**
         * 初始化（ATTRS）默认属性
         */
        initDataByAttrs: function() {
            // self[DATA_KEY][key] = L.clone(value);
            /*    if(value.value){
                //self[DATA_KEY][key].value = value.value;
            }*/
            //self[DATA_KEY][key] = value;

            var self = this,
                attrs = self.constructor.ATTRS;
            if (!self[DATA_KEY]) {
                self[DATA_KEY] = {};
            }

            M.each(attrs, function(obj, key) {
                self[DATA_KEY][key] =
                    L.isObject(obj) && (!L.isUndefined(obj.value) || !L.isUndefined(obj.getter)|| !L.isUndefined(obj.setter)) ? L.clone(obj) : {
                        value: obj
                    }
            });
        },
        /**
         * 获取一个属性值
         * @param  {String} name 属性名称
         * @return {Any}    
         */
        get: function(name) {
            var d = this[DATA_KEY];
            return (d && name in d) ? (d[name]['getter'] ? d[name]['getter'].call(this,  d[name]) : d[name][VALUE]) : undefined;
        },
        /**
         * 获取一组属性值
         * @param  {String} names 用逗号隔开的属性列表，如：属性1,属性2...
         * @return {Object}       键值对形式的一组值
         */
        getAttrs: function(names) {
            var vs = {},
                self = this;
            M.each(names.split(','), function(k) {
                vs[k] = self.get(k);
            });
            return vs;
        },
        setter: function(obj) {
            if (!obj) return;
            for (var key in obj) {
                this.set(key, obj[key]);
            }
        },
        /**
         * 设置一组属性值
         * @param {Object<{key1:value1,key2:value2}>} attrs 一组属性值
         */
        setAttrs: function(attrs) {
            var self = this;
            M.each(attrs, function(value, key) {
                self.set(key, value);
            });
        },
        /**
         * 设置一个属性值
         * @param {String}  name    属性名称
         * @param {Any}  val     属性值
         * @param {Boolean} isClone 是否强制赋值。在值是Object时有效
         */
        set: function(name, val, isClone) {
            var d = this[DATA_KEY];
            if (isClone === true) {
                val = L.clone(val);
            }
            if (!(d && d[name])) {
                d[name] = {};
            }

            if (d && name in d && d[name].readOnly == true) return this;

            if (d[name]['setter']) {
                val = d[name]['setter'].call(this, val,  d[name]);
            }

            d[name][VALUE] = val;
            return this;
        }
    });
    M.Base = Base;
}); 
/**
 * 节点基础操作
 */
Mo.define('dom', function(M) {

    M.namespace('DOM');

    var OWNER_DOCUMENT = 'ownerDocument',
        GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect',
        DOCUMENT_ELEMENT = 'documentElement',
        documentElement = M.config.doc.documentElement,
        COMPAT_MODE = 'compatMode',
        STR_NODE_TYPE = 'nodeType',
        STR_TAG_NAME = 'tagName',
        STR_PARENT_NODE = 'parentNode',
        STR_CONTAINS = 'contains',
        EMPTY_ARRAY = [],
        _bruteContains = function(element, needle) {
            while (needle) {
                if (element === needle) {
                    return true;
                }
                needle = needle.parentNode;
            }
            return false;
        };
    // IE < 8 throws on node.contains(textNode)
    var supportsContainsTextNode = (function() {
        var node = M.config.doc.createElement('div'),
            textNode = node.appendChild(M.config.doc.createTextNode('')),
            result = false;

        try {
            result = node.contains(textNode);
        } catch (e) {}

        return result;
    })();
    
    var DOM = {

        /**
         * 通过ID获取节点
         * @param {String} id 节点ID
         * @param {Object} doc 父节点，默认是document
         * @return {HTMLElement | null} HTMLElement或者null
         */
        byId: function(id, doc) {
            // handle dupe IDs and IE name collision
            return DOM.allById(id, doc)[0] || null;
        },
        /**
         * 获取节点ID
         * @param  {Object} node 
         * @return {String} 节点ID  
         */
        getId: function(node) {
            var id;
            if (node.id && !node.id.tagName && !node.id.item) {
                id = node.id;
            } else if (node.attributes && node.attributes.id) {
                id = node.attributes.id.value;
            }

            return id;
        },
        /**
         * 设置节点ID
         * @param {Object} node 节点
         * @param {String} id   节点ID
         */
        setId: function(node, id) {
            if (node.setAttribute) {
                node.setAttribute('id', id);
            } else {
                node.id = id;
            }
        },
        /**
         * 查找父节点
         * @param  {Object}   element  基础节点
         * @param  {Function} [fn]       父节点需要满足的函数必须返回true和false
         * @param  {Boolean}   [testSelf] 是否用fn检测当前节点
         * @param  {Function}   [stopFn]   是否需要停止查找函数必须返回true和false
         * @return {HTMLElement | null}            返回父节点
         */
        ancestor: function(element, fn, testSelf, stopFn) {
            var ret = null;
            if (testSelf) {
                ret = (!fn || fn(element)) ? element: null;

            }
            return ret || DOM.elementByAxis(element, STR_PARENT_NODE, fn, null, stopFn);
        },
        /**
         * 返回父节点数组
         * @param  {Object}   element  基础节点
         * @param  {Function} [fn]       父节点需要满足的函数必须返回true和false
         * @param  {Boolean}   [testSelf] 是否用fn检测当前节点
         * @param  {Function}   [stopFn]   是否需要停止查找函数必须返回true和false
         * @return {Array}            返回父节点数组
         */
        ancestors: function(element, fn, testSelf, stopFn) {
            var ancestor = element,
            ret = [];
            //递归查找父节点，把满足的节点插入ret
            while ((ancestor = DOM.ancestor(ancestor._node || ancestor, fn, testSelf, stopFn))) {
                testSelf = false;
                if (ancestor) {
                    ret.unshift(ancestor);

                    if (stopFn && stopFn(ancestor)) {
                        return ret;
                    }
                }
            }
            return ret;
        },
        /**
         * 按照一定规则查找节点的实现
         * @param  {Object}   element 基础节点
         * @param  {String}   axis    查找节点的方法 nextSibling：下一个节点  previousSibling：上一个节点
         * @param  {Function} fn      节点需要满足的函数必须返回true和false|默认为空
         * @param  {Boolean}   all     ?
         * @param  {Function}   stopAt  是否需要停止查找函数必须返回true和false|默认为空
         * @return {HTMLElement | null}           返回父节点
         */
        elementByAxis: function(element, axis, fn, all, stopAt) {
            while (element && (element = element[axis])) { // NOTE: assignment
                if ((all || element['tagName']) && (!fn || fn(element))) {
                    return element;
                }

                if (stopAt && stopAt(element)) {
                    return null;
                }
            }
            return null;
        },
        /**
         * 判断一个节点是否在另一个节点之内
         * @param  {Object} element 基础节点
         * @param  {Object} needle  判断节点
         * @return {Boolean}        
         */
        contains: function(element, needle) {
            var ret = false;

            if (!needle || !element || !needle[STR_NODE_TYPE] || !element[STR_NODE_TYPE]) {
                ret = false;
            } else if (element[STR_CONTAINS] &&
            // IE < 8 throws on node.contains(textNode) so fall back to brute.
            // Falling back for other nodeTypes as well.
            (needle[STR_NODE_TYPE] === 1 || supportsContainsTextNode)) {
                ret = element[STR_CONTAINS](needle);
            } else if (element[COMPARE_DOCUMENT_POSITION]) {
                // Match contains behavior (node.contains(node) === true).
                // Needed for Firefox < 4.
                if (element === needle || !!(element[COMPARE_DOCUMENT_POSITION](needle) & 16)) {
                    ret = true;
                }
            } else {
                ret = _bruteContains(element, needle);
            }

            return ret;
        },
        /**
         * 判断节点是否在document内
         * @param  {Object} element 基础节点
         * @param  {Object} doc     文档范围|默认为document
         * @return {Boolean}         返回
         */
        inDoc: function(element, doc) {
            var ret = false,
            rootNode;

            if (element && element.nodeType) { (doc) || (doc = element[OWNER_DOCUMENT]);

                rootNode = doc[DOCUMENT_ELEMENT];

                // contains only works with HTML_ELEMENT
                if (rootNode && rootNode.contains && element.tagName) {
                    ret = rootNode.contains(element);
                } else {
                    ret = DOM.contains(rootNode, element);
                }
            }

            return ret;

        },
        /**
         * 获取所有ID
         * @param  {String} id   节点ID
         * @param  {Object} root 搜索范围默认为document
         * @return {Array}       数组
         */
        allById: function(id, root) {
            root = root || M.config.doc;
            var nodes = [],
                ret = [],
                i,
                node;

            if (root.querySelectorAll) {
                ret = root.querySelectorAll('[id="' + id + '"]');
            } else if (root.all) {
                nodes = root.all(id);

                if (nodes) {
                    // root.all may return HTMLElement or HTMLCollection.
                    // some elements are also HTMLCollection (FORM, SELECT).
                    if (nodes.nodeName) {
                        if (nodes.id === id) { // avoid false positive on name
                            ret.push(nodes);
                            nodes = EMPTY_ARRAY; // done, no need to filter
                        } else { //  prep for filtering
                            nodes = [nodes];
                        }
                    }

                    if (nodes.length) {
                        // filter out matches on node.name
                        // and element.id as reference to element with id === 'id'
                        for (i = 0; node = nodes[i++];) {
                            if (node.id === id  ||
                                    (node.attributes && node.attributes.id &&
                                    node.attributes.id.value === id)) {
                                ret.push(node);
                            }
                        }
                    }
                }
            } else {
                ret = [DOM._getDoc(root).getElementById(id)];
            }

            return ret;
       },
       /**
        * 获取同级几点
        * @param  {Object}   node 基础节点
        * @param  {Function} fn   节点需要满足的方法。默认为空
        * @return {Array}        满足要求的同级节点数组
        */
        siblings: function(node, fn) {
            var nodes = [],
            sibling = node;

            while ((sibling = sibling['previousSibling'])) {
                if (sibling['tagName'] && (!fn || fn(sibling))) {
                    nodes.unshift(sibling);
                }
            }

            sibling = node;
            while ((sibling = sibling['nextSibling'])) {
                if (sibling['tagName'] && (!fn || fn(sibling))) {
                    nodes.push(sibling);
                }
            }

            return nodes;
        },
        /**
         * 获取节点所在document
         * @param  {Object} element 基础节点，可以为空
         * @return {Object}         document
         */
        _getDoc: function(element) {
            var doc = M.config.doc;
            if (element) {
                doc = (element[STR_NODE_TYPE] === 9) ? element: // element === document
                element[OWNER_DOCUMENT] || // element === DOM node
                element.document || // element === window
                M.config.doc; // default
            }

            return doc;
        },
        /**
         * 返回子元素
         * @param  {Object} node 基础节点
         * @param  {String} tag  子元素tagname，可选
         * @return {Array}       符合tag的子节点数组
         */
        _children: function(node, tag) {
            var i = 0,
            children = node.children,
            childNodes,
            hasComments,
            child;

            if (children && children.tags) { // use tags filter when possible
                if (tag) {
                    children = node.children.tags(tag);
                } else { // IE leaks comments into children
                    hasComments = children.tags('!').length;
                }
            }

            if (!children || (!children.tags && tag) || hasComments) {
                childNodes = children || node.childNodes;
                children = [];
                while ((child = childNodes[i++])) {
                    if (child.nodeType === 1) {
                        if (!tag || tag === child.tagName) {
                            children.push(child);
                        }
                    }
                }
            }

            return children || [];
        }
    };
    //混合到M.DOM
    M.mix(M.DOM, DOM);
    
});

 
/**
 * 节点扩展操作
 */
Mo.define('dom-extend', function(M) {
	var DOCUMENT_ELEMENT = 'documentElement',
		COMPAT_MODE = 'compatMode',
        STR_TAG_NAME = 'tagName',
        OWNER_DOCUMENT = 'ownerDocument',
		documentElement = M.config.doc.documentElement;

    var getOffsets = function(r1, r2) {
        var t = Math.max(r1[TOP], r2[TOP]),
            r = Math.min(r1[RIGHT], r2[RIGHT]),
            b = Math.min(r1[BOTTOM], r2[BOTTOM]),
            l = Math.max(r1[LEFT], r2[LEFT]),
            ret = {};

        ret[TOP] = t;
        ret[RIGHT] = r;
        ret[BOTTOM] = b;
        ret[LEFT] = l;
        return ret;
    };
    var M_DOM = M.DOM;
    M.extend(M.DOM, {
        //TODO特殊的元素值设置，不能通过value=形式设置，如select
        VALUE_SETTERS: {
            button: function(node, val) {
                var attr = node.attributes.value;
                if (!attr) {
                    attr = node[OWNER_DOCUMENT].createAttribute('value');
                    node.setAttributeNode(attr);
                }

                attr.value = val;
            },
            select: function(node, val) {
                for (var i = 0,
                        options = node.getElementsByTagName('option'), option; option = options[i++];) {
                    if (M_DOM.getValue(option) === val) {
                        option.selected = true;
                        //Y_DOM.setAttribute(option, 'selected', 'selected');
                        break;
                    }
                }
            }
        },
        VALUE_GETTERS: {
            option: function(node) {
                var attrs = node.attributes;
                return (attrs.value && attrs.value.specified) ? node.value : node.text;
            },

            select: function(node) {
                var val = node.value,
                    options = node.options;

                if (options && options.length) {
                    // TODO: implement multipe select
                    if (node.multiple) {} else if (node.selectedIndex > -1) {
                        val = M_DOM.getValue(options[node.selectedIndex]);
                    }
                }

                return val;
            },
            button: function(node) {
                return (node.attributes && node.attributes.value) ? node.attributes.value.value : '';
            }
        },
        winWidth: function(node) {
            var w = M_DOM._getWinSize(node).width;
            return w;
        },
        winHeight: function(node) {
            var h = M_DOM._getWinSize(node).height;
            return h;
        },
        _getWinSize: function(node, doc) {
            doc = doc || (node) ? M_DOM._getDoc(node) : M.config.doc;
            var win = doc.defaultView || doc.parentWindow,
                mode = doc[COMPAT_MODE],
                h = win.innerHeight,
                w = win.innerWidth,
                root = doc[DOCUMENT_ELEMENT];

            if (mode && !M.UA.opera) { // IE, Gecko
                if (mode != 'CSS1Compat') { // Quirks
                    root = doc.body;
                }
                h = root.clientHeight;
                w = root.clientWidth;
            }
            return {
                height: h,
                width: w
            };
        },
        
        
        docScrollX: function(node, doc) {
            doc = doc || (node) ? M_DOM._getDoc(node) : M.config.doc; // perf optimization
            var dv = doc.defaultView,
                pageOffset = (dv) ? dv.pageXOffset : 0;
            return Math.max(doc[DOCUMENT_ELEMENT].scrollLeft, doc.body.scrollLeft, pageOffset);
        },
        docScrollY: function(node, doc) {
            doc = doc || (node) ? M_DOM._getDoc(node) : M.config.doc; // perf optimization
            var dv = doc.defaultView,
                pageOffset = (dv) ? dv.pageYOffset : 0;
            return Math.max(doc[DOCUMENT_ELEMENT].scrollTop, doc.body.scrollTop, pageOffset);
        },
        getValue: function(node) {
            var ret = '',
                // TODO: return null?
                getter;

            if (node && node[STR_TAG_NAME]) {
                getter = M_DOM.VALUE_GETTERS[node[STR_TAG_NAME].toLowerCase()];

                if (getter) {
                    ret = getter(node);
                } else {
                    ret = node.value;
                }
            }

            // workaround for IE8 JSON stringify bug
            // which converts empty string values to null
            if (ret === '') {
                ret = ''; // for real
            }

            return (typeof ret === 'string') ? ret : '';
        },

        setValue: function(node, val) {
            var setter;

            if (node && node[STR_TAG_NAME]) {
                setter = M_DOM.VALUE_SETTERS[node[STR_TAG_NAME].toLowerCase()];

                if (setter) {
                    setter(node, val);
                } else {
                    node.value = val;
                }
            }
        },
        setText: (documentElement.textContent !== undefined) ?
            function(element, content) {
                if (element) {
                    element.textContent = content;
                }
            } : function(element, content) {
                if ('innerText' in element) {
                    element.innerText = content;
                } else if ('nodeValue' in element) {
                    element.nodeValue = content;
                }
            },
        getText: (documentElement.textContent !== undefined) ?
            function(element) {
                var ret = '';
                if (element) {
                    ret = element.textContent;
                }
                return ret || '';
            } : function(element) {
                var ret = '';
                if (element) {
                    ret = element.innerText || element.nodeValue; // might be a textNode
                }
                return ret || '';
            }
    });




}); 
/**
 * @namespace M
 * 
 */
Mo.define('node-core', function(M) {
	var STR_PREFIX = M.config.prefix,
        _fragClones = {},
		M_DOM = M.DOM,
        Lang = M.Lang,
        STR_NODE_TYPE = 'nodeType',
        STR_TAG_NAME = 'tagName',
		re_aria = /^(?:role$|aria-)/,
        _create = function(html, doc, tag) {
            tag = tag || 'div';

            var frag = _fragClones[tag];
            if (frag) {
                frag = frag.cloneNode(false);
            } else {
                frag = _fragClones[tag] = doc.createElement(tag);
            }
            frag.innerHTML = html;
            return frag;
        },
        creators = {},
        createFromDIV = function(html, tag) {
            var div = M.config.doc.createElement('div'),
                ret = true;

            div.innerHTML = html;
            if (!div.firstChild || div.firstChild.tagName !== tag.toUpperCase()) {
                ret = false;
            }

            return ret;
        },
        _nl2frag = function(nodes, doc) {
            var ret = null,
                i, len;

            if (nodes && (nodes.push || nodes.item) && nodes[0]) {
                doc = doc || nodes[0].ownerDocument;
                ret = doc.createDocumentFragment();

                if (nodes.item) {
                    // convert live list to static array
                    //TODO
                    nodes = M.Array.toArray(nodes, 0, true);
                }

                for (i = 0, len = nodes.length; i < len; i++) {
                    ret.appendChild(nodes[i]);
                }
            } // else inline with log for minification
            return ret;
        };
    //creators
    if (!(function() {
            var node = M.config.doc.createElement('table');
            try {
                node.innerHTML = '<tbody></tbody>';
            } catch (e) {
                return false;
            }
            return (node.firstChild && node.firstChild.nodeName === 'TBODY');
        }())) {
        creators.tbody = function(html, doc) {
            var frag = Y_DOM.create(TABLE_OPEN + html + TABLE_CLOSE, doc),
                tb = Y.DOM._children(frag, 'tbody')[0];

            if (frag.children.length > 1 && tb && !re_tbody.test(html)) {
                tb.parentNode.removeChild(tb); // strip extraneous tbody
            }
            return frag;
        };
    }
    if (!createFromDIV('<script type="text/javascript">< script > </script>/</script>', 'script')) {
        creators.script = function(html, doc) {
            var frag = doc.createElement('div');

            frag.innerHTML = '-' + html;
            frag.removeChild(frag.firstChild);
            return frag;
        };
        creators.link = creators.style = creators.script;
    }
    if (!createFromDIV('<tr></tr>', 'tr')) {
        M.mix(creators, {
            option: function(html, doc) {
                return M_Node.create('<select><option class="moui-big-dummy" selected></option>' + html + '</select>', doc, 1);
            },

            tr: function(html, doc) {
                return M_Node.create('<tbody>' + html + '</tbody>', doc, 1);
            },

            td: function(html, doc) {
                return _create('<tr>' + html + '</tr>', doc, 1);
            },

            col: function(html, doc) {
                return M_Node.create('<colgroup>' + html + '</colgroup>', doc, 1);
            },
            tbody: 'table'
        });
        M.mix(creators, {
            legend: 'fieldset',
            th: creators.td,
            thead: creators.tbody,
            tfoot: creators.tbody,
            caption: creators.tbody,
            colgroup: creators.tbody,
            optgroup: creators.option
        });
    }

    /**
     * Node类封装了一些操作节点的通用方法。可通过get/set方法访问,修改Node的属性。可通过M.one方法获得Node实例
     * @class M.Node
     * @example
     * M.one(selector); //可以通过css选择器获取到node对象
     * M.role(roleName);//可以通过data-role=roleName获取到node对象
     * M.all(selector);//可以通过css选择器获取到nodelist对象
     */

    var M_Node = function(node) {
        if (!node) {
            M.log(arguments.callee.caller)
            return null; // NOTE: return
        }

        if (typeof node == 'string') {
            node = M_Node._fromString(node);
            if (!node) {
                return null; // NOTE: return
            }
        }

        var uid = node[STR_PREFIX];

        if (uid && M_Node._instances[uid] && M_Node._instances[uid]._node !== node) {
            node[uid] = null; // unset existing uid to prevent collision (via clone or hack)
        }

        uid = uid || M.stamp(node);

        this[STR_PREFIX] = uid;

        this._node = node;

        //this.setAttr(STR_PREFIX, uid);
        
        this._stateProxy = node;
    };
    M.Node = M_Node;
	var staticMethods = {
        /**
         * 提供节点操作属性操作的方法。如不同节点类型value的set和get
         * @prorotype {obejct} attrFix
         */
        attrFix: {},
        DEFAULT_GETTER: function(name) {
            var node = this._stateProxy,
                val;

            if (name.indexOf && name.indexOf('.') > -1) {
                val = Lang.getObjValue(node, name.split('.'));
            } else if (typeof node[name] != 'undefined') { // pass thru from DOM
                val = node[name];
            }

            return val;
        },
        DEFAULT_SETTER: function(name, val) {
            var node = this._stateProxy,
                strPath;

            if (name.indexOf('.') > -1) {
                strPath = name;
                name = name.split('.');
                // only allow when defined on node
                Lang.setObjValue(node, name, val);
            } else if (typeof node[name] != 'undefined') { // pass thru DOM properties
                node[name] = val;
            }

            return val;
        },
        /**
         * 把原型节点和节点列表封装成M.Node或M.NodeList，如果参数是无效对象，则返回null。
         * @method {Any} node M.Node实例或HTMLNode
         * @return {Node | Node.List | null} 取决于传入的值
         */
        scrubVal: function(val, node) {
            if (val) {
                if (typeof val == 'object' || typeof val == 'function') { // safari nodeList === function
                    if (STR_NODE_TYPE in val || M_Node.isWindow(val)) { // node || window
                        val = M.one(val);
                    } else if ((val.item && !val._nodes) || // dom collection or Node instance
                        (val[0] && val[0][STR_NODE_TYPE])) { // array of DOM Nodes
                        val = M.all(val);
                    }
                }
            } else if (typeof val === 'undefined') {
                val = node; 
            } else if (val === null) {
                val = null; 
            }
            return val;
        },
        _fromString: function(node, root) {
            if (node) {
                if (node.indexOf('doc') === 0) { // doc OR document
                    node = M.config.doc;
                } else if (node.indexOf('win') === 0) { // win OR window
                    node = M.config.win;
                } else {
                    node = M.Selector.query(node, root)[0];
                }
            }

            return node || null;
        },
        _instances: {},
        /**
         * 判断一个对象是否是window对象
         * @static
         * @param {object} obj
         * @return {Boolean}
         */
        isWindow: function(obj) {
            return !!(obj && obj.scrollTo && obj.document);
        },
        /**
         * 根据传入的标签，创建一个新节点 不支持创建空tr接待你
         * @static
         * @param {string} html 要创建的节点代码
         * @param {HTMlElement}  document对象，默认为当前窗口的document对象
         * @return {Node} DOM原生节点或文档碎片fragment
         */
        create: function(html, doc, isDom) {
            //from yui
            var re_tag = /<([a-z]+)/i;

            if (typeof html === 'string') {
                html = Lang.trim(html); // match IE which trims whitespace from innerHTML
            }
            doc = doc || document;
            var m = re_tag.exec(html),
                create = _create,
                custom = creators,
                ret = null,
                creator,
                tag,
                nodes;



            if (html != undefined) { // not undefined or null
                if (m && m[1]) {
                    creator = custom[m[1].toLowerCase()];

                    if (typeof creator === 'function') {
                        create = creator;
                    } else {
                        tag = creator;
                    }
                }
                nodes = create(html, doc, tag).childNodes;
                //console.log(nodes.length)
                if (nodes.length === 1) { // return single node, breaking parentNode ref from "fragment"
                    ret = nodes[0].parentNode.removeChild(nodes[0]);
                } else if (nodes[0] && nodes[0].className === 'moui-big-dummy') { // using dummy node to preserve some attributes (e.g. OPTION not selected)
                    /*} else if (nodes[0]) { // using dummy node to preserve some attributes (e.g. OPTION not selected)*/
                    if (nodes.length === 2) {
                        ret = nodes[0].nextSibling;
                    } else {
                        nodes[0].parentNode.removeChild(nodes[0]);
                        ret = _nl2frag(nodes, doc);
                    }
                } else { // return multiple nodes as a fragment
                    ret = _nl2frag(nodes, doc);
                }
            }
            return isDom ? ret : M.one(ret);
        },
        /**
         *获取图片原始尺寸
         */
        getImgSize: function(img) {
            if (!Lang.isObject(img)) {
                return null;
            }
            var img = img._node || img,
                org = new Image(),
                wh = {};

            org.src = img.src;

            wh = {
                width: org.width,
                height: org.height
            };
            org = null;
            return wh;
        }
    };

    M.each(staticMethods, function(fun, name) {
        M.Node[name] = fun;
    });
    M.extend(M_Node.attrFix, {
        'children': {
            getter: function() {
                var node = this._node,
                    children = node.children,
                    childNodes, i, len;

                if (!children) {
                    childNodes = node.childNodes;
                    children = [];

                    for (i = 0, len = childNodes.length; i < len; ++i) {
                        if (childNodes[i].tagName) {
                            children[children.length] = childNodes[i];
                        }
                    }
                }
                return M.all(children);
            }
        },
        selectedItem: {
            getter: function() {
                var node = this._node,
                    val = node.value,
                    options = node.options;

                if (options && options.length) {
                    // TODO: implement multipe select
                    if (node.multiple) {} else if (node.selectedIndex > -1) {
                        return M.one(options[node.selectedIndex]);
                    }
                }
                return null;
            }
        },
        value: {
            getter: function() {
                return M_DOM.getValue(this._node);
            },

            setter: function(val) {
                M_DOM.setValue(this._node, val);
                return val;
            }
        }
        
    });
    /** @lends M.Node.prototype*/
    var nodeCls = {
        /**
         * 用字符串形式调用节点原生方法，用于原生节点操作
         * @param  {String} method 方法名
         * @param  {String | Node} [a]      方法第一个参数 可为节点
         * @param  {String | Node} [b]      方法第二个参数 可为节点
         * @param  {Anything} [c]      方法第三个参数
         * @param  {Anything} [d]      方法第四个参数
         * @param  {Anything} [e]      方法第五个参数
         * @return {Node}        当前节点
         *
         * @example
         * ###HTML
         * ```
         * <div data-role="data"></div>
         * ```
         *
         * ###JS
         * M.one('data').invoke('innerHTML'); // 输出标签内容
         */
        invoke: function(method, a, b, c, d, e) {
            var node = this._node,
                ret;

            if (a && a._node) {
                a = a._node;
            }

            if (b && b._node) {
                b = b._node;
            }

            ret = node[method](a, b, c, d, e);
            return M_Node.scrubVal(ret, this);
        },
        /**
         * 获取原生节点属性
         * @param  {String} attr 原生节点属性名
         * @return {String | Object}      对应值
         */
        get: function(attr) {
            var attrConfig = M_Node.attrFix[attr],
                val;

            if (attrConfig && attrConfig.getter) {
                val = attrConfig.getter.call(this);
            } else if (re_aria.test(attr)) {
                val = this._node.getAttribute(attr, 2);
            } else {
                val = M_Node.DEFAULT_GETTER.apply(this, arguments);
            }

            if (val) {
                if (val.length && val.length > 0 && val[0][STR_NODE_TYPE] && val[0][STR_NODE_TYPE] !== 2) {

                    val = M_Node.scrubVal(val, this);

                }
            } else if (val === null) {
                val = null; // IE: DOM null is not true null (even though they ===)
            }
            return val;
        },
        /**
         * 设置原生节点属性
         * @param {String} attr 原生节点属性
         * @param {String | Object} val  原生节点属性对应值
         */
        set: function(attr, val) {
            var attrConfig = M_Node.attrFix[attr];

            if (attrConfig && attrConfig.setter) {
                attrConfig.setter.call(this, val, attr);
            } else if (re_aria.test(attr)) { // special case Aria
                this._node.setAttribute(attr, val);
            } else {
                M_Node.DEFAULT_SETTER.apply(this, arguments);
            }
            
            return this;
        },
        /**
         * 获取原生节点
         * @return {HTMLelement} 原生节点
         */
        getDOMNode: function() {
            return this._node;
        }
    }
    M.extend(M.Node, nodeCls);
}); 
Mo.define('node-attrs', function(M) {
    var Lang = M.Lang,
    REGEX_SELECTED = /^(?:checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped)$/i,
    PROPFIX = (!document.documentElement.hasAttribute) ? {'for': 'htmlFor','class': 'className'}: {'htmlFor': 'for','className': 'class'},
    /**
     * 属性管理器
     */
    attributeManager = {
        /**
         * 获取节点属性
         * @param  {Object} el     基础节点
         * @param  {String} attr   属性名
         * @return {String}        对应属性的值
         */
        getAttr: function(el, attr) {
            var ret = undefined;
            try{
                if (el && attr && el.getAttribute) {
                    attr = PROPFIX[attr] || attr;
                    ret = el.getAttribute(attr);

                    if (ret === null) {
                        ret = undefined; // per DOM spec
                    }
                }
            }catch(eee){}
            return ret;
        },
        /**
         * 设置节点属性
         * @param {Object} el   基础节点
         * @param {String} attr 属性名
         * @param {String} val  属性值
         */
        setAttr: function(el, attr, val) {
            try{
                if (el && attr && el.setAttribute) {
                    attr = PROPFIX[attr] || attr;
                    el.setAttribute(attr, val);
                }
            }
            catch(eee){}
        },
        /**
         * 删除属性
         * @param  {Object} el    基础节点
         * @param  {String} attr  属性名
         */
        removeAttr: function(el, attr) {
            var name, propName, i = 0,
            attrNames = attr && attr.match(/\S+/g);
            if (attrNames && el.nodeType === 1) {
                M.each(function(name){
                    propName = PROPFIX[name] || name;
                    //如果是 checked,selected 等属性,则设置为false
                    if (REGEX_SELECTED(name)) {
                        el[propName] = false;
                    }
                    el.removeAttribute(name);
                });
            }

        }
    };

    M.attributeManager = attributeManager;
    /**
    * 节点属性相关操作
    */
    M.extend(M.Node,/** *@lends M.Node.prototype*/{
        /**
         * 返回指定属性名称
         * @param {String} attrName 属性名称
         * @return {String | null} 属性未定义时，返回null
         * ###HTML
         * ```
         * <div data-role="node" class="header" attr="data"></div>
         * ```
         * ###JS
         * M.role('node').getAttr('attr'); // data
         */
        getAttr: function(attr) {
            return attributeManager.getAttr(this._node, attr);
        },
        /**
         * 删除指定属性
         * @param {String} attr 属性名称
         * @return {Node} 返回节点本身
         * @example
         * ###HTML
         * ```
         * <div data-role="node" class="header" attr="data"></div>
         * ```
         * ###JS
         * M.role('node').removeAttr('attr');
         * 
         * ###result
         * ```
         * <div data-role="node" class="header"></div>
         * ```
         */
        removeAttr: function(attr) {
            var node = this._node;
            if (node) {
                node.removeAttribute(attr, 0); // comma zero for IE < 8 to force case-insensitive
            }
            return this;
        },
        /**
         * 设置节点属性值
         * @param {String} attr 属性名称
         * @param {String} value 属性值
         * @example
         * ###HTML
         * ```
         * <div data-role="node" class="header" attr="data"></div>
         * ```
         * ###JS
         * M.role('node').setAttr('attr','data0');
         * 
         * ###result
         * ```
         * <div data-role="node" class="header" attr="data0"></div>
         * ```
         *
         */
        setAttr: function(attr, value) {
            attributeManager.setAttr(this._node, attr, value);
            return this;
        },
        /**
         * 设置一组属性值
         * @param {Object} attrs 以属性名称为key的键值对
         *
         * @example
         * ###HTML
         * ```
         * <div data-role="node" class="header" attr="data" ></div>
         * ```
         * ###JS
         * M.role('node').setAttrs({'attr':'data0','attr1':'data1'});
         * 
         * ###result
         * ```
         * <div data-role="node" class="header" attr="data0" attr1="data1"></div>
         * ```
         */
        setAttrs: function(attrs) {
            var el = this._node;
            M.each(attrs, function(value, attr) {
                attributeManager.setAttr(el, attr, value);
            });
            return this;
        },
        /**
         * 判断节点属性是否存在
         * @param  {String}  attr 需要判断的元素
         * @return {Boolean}   是否存在
         * @example
         * ###HTML
         * ```
         * <div data-role="node" class="header" attr="data" ></div>
         * ```
         * ###JS
         * M.role('node').hasAttribute('attr'); //true
         */
        hasAttribute: function(attr) {
            var n = this._node;
            return n.hasAttribute ? this._node.hasAttribute(a) : !Lang.isUndefined(n[a]);
        },
    })
    
}); 
 /**
 * 节点插入相关操作
 * @namespace M
 * @lends M.Node.prototype
 */
Mo.define('node-dom', function(M) {
    var Lang = M.Lang,
        M_DOM = M.DOM,
        STR_PREFIX = M.config.prefix,
        _wrapFn = function(fn) {
            var ret = null;
            if (fn) {
                if (typeof fn == 'string') {
                    ret = function(n) {
                        return M.Selector.test(n, fn);
                    };
                } else {
                    ret = function(n) {
                        return fn(M.one(n));
                    };
                }
            }

            return ret;
        };
    /**
     * @lends M.Node.prototype
     */
    var dom = {
        /**
         * 清空几点子元素
         * @return {Node} 当前节点
         */
        empty: function() {
            var self = this;
            var cs = self.get('childNodes');
            cs.length != 0 && cs.remove(); //.destroy(true);
            return self;
        },
        /**
         * 向节点中插入html 
         * @param {String} content 插入内容
         * @param {Node | String} where   插入位置replace| before | after 默认append 
         */
        addHTML: function(content, where) {
            var node = this._node,
                nodeParent = node.parentNode,
                i = 0,
                item, ret = content,
                newNode;
            if (content != undefined) { // not null or undefined (maybe 0)
                if (content.nodeType) { // DOM node, just add it
                    newNode = content;
                } else if (typeof content == 'string' || typeof content == 'number') {
                    ret = newNode = M.Node.create(content, null, true);
                } else if (content[0] && content[0].nodeType) { // array or collection
                    newNode = M.config.doc.createDocumentFragment();
                    while ((item = content[i++])) {
                        newNode.appendChild(item); // append to fragment for insertion
                    }
                }
            }

            if (where) {
                if (newNode && where.parentNode) { // insert regardless of relationship to node
                    where.parentNode.insertBefore(newNode, where);
                } else {
                    switch (where) {
                        case 'replace':
                            while (node.firstChild) {
                                node.removeChild(node.firstChild);
                            }
                            if (newNode) { // allow empty content to clear node
                                node.appendChild(newNode);
                            }
                            break;
                        case 'before':
                            if (newNode) {
                                nodeParent.insertBefore(newNode, node);
                            }
                            break;
                        case 'after':
                            if (newNode) {
                                if (node.nextSibling) { // IE errors if refNode is null
                                    nodeParent.insertBefore(newNode, node.nextSibling);
                                } else {
                                    nodeParent.appendChild(newNode);
                                }
                            }
                            break;
                        default:
                            if (newNode) {
                                node.appendChild(newNode);
                            }
                            break;
                    }
                }
            } else if (newNode) {
                node.appendChild(newNode);
            }

            return ret;
        },
        /**
         * 在节点指定位置插入节点
         * @method insert
         * @static
         * @param {string} content 要创建的节点代码
         * @param {HTMLElement | Array | HTMLCollection} [where] 指定插入位置
         * 如果未指定where参数，则插入到当前节点结尾
         * <dl>
         * <dt>HTMLElement</dt>
         * <dd>插入到指定节点之前</dd>
         * <dt>"replace"</dt>
         * <dd>替换当前的节点</dd>
         * <dt>"before"</dt>
         * <dd>插入到当前节点前</dd>
         * <dt>"after"</dt>
         * <dd>插入到当前节点之后</dd>
         * </dl>
         * @return {Node} DOM原生节点或文档碎片fragment
         */
        insert: function(content, where) {
            this._insert(content, where);
            return this;
        },
        _insert: function(content, where) {
            var node = this._node,
                ret = null;

            if (typeof where == 'number') { // allow index
                where = this._node.childNodes[where];
            } else if (where && where._node) { // Node
                where = where._node;
            }

            if (content && typeof content != 'string') { // allow Node or NodeList/Array instances
                content = content._node || content._nodes || content;
            }
            //if(content){  ccontent是0或空字符串时,无法设置内容
            ret = this.addHTML(content, where);
            //}

            return ret;
        },
        /**
         * 把当前元素添加到指定节点
         * @method insert
         * @param {string | HTMLElement} node 要创建的节点代码
         * @param {HTMLElement | Array | HTMLCollection} [where] 指定插入位置
         */
        appendTo: function(node) {
            M.one(node).append(this);
            return this;
        },
        /**
         * 把指定内容插入到当前节点firstChild的位置
         * @method insert
         * @param {String | Node | HTMLElement} content 要插入的内容
         * @param {Node} 当前节点
         */
        prepend: function(content) {
            return this.insert(content, 0);
        },
        /**
         * 把当前元素添加到指定节点
         * @method insert
         * @param {String | Node | HTMLElement} content 要插入的内容
         * @param {Node} 当前节点
         */
        append: function(content) {
            return this.insert(content, null);
        },
        /**
         * @method appendChild
         * @param {String | Node | HTMLElement} content 要插入的节点
         * @param {Node} 被添加的节点
         */
        appendChild: function(node) {
            return M.Node.scrubVal(this._insert(node));
        },
        /**
         * 在指定节点之前插入元素
         * @method insertBefore
         * @param {String | Node | HTMLElement} newNode 要添加的新元素
         * @param {Node} 被添加的节点
         */
        insertBefore: function(node) {
            return M.Node.scrubVal(this._insert(node, 'before'));
        },
        /**
         * 在指定节点之后插入元素
         * @param  {String | Node | HTMLElement} node 要添加的新元素
         * @return {Node}      当前节点
         */
        insertAfter: function(node) {
            return M.Node.scrubVal(this._insert(node, 'after'));
        },
        /**
         * 执行一个函数,为了实现任意节点或节点列表的each兼容
         * @param  {Function} fn    需要执行的函数
         * @param  {Object}   content 函数执行环境
         * @return {Anything}          函数运行结果
         */
        each: function(fn, content) {
            return fn.call(content || this, this, 0);
        },
        /**
         * 删除当前节点
         * @method remove
         * @param {String | Node | HTMLElement} destroy 要添加的新元素
         * @param {String | Node | HTMLElement} refNode 新元素将插入到该节点之前
         * @param {Node} 被添加的节点
         */
        remove: function(destroy) {
            var node = this._node;

            if (node && node.parentNode) {
                node.parentNode.removeChild(node);
            }

            if (destroy) {
                this.destroy(true);
            }

            return this;
        },
        /**
         * 替换当前节点
         * @param  {String | Node | HTMLElement} newNode 替换的内容
         * @return {Node}         当前节点
         */
        replace: function(newNode) {
            var node = this._node;
            if (typeof newNode == 'string') {
                newNode = M_Node.create(newNode, null, true);
            } else {
                newNode = newNode.getDOMNode ? newNode.getDOMNode() : newNode;
            }
            node.parentNode.replaceChild(newNode, node);
            return this;
        },
        /**
         * 销毁当前节点，解绑绑定事件，清空data，解绑插件
         * @method destroy
         */
        destroy: function(recursive) {
            //TODO
            //var UID = M.config.doc.uniqueID ? 'uniqueID': '_yuid',
            var instance,
                self = this;

            //this.purge(); // TODO: only remove events add via this Node
            if (self.unplug) { // may not be a PluginHost
                self.unplug();
            }

            self.clearData();
            if (recursive) {
                M.NodeList.each(self.all('*'), function(node) {
                    instance = M_Node._instances[node[STR_PREFIX]];
                    if (instance) {
                        instance.destroy();
                    } else { // purge in case added by other means
                        //M.Event.purgeElement(node);
                    }
                });
            }

            self._node = null;
            self._stateProxy = null;

            delete M_Node._instances[self[STR_PREFIX]];
        },
        /**
         * 设置节点内HTML，会替换原有的HTML；
         * @param {HTML|node} content 插入的内容
         */
        setHTML: function(content) {
            this._insert(content, 'replace');
            return this;
        },
        /**
         * 获取节点内html;
         * @return {HTML} 节点内原生节点
         */
        getHTML: function() {
            return this.get('innerHTML');
        },
        /**
         * 设置元素内文本
         * @param {String} text 文本内容
         */
        setText: function(text) {
            M_DOM.setText(this._node, text);
            return this;
        },
        /**
         * 获取元素内文本
         * @return {String} text 文本内容
         */
        getText: function() {
            return M_DOM.getText(this._node);
        },
        /**
         * 获取data-attrs属性内的data并解析成对象，aa=bb&cc=dd&结构
         * @param  {type} k [description]
         * @return {type}   [description]
         */
        getDataValue: function(k) {
            var d = Lang.getDataValue(this.getAttr('data-attrs'));
            return k ? (d[k] || '') : d;
        },
        /**
         * ??
         * @param  {type} selector [description]
         * @return {type}          [description]
         */
        test: function(selector) {
            return M.Selector.test(this._node, selector);
        },

        /**
         * 测试一个节点是否在另一个节点内
         * @param  {type} needle [description]
         * @return {type}        [description]
         */
        contains: function(needle) {
            if (needle._node) {
                needle = needle._node;
            }
            return M_DOM.contains(this._node, needle);
        },
        /**
         * 获取节点的父节点
         * @param  {Function} [fn]       父节点需要满足的函数必须返回true和false
         * @param  {Boolean}   [testSelf] 是否用fn检测当前节点
         * @param  {Function}   [stopFn]   是否需要停止查找函数必须返回true和false
         * @return {HTMLElement | null}            返回父节点
         */
        ancestor: function(fn, testSelf, stopFn) {
            // testSelf is optional, check for stopFn as 2nd arg
            if (arguments.length === 2 && (typeof testSelf == 'string' || typeof testSelf == 'function')) {
                stopFn = testSelf;
            }

            return M.one(M_DOM.ancestor(this._node, _wrapFn(fn), testSelf, _wrapFn(stopFn)));
        },
        /**
         * 返回父节点数组
         * @param  {Function} [fn]       父节点需要满足的函数必须返回true和false
         * @param  {Boolean}   [testSelf] 是否用fn检测当前节点
         * @param  {Function}   [stopFn]   是否需要停止查找函数必须返回true和false
         * @return {Array}            返回父节点数组
         */
        ancestors: function(fn, testSelf, stopFn) {
            return M.all(M_DOM.ancestors(this._node, _wrapFn(fn), testSelf, _wrapFn(stopFn)));
        },
        /**
         * 获取当前节点的下一个节点
         * @param  {Function} [fn]  节点需要满足的函数必须返回true和false
         * @param  {String}   [all] 不区分tagname
         * @return {Node}     查找出的节点
         */
        next: function(fn, all) {
            return M.one(M_DOM.elementByAxis(this._node, 'nextSibling', _wrapFn(fn), all));
        },
        /**
         * 获取当前节点的上一个节点
         * @param  {Function} [fn]  节点需要满足的函数必须返回true和false
         * @param  {String}   [all] 不区分tagname
         * @return {Node}     查找出的节点
         */
        previous: function(fn, all) {
            return M.one(M_DOM.elementByAxis(this._node, 'previousSibling', _wrapFn(fn), all));
        },
        /**
         * 获取当前节点的全部兄弟节点
         * @param  {Function} [fn]  节点需要满足的函数必须返回true和false
         * @return {Node}     查找出的节点数组
         */
        siblings: function(fn) {
            return M.all(M_DOM.siblings(this._node, _wrapFn(fn)));
        }
    };
    
    M.extend(M.Node, dom);
}) 
/**
 * css相关操作封装
 * 
 * 用节点的style属性对css进行操作
 * 如果style的属性为空，则用getComputedStyle方法获取渲染后的css
 * getComputedStyle已支持主流浏览器，
 * 兼容性：PC端使用需要添加对IE6,7,8的兼容
 */
Mo.define('node-style', function(M) {
    var Lang = M.Lang,
        M_DOM = M.DOM,
        CUSTOM_STYLES = {},
        re_unit = /width|height|top|left|right|bottom|margin|padding/i,
        GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect',
        OWNER_DOCUMENT = 'ownerDocument',
        STR_STYLE = 'style',
        DOCUMENT_ELEMENT = 'documentElement',
        STR_DEFAULT_VIEW = 'defaultView',
        STR_GET_COMPUTED_STYLE = 'getComputedStyle',
        DEFAULT_UNIT = 'px',
        STR_FLOAT = 'float',
        CSS_FLOAT = 'cssFloat',
        STYLE_FLOAT = 'styleFloat',
        TOP = 'top',
        LEFT = 'left',
        BOTTOM = 'bottom',
        RIGHT = 'right',
        POSITION = 'position',
        FIXED = 'fixed',
        COMPAT_MODE = 'compatMode',
        _BACK_COMPAT = 'BackCompat',
        SCROLL_NODE = null;
        DOC = M.config.doc,
        get_computed_style = function(node, att) {
            var val = '',
                doc = node[OWNER_DOCUMENT],
                computed;

            if (node[STR_STYLE] && doc[STR_DEFAULT_VIEW] && doc[STR_DEFAULT_VIEW][STR_GET_COMPUTED_STYLE]) {
                computed = doc[STR_DEFAULT_VIEW][STR_GET_COMPUTED_STYLE](node, null);
                if (computed) { // FF may be null in some cases (ticket #2530548)
                    val = computed[att];
                }
            }
            return val;
        };
    //初始化CUSTOM_STYLES
    if (!Lang.isUndefined(DOC[DOCUMENT_ELEMENT][STR_STYLE][CSS_FLOAT])) {
        CUSTOM_STYLES[STR_FLOAT] = CSS_FLOAT;
    } else if (!Lang.isUndefined(DOC[DOCUMENT_ELEMENT][STR_STYLE][STYLE_FLOAT])) {
        CUSTOM_STYLES[STR_FLOAT] = STYLE_FLOAT;
    }
    M.DOM.CUSTOM_STYLES = CUSTOM_STYLES;
    // TODO ？不存在re_color
    if (M.UA.opera) {
        get_computed_style = function(node, att) {
            var view = node[OWNER_DOCUMENT][STR_DEFAULT_VIEW],
                val = view[STR_GET_COMPUTED_STYLE](node, '')[att];
            //TODO fix operate
            if (re_color.test(att)) {
                val = Y.Color.toRGB(val);
            }
            return val;
        };

    }
    // webkit内核获取background-color为transparent时会输出rgba(0, 0, 0, 0)
    if (M.UA.webkit) {
        get_computed_style = function(node, att) {
            var view = node[OWNER_DOCUMENT][STR_DEFAULT_VIEW],
                val = view[STR_GET_COMPUTED_STYLE](node, '')[att];
            if (val === 'rgba(0, 0, 0, 0)') {
                val = 'transparent';
            }
            return val;
        }
    }
    //创建样式管理器
	var styleManager = {
        /**
         * 设置节点的css值
         * @param {Object} el    操作节点
         * @param {String} att   css属性
         * @param {String} val   css值
         */
        set: function(el, att, val) {
            var style = el.style;
            if (style) {
                if (val === null || val === '') { // normalize unsetting
                    val = '';
                } else if (!isNaN(new Number(val)) && re_unit.test(att)) { // number values may need a unit
                    val += DEFAULT_UNIT;
                }
                //debugger
                if (att in CUSTOM_STYLES) {
                    if (CUSTOM_STYLES[att].set) {
                        CUSTOM_STYLES[att].set(el, val, style);
                        return; // NOTE: return
                    } else if (typeof CUSTOM_STYLES[att] === 'string') {
                        att = CUSTOM_STYLES[att];
                    }
                } else if (att === '') { // unset inline styles
                    att = 'cssText';
                    val = '';
                }
                try {
                    style[att] = val;
                } catch (err) {
                    M.log('error', err);
                    M.log('info', el);
                    M.log('info', 'att:' + att + '    val:' + val);
                    M.log('info', 'end');

                }
            }
        },
        get: function(el, att, style) {
            style = style || el.style;
            var val = '';

            if (style) {
                if (att in CUSTOM_STYLES) {
                    if (CUSTOM_STYLES[att].get) {
                        return CUSTOM_STYLES[att].get(el, att, style); // NOTE: return
                    } else if (typeof CUSTOM_STYLES[att] === 'string') {
                        att = CUSTOM_STYLES[att];
                    }
                }
                val = style[att];
                if (val === '') { // TODO: is empty string sufficient?
                    val = get_computed_style(el, att);
                }
            }
            return val;
        },
        setX: function(node, x) {
            return styleManager.setXY(node, [x, null]);
        },
        setY: function(node, y) {
            return styleManager.setXY(node, [null, y]);
        },
        setXY: function(node, xy, noRetry) {
            var setStyle = styleManager.set,
                pos, delta, newXY, currentXY;

            if (node && xy) {
                pos = styleManager.get(node, 'position');

                delta = styleManager._getOffset(node);
                if (pos == 'static') { // default to relative
                    pos = 'relative';
                    setStyle(node, POSITION, pos);
                }
                currentXY = styleManager.getXY(node);
                try {
                    if (xy[0] !== null) {
                        setStyle(node, LEFT, xy[0] - currentXY[0] + delta[0] + 'px');
                    }

                    if (xy[1] !== null) {
                        setStyle(node, TOP, xy[1] - currentXY[1] + delta[1] + 'px');
                    }
                } catch (ee) {
                    debugger
                }
                if (!noRetry) {
                    newXY = styleManager.getXY(node);
                    if (newXY[0] !== xy[0] || newXY[1] !== xy[1]) {
                        styleManager.setXY(node, xy, true);
                    }
                }

            } else {}
        },
        getXY: function() {
            if (M.config.doc[DOCUMENT_ELEMENT][GET_BOUNDING_CLIENT_RECT]) {
                return function(node) {
                    var xy = null,
                        scrollLeft, scrollTop, mode, box, offX, offY, doc, win, inDoc, rootNode;

                    if (node && node.tagName) {
                        doc = node.ownerDocument;
                        mode = doc[COMPAT_MODE];

                        if (mode !== _BACK_COMPAT) {
                            rootNode = doc[DOCUMENT_ELEMENT];
                        } else {
                            rootNode = doc.body;
                        }

                        // inline inDoc check for perf
                        if (rootNode.contains) {
                            inDoc = rootNode.contains(node);
                        } else {
                            inDoc = M_DOM.contains(rootNode, node);
                        }

                        if (inDoc) {
                            win = doc.defaultView;

                            // inline scroll calc for perf
                            if (win && 'pageXOffset' in win) {
                                scrollLeft = win.pageXOffset;
                                scrollTop = win.pageYOffset;
                            } else {
                                scrollLeft = (SCROLL_NODE) ? doc[SCROLL_NODE].scrollLeft : M_DOM.docScrollX(node, doc);
                                scrollTop = (SCROLL_NODE) ? doc[SCROLL_NODE].scrollTop : M_DOM.docScrollY(node, doc);
                            }
                            
                            box = node[GET_BOUNDING_CLIENT_RECT]();
                            xy = [box.left, box.top];

                            if (offX || offY) {
                                xy[0] -= offX;
                                xy[1] -= offY;

                            }
                            if ((scrollTop || scrollLeft)) {
                                if (!M.UA.ios || (M.UA.ios >= 4.2)) {
                                    xy[0] += scrollLeft;
                                    xy[1] += scrollTop;
                                }

                            }
                        } else {
                            xy = styleManager._getOffset(node);
                        }
                    }
                    return xy;
                };
            } else {
                return function(node) {
                    // manually calculate by crawling up offsetParents
                    //Calculate the Top and Left border sizes (assumes pixels)
                    var xy = null,
                        doc, parentNode, bCheck, scrollTop, scrollLeft;

                    if (node) {
                        if (M_DOM.inDoc(node)) {
                            xy = [node.offsetLeft, node.offsetTop];
                            doc = node.ownerDocument;
                            parentNode = node;
                            // TODO: refactor with !! or just falsey
                            bCheck = ((M.UA.gecko || M.UA.webkit > 519) ? true : false);

                            // TODO: worth refactoring for TOP/LEFT only?
                            while ((parentNode = parentNode.offsetParent)) {
                                xy[0] += parentNode.offsetLeft;
                                xy[1] += parentNode.offsetTop;
                                if (bCheck) {
                                    xy = styleManager._calcBorders(parentNode, xy);
                                }
                            }

                            // account for any scrolled ancestors
                            if (styleManager.get(node, POSITION) != FIXED) {
                                parentNode = node;

                                while ((parentNode = parentNode.parentNode)) {
                                    scrollTop = parentNode.scrollTop;
                                    scrollLeft = parentNode.scrollLeft;

                                    //Firefox does something funky with borders when overflow is not visible.
                                    if (M.UA.gecko && (styleManager.get(parentNode, 'overflow') !== 'visible')) {
                                        xy = styleManager._calcBorders(parentNode, xy);
                                    }

                                    if (scrollTop || scrollLeft) {
                                        xy[0] -= scrollLeft;
                                        xy[1] -= scrollTop;
                                    }
                                }
                                xy[0] += M_DOM.docScrollX(node, doc);
                                xy[1] += M_DOM.docScrollY(node, doc);

                            } else {
                                //Fix FIXED position -- add scrollbars
                                xy[0] += M_DOM.docScrollX(node, doc);
                                xy[1] += M_DOM.docScrollY(node, doc);
                            }
                        } else {
                            xy = styleManager._getOffset(node);
                        }
                    }

                    return xy;
                };
            }
        }(),
        getY: function(node) {
            return styleManager.getXY(node)[1];
        },
        getX: function(node) {
            return styleManager.getXY(node)[0];
        },
        /**
         * 计算节点边框
         * @param  {type} node [description]
         * @param  {type} xy2  [description]
         * @return {type}      [description]
         */
        _calcBorders: function(node, xy2) {
            var t = parseInt(get_computed_style(node, 'borderTopWidth'), 10) || 0,
            l = parseInt(get_computed_style(node, 'borderLeftWidth'), 10) || 0;
            if (M.UA.gecko) {
                if (node.tagName) {
                    t = 0;
                    l = 0;
                }
            }
            xy2[0] += l;
            xy2[1] += t;
            return xy2;
        },
        _getOffset: function(node) {
            var pos, xy = null;

            if (node) {
                pos = styleManager.get(node, 'position');
                xy = [parseInt(get_computed_style(node, 'left'), 10), parseInt(get_computed_style(node, 'top'), 10)];

                if (isNaN(xy[0])) { // in case of 'auto'
                    xy[0] = parseInt(styleManager.get(node, 'left'), 10); // try inline
                    if (isNaN(xy[0])) { // default to offset value
                        xy[0] = (pos === 'relative') ? 0 : node.offsetLeft || 0;
                    }
                }

                if (isNaN(xy[1])) { // in case of 'auto'
                    xy[1] = parseInt(styleManager.get(node, 'top'), 10); // try inline
                    if (isNaN(xy[1])) { // default to offset value
                        xy[1] = (pos === 'relative') ? 0 : node.offsetTop || 0;
                    }
                }
            }
            return xy;
        },
        region: function(node) {
            var xy = styleManager.getXY(node),
                ret = false;

            if (node && xy) {
                ret = styleManager._getRegion(xy[1], // top
                    xy[0] + node.offsetWidth, // right
                    xy[1] + node.offsetHeight, // bottom
                    xy[0] // left
                );
            }

            return ret;
        },
        inRegion: function(node, node2, all, altRegion) {
            var region = {},
                r = altRegion || styleManager.region(node),
                n = node2,
                off;

            if (n.tagName) {
                region = styleManager.region(n);
            } else if (Lang.isObject(node2)) {
                region = node2;
            } else {
                return false;
            }

            if (all) {
                return (r[LEFT] >= region[LEFT] && r[RIGHT] <= region[RIGHT] && r[TOP] >= region[TOP] && r[BOTTOM] <= region[BOTTOM]);
            } else {
                off = getOffsets(region, r);
                if (off[BOTTOM] >= off[TOP] && off[RIGHT] >= off[LEFT]) {
                    return true;
                } else {
                    return false;
                }

            }
        },
        inViewportRegion: function(node, all, altRegion) {
            return styleManager.inRegion(node, styleManager.viewportRegion(node), all, altRegion);
        },
        _getRegion: function(t, r, b, l) {
            var region = {};

            region[TOP] = region[1] = t;
            region[LEFT] = region[0] = l;
            region[BOTTOM] = b;
            region[RIGHT] = r;
            region.width = region[RIGHT] - region[LEFT];
            region.height = region[BOTTOM] - region[TOP];

            return region;
        },
        viewportRegion: function(node) {
            node = node || M.config.doc.documentElement;
            var ret = false,
                scrollX, scrollY;

            if (node) {
                scrollX = M_DOM.docScrollX(node);
                scrollY = M_DOM.docScrollY(node);

                ret = styleManager._getRegion(scrollY, // top
                    M_DOM.winWidth(node) + scrollX, // right
                    scrollY + M_DOM.winHeight(node), // bottom
                    scrollX); // left
            }

            return ret;
        }
    };
    M.styleManager = styleManager;
    /**
    * 节点css相关操作
    * @lends M.Node.prototype
    */
    var nodeStyle = {
    	/**
         * 设置节点CSS
         * @param {String} attr  css属性
         * @param {String} value css值
         * @return {Object} mojs节点
         */
        setStyle: function(attr, value) {
            styleManager.set(this._node, attr, value);
            return this;
        },
        /**
         * 设置一组节点CSS
         * @param {Object} attr  css键值对集合
         * @return {Object} mojs节点 
         */
        setStyles: function(attrs) {
            var el = this._node;
            M.each(attrs, function(value, attr) {
                styleManager.set(el, attr, value);
            });
            return this;
        },
        /**
         * 获取节点css值
         * @param  {String} attr css属性
         * @return {Object}      mojs节点
         */
        getStyle: function(attr) {
            return styleManager.get(this._node, attr);
        },
        /**
         * 显示节点
         * @return {Object}      mojs节点
         */
        show: function() {
            var self = this;
            self.removeAttr('hidden');
            self.setStyle('display', '');
            return self;
        },
        /**
         * 显示隐藏节点
         * @return {Object}      mojs节点
         */
        toggle: function() {
            var self = this;
            if (self.getStyle('display') == 'none') {
                self.show();
                return
            }
            self.hide();
        },
        /**
         * 隐藏节点
         * @return {Object}      mojs节点
         */
        hide: function() {
            var self = this;
            self.setAttr('hidden', true);
            self.setStyle('display', 'none');
            return this;
        },
        /**
         * 设置节点X坐标
         * @param {Int} x 坐标值
         */
        setX: function(x) {
            this.setXY(x, null);
        },
        /**
         * 设置节点Y坐标
         * @param {Int} y 坐标值
         */
        setY: function(y) {
            this.setXY(null, y);
        },
        /**
         * 设置节点XY坐标
         * @param {type} x x坐标值
         * @param {type} y y坐标值
         */
        setXY: function(x, y) {
            styleManager.setXY(this._node, [x, y]);
        },
        /**
         * 获取节点position属性
         * @return {String} position属性
         */
        getPosition: function() {
            return styleManager._getOffset(this._node);
        },
        /**
         * 获取节点xy值
         * @return {Array} xy[0]为X坐标，xy[1]为Y坐标
         */
        getXY: function() {
            return styleManager.getXY(this._node);
        },
        /**
         * 获取节点x值
         * @return {Int} x坐标值
         */
        getX: function() {
            return this.getXY()[0];
        },
        /**
         * 获取节点y值
         * @return {Int} y坐标值
         */
        getY: function() {
            return this.getXY()[1];
        }
    }

    M.extend(M.Node, nodeStyle);
    var M_Node = M.Node;
    M.extend(M_Node.attrFix,{
        viewportRegion: {
            getter: function() {
                return styleManager.viewportRegion(this.getDOMNode());
            }
        },
        region: {
            getter: function() {
                var node = this.getDOMNode(),
                    region;

                if (node && !node.tagName) {
                    if (node.nodeType === 9) { // document
                        node = node.documentElement;
                    }
                }
                if (M_Node.isWindow(node)) {
                    region = styleManager.viewportRegion(node);
                } else {
                    region = styleManager.region(node);
                }
                return region;
            }
        }
    });

}); 
/**
 * 修改自YUI3 Selector
 * 支持格式如：
 *
 *   #foo{} .bar{} a#foo.bar{} #foo{} a[href]{} ul#list > li {} #foo a {}
 *   #foo a[title~=hello] {} #foo a[href^="http://"] {} #foo a[href$=com] {} #foo a[href*=twitter]
 *   span ~ strong {} p + p {}
 *   div,p{}
 *
 *
 * @module: dom
 * @submodule selector
 * @author: jiangjibing
 * @date: 2013/6/26
 */


Mo.define('selector',function(M) {
    M.namespace('Selector');

    var COMPARE_DOCUMENT_POSITION = 'compareDocumentPosition',
        OWNER_DOCUMENT = 'ownerDocument',
        PARENT_NODE = 'parentNode',
        TAG_NAME = 'tagName',
        ATTRIBUTES = 'attributes',
        COMBINATOR = 'combinator',
        PSEUDOS = 'pseudos',
        PREVIOUSSIBLING = 'previousSibling',
        STR_PARENT_NODE = 'parentNode',
        M_DOM = M.DOM,
        MArray = M.Array,
        Lang = M.Lang,

        M_DOM_getAttr = M.attributeManager.getAttr,


        _reNth = /^(?:([\-]?\d*)(n){1}|(odd|even)$)*([\-+]?\d*)$/;

        //debugger;

    var Selector = {
        _types: {
            esc: {
                token: '\uE000',
                re: /\\[:\[\]\(\)#\.\'\>+~"]/gi
            },

            attr: {
                token: '\uE001',
                re: /(\[[^\]]*\])/g
            },

            pseudo: {
                token: '\uE002',
                re: /(\([^\)]*\))/g
            }
        },

        useNative: true,

        _escapeId: function(id) {
            if (id) {
                id = id.replace(/([:\[\]\(\)#\.'<>+~"])/g,'\\$1');
            }
            return id;
        },

        _compare: ('sourceIndex' in M.config.doc.documentElement) ?
            function(nodeA, nodeB) {
                var a = nodeA.sourceIndex,
                    b = nodeB.sourceIndex;

                if (a === b) {
                    return 0;
                } else if (a > b) {
                    return 1;
                }

                return -1;

            } : (M.config.doc.documentElement[COMPARE_DOCUMENT_POSITION] ?
            function(nodeA, nodeB) {
                if (nodeA[COMPARE_DOCUMENT_POSITION](nodeB) & 4) {
                    return -1;
                } else {
                    return 1;
                }
            } :
            function(nodeA, nodeB) {
                var rangeA, rangeB, compare;
                if (nodeA && nodeB) {
                    rangeA = nodeA[OWNER_DOCUMENT].createRange();
                    rangeA.setStart(nodeA, 0);
                    rangeB = nodeB[OWNER_DOCUMENT].createRange();
                    rangeB.setStart(nodeB, 0);
                    compare = rangeA.compareBoundaryPoints(1, rangeB); // 1 === Range.START_TO_END
                }

                return compare;

        }),

        _sort: function(nodes) {
            if (nodes) {
                nodes = MArray.toArray(nodes, 0, true);
                if (nodes.sort) {
                    nodes.sort(Selector._compare);
                }
            }

            return nodes;
        },

        _deDupe: function(nodes) {
            var ret = [],
                i, node;

            for (i = 0; (node = nodes[i++]);) {
                if (!node._found) {
                    ret[ret.length] = node;
                    node._found = true;
                }
            }

            for (i = 0; (node = ret[i++]);) {
                node._found = null;
                node.removeAttribute('_found');
            }

            return ret;
        },

        /**
         * Retrieves a set of nodes based on a given CSS selector.
         * @method query
         *
         * @param {string} selector The CSS Selector to test the node against.
         * @param {HTMLElement} root optional An HTMLElement to start the query from. Defaults to M.config.doc
         * @param {Boolean} firstOnly optional Whether or not to return only the first match.
         * @return {Array} An array of nodes that match the given selector.
         * @static
         */
        query: function(selector, root, firstOnly, skipNative) {
            root = root || M.config.doc;
            var ret = [],
                useNative = (M.Selector.useNative && M.config.doc.querySelector && !skipNative),
                queries = [[selector, root]],
                query,
                result,
                i,
                fn = (useNative) ? M.Selector._nativeQuery : M.Selector._bruteQuery;

            if (selector && fn) {
                // split group into seperate queries
                if (!skipNative && // already done if skipping
                        (!useNative || root.tagName)) { // split native when element scoping is needed
                    queries = Selector._splitQueries(selector, root);
                }

                for (i = 0; (query = queries[i++]);) {
                    result = fn(query[0], query[1], firstOnly);
                    if (!firstOnly) { // coerce DOM Collection to Array
                        result = MArray.toArray(result, 0, true);
                    }
                    if (result) {
                        ret = ret.concat(result);
                    }
                }

                if (queries.length > 1) { // remove dupes and sort by doc order
                    ret = Selector._sort(Selector._deDupe(ret));
                }
            }

            return (firstOnly) ? (ret[0] || null) : ret;

        },

        _replaceSelector: function(selector) {
            var esc = M.Selector._parse('esc', selector), // pull escaped colon, brackets, etc.
                attrs,
                pseudos;

            // first replace escaped chars, which could be present in attrs or pseudos
            selector = M.Selector._replace('esc', selector);

            // then replace pseudos before attrs to avoid replacing :not([foo])
            pseudos = M.Selector._parse('pseudo', selector);
            selector = Selector._replace('pseudo', selector);

            attrs = M.Selector._parse('attr', selector);
            selector = M.Selector._replace('attr', selector);

            return {
                esc: esc,
                attrs: attrs,
                pseudos: pseudos,
                selector: selector
            };
        },

        _restoreSelector: function(replaced) {
            var selector = replaced.selector;
            selector = M.Selector._restore('attr', selector, replaced.attrs);
            selector = M.Selector._restore('pseudo', selector, replaced.pseudos);
            selector = M.Selector._restore('esc', selector, replaced.esc);
            return selector;
        },

        _replaceCommas: function(selector) {
            var replaced = M.Selector._replaceSelector(selector),
                selector = replaced.selector;

            if (selector) {
                selector = selector.replace(/,/g, '\uE007');
                replaced.selector = selector;
                selector = M.Selector._restoreSelector(replaced);
            }
            return selector;
        },

        // allows element scoped queries to begin with combinator
        // e.g. query('> p', document.body) === query('body > p')
        _splitQueries: function(selector, node) {
            if (selector.indexOf(',') > -1) {
                selector = M.Selector._replaceCommas(selector);
            }

            var groups = selector.split('\uE007'), // split on replaced comma token
                queries = [],
                prefix = '',
                id,
                i,
                len;

            if (node) {
                // enforce for element scoping
                if (node.nodeType === 1) { // Elements only
                    id = M.Selector._escapeId(M_DOM.getId(node));

                    if (!id) {
                        id = M.guid();
                        M_DOM.setId(node, id);
                    }

                    prefix = '[id="' + id + '"] ';
                }

                for (i = 0, len = groups.length; i < len; ++i) {
                    selector =  prefix + groups[i];
                    queries.push([selector, node]);
                }
            }

            return queries;
        },

        _nativeQuery: function(selector, root, one) {
            if (M.UA.webkit && selector.indexOf(':checked') > -1 &&
                    (M.Selector.pseudos && M.Selector.pseudos.checked)) { // webkit (chrome, safari) fails to pick up "selected"  with "checked"
                return M.Selector.query(selector, root, one, true); // redo with skipNative true to try brute query
            }
            try {
                return root['querySelector' + (one ? '' : 'All')](selector);
            } catch(e) { // fallback to brute if available
                return M.Selector.query(selector, root, one, true); // redo with skipNative true
            }
        },

        filter: function(nodes, selector) {
            var ret = [],
                i, node;

            if (nodes && selector) {
                for (i = 0; (node = nodes[i++]);) {
                    if (M.Selector.test(node, selector)) {
                        ret[ret.length] = node;
                    }
                }
            } else {
            }

            return ret;
        },
        /**
         * 测试node是否在root节点的selector选择器下
         * @param  {Object} node     测试节点
         * @param  {String|Function} selector 选择器|函数
         * @param  {Object} root     目标节点
         * @return {Boolean}          [description]
         */
        test: function(node, selector, root) {
            var ret = false,
                useFrag = false,
                groups,
                parent,
                item,
                items,
                frag,
                id,
                i, j, group;

            if (node && node.tagName) { // only test HTMLElements

                if (typeof selector == 'function') { // test with function
                    ret = selector.call(node, node);
                } else { // test with query
                    // we need a root if off-doc
                    groups = selector.split(',');
                    if (!root && !M_DOM.inDoc(node)) {
                        parent = node.parentNode;
                        if (parent) {
                            root = parent;
                        } else { // only use frag when no parent to query
                            frag = node[OWNER_DOCUMENT].createDocumentFragment();
                            frag.appendChild(node);
                            root = frag;
                            useFrag = true;
                        }
                    }
                    root = root || node[OWNER_DOCUMENT];

                    id = M.Selector._escapeId(M_DOM.getId(node));
                    if (!id) {
                        id = M.guid();
                        M_DOM.setId(node, id);
                    }

                    for (i = 0; (group = groups[i++]);) { // TODO: off-dom test
                        group += '[id="' + id + '"]';
                        items = M.Selector.query(group, root);

                        for (j = 0; item = items[j++];) {
                            if (item === node) {
                                ret = true;
                                break;
                            }
                        }
                        if (ret) {
                            break;
                        }
                    }

                    if (useFrag) { // cleanup
                        frag.removeChild(node);
                    }
                };
            }

            return ret;
        },

        /**
         * A convenience function to emulate M.Node's aNode.ancestor(selector).
         * @param {HTMLElement} element An HTMLElement to start the query from.
         * @param {String} selector The CSS selector to test the node against.
         * @return {HTMLElement} The ancestor node matching the selector, or null.
         * @param {Boolean} testSelf optional Whether or not to include the element in the scan
         * @static
         * @method ancestor
         */
         /*
        ancestor: function (element, selector, testSelf) {
            return M_DOM.ancestor(element, function(n) {
                return M.Selector.test(n, selector);
            }, testSelf);
        },
        */

        _parse: function(name, selector) {
            return selector.match(M.Selector._types[name].re);
        },

        _replace: function(name, selector) {
            var o = M.Selector._types[name];
            return selector.replace(o.re, o.token);
        },

        _restore: function(name, selector, items) {
            if (items) {
                var token = M.Selector._types[name].token,
                    i, len;
                for (i = 0, len = items.length; i < len; ++i) {
                    selector = selector.replace(token, items[i]);
                }
            }
            return selector;
        },

        getId: function(node) {
            var id;
            // HTMLElement returned from FORM when INPUT name === "id"
            // IE < 8: HTMLCollection returned when INPUT id === "id"
            // via both getAttribute and form.id
            if (node.id && !node.id.tagName && !node.id.item) {
                id = node.id;
            } else if (node.attributes && node.attributes.id) {
                id = node.attributes.id.value;
            }

            return id;
        },

        setId: function(node, id) {
            if (node.setAttribute) {
                node.setAttribute('id', id);
            } else {
                node.id = id;
            }
        },

        _getNth : function(node, expr, tag, reverse) {
            _reNth.test(expr);
            var a = parseInt(RegExp.$1, 10), // include every _a_ elements (zero means no repeat, just first _a_)
                n = RegExp.$2, // "n"
                oddeven = RegExp.$3, // "odd" or "even"
                b = parseInt(RegExp.$4, 10) || 0, // start scan from element _b_
                result = [],
                siblings = M_DOM._children(node.parentNode, tag),
                op;

            if (oddeven) {
                a = 2; // always every other
                op = '+';
                n = 'n';
                b = (oddeven === 'odd') ? 1 : 0;
            } else if ( isNaN(a) ) {
                a = (n) ? 1 : 0; // start from the first or no repeat
            }

            if (a === 0) { // just the first
                if (reverse) {
                    b = siblings.length - b + 1;
                }

                if (siblings[b - 1] === node) {
                    return true;
                } else {
                    return false;
                }

            } else if (a < 0) {
                reverse = !!reverse;
                a = Math.abs(a);
            }

            if (!reverse) {
                for (var i = b - 1, len = siblings.length; i < len; i += a) {
                    if ( i >= 0 && siblings[i] === node ) {
                        return true;
                    }
                }
            } else {
                for (var i = siblings.length - b, len = siblings.length; i >= 0; i -= a) {
                    if ( i < len && siblings[i] === node ) {
                        return true;
                    }
                }
            }
            return false;
        },

        //CSS2支持
        _reRegExpTokens: /([\^\$\?\[\]\*\+\-\.\(\)\|\\])/,
        SORT_RESULTS: true,

        // TODO: better detection, document specific
        _isXML: (function() {
            var isXML = (M.config.doc.createElement('div').tagName !== 'DIV');
            return isXML;
        }()),

        /**
         * Mapping of shorthand tokens to corresponding attribute selector
         * @property shorthand
         * @type object
         */
        shorthand: {
            '\\#(-?[_a-z0-9]+[-\\w\\uE000]*)': '[id=$1]',
            '\\.(-?[_a-z]+[-\\w\\uE000]*)': '[className~=$1]'
        },

        /**
         * List of operators and corresponding boolean functions.
         * These functions are passed the attribute and the current node's value of the attribute.
         * @property operators
         * @type object
         */
        operators: {
            '': function(node, attr) { return M_DOM_getAttr(node, attr) !== ''; }, // Just test for existence of attribute
            '~=': '(?:^|\\s+){val}(?:\\s+|$)', // space-delimited
            '|=': '^{val}-?', // optional hyphen-delimited
            '^=': '^{val}', // Match starts with value
            '$=': '{val}$', // Match ends with value
            '*=': '{val}' // Match contains value as substring
        },

        pseudos: {
           'first-child': function(node) {
                return M_DOM._children(node[PARENT_NODE])[0] === node;
            },
            'root': function(node) {
                return node === node.ownerDocument.documentElement;
            },

            'nth-child': function(node, expr) {
                return M.Selector._getNth(node, expr);
            },

            'nth-last-child': function(node, expr) {
                return M.Selector._getNth(node, expr, null, true);
            },

            'nth-of-type': function(node, expr) {
                return M.Selector._getNth(node, expr, node.tagName);
            },

            'nth-last-of-type': function(node, expr) {
                return M.Selector._getNth(node, expr, node.tagName, true);
            },

            'last-child': function(node) {
                var children = M_DOM._children(node.parentNode);
                return children[children.length - 1] === node;
            },

            'first-of-type': function(node) {
                return M_DOM._children(node.parentNode, node.tagName)[0] === node;
            },

            'last-of-type': function(node) {
                var children = M_DOM._children(node.parentNode, node.tagName);
                return children[children.length - 1] === node;
            },

            'only-child': function(node) {
                var children = M_DOM._children(node.parentNode);
                return children.length === 1 && children[0] === node;
            },

            'only-of-type': function(node) {
                var children = M_DOM._children(node.parentNode, node.tagName);
                return children.length === 1 && children[0] === node;
            },

            'empty': function(node) {
                return node.childNodes.length === 0;
            },

            'not': function(node, expr) {
                return !M.Selector.test(node, expr);
            },

            'contains': function(node, expr) {
                var text = node.innerText || node.textContent || '';
                return text.indexOf(expr) > -1;
            },

            'checked': function(node) {
                return (node.checked === true || node.selected === true);
            },

            'enabled': function(node) {
                return (node.disabled !== undefined && !node.disabled);
            },

            'disabled': function(node) {
                return (node.disabled);
            }
        },

        _bruteQuery: function(selector, root, firstOnly) {
            var ret = [],
                nodes = [],
                tokens = Selector._tokenize(selector),
                token = tokens[tokens.length - 1],
                rootDoc = M_DOM._getDoc(root),
                child,
                id,
                className,
                tagName;

            if (token) {
                // prefilter nodes
                id = token.id;
                className = token.className;
                tagName = token.tagName || '*';

                if (root.getElementsByTagName) { // non-IE lacks DOM api on doc frags
                    // try ID first, unless no root.all && root not in document
                    // (root.all works off document, but not getElementById)
                    if (id && (root.all || (root.nodeType === 9 || M_DOM.inDoc(root)))) {
                        nodes = M_DOM.allById(id, root);
                    // try className
                    } else if (className) {
                        nodes = root.getElementsByClassName(className);
                    } else { // default to tagName
                        nodes = root.getElementsByTagName(tagName);
                    }

                } else { // brute getElementsByTagName()
                    child = root.firstChild;
                    while (child) {
                        // only collect HTMLElements
                        // match tag to supplement missing getElementsByTagName
                        if (child.tagName && (tagName === '*' || child.tagName === tagName)) {
                            nodes.push(child);
                        }
                        child = child.nextSibling || child.firstChild;
                    }
                }
                if (nodes.length) {
                    ret = Selector._filterNodes(nodes, tokens, firstOnly);
                }
            }

            return ret;
        },

        _filterNodes: function(nodes, tokens, firstOnly) {
            var i = 0,
                j,
                len = tokens.length,
                n = len - 1,
                result = [],
                node = nodes[0],
                tmpNode = node,
                getters = M.Selector.getters,
                operator,
                combinator,
                token,
                path,
                pass,
                value,
                tests,
                test;

            for (i = 0; (tmpNode = node = nodes[i++]);) {
                n = len - 1;
                path = null;

                testLoop:
                while (tmpNode && tmpNode.tagName) {
                    token = tokens[n];
                    tests = token.tests;
                    j = tests.length;
                    if (j && !pass) {
                        while ((test = tests[--j])) {
                            operator = test[1];
                            if (getters[test[0]]) {
                                value = getters[test[0]](tmpNode, test[0]);
                            } else {
                                value = tmpNode[test[0]];
                                if (test[0] === 'tagName' && !Selector._isXML) {
                                    value = value.toUpperCase();
                                }
                                if (typeof value != 'string' && value !== undefined && value.toString) {
                                    value = value.toString(); // coerce for comparison
                                } else {
                                     try{
                                        if (value === undefined && tmpNode.getAttribute) {
                                            value = tmpNode.getAttribute(test[0]);
                                        }

                                    }catch(ee){}
                                }


                            }

                            if ((operator === '=' && value !== test[2]) ||  // fast path for equality
                                (typeof operator !== 'string' && // protect against String.test monkey-patch (Moo)
                                operator.test && !operator.test(value)) ||  // regex test
                                (!operator.test && // protect against RegExp as function (webkit)
                                        typeof operator === 'function' && !operator(tmpNode, test[0], test[2]))) { // function test

                                // skip non element nodes or non-matching tags
                                if ((tmpNode = tmpNode[path])) {
                                    while (tmpNode &&
                                        (!tmpNode.tagName ||
                                            (token.tagName && token.tagName !== tmpNode.tagName))
                                    ) {
                                        tmpNode = tmpNode[path];
                                    }
                                }
                                continue testLoop;
                            }
                        }
                    }

                    n--; // move to next token
                    // now that we've passed the test, move up the tree by combinator
                    if (!pass && (combinator = token.combinator)) {
                        path = combinator.axis;
                        tmpNode = tmpNode[path];

                        // skip non element nodes
                        while (tmpNode && !tmpNode.tagName) {
                            tmpNode = tmpNode[path];
                        }

                        if (combinator.direct) { // one pass only
                            path = null;
                        }

                    } else { // success if we made it this far
                        result.push(node);
                        if (firstOnly) {
                            return result;
                        }
                        break;
                    }
                }
            }
            node = tmpNode = null;
            return result;
        },

        combinators: {
            ' ': {
                axis: PARENT_NODE
            },

            '>': {
                axis: PARENT_NODE,
                direct: true
            },


            '+': {
                axis: PREVIOUSSIBLING,
                direct: true
            },

            '~' : {
                axis: PREVIOUSSIBLING
            }
        },

        _parsers: [
            {
                name: ATTRIBUTES,
                re: /^\uE003(-?[a-z]+[\w\-]*)+([~\|\^\$\*!=]=?)?['"]?([^\uE004'"]*)['"]?\uE004/i,
                fn: function(match, token) {
                    var operator = match[2] || '',
                        operators = Selector.operators,
                        escVal = (match[3]) ? match[3].replace(/\\/g, '') : '',
                        test;

                    // add prefiltering for ID and CLASS
                    if ((match[1] === 'id' && operator === '=') ||
                            (match[1] === 'className' &&
                            M.config.doc.documentElement.getElementsByClassName &&
                            (operator === '~=' || operator === '='))) {
                        token.prefilter = match[1];


                        match[3] = escVal;

                        // escape all but ID for prefilter, which may run through QSA (via Dom.allById)
                        token[match[1]] = (match[1] === 'id') ? match[3] : escVal;

                    }

                    // add tests
                    if (operator in operators) {
                        test = operators[operator];
                        if (typeof test === 'string') {
                            match[3] = escVal.replace(Selector._reRegExpTokens, '\\$1');
                            test = new RegExp(test.replace('{val}', match[3]));
                        }
                        match[2] = test;
                    }
                    if (!token.last || token.prefilter !== match[1]) {
                        return match.slice(1);
                    }
                }
            },
            {
                name: TAG_NAME,
                re: /^((?:-?[_a-z]+[\w-]*)|\*)/i,
                fn: function(match, token) {
                    var tag = match[1];

                    if (!Selector._isXML) {
                        tag = tag.toUpperCase();
                    }

                    token.tagName = tag;

                    if (tag !== '*' && (!token.last || token.prefilter)) {
                        return [TAG_NAME, '=', tag];
                    }
                    if (!token.prefilter) {
                        token.prefilter = 'tagName';
                    }
                }
            },
            {
                name: COMBINATOR,
                re: /^\s*([>+~]|\s)\s*/,
                fn: function(match, token) {
                }
            },
            {
                name: PSEUDOS,
                re: /^:([\-\w]+)(?:\uE005['"]?([^\uE005]*)['"]?\uE006)*/i,
                fn: function(match, token) {
                    var test = Selector[PSEUDOS][match[1]];
                    if (test) { // reorder match array and unescape special chars for tests
                        if (match[2]) {
                            match[2] = match[2].replace(/\\/g, '');
                        }
                        return [match[2], test];
                    } else { // selector token not supported (possibly missing CSS3 module)
                        return false;
                    }
                }
            }
            ],

        _getToken: function(token) {
            return {
                tagName: null,
                id: null,
                className: null,
                attributes: {},
                combinator: null,
                tests: []
            };
        },

        /*
            Break selector into token units per simple selector.
            Combinator is attached to the previous token.
         */
        _tokenize: function(selector) {
            selector = selector || '';
            selector = Selector._parseSelector(Lang.trim(selector));
            var token = Selector._getToken(),     // one token per simple selector (left selector holds combinator)
                query = selector, // original query for debug report
                tokens = [],    // array of tokens
                found = false,  // whether or not any matches were found this pass
                match,         // the regex match
                test,
                i, parser;
            /*
                Search for selector patterns, store, and strip them from the selector string
                until no patterns match (invalid selector) or we run out of chars.

                Multiple attributes and pseudos are allowed, in any order.
                for example:
                    'form:first-child[type=button]:not(button)[lang|=en]'
            */
            outer:
            do {
                found = false; // reset after full pass
                for (i = 0; (parser = Selector._parsers[i++]);) {
                    if ( (match = parser.re.exec(selector)) ) { // note assignment
                        if (parser.name !== COMBINATOR ) {
                            token.selector = selector;
                        }
                        selector = selector.replace(match[0], ''); // strip current match from selector
                        if (!selector.length) {
                            token.last = true;
                        }

                        if (Selector._attrFilters[match[1]]) { // convert class to className, etc.
                            match[1] = Selector._attrFilters[match[1]];
                        }

                        test = parser.fn(match, token);
                        if (test === false) { // selector not supported
                            found = false;
                            break outer;
                        } else if (test) {
                            token.tests.push(test);
                        }

                        if (!selector.length || parser.name === COMBINATOR) {
                            tokens.push(token);
                            token = Selector._getToken(token);
                            if (parser.name === COMBINATOR) {
                                token.combinator = M.Selector.combinators[match[1]];
                            }
                        }
                        found = true;
                    }
                }
            } while (found && selector.length);

            if (!found || selector.length) { // not fully parsed
                tokens = [];
            }
            return tokens;
        },

        _replaceMarkers: function(selector) {
            selector = selector.replace(/\[/g, '\uE003');
            selector = selector.replace(/\]/g, '\uE004');

            selector = selector.replace(/\(/g, '\uE005');
            selector = selector.replace(/\)/g, '\uE006');
            return selector;
        },

        _replaceShorthand: function(selector) {
            var shorthand = M.Selector.shorthand,
                re;

            for (re in shorthand) {
                if (shorthand.hasOwnProperty(re)) {
                    selector = selector.replace(new RegExp(re, 'gi'), shorthand[re]);
                }
            }

            return selector;
        },

        _parseSelector: function(selector) {
            var replaced = M.Selector._replaceSelector(selector),
                selector = replaced.selector;

            // replace shorthand (".foo, #bar") after pseudos and attrs
            // to avoid replacing unescaped chars
            selector = M.Selector._replaceShorthand(selector);

            selector = M.Selector._restore('attr', selector, replaced.attrs);
            selector = M.Selector._restore('pseudo', selector, replaced.pseudos);

            // replace braces and parens before restoring escaped chars
            // to avoid replacing ecaped markers
            selector = M.Selector._replaceMarkers(selector);
            selector = M.Selector._restore('esc', selector, replaced.esc);

            return selector;
        },

        _attrFilters: {
            'class': 'className',
            'for': 'htmlFor'
        },

        getters: {
            href: function(node, attr) {
                return M_DOM_getAttr(node, attr);
            },

            id: function(node, attr) {
                return M_DOM.getId(node);
            }
        }



    };







    M.mix(M.Selector, Selector);

});
 
/**
 * 封装event
 * @memberOf M
 * @class Event
 * @2013.6.28
 * @author: shenguozu
**/
Mo.define('event', function (M) {
    M.Event = function( event, currentTarget ){
        var e, t, f,
            self = this;

        if(!(M.instanceOf(self, M.Event))) {
            self = new M.Event(event)
        }


        self._type_ = "mEvent";

        if( event && typeof event == "object" && event.type ){

            self.originalEvent = e = event;

            for( var name in e )
                if( typeof e[name] != "function" )
                    self[ name ] = e[ name ];

            if( e.extraData )
                M.extend( self, e.extraData );

            self._target = self.srcElement = e.srcElement || (
                ( t = e.target ) && ( t.nodeType == 3 ? t.parentNode : t )
            );
            self.relatedTarget = e.relatedTarget || (
                ( t = e.fromElement ) && ( t === self.target ? e.toElement : t )
            );
			self.currentTarget = currentTarget ? currentTarget : M.one(self.currentTarget);
            if(M.Node) {
                if(self._target){
                    self.target = new M.Node( self._target );
                }
            }


            self.keyCode = self.which = e.keyCode || e.which;

            // Add which for click: 1 === left; 2 === middle; 3 === right
            if( !self.which && e.button !== undefined )
                self.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) );

            var doc = document.documentElement, body = document.body;

            self.pageX = e.pageX || (
                e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0)
            );

            self.pageY = e.pageY || (
                e.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0)
            );

            self.data;
        }

        self.timeStamp = new Date().getTime();
        self.type = self.type || event;
        return self;
    }

    M.extend(M.Event, /** * @lends M.Event*/{
        /**
         * 阻止浏览器默认方法
         */
        stopPropagation : function() {
             var e = this.originalEvent;
             e && ( e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true );
        },
        /**
         * 阻止事件冒泡
         */
        preventDefault : function() {
             var e = this.originalEvent;
             e && ( e.preventDefault ? e.preventDefault() : e.returnValue = false );
        },
        /**
         * 同时阻止浏览器默认方法，事件冒泡
         */
        halt: function(){
            this.stopPropagation();
            this.preventDefault();
        }

    });
});
 
/**
 * 节点class相关操作
 */
Mo.define('node-cls', function(M) {
    var Lang = M.Lang,
    _regexCache = {},
    _getRegExp = function(str, flags){
        flags = flags || '';
        if (!_regexCache[str + flags]) {
            _regexCache[str + flags] = new RegExp(str, flags);
        }
        return _regexCache[str + flags];
    },
    /**
     * 判断节点是否存在class
     * @param  {Object}  node      基础节点
     * @param  {String}  className class名称
     * @return {Boolean}           是否存在
     */
    hasClass =  function(node, className) {
        var re = _getRegExp('(?:^|\\s+)' + className + '(?:\\s+|$)');
        return re.test(node.className);
    },
    /**
     * 删除节点class
     * @param  {Object}  node      基础节点
     * @param  {String}  className class名称
     */
    removeClass = function (node, className) {
        if(className.indexOf(',') > -1){
            className = className.split(',');
            M.each(className, function(cName) {
                removeClass(node, cName);
            });
        }
        if (className && hasClass(node, className)) {
            node.className = Lang.trim(node.className.replace(_getRegExp('(?:^|\\s+)' + className + '(?:\\s+|$)'), ' '));

            if ( hasClass(node, className) ) {//处理多个相同class的情况
                removeClass(node, className);
            }
        }
    },
    /**
     * 添加节点
     * @param {Object} node      基础节点
     * @param {String} className class名称
     */
    addClass = function(node, className) {
        if (!hasClass(node, className)) {
            node.className = Lang.trim([node.className, className].join(' '));
        }
    },
    classManager = {
        removeClass: removeClass,
        addClass: addClass,
        toggleClass: function(node, className, force) {
            var add = (force !== undefined) ? force : !(hasClass(node, className));

            if (add) {
                addClass(node, className);
            } else {
                removeClass(node, className);
            }
        },
        replaceClass: function(node, oldC, newC) {
            removeClass(node, oldC); // remove first in case oldC === newC
            addClass(node, newC);
        },
        hasClass:hasClass
    };
    M.classManager = classManager;
    /**
     * 节点class相关操作
     * @lends M.Node.prototype
     */
    var nodeCls = {
        /**
         * 判断当前节点是否拥有指定class
         * @param {string} className class名称
         * @return {boolean} 有用指定的classname则返回true
         * @example
         * ###HTML
         * ```
         * <div data-role="node" class="header"></div>
         * ```
         * ###JS
         * M.role('node').hasClass('header');// ture
         */
        hasClass: function(className) {
            return classManager.hasClass(this._node, className);
        },
        /**
         * 删除节点的class
         * @param  {String} className class名称
         * @return {Node}          返回当前node节点
         * @example
         * ###HTML
         * ```
         * <div data-role="node" class="header"></div>
         * ```
         * ###JS
         * M.role('node').removeClass('header');
         * 
         * ###result
         * ```
         * <div data-role="node"></div>
         * ```
         */
        removeClass: function(className) {
            classManager.removeClass(this._node, className);
            return this;
        },
        /**
         * 为节点添加class
         * @param {String} className class名称
         * @return {Node}          返回当前node节点
         * @example
         * ###HTML
         * ```
         * <div data-role="node" class="header"></div>
         * ```
         * ###JS
         * M.role('node').addClass('other');
         * 
         * ###result
         * ```
         * <div data-role="node" class="header other"></div>
         * ```
         * 
         */
        addClass: function(className) {
            classManager.addClass(this._node, className);
            return this;
        },
        /**
         * 点击时添加或者删除节点Class
         * @param {String} className class名称
         * @param {Boolean} b      当前是否是选中状态
         * @return {Node}          返回当前node节点
         * ###HTML
         * ```
         * <div data-role="node" class="header"></div>
         * ```
         * ###JS
         * M.role('node').toggleClass('other');
         * 
         * ###result
         * ```
         * <div data-role="node" class="header other"></div>
         * ```
         * ###JS
         * M.role('node').toggleClass('other');
         * ###result
         * ```
         * <div data-role="node" class="header"></div>
         * ```
         */
        toggleClass: function(className, b) {
            classManager.toggleClass(this._node, className, b);
            return this;
        },
        /**
         * 用指定的className替换某个className
         * @param {string} oldCls 要替换的className
         * @param {string} newCls 新的className
         * @example
         * ###HTML
         * ```
         * <div data-role="node" class="header"></div>
         * ```
         * ###JS
         * M.role('node').replaceClass('header','other');
         * 
         * ###result
         * ```
         * <div data-role="node" class="other"></div>
         * ```
         */
        replaceClass: function(oldCls, newCls) {
            classManager.replaceClass(this._node, oldCls, newCls);
            return this;
        }
        
    }
    M.extend(M.Node, nodeCls);
}) 
/**
* 节点数据缓存相关操作
*/
Mo.define('node-data', function(M) {
    var STR_DATA_PREFIX = 'data-';
    /**
     * @lends M.Node.prototype
     */
    var data = {
        _initData: function() {
            if (! ('_data' in this)) {
                this._data = {};
            }
        },
        /**
         * 获取节点缓存数据
         * @param  {String} name 缓存数据名称
         * @return {Object | String}      缓存的数据
         */
        getData: function(name) {
            this._initData();

            var data = this._data,
            ret = data;

            if (arguments.length) { // single field
                if (name in data) {
                    ret = data[name];
                } else { // initialize from HTML attribute
                    ret = this._getDataAttribute(name);
                }
            } else if (typeof data == 'object' && data !== null) { // all fields
                ret = {};
                M.each(data, function(v, n) {
                    ret[n] = v;
                });

                ret = this._getDataAttributes(ret);
            }

            return ret;
        },
        /**
         * 设置节点缓存数据
         * @param {String} name 缓存数据名称
         * @param {Object | String} val  缓存的数据
         */
        setData: function(name, val) {
            this._initData();
            if (arguments.length > 1) {
                this._data[name] = val;
            } else {
                this._data = name;
            }
            return this;
        },
        _getDataAttributes: function(ret) {
            ret = ret || {};
            var i = 0,
            attrs = this._node.attributes,
            len = attrs.length,
            prefixLength = STR_DATA_PREFIX.length,
            name;

            while (i < len) {
                name = attrs[i].name;
                if (name.indexOf(STR_DATA_PREFIX) === 0) {
                    name = name.substr(prefixLength);
                    if (! (name in ret)) { // only merge if not already stored
                        ret[name] = this._getDataAttribute(name);
                    }
                }

                i += 1;
            }

            return ret;
        },
        _getDataAttribute: function(name) {
            name = STR_DATA_PREFIX + name;

            var node = this._node,
            attrs = node.attributes,
            data = attrs && attrs[name] && attrs[name].value;

            return data;
        },
        /**
         * 清除节点缓存数据
         * @param  {String} name 缓存数据名称
         * @return {HTMLelement}      当前原生节点
         */
        clearData: function(name) {
            if ('_data' in this) {
                if (typeof name != 'undefined') {
                    delete this._data[name];
                } else {
                    delete this._data;
                }
            }

            return this;
        }
    }

    M.extend(M.Node, data);
}); 
/**
 * node-event 提供基于node的事件绑定、解绑、代理、解除代理及自定义事件机制
 * 
 * 
*/
Mo.define('node-event', function (M) {
    var Lang = M.Lang,
        EVTS = "_moEvent",
        MOUSEENTER = "mouseenter",
        MOUSELEAVE = "mouseleave",
        MOUSEOVER = "mouseover",
        MOUSEOUT = "mouseout";
    /**
     * @lends M.Node.prototype
     */
    M.EventTarget = {
		/**
		 * 提供事件绑定与注册
		 * @param {string} types 事件类型
		 * @param {Function} fn 事件触发时对应的处理函数
		 * @param {Ojbect} context  事件触发时对应的this
		 * @param {Any} args  事件触发时要传递的参数
		 * @param {String} selector  支持选择器，用来匹配event.target，多用于事件代理
		 */
        on: function(types, fn, context, args, selector) {
  
            var orgType,self = this._node || this,k,
                capture = false,
                isNode = (Lang.isNode(self) || self === window) ? true : false;
            if( Lang.isString(types) && types.indexOf(',') !== -1){
                types = types.split(',');
            }

            if(Lang.isArray(types)) {
                for (var type in types ) {
                    this.on( types[type], fn, context, args, selector);
                }
                return this;
            }else if(Lang.isObject(types)) {
                for(var type in types){
                    this.on(type, types[type], context, args, selector);
                }
            }
            //webkit mouseenter && mouseleave 处理
            context = context || this;
            types = Lang.trim(types);
            orgType = types;
            self.evtWebkit = M.UA.webkit && (orgType == MOUSEENTER || orgType == MOUSELEAVE);
            self.evtIE = M.UA.ie ? true : false;
            if(self.evtWebkit || self.evtIE){
                types === MOUSEENTER && (types = MOUSEOVER);
                types === MOUSELEAVE && (types = MOUSEOUT);
            }

            self.isOrgEvt = isNode && (typeof self['on'+types]) === 'object' ? true : false;
            self[EVTS] = self[EVTS] || {};
            self[EVTS][types] = self[EVTS][types] || {};
            var args_arr;

            k = M.stamp(fn);

            if (!selector) {
                self[EVTS][types][k] = function(e){
                    e = e || window.event;
                    if(self.evtWebkit){
                        //webkit mouseenter && mouseleave  处理
                        var et=e.currentTarget,er=e.relatedTarget;
                        if(et.contains(er)) return false;
                    };
                    self[EVTS][types].isOrgEvt && (e = new M.Event(e, self[EVTS][types][k] && self[EVTS][types][k].currentTarget));
                    args_arr = [e];
                    if(self[EVTS][types][k] && !Lang.isUndefined(self[EVTS][types][k]._args)){
                        args_arr[Lang.isArray(self[EVTS][types][k]._args) ? 'concat' : 'push'](self[EVTS][types][k]._args);
                    }
                    return fn.apply(context, args_arr);
                };
                self[EVTS][types].isOrgEvt = self.isOrgEvt;
                self[EVTS][types][k]._args = args;
                self[EVTS][types][k].currentTarget = M.one(self);
                self[EVTS][types][k].orgType = orgType;
            }else{
                //delegate 处理
                capture = true;
                self[EVTS][types][k] = function(e, args) {
                    var e = e || window.event,
                        target = e.target || e.srcElement,
                        isTarget = false;
                    if(target.nodeType === 3) {
                        target = target.parentNode;
                    }

					do {
						if(!target) return;
						isTarget = M.Selector.test( target, selector, self);
						if( !isTarget && target !== self) {
							target = target.parentNode;
						}
                    } while (!isTarget && target !== self)

                    if ( isTarget ) {
                        args_arr = [new M.Event(e, M.one(target))];
                        if(self[EVTS][types][k]._args){
                            args_arr.push(self[EVTS][types][k]._args);
                        }
                        return fn.apply(context, args_arr);
                    }
                };
                self[EVTS][types][k]._args = args;
                self[EVTS][types][k].currentTarget = M.one(self);
                self[EVTS][types][k].orgType = orgType;
            }
            M.EventTarget._add(self, types, self[EVTS][types][k], capture);
            return this;
        },
		/**
		 * 提供事件解绑
		 *
		 * @param {string} types 事件类型
		 * @param {Function} fn  要解绑的函数，不设置则解绑所有
		 * @param {String} selector  支持选择器，用来匹配event.target，多用于事件代理解绑
		 */
        off: function(types, fn, selector) {
            var self = this._node ? this._node : this;

            if( !Lang.isString(types)) {
                return;
            } else if(types.indexOf(',') !== -1){
                types = types.split(',');
            }
            if( Lang.isArray(types)) {
                for ( var type in types ) {
                    this.off(types[type], fn, selector);
                }
                return this;
            }
            types = Lang.trim(types);
            if(!self[EVTS] || !self[EVTS][types]) return;
            var k;
            if(self.evtWebkit || self.evtIE) {
                if(types === MOUSEENTER) {
                    types = MOUSEOVER;
                }else if(types === MOUSELEAVE) {
                    types = MOUSEOUT;
                }
            }
            if(fn){
                k = fn[M.config.prefix];
                if(k && self[EVTS][types][k]) {
                    if(self[EVTS][types].isOrgEvt){
                        M.EventTarget._remove( self, types, self[EVTS][types][k], false);
                    }

                    delete self[EVTS][types][k];
                }
            }else{
                for(var k in self[EVTS][types]){
                    if(self[EVTS][types].isOrgEvt) {
                        M.EventTarget._remove( self, types, self[EVTS][types][k], false);
                    }
                }
                delete self[EVTS][types];
            }

        },
		/**
		 * 提供事件代理绑定
		 *
		 * @param {string} types  事件类型
		 * @param {Function} fn  事件触发时对应的处理函数
		 * @param {String} selector  支持选择器，用来匹配event.target
		 * @param {Ojbect} context  事件触发时对应的this
		 * @param {Any} args  事件触发时要传递的参数
		 */
        delegate: function( types, fn, selector, context, args ) {
            this.on( types, fn, context, args, selector );
        },
		/**
		 * 提供事件代理解绑
		 *
		 * @param {string} types  事件类型
		 * @param {Function} fn  事件触发时对应的处理函数，不设置解绑所有
		 * @param {String} selector  支持选择器，用来匹配event.target
		 */
        undelegate: function( types, fn, selector ) {
            this.off( types, fn, selector );
        },
		/**
		 * 手动触发事件
		 * @param {string} type  事件类型
		 * @param {Any} args  事件触发时要传递的参数
		 */
        fire: function( type, args ) {
            var self = this._node || this,
                evType;
            if(Lang.isObject(self[EVTS])){
                evType = self[EVTS][type];
                if(Lang.isObject(evType)) {
					var lastFn;
                    for(var i in evType) {
                        var fn = evType[i];
                        if(Lang.isFunction(fn)) {
							lastFn = fn && fn(args);
                        }
                    }
					return lastFn;
                }
            }
        }

    }
    /**
     * @lends M.Node.prototype
     */
    M._DOMEvent = {
        /**
         * 触发focus方法
         * @return {Object} 当前Node节点
         */
        focus: function(){
            this._node && this._node.focus();
			return this;
        },
        /**
         * 触发blur方法
         * @return {Object} 当前Node节点
         */
        blur: function(){
            this._node && this._node.blur();
			return this;
        }

    };

    M.extend(M.Node, M.EventTarget);
    M.extend(M.Node, M._DOMEvent);

    M.extend(M.EventTarget, {
        _add: function(el, type, fn, capture) {
            if (el && el.addEventListener) {
                el.addEventListener(type, fn, capture);
            } else if (el && el.attachEvent) {
                el.attachEvent('on' + type, fn);
            }
        },
        _remove: function(el, type, fn, capture) {
            if (el && el.removeEventListener) {
				el.removeEventListener(type, fn, capture);
            } else if (el && el.detachEvent) {
                el.detachEvent('on' + type, fn);
            }
        }
    });

});

 
/**
 * node数组封装，提供常用操作
 * @memberOf M
 * @class NodeList
 */
Mo.define('node-list',function (M) {
    var nodeList = function (nodes, root) {
        var tmp = [];
        if (nodes) {
            if (typeof nodes === 'string') { // selector query
                this._query = nodes;
                nodes = M.Selector.query(nodes, root);
            } else if (nodes.nodeType || M.Node.isWindow(nodes)) { // domNode || window
                nodes = [nodes];
            } else if (nodes._node) { // Y.Node
                nodes = [nodes._node];
            } else if (nodes[0] && nodes[0]._node) { // allow array of Y.Nodes
                M.each(nodes, function(node) {
                    if (node._node) {
                        tmp.push(node._node);
                    }
                });
                nodes = tmp;
            } else { // array of domNodes or domNodeList (no mixed array of Y.Node/domNodes)
                //TODO
                nodes = M.Array.toArray(nodes, 0, true);
            }
        }

        /**
         * The underlying array of DOM nodes bound to the Y.NodeList instance
         * @property _nodes
         * @private
         */
        this._nodes = nodes || [];
    };

    nodeList.getDOMNodes = function(nlist) {
        return (nlist && nlist._nodes) ? nlist._nodes : nlist;
    };

    nodeList.each = function(instance, fn, context) {
        var nodes = instance._nodes;
        if (nodes && nodes.length) {
            M.each(nodes, fn, context || instance);
        } else {
            //M.log('warn','nodeList no nodes bound to ' , instance);
        }
    };
    nodeList.addMethod = function(name, fn, context, newNode) {
        //M.log('info', 'nodeList.addMethod', name)
        if (name && fn) {
            nodeList.prototype[name] = function() {
                var ret = [],
                    args = arguments;

                M.each(this._nodes, function(node) {
                    var UID = (node.uniqueID && node.nodeType !== 9 ) ? 'uniqueID' : 'moid',
                        instance = M.Node._instances[node[UID]],
                        ctx,
                        result;
                    if (!instance) {
                        instance = newNode ? M.one(node) : nodeList._getTempNode(node);
                    }
                    ctx = context || instance;
                    result = fn.apply(ctx, args);
                    if (result !== undefined && result !== instance) {
                        ret[ret.length] = result;
                    }
                });

                // TODO: remove tmp pointer
                return ret.length ? ret : this;
            };
        } else {
            //M.log('warn','node-list:','unable to add method "' + name + '" to nodeList');
        }
    };
    nodeList.importMethod = function(host, name, altName, newDom) {
        if (typeof name === 'string') {
            altName = altName || name;
            nodeList.addMethod(name, host[name], null, newDom);
        } else {
            M.each(name, function(n) {
                nodeList.importMethod(host, n, null, newDom);
            });
        }
    };
    nodeList._getTempNode = function(node) {
        //M.log('info', 'nodeList._getTempNode', name)
        var tmp = nodeList._tempNode;
        if (!tmp) {
            tmp = M.Node.create('<div></div>');
            nodeList._tempNode = tmp;
        }

        tmp._node = node;
        tmp._stateProxy = node;
        return tmp;
    };

    M.extend(nodeList,/** * @lends M.NodeList*/{
       _invoke: function(method, args, getter) {
            var ret = (getter) ? [] : this;

            this.each(function(node) {
                var val = node[method].apply(node, args);
                if (getter) {
                    ret.push(val);
                }
            });

            return ret;
        },
        /**
         * 按照索引获取list内的node节点
         * @param  {Int} index 索引号
         * @return {Node}       node节点
         */
        item: function(index) {
            return M.one((this._nodes || [])[index]);
        },
        /**
         * list内每个元素执行方法        
         * @param  {Function} fn      需要执行的方法   
         * @param  {everything}   context 传递给方法的参数
         * @return {Node}         当前list
         */
        each: function(fn, context) {
            var instance = this;
            M.each(this._nodes, function(node, index) {
                node = M.one(node);
                return fn.call(context || node, node, index, instance);
            });
            return instance;
        },
        /**
         * 判断一个节点的索引
         * @param  {Node} node list内的一个元素
         * @return {Int}      索引值
         */
        indexOf: function(node) {
            return Lang.indexOf(M.Node.getDOMNode(node), this._nodes);
        },
        /**
         * 刷新list内元素，按照上次的超找方式重新查找
         * @return {NodeList} 查找后的List
         */
        refresh: function() {
            var doc,
                nodes = this._nodes,
                query = this._query,
                root = this._queryRoot;

            if (query) {
                if (!root) {
                    if (nodes && nodes[0] && nodes[0].ownerDocument) {
                        root = nodes[0].ownerDocument;
                    }
                }

                this._nodes = M.Selector.query(query, root);
            }

            return this;
        },
        /**
         * 返回List的长度
         * @return {Int} list长度
         */
        size: function() {
            return this._nodes.length;
        },
        /**
         * 判断list是否为空
         * @return {Boolean} 是否为空
         */
        isEmpty: function() {
            return this._nodes.length < 1;
        },
        /**
         * 转换成字符串形式
         */
        toString: function() {
            var str = '',
                errorMsg = this['muid'] + ': not bound to any nodes',
                nodes = this._nodes,
                node;

            if (nodes && nodes[0]) {
                node = nodes[0];
                str += node['nodeName'];
                if (node.id) {
                    str += '#' + node.id;
                }

                if (node.className) {
                    str += '.' + node.className.replace(' ', '.');
                }

                if (nodes.length > 1) {
                    str += '...[' + nodes.length + ' items]';
                }
            }
            return str || errorMsg;
        },
        /**
         * 获取原生节点数组
         * @return {type} [description]
         */
        getDOMNodes: function() {
            return this._nodes;
        },
        /**
         * 过滤
         * @param  {Function |String}  selector 需要满足的函数或者选择器
         * @return {NodeList}          满足条件的nodelist
         */
        filter:function(selector) {
            var ret = [],
                nodes = this._nodes,
                i, node,Lang = M.Lang;

            if (nodes) {
                if(Lang.isString(selector)){
                    for (i = 0; (node = nodes[i++]);) {
                        if (M.Selector.test(node, selector)) {
                            ret[ret.length] = node;
                        }
                    }
                }
                if(Lang.isFunction(selector)){
                    M.each(nodes, function(n, i) {
                        n = M.one(n);
                        if(selector.apply(n,[n, i])){
                            ret[ret.length] = n._node;
                        }
                    });
                }
            } else {
            }
            return M.all(ret);
        }
    });

    nodeList.importMethod(M.Node.prototype, ['append','remove', 'hasClass', 'empty','setHTML','addClass','toggleClass','removeClass','getAttr','removeAttr','setAttr','setAttrs','setStyle','setStyles','getStyle','on','off','fire','delegate','show','hide', 'set', 'get']);
    nodeList.importMethod(M.Node.prototype, ['on','off','fire','delegate'], null, true);
    //M.NodeList.importMethod(M.Node.prototype, ['on','off','fire','delegate']);

    M.NodeList = nodeList;
    /**
     * 为M添加批量选择方法
     * @lends M                        
     */
    
    /**
     * 选择多个节点
     * @param  {String | HTML |dom} nodes 查找的节点
     * @param  {Node} root  选择的节点范围
     * @example
     * ###HTML
     * ```
     * <ul class="list">
     *     <li></li>
     *     <li></li>
     *     <li></li>
     * </ul>
     * ```
     * ###JS
     * var node_list = M.all('.list li');
     * //or
     * //var node_list = M.all('li', M.one('.list'));
     * node_list.addClass('item')
     * ###Result
     * ```
     * //.list 下的所有 li 都加上了 item
     * <ul class="list">
     *     <li class="item"></li>
     *     <li class="item"></li>
     *     <li class="item"></li>
     * </ul>
     * ```
     * @return {NodeList}   满足的全部节点的List
     */
    M.all = function (nodes, root) {
        if(root){
            if(root.getDOMNode){
                root = root.getDOMNode();
            }
            if(root.getDOMNodes){
                root = root.getDOMNodes();
            }
        }
        return new nodeList(nodes, root);
    };
    /**
     * 选择对应data-role的节点list 
     * @param  {String} roles roles名称
     * @param  {Node} root  选择的节点范围
     * @return {NodeList}       满足的全部节点的List
     */
    M.roles = function(roles, root){
        return M.all('[data-role='+roles+']', root)
    }
    /**
     * 为Node添加批量选择方法                    
     */
    M.extend(M.Node, /** @lends M.Node.prototype*/{
        /**
         * 查找子节点
         * @param  {String | HTML |dom} selector 查找的节点
         * @example
         * ###HTML
         * ```
         * <ul class="list">
         *     <li></li>
         *     <li></li>
         *     <li></li>
         * </ul>
         * ```
         * ### JS
         * var list = M.one('.list');
         * list.all('li');
         * 
         * ### Result
         * .list节点下所有的li标签
         * @return {NodeList}   满足的全部节点的List
         */
        all:function(selector) {
            return M.all(selector, this._node);
        },
        /**
         * 按照data-role查找子节点
         * @param  {String} selector roles名称
         * @return {NodeList}   满足的全部节点的List
         */
        roles:function(selector) {
            return M.roles(selector, this._node);
        }
    });
});
 
/**
 * 提供节点相关的操作方法
 * @author wanhu
 * @date: 2013/6/26
 * @namespace M
 * @class M.Node
 * 
 * @lends M.Node.prototype
 */

Mo.define('node', function(M) {
    var prefix = M.config.prefix,
    M_Node = M.Node,
    STR_NODE_TYPE = 'nodeType';

    //继承原生方法
    M.each(['removeChild', 'hasChildNodes', 'cloneNode', 'scrollIntoView', 'getElementsByTagName', 'focus', 'blur', 'submit', 'reset', 'select', 'createCaption'], function(method) {
        M.Node.prototype[method] = function(arg1, arg2, arg3) {
            var ret = this.invoke(method, arg1, arg2, arg3);
            return ret;
        };
    });


     /**
      * 返回(不指定则在文档内查找)第一个匹配选择器的节点，可通过此方法把原生DOM节点转换为方法
      * @method one
      * @static
      * @param {string | HTMLElement | Node} selector 选择器或节点
      * @param {string | HTMLElement | Node} root 选择范围
      * @return {Node | null}
      * @memberOf Mo
      */
    M.one = function(node, root) {
        var instance = null,
        cachedNode, uid;

        if(root&&root.getDOMNode){root=root.getDOMNode();}

        if (node) {
            if (typeof node == 'string') {
                node = M_Node._fromString(node, root);
                if (!node) {
                    return null; // NOTE: return
                }
            } else if (node.getDOMNode) {
                return node; // NOTE: return
            }
            if (node.nodeType || M_Node.isWindow(node)) { // avoid bad input (numbers, boolean, etc)
                uid = (node.uniqueID && node.nodeType !== 9) ? node.uniqueID : node[prefix];

                instance = M_Node._instances[uid]; // reuse exising instances
                cachedNode = instance ? instance._node: null;

                if(!uid){
                    uid = M.stamp(node);
                }

                if (!instance || (cachedNode && node !== cachedNode)) { // new Node when nodes don't match
                    instance = new M_Node(node);
                    if (node.nodeType != 11) { // dont cache document fragment
                        //M_Node._instances[instance[prefix]] = instance; // cache node
                        M_Node._instances[uid] = instance; // cache node
                    }
                }
            }
        }
        return instance;
    }

     /**
      * 返回指定范围内(不指定则在文档内查找)第一个符合选择器 [data-role=roleValue] 的所有节点，

        //code1
        M.one('[data-role=roleValue]')
        //code2
        M.role('roleValue')
        //code1和code2返回值一样

      * @method role
      * @param {string} role role的属性值
      * @param {string|dom|Node} root 选择器限定范围
      * @return {Node | null}
      * @for Mo
      */
    M.role = function(role, root){
        return M.one('[data-role=' + role + ']', root);
    }

     /**
      * 返回当前节点下第一个匹配选择器的节点
      * @method one
      * @param {string | HTMLElement | Node} selector 选择器或节点
      * @param {string | HTMLElement | Node} root 选择范围
      * @return {Node | null}
      * @for Mo.Node
      */
     M.extend(M.Node, {
        one: function(selector){
            return M.one(selector, this._node);
        },
        role:function(selector) {
            return M.role(selector, this._node);
        }
    })
}); 
/**
 *@template.js 模版
 *
 *@author zhangjian
 *@date 2013.06.26
 *@version 1.0.5
 */
Mo.define('template', function(M) {
    var L = M.Lang,
        TPL_Cache = {};
    /**
     * 模版解析类
     * @constructs  M.Template
     */

    var template = function(id, content) {
        return M.Template[M.Lang.isObject(content) ? 'render' : 'compile'].apply(M.Template, arguments);
    };
    /** @lends M.Template */
    (function(exports, global) {
        'use strict';
        exports.version = '2.0.1';
        exports.openTag = '{{'; // 设置逻辑语法开始标签
        exports.closeTag = '}}'; // 设置逻辑语法结束标签
        exports.isEscape = true; // HTML字符编码输出开关
        exports.isCompress = false; // 剔除渲染后HTML多余的空白开关
        exports.parser = null; // 自定义语法插件接口
        /**
         * 渲染模板
         * @param   {String}  tid  模板ID
         * @param   {Object}  data  数据
         * @memberOf M.Template
         * @return  {String}    渲染好的HTML字符串
         */
        exports.render = function(id, data) {

            var cache = _getCache(id);

            if (cache === undefined) {

                return _debug({
                    id: id,
                    name: 'Render Error',
                    message: 'No Template'
                });

            }

            return cache(data);
        };

        /**
         * 编译模板
         * @param   {String}  [tid]  模板ID
         * @param   {String}   tstr   模板字符串
         * @memberOf M.Template
         * @return  {Function}  渲染方法
         */
        exports.compile = function(id, source) {

            var params = arguments;
            var isDebug = params[2];
            var anonymous = 'anonymous';

            if (typeof source !== 'string') {
                isDebug = params[1];
                source = params[0];
                id = anonymous;
            }

            try {

                var Render = _compile(source, isDebug);

            } catch (e) {

                e.id = id || source;
                e.name = 'Syntax Error';

                return _debug(e);

            }

            function render(data) {

                try {

                    return new Render(data) + '';

                } catch (e) {

                    if (!isDebug) {
                        return exports.compile(id, source, true)(data);
                    }

                    e.id = id || source;
                    e.name = 'Render Error';
                    e.source = source;

                    return _debug(e);

                }

            }
            render.prototype = Render.prototype;
            render.toString = function() {
                return Render.toString();
            };

            if (id !== anonymous) {
                _cache[id] = render;
            }

            return render;

        };

        /**
         * 添加模板辅助方法
         * @param   {String}    名称
         * @param   {Function}  方法
         */
        exports.helper = function(name, helper) {
            exports.prototype[name] = helper;
        };

        /**
         * 模板错误事件
         * @name    template.onerror
         * @event
         * @ignore
         */
        exports.onerror = function(e) {
            var content = '[template]:\n' + e.id + '\n\n[name]:\n' + e.name;

            if (e.message) {
                content += '\n\n[message]:\n' + e.message;
            }

            if (e.line) {
                content += '\n\n[line]:\n' + e.line;
                content += '\n\n[source]:\n' + e.source.split(/\n/)[e.line - 1].replace(/^[\s\t]+/, '');
            }

            if (e.temp) {
                content += '\n\n[temp]:\n' + e.temp;
            }

            if (global.console) {
                console.error(content);
            }
        };

        // 编译好的函数缓存
        var _cache = {};

        // 获取模板缓存
        var _getCache = function(id) {

            var cache = _cache[id];

            if (cache === undefined && 'document' in global) {
                var elem = document.getElementById(id);

                if (elem) {
                    var source = elem.value || elem.innerHTML;
                    return exports.compile(id, source.replace(/^\s*|\s*$/g, ''));
                }

            } else if (_cache.hasOwnProperty(id)) {

                return cache;
            }
        };

        // 模板调试器
        var _debug = function(e) {

            exports.onerror(e);

            function error() {
                return error + '';
            }

            error.toString = function() {
                return '{Template Error}';
            };

            return error;
        };

        // 模板编译器
        var _compile = (function() {

            // 辅助方法集合
            exports.prototype = {
                $render: exports.render,
                $escape: function(content) {

                    return typeof content === 'string' ? content.replace(/&(?![\w#]+;)|[<>"']/g, function(s) {
                        return {
                            "<": "&#60;",
                            ">": "&#62;",
                            '"': "&#34;",
                            "'": "&#39;",
                            "&": "&#38;"
                        }[s];
                    }) : content;
                },
                $string: function(value) {

                    if (typeof value === 'string' || typeof value === 'number') {

                        return value;

                    } else if (typeof value === 'function') {

                        return value();

                    } else {

                        return '';

                    }

                }
            };

            var arrayforEach = Array.prototype.forEach ||
                function(block, thisObject) {
                    var len = this.length >>> 0;

                    for (var i = 0; i < len; i++) {
                        if (i in this) {
                            block.call(thisObject, this[i], i, this);
                        }
                    }

                };

            // 数组迭代
            var forEach = function(array, callback) {
                arrayforEach.call(array, callback);
            };

            // 静态分析模板变量
            var KEYWORDS =
                // 关键字
                'break,case,catch,continue,debugger,default,delete,do,else,false' + ',finally,for,function,if,in,instanceof,new,null,return,switch,this' + ',throw,true,try,typeof,var,void,while,with'

            // 保留字
            +',abstract,boolean,byte,char,class,const,double,enum,export,extends' + ',final,float,goto,implements,import,int,interface,long,native' + ',package,private,protected,public,short,static,super,synchronized' + ',throws,transient,volatile'

            // ECMA 5 - use strict
            + ',arguments,let,yield'

            + ',undefined';
            var REMOVE_RE = /\/\*(?:.|\n)*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|'[^']*'|"[^"]*"|[\s\t\n]*\.[\s\t\n]*[$\w\.]+/g;
            var SPLIT_RE = /[^\w$]+/g;
            var KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g');
            var NUMBER_RE = /\b\d[^,]*/g;
            var BOUNDARY_RE = /^,+|,+$/g;
            var getVariable = function(code) {

                code = code.replace(REMOVE_RE, '').replace(SPLIT_RE, ',').replace(KEYWORDS_RE, '').replace(NUMBER_RE, '').replace(BOUNDARY_RE, '');

                code = code ? code.split(/,+/) : [];

                return code;
            };

            return function(source, isDebug) {

                var openTag = exports.openTag;
                var closeTag = exports.closeTag;
                var parser = exports.parser;

                var code = source;
                var tempCode = '';
                var line = 1;
                var uniq = {
                    $data: true,
                    $helpers: true,
                    $out: true,
                    $line: true
                };
                var helpers = exports.prototype;
                var prototype = {};

                var variables = "var $helpers=this," + (isDebug ? "$line=0," : "");

                var isNewEngine = ''.trim; // '__proto__' in {}
                var replaces = isNewEngine ? ["$out='';", "$out+=", ";", "$out"] : ["$out=[];", "$out.push(", ");", "$out.join('')"];

                var concat = isNewEngine ? "if(content!==undefined){$out+=content;return content}" : "$out.push(content);";

                var print = "function(content){" + concat + "}";

                var include = "function(id,data){" + "if(data===undefined){data=$data}" + "var content=$helpers.$render(id,data);" + concat + "}";

                // html与逻辑语法分离
                forEach(code.split(openTag), function(code, i) {
                    code = code.split(closeTag);

                    var $0 = code[0];
                    var $1 = code[1];

                    // code: [html]
                    if (code.length === 1) {

                        tempCode += html($0);

                        // code: [logic, html]
                    } else {

                        tempCode += logic($0);

                        if ($1) {
                            tempCode += html($1);
                        }
                    }

                });

                code = tempCode;

                // 调试语句
                if (isDebug) {
                    code = 'try{' + code + '}catch(e){' + 'e.line=$line;' + 'throw e' + '}';
                }

                code = "'use strict';" + variables + replaces[0] + code + 'return new String(' + replaces[3] + ')';

                try {

                    var Render = new Function('$data', code);
                    Render.prototype = prototype;

                    return Render;

                } catch (e) {
                    e.temp = 'function anonymous($data) {' + code + '}';
                    throw e;
                }

                // 处理 HTML 语句
                function html(code) {

                    // 记录行号
                    line += code.split(/\n/).length - 1;

                    if (exports.isCompress) {
                        code = code.replace(/[\n\r\t\s]+/g, ' ');
                    }

                    code = code
                    // 单引号与反斜杠转义(因为编译后的函数默认使用单引号，因此双引号无需转义)
                    .replace(/('|\\)/g, '\\$1')
                    // 换行符转义(windows + linux)
                    .replace(/\r/g, '\\r').replace(/\n/g, '\\n');

                    code = replaces[1] + "'" + code + "'" + replaces[2];

                    return code + '\n';
                }

                // 处理逻辑语句
                function logic(code) {

                    var thisLine = line;

                    if (parser) {

                        // 语法转换插件钩子
                        code = parser(code);

                    } else if (isDebug) {

                        // 记录行号
                        code = code.replace(/\n/g, function() {
                            line++;
                            return '$line=' + line + ';';
                        });

                    }

                    // 输出语句. 转义: <%=value%> 不转义:<%==value%>
                    if (code.indexOf('=') === 0) {

                        var isEscape = code.indexOf('==') !== 0;

                        code = code.replace(/^=*|[\s;]*$/g, '');

                        if (isEscape && exports.isEscape) {

                            // 转义处理，但排除辅助方法
                            var name = code.replace(/\s*\([^\)]+\)/, '');
                            if (!helpers.hasOwnProperty(name) && !/^(include|print)$/.test(name)) {
                                code = '$escape($string(' + code + '))';
                            }

                        } else {
                            code = '$string(' + code + ')';
                        }

                        code = replaces[1] + code + replaces[2];

                    }

                    if (isDebug) {
                        code = '$line=' + thisLine + ';' + code;
                    }

                    getKey(code);

                    return code + '\n';
                }

                // 提取模板中的变量名
                function getKey(code) {

                    code = getVariable(code);

                    // 分词
                    forEach(code, function(name) {

                        // 除重
                        if (!uniq.hasOwnProperty(name)) {
                            setValue(name);
                            uniq[name] = true;
                        }

                    });

                }

                // 声明模板变量
                // 赋值优先级:
                // 内置特权方法(include, print) > 私有模板辅助方法 > 数据 > 公用模板辅助方法
                function setValue(name) {

                    var value;

                    if (name === 'print') {

                        value = print;

                    } else if (name === 'include') {

                        prototype['$render'] = helpers['$render'];
                        value = include;

                    } else {

                        value = '$data.' + name;

                        if (helpers.hasOwnProperty(name)) {

                            prototype[name] = helpers[name];

                            if (name.indexOf('$') === 0) {
                                value = '$helpers.' + name;
                            } else {
                                value = value + '===undefined?$helpers.' + name + ':' + value;
                            }
                        }

                    }

                    variables += name + '=' + value + ',';
                }

            };
        })();

    })(template, M.config.win);
    (function(exports) {

        exports.openTag = '{{';
        exports.closeTag = '}}';
        var _helpers = exports.prototype;

        exports.parser = function(code) {
            code = code.replace(/^\s/, '');

            var args = code.split(' ');
            var key = args.shift();
            var keywords = exports.keywords;
            var fuc = keywords[key];

            if (fuc && keywords.hasOwnProperty(key)) {

                args = args.join(' ');
                code = fuc.call(code, args);

            } else if (exports.prototype.hasOwnProperty(key)) {

                args = args.join(',');
                code = '==' + key + '(' + args + ');';

            } else {

                code = code.replace(/[\s;]*$/, '');
                code = '=' + code;
            }

            return code;
        };

        exports.keywords = {

            'if': function(code) {
                return 'if(' + code + '){';
            },

            'else': function(code) {
                code = code.split(' ');

                if (code.shift() === 'if') {
                    code = ' if(' + code.join(' ') + ')';
                } else {
                    code = '';
                }

                return '}else' + code + '{';
            },

            '/if': function() {
                return '}';
            },

            'each': function(code) {

                code = code.split(' ');

                var object = code[0] || '$data';
                var as = code[1] || 'as';
                var value = code[2] || '$value';
                var index = code[3] || '$index';

                var args = value + ',' + index;

                if (as !== 'as') {
                    object = '[]';
                }

                return '$each(' + object + ',function(' + args + '){';
            },

            '/each': function() {
                return '});';
            },

            'echo': function(code) {
                return 'print(' + code + ');';
            },

            'include': function(code) {
                code = code.split(' ');

                var id = code[0];
                var data = code[1];
                var args = id + (data ? (',' + data) : '');

                return 'include(' + args + ');';
            }

        };

        exports.helper('$each', function(data, callback) {

            var isArray = Array.isArray ||
                function(obj) {
                    return Object.prototype.toString.call(obj) === '[object Array]';
                };

            if (isArray(data)) {
                for (var i = 0,
                    len = data.length; i < len; i++) {
                    callback.call(data, data[i], i, data);
                }
            } else {
                for (i in data) {
                    callback.call(data, data[i], i);
                }
            }

        });

        template.helper('$encodeURIComponent', function(u) {
            var s = '';
            try {
                s = decodeURIComponent(u);
            } catch (er) {}
            return encodeURIComponent(s || u);
        });
        //处理html
        template.helper('$htmlparser', function(u) {
            var s = '';
            try {
                s = u.replace(/<\/?[^>]*>/g,'');
            } catch (er) {}
            return s;
        });
        //处理img路径
        //size:211x211
        template.helper('$imgparser', function(u,size) {
            var s = $appCfg.imgsvr,
                size = size||'130x130';
                //u='http://10.8.8.29/resize_130x130/ImageWorkerPath/Groupon/2/20150305/317049c39968436996847cda1c641cfc.jpg';
                //console.log(size);
                //u="/ImageWorkerPath/Groupon/2/20150305/12722fac665d47a1adfaa65be4001acd.jpg";
            try {
                //console.log(/http:\/\//.test(u));
                if(/^http:\/\//.test(u)){
                    s = u;
                }else{
                    s = s+'resize_'+size+'/'+u;
                }
            } catch (er) {}
            return s;
        });
    })(template);
    /**
     * 获取模板
     * @param  {string} key 模板名称，对应资源路径为$res.tpl['key'],如“cmt-reply”,'cmt.reply'
     * @return {Object}
     */
    template.get = function(k) {
        var ret = TPL_Cache[k];
        if (ret) {
            return ret;
        }
        ret = L.getObjValue($res.tpl, k);
        L.verify(!L.isUndefined(ret), 'template.get-->$res.tpl.' + k + ' is not undefined', function() {
            ret = template(ret);
            TPL_Cache[k] = ret;
        });
        return ret;

    };
    M.Template = template;
}); 
﻿/**
 * 选择器修改至Qwery，支持原生query和CSS2选择器
 * 支持格式如：
 *
 *   #foo{} .bar{} a#foo.bar{} #foo{} a[href]{} ul#list > li {} #foo a {}
 *   #foo a[title~=hello] {} #foo a[href^="http://"] {} #foo a[href$=com] {} #foo a[href*=twitter]
 *   span ~ strong {} p + p {}
 *   div,p{}
 *
 *   todo: ie6\7 存在查找disabled\readOnly 出错情况，待修复
 * @namespace M.Widget
 * @author jiangjibing
 * @date 2013/6/26
 */
Mo.define('widget', function(M) {
    var L = M.Lang;

    function widgetBase() {
        this._init.apply(this, arguments);
    }

    M.namespace('Widget');

    M.extend(widgetBase, M.Base);

    M.extend(widgetBase, {
        _init: function(config) {
            this.initDataByAttrs();
            this.setter(config);

            this.init.apply(this, arguments);
        }
    });
    /**
     * 定义组件
     * @param  {String} widgetName 组件名称
     * @param  {Obejct} cfg        组件方法
     * @return {Object}            返回定义好的组件
     */
    M.widget = function(widgetName, cfg) {
        var widget = function() {
            widget.superclass.constructor.apply(this, arguments);
        };
        widget.ATTRS = cfg.ATTRS || {};

        M.extend(widget, M.EventTarget);
        M.extend(widget, widgetBase, cfg);

        M.Widget[widgetName] = widget;
        return widget;
    };
    /**
     * 通过组件名称调用组件
     * @param  {String} widgetName 组件名
     * @param  {Object} cfg        组件参数
     * @return {Widget}            组件
     */
    M.getWidget = function(widgetName, cfg) {
        if (!M.Widget[widgetName]) {
            M.log('error', 'widget ' + widgetName + ' 不存在');
            return null;
        }
        return new M.Widget[widgetName](cfg||{});
    }
}); 
Mo.define('localstorage', function(M) {

    /** 
    * @namespace M.LocalStorage
    */
    M.LocalStorage = {};

    M.extend(M.LocalStorage, /** @lends M.LocalStorage */{
        /**
         * 设置本地存储支持expire
         * @static
         * @example
         * var loc = M.LocalStorage,
         *     k = 'locTest',
         *     v = {
         *      a: '11',
         *      b: '22'
         *     },
         *     exp = 100;
         *
         * loc.setItem(k,JSON.stringify(v),exp);
         *
         * @param {string} key    关键字
         * @param {string} value  值
         * @param {Number} [expire] 过期时间(以秒为单位)
         *
         */
        setItem: function(key, value, expire) {
            var curTime = new Date().getTime();
            //根据key生成对象
            var obj = {
                $value: value,
                $expire: (expire && expire > 0) ? expire : -1,
                $setTime: curTime
            };
            localStorage[key] = JSON.stringify(obj);
        },
        /**
         * 获取本地存储
         * @static
         * @example
         * var loc = M.LocalStorage,
         *     k = 'locTest';
         *
         * var v = loc.setItem(k);
         *
         * @param {string} key    关键字
         * @return {string} value 值
         *
         */
        getItem: function(key) {
            var curTime = new Date().getTime();
            var val = localStorage[key],
                obj;
            if (val) {
                try{
                    obj = JSON.parse(val);
                }catch(eee){
                    //console.log('使用原生localStorage设置:'+val);
                    return val; //使用原生localStorage设置
                }
                if (obj.$expire && obj.$expire != -1) { //设置了过期时间
                    //当前时间-设置时间小于过期时间则返回值
                    if (curTime - obj.$setTime <= obj.$expire * 1000) {
                        //console.log('设置过期时间返回值:'+obj.$value);
                        return obj.$value;
                    } else {
                        //清空localStorage
                        this.removeItem(key);
                        return undefined;
                    }
                } else if(obj.$value){ //没设置过期时间直接返回值
                    //console.log('没设置过期时间直接返回值:'+obj.$value);
                    return obj.$value;
                }else{
                    //console.log('使用原生localStorage设置:'+val);
                    return val; //使用原生localStorage设置的obj
                }
            }
            return obj;
        },
        /**
         * 删除本地存储
         * @static
         * @example
         * var loc = M.LocalStorage,
         *     k = 'locTest';
         *
         * loc.removeItem(k);
         *
         * @param {string} key    关键字
         *
         */
        removeItem: function(key) {
            localStorage.removeItem(key);
        },

        /**
         * 获取带有指定前缀的所有数据
         * @param  {[string]} prefix 
         * @return {[Object]}        
         */
        getAllItemsByPrefix:function(prefix){
            var items=[];
            for(var i in localStorage){
                if(i.indexOf(prefix)>-1){
                    items.push({
                        key:i,
                        value:localStorage[i]
                    })
                }
            }
            return items;
        },

        /**
         * 获取带有指定前缀的数据的数量
         * @param  {[string]} prefix 
         * @return {[number]}        
         */
        getItemsCountByPrefix:function(prefix){
            return this.getAllItemsByPrefix(prefix).length;
        },

        /**
         * 删除所有带有前缀的数据
         * @param  {[string]} prefix 
         * @return {[null]}        
         */
        clearAllItemsByPrefix:function(prefix){
            for(var i in localStorage){
                if(i.indexOf(prefix)>-1){
                    this.removeItem(i);
                }
            }
        },

        /**
         * 向指定key中添加历史记录
         * @param {[type]} key   [description]
         * @param {[type]} value [description]
         */
        addItem:function(key, value){
            var history = this.getItem(key);
            
            // 存在历史记录
            if(history){

                // 清除掉重复的历史记录
                for(var i=0,l=history.length;i<l;i++){
                    if(history[i].address === value.address){
                        history.splice(i,1);
                        break;
                    }
                }
                history.unshift(value);
                this.setItem(key, history);
            }else{
                this.setItem(key, [value]);
            }
        },

        /**
         * 删除指定key中的单条数据
         * @param  {string} key   键名称
         * @param  {sting} value 地址名称
         * @return {[type]}       [description]
         */
        deleteValue:function(key, value){
            var history = this.getItem(key);
            if(history){
                for(var i=0,l=history.length;i<l;i++){
                    if(history[i].address === value){
                        history.splice(i,1);
                        break;
                    }
                }
                this.setItem(key, history);
            }
        }
    });
}); 
/**
 * io-base
 * @module: io-core
 * @author: zhangjian
 * @date: 2013/6/28
 */

Mo.define('io-core', function (M) {
       M.namespace("io.core");
    /**
     *@description io.core方法
     */
    M.extend(M.io.core,{
        request : function (method, uri, cb, data, options) {
            if (options) {
                var hs = options.headers;
                if (hs) {
                    for (var h in hs) {
                        if (hs.hasOwnProperty(h)) {
                            this.initHeader(h, hs[h], false);
                        }
                    }
                }
                if (options.xmlData) {
                    if (!hs || !hs['Content-Type']) {
                        this.initHeader('Content-Type', 'text/xml', false);
                    }
                    method = (method ? method : (options.method ? options.method : 'POST'));
                    data = options.xmlData;
                } else if (options.jsonData) {
                    if (!hs || !hs['Content-Type']) {
                        this.initHeader('Content-Type', 'application/json', false);
                    }
                    method = (method ? method : (options.method ? options.method : 'POST'));
                    data = typeof options.jsonData == 'object' ? JSON.stringify(options.jsonData) : options.jsonData;
                }
            }
            return this.asyncRequest(method, uri, cb, data);
        },
        headers : {},
        hasHeaders : false,
        useDefaultHeader : true,
        defaultPostHeader : 'application/x-www-form-urlencoded; charset=UTF-8',
        useDefaultXhrHeader : true,
        defaultXhrHeader : 'XMLHttpRequest',
        hasDefaultHeaders : true,
        defaultHeaders : {},
        poll : {},
        timeout : {},
        pollInterval : 50,
        transactionId : 0,
        setProgId : function (id) {
            this.activeX.unshift(id);
        },
        setDefaultPostHeader : function (b) {
            this.useDefaultHeader = b;
        },
        setDefaultXhrHeader : function (b) {
            this.useDefaultXhrHeader = b;
        },
        setPollingInterval : function (i) {
            if (typeof i == 'number' && isFinite(i)) {
                this.pollInterval = i;
            }
        },
        createXhrObject : function (transactionId) {
            var obj;
            try {
                obj = {
                    conn : new XMLHttpRequest(),
                    tId : transactionId
                };
            } catch (e) {
                for (var i = 0; i < this.activeX.length; ++i) {
                    try {
                        obj = {
                            conn : new ActiveXObject(this.activeX[i]),
                            tId : transactionId
                        };
                        break;
                    } catch (e) {}
                }
            }
            finally {
                return obj;
            }
        },
        getConnectionObject : function () {
            var o,
                self = this,
                tId = this.transactionId;

            try {
                o = self.createXhrObject(tId);
                if (o) {
                    self.transactionId++;
                }
            } catch (e) {
                M.log('error', 'io-core:getConnectionObject' , e);;
            }
            finally {
                return o;
            }
        },
        asyncRequest : function (method, uri, callback, postData) {
            var self = this,
                o = this.getConnectionObject();

            if (!o) {
                return null;
            }
            o.conn.open(method, uri, true);

            if (self.useDefaultXhrHeader) {
                if (!self.defaultHeaders['X-Requested-With']) {
                    self.initHeader('X-Requested-With', self.defaultXhrHeader, true);
                }
            }

            if (postData && self.useDefaultHeader && (!self.hasHeaders || !self.headers['Content-Type'])) {
                self.initHeader('Content-Type', self.defaultPostHeader);
            }

            if (self.hasDefaultHeaders || self.hasHeaders) {
                self.setHeader(o);
            }

            self.handleReadyState(o, callback);
            o.conn.send(postData || null);

            return o;
        },
        handleReadyState : function (o, callback) {
            var oConn = this;

            if (callback && callback.timeout) {
                this.timeout[o.tId] = window.setTimeout(function () {
                        oConn.abort(o, callback, true);
                    }, callback.timeout);
            }

            this.poll[o.tId] = window.setInterval(
                    function () {
                    if (o.conn && o.conn.readyState == 4) {
                        window.clearInterval(oConn.poll[o.tId]);
                        delete oConn.poll[o.tId];

                        if (callback && callback.timeout) {
                            window.clearTimeout(oConn.timeout[o.tId]);
                            delete oConn.timeout[o.tId];
                        }

                        oConn.handleTransactionResponse(o, callback);
                    }
                }, this.pollInterval);
        },
        handleTransactionResponse : function (o, callback, isAbort) {
            if (!callback) {
                this.releaseObject(o);
                return;
            }

            var httpStatus,
            responseObject;

            try {
                if (o.conn.status !== undefined && o.conn.status != 0) {
                    httpStatus = o.conn.status;
                } else {
                    httpStatus = 13030;
                }
            } catch (e) {

                httpStatus = 13030;
            }

            if ((httpStatus >= 200 && httpStatus < 300) || (M.UA.ie && httpStatus == 1223)) {
                responseObject = this.createResponseObject(o, callback.argument);
                if (callback.success) {
                    if (!callback.scope) {
                        callback.success(responseObject);
                    } else {

                        callback.success.apply(callback.scope, [responseObject]);
                    }
                }
            } else {
                switch (httpStatus) {

                case 12002:
                case 12029:
                case 12030:
                case 12031:
                case 12152:
                case 13030:
                    responseObject = this.createExceptionObject(o.tId, callback.argument, (isAbort ? isAbort : false));
                    if (callback.failure) {
                        if (!callback.scope) {
                            callback.failure(responseObject);
                        } else {
                            callback.failure.apply(callback.scope, [responseObject]);
                        }
                    }
                    break;
                default:
                    responseObject = this.createResponseObject(o, callback.argument);
                    if (callback.failure) {
                        if (!callback.scope) {
                            callback.failure(responseObject);
                        } else {
                            callback.failure.apply(callback.scope, [responseObject]);
                        }
                    }
                }
            }

            this.releaseObject(o);
            responseObject = null;
        },
        createResponseObject : function (o, callbackArg) {
            var obj = {};
            var headerObj = {};
            try {
                var headerStr = o.conn.getAllResponseHeaders();
                var header = headerStr.split('\n');
                for (var i = 0; i < header.length; i++) {
                    var delimitPos = header[i].indexOf(':');
                    if (delimitPos != -1) {
                        headerObj[header[i].substring(0, delimitPos)] = header[i].substring(delimitPos + 2);
                    }
                }
            } catch (e) {}

            obj.tId = o.tId;
            obj.status = o.conn.status;
            obj.statusText = o.conn.statusText;
            obj.getResponseHeader = function (header) {
                return headerObj[header];
            };
            obj.getAllResponseHeaders = function () {
                return headerStr
            };
            obj.responseText = o.conn.responseText;
            obj.responseXML = o.conn.responseXML;

            if (typeof callbackArg !== undefined) {
                obj.argument = callbackArg;
            }

            return obj;
        },
        createExceptionObject : function (tId, callbackArg, isAbort) {
            var COMM_CODE = 0;
            var COMM_ERROR = 'communication failure';
            var ABORT_CODE = -1;
            var ABORT_ERROR = 'transaction aborted';

            var obj = {};

            obj.tId = tId;
            if (isAbort) {
                obj.status = ABORT_CODE;
                obj.statusText = ABORT_ERROR;
            } else {
                obj.status = COMM_CODE;
                obj.statusText = COMM_ERROR;
            }

            if (callbackArg) {
                obj.argument = callbackArg;
            }

            return obj;
        },
        initHeader : function (label, value, isDefault) {
            var headerObj = (isDefault) ? this.defaultHeaders : this.headers;

            if (headerObj[label] === undefined) {
                headerObj[label] = value;
            } else {

                headerObj[label] = value + "," + headerObj[label];
            }

            if (isDefault) {
                this.hasDefaultHeaders = true;
            } else {
                this.hasHeaders = true;
            }
        },
        setHeader : function (o) {
            if (this.hasDefaultHeaders) {
                for (var prop in this.defaultHeaders) {
                    if (this.defaultHeaders.hasOwnProperty(prop)) {
                        o.conn.setRequestHeader(prop, this.defaultHeaders[prop]);
                    }
                }
            }

            if (this.hasHeaders) {
                for (var prop in this.headers) {
                    if (this.headers.hasOwnProperty(prop)) {
                        o.conn.setRequestHeader(prop, this.headers[prop]);
                    }
                }
                this.headers = {};
                this.hasHeaders = false;
            }
        },
        resetDefaultHeaders : function () {
            delete this.defaultHeaders;
            this.defaultHeaders = {};
            this.hasDefaultHeaders = false;
        },
        abort : function (o, callback, isTimeout) {
            if (this.isCallInProgress(o)) {
                o.conn.abort();
                window.clearInterval(this.poll[o.tId]);
                delete this.poll[o.tId];
                if (isTimeout) {
                    delete this.timeout[o.tId];
                }

                this.handleTransactionResponse(o, callback, true);

                return true;
            } else {
                return false;
            }
        },
        isCallInProgress : function (o) {

            if (o.conn) {
                return o.conn.readyState != 4 && o.conn.readyState != 0;
            } else {

                return false;
            }
        },
        releaseObject : function (o) {
            o.conn = null;
            o = null;
        },
        activeX : [
            'MSXML2.XMLHTTP.3.0',
            'MSXML2.XMLHTTP',
            'Microsoft.XMLHTTP'
        ]
    });

});
 
/**
 * io-base
 * @module: io-base
 * @author: zhangjian
 * @date: 2013/6/28
 */

Mo.define('io', function(M) {
    var core = M.io.core,
        L = M.Lang,
        ioqueue = {};
    /**
     *@class IO
     *@method ajax
     *@param {config} 配置
     */
    function IO(config) {
            this.init.apply(this, arguments);
        }
        //M.extend(IO, M.EventTarget);
    M.extend(IO, {
        timeout: 30000,
        autoAbort: false,
        disableCaching: true,
        disableCachingParam: '_dc',
        init: function(options) {
            this.opts = options;
            return this;
        },
        /**
         *@description 异步请求方法
         *@method request
         *@param {o} object
         *@public
         */
        request: function(o) {
            var self = this;
            if (L.isFunction(o.start)) {
                o.start.call(self, o);
            }
            var p = o.data;

            if (L.isFunction(p)) {
                p = p.call(o.scope || M.config.win, o);
            }
            if (L.isObject(p)) {
                p = L.encodeUrl(p);
            }
            if (self.extraParams) {
                var extras = L.encodeUrl(self.extraParams);
                p = p ? (p + '&' + extras) : extras;
            }

            var url = o.url || self.url;

            if (L.isFunction(url)) {
                url = url.call(o.scope || window, o);
            }



            var hs = o.headers;
            if (self.defaultHeaders) {
                hs = M.merge(hs || {}, self.defaultHeaders);
                if (!o.headers) {
                    o.headers = hs;
                }
            }
            var cb = {
                success: self.handleResponse,
                failure: self.handleFailure,
                scope: self,
                argument: {
                    options: o
                },
                timeout: o.timeout || self.timeout
            };

            var method = o.method || self.method || ((p || o.xmlData || o.jsonData) ? "POST" : "GET");
            method = method.toUpperCase();
            if (method == 'GET' && (self.disableCaching && o.disableCaching !== false) || o.disableCaching === true) {
                var dcp = o.disableCachingParam || self.disableCachingParam;
                url += (url.indexOf('?') != -1 ? '&' : '?') + dcp + '=' + (new Date().getTime());
            }

            if (L.isBoolean(o.autoAbort)) { // options gets top priority
                if (o.autoAbort) {
                    self.on.abort();
                }
            } else if (self.autoAbort !== false) {
                self.on.abort();
            }
            if ((method == 'GET' || o.xmlData || o.jsonData) && p) {

                url += (url.indexOf('?') != -1 ? '&' : '?') + p;
                p = '';
            }
            self.transId = core.request(method, url, cb, p, o);
            return self.transId;

        },
        isLoading: function(transId) {
            return transId ? c.isCallInProgress(transId) : !!this.transId;
            /*
            if (transId) {
                return c.isCallInProgress(transId);
            } else {
                return this.transId ? true : false;
            }
            */
        },
        abort: function(transId) {
            transId = transId || this.isLoading();
            if (transId) {
                core.abort(transId);
            }
        },

        // private 请求成功调用方法
        handleResponse: function(response) {
            this.transId = false;
            var options = response.argument.options;
            response.argument = options ? options.argument : null;
            // this.fireEvent("requestcomplete", this, response, options);
            options.success && options.success.apply(options.scope, [response, options] || []);
            options.complete && options.complete.apply(options.scope, [response, true, options] || []);
            this.destroy();
        },

        // private 请求失败调用方法
        handleFailure: function(response, e) {
            this.transId = false;
            var options = response.argument.options;
            response.argument = options ? options.argument : null;
            // this.fireEvent("requestexception", this, response, options, e);
            options.failure && options.failure.apply(options.scope, [response, options] || []);
            options.complete && options.complete.apply(options.scope, [response, false, options] || []);
            this.destroy();
        },
        destroy: function() {
            var self = this;
            delete ioqueue[self.opts.__id];
        }
    });

    /**
    @description io操作
    @method io
    @static
    @param {options}
    @return {null}
     **/
    M.xio = function(options) {
        var _id = M.guid();
        ioqueue[_id] = new IO({
            autoAbort: false,
            __id: _id
        });
        return ioqueue[_id].request(options);;
    };
}); 
Mo.define('xpost', function(M) {
    /**
     * 请求选项
     * @typedef {Object} M~xpostOption
     * @property {string}  url    接口地址
     * @property {object}  data   发送的数据结构，value支持function，如data = {name:function(){return 'tck'};}
     * @property {object}  jsonData   发送json格式数据结构
     * @property {string}  [method='get'] 传输方式get或post
     * @property {object}  on    回调的方法
     * @property {M.xpostSuccess} on.success 成功回调函数
     * @property {M.xpostFailure} on.failure 失败回调函数     
     */

    var L = M.Lang;
    var DEAFULT_CFG = {
        // url
        // type
        dataType: 'json',
        method: 'get',
        on: {
            // start: function(){},
            // // 请求完成后执行的回调
            // success: function(){},
            // // 请求失败时执行的回调
            // failure: function(){}
        }
    };
    if (window.$isdebug) {
        var _debug_api_per
        if (/\:\d+\/(\d+)/.test(location.href)) {
            _debug_api_per = location.href.match(/\:\d+\/(\d+)/)[1];
        }
    }
    /** @lends M */
    /**
     * @callback M.xpostSuccess
     * @param {object} res 成功结果
     * @param {object} cfg 发送的对象
     */
    /**
     * @callback M.xpostFailure
     * @param {object} res 失败结果
     * @param {object} cfg 发送的对象
     */

    /**
     * 发送异步请求（支持jsonp）
     * @static
     * @example
     * M.xPost({
     *       url:'api地址',
     *       method:'POST',
     *       data:{
     *           aid: aId,  //必选
     *       },
     *       //支持jsonData
     *       //jsonData:{
     *       //    aid: aId,  //必选
     *       //},
     *       on:{
     *           success:function(res) {
     *               //console.log(res);return
     *
     *           },
     *           failure: function(res2) {
     *               //console.log(res);return
     *           }
     *       }
     *   });
     *
     * @param {M~xpostOption} option   所需要的参数对象
     *
     */
    M.xPost = function(cfg) {
        if (!cfg.url) {
            throw new Error('参数 url 未赋值 in xpost');
        }
        cfg = M.merge({}, DEAFULT_CFG, cfg);
        if (!cfg.data) {
            if (cfg.params) {
                M.log('error', 'xpost: cfg.data is in cfg.params');
                cfg.data = cfg.params;
            } else {
                M.log('warn', 'xpost: cfg.data is null');
                cfg.data = {
                    _: ''
                };
            }
        }

        //执行fn
        var fdata = {};
        M.each(cfg.data, function(p, n) {
            fdata[n] = L.isFunction(p) ? p() : p;
        });

        //TODO 跨域的话，就调用xdr
        // if (cfg.method.toLowerCase() == 'post') {
        //     return M.io.Xdr(cfg);
        // }
        // debugger;
        if (window.$isdebug && cfg.url.indexOf('http') != 0) {

            cfg.url = (_debug_api_per ? '/' + _debug_api_per : '') + '/d_api/tuan' + cfg.url;
        }
        var host = M.Lang.getUrlHost(cfg.url);
        var isCross = host.host !== M.config.win.location.host;
        
        if (!isCross) {
            M.jsonp(cfg);
            return;
        }

        return M.xio({
            url: cfg.url,
            data: fdata, //执行fn之后的data
            method: cfg.method || 'get',
            jsonData: cfg.jsonData,
            start: function(e) {
                cfg.on.start && cfg.on.start(e);
            },
            complete: function(res) {
                if (cfg.on && cfg.on.complete) {
                    cfg.on.complete(res, cfg);
                }
            },
            //传递参数
            // timeout:3000,//请求超时时间设置
            success: function(response) {
                //请求成功调用
                
                try {
                    var _data = JSON.parse(response.responseText);
                } catch (error) {
                    if (cfg.on.failure) {
                        cfg.on.failure(_data, cfg);
                    } else {
                        M.log('error', M.Lang.isUndefined(_data) ? "xpost-->>服务器返回数据错误！" : _data.msg);
                    }
                    return;
                }
                if(_data.State || _data.code == 0){
                    cfg.on.success && cfg.on.success(_data, cfg);
                }else{
                     if (cfg.on.failure) {
                        
                        cfg.on.failure(_data, cfg);

                    } else {
                        // todo统一错误提示
                        // if (_data.code == 6) {
                        //     // alert('需要登录')
                        //     location.href = $appCfg.LoginIndex + '?returnUrl=' + _data.msg;
                        // } else {
                        //     Mt.alert(_data.msg);
                        // }
                    }
                }
                // switch (_data.State) {
                //     // 请求成功
                    
                //     case 1:
                //     case '1':
                //         cfg.on.success && cfg.on.success(_data, cfg);
                //         break;
                //     default:
                //         if (cfg.on.failure) {
                //             cfg.on.failure(_data, cfg);
                //         } else {
                //             if (_data.code == 6) {
                //                 // alert('需要登录')
                //                 location.href = $appCfg.LoginIndex + '?returnUrl=' + _data.msg;
                //             } else {
                //                 Mt.alert(_data.msg);
                //             }
                //         }
                // }
            },
            failure: function(response) {
                //请求失败调用
                try {
                    var _data = JSON.parse(response.responseText);
                    // if (_data.code == 4000002 && !cfg.ignoreLogin && M.DialogLogin) {
                    //     M.DialogLogin();
                    // }
                    if (cfg.on.failure) {
                        cfg.on.failure(_data, cfg);
                    } else {
                        M.log('error', _data.msg);
                    }
                } catch (eee) {
                    if (response.statusText == "transaction aborted") {
                        if (cfg.on.failure) {
                            cfg.on.failure({
                                code: -1,
                                msg: '请求超时'
                            }, cfg);
                        } else {
                            // Mt.alert("服务器请求超时！");
                        }
                    } else {
                        if (cfg.on.failure) {
                            cfg.on.failure({
                                code: -1,
                                msg: 'Network anomalies！'
                            }, cfg);
                        } else {
                            Mt.alert("Network anomalies！");
                        }

                        // M.log('error', 'xpost_error:' + eee);
                    }
                }
                //console.log('warn : '+'IO failure...');
                //if (response.status == 404) {
                //  M.log(response.statusText);
                //  }
            }
        });

    };
}) 
﻿/**
 * @namespace M.Plugin
 * @author jiangjibing
 * @date 2013/6/26
 */

Mo.define('plugin', function(M) {

    M.namespace('Plugin');

    //实现插件主机
    var L = M.Lang,
        VALUE = 'value',
        PluginHost = function() {
            //已注册插件对象
        };
    /**
     * 插件宿主
     * @class M.PluginHost
     */
    /**
     * @lends = M.PluginHost
     */
    PluginHost.prototype = {
        /**
         * 挂载插件
         * @param  {String|M.PlugiBase} plugin 插件对象或插件名称
         * @param  {Object} config 配置
         * @return {PluginHost}         
         */
        plug: function(_Plugin, _config) {
            var ns, self = this;
            if(L.isString(_Plugin)){
                if (!M.Plugin[_Plugin]) {
                    M.log('error', '未找到插件：' + _Plugin + '  1.调用名称没错? 2.引用了该插件 3.插件JS异常？');
                    return;
                }
                _Plugin = M.Plugin[_Plugin];
            }
            self._Plugins = self._Plugins || {};

            if (L.isArray(_Plugin)) {
                M.each(_Plugin, function(_plugin) {
                    self.plug(_plugin);
                });
            } else {
                if (_Plugin && !L.isFunction(_Plugin)) {
                    _config = _Plugin.cfg;
                    _Plugin = _Plugin.fn;
                }

                // 确保插件是函数类型  插件必须有Name
                if (_Plugin && _Plugin.NS) {
                    ns = _Plugin.NS;

                    _config = _config || {};
                    _config.host = self;

                    if (self.hasPlugin(ns)) {
                        // Update config

                        if (self[ns].setter) {
                            self[ns].setter(_config);
                        }

                    } else {
                        // Create new instance
                        self[ns] = new _Plugin(_config);
                        self._Plugins[ns] = _Plugin;
                    }
                }
            }
            return self;
        },

        unplug: function(_Plugin) {
            var ns = _Plugin,
                self = this,
                Plugins = self._Plugins;
            //debugger;
            if (_Plugin) {
                if (L.isFunction(_Plugin)) {
                    ns = _Plugin.NS;
                    if (ns && (!Plugins[ns] || Plugins[ns] !== _Plugin)) {
                        ns = null;
                    }
                }

                if (ns) {
                    if (self[ns]) {
                        if (self[ns].destroy) {
                            this[ns].destroy();
                        }
                        delete self[ns];
                    }
                    if (Plugins[ns]) {
                        delete Plugins[ns];
                    }
                }
            } else {
                for (ns in self._Plugins) {
                    if (self._Plugins.hasOwnProperty(ns)) {
                        self.unplug(ns);
                    }
                }
            }
            return self;

        },

        //判断插件是否存在
        //todo this.name ns=''有否必要？
        hasPlugin: function(name) {
            return (this._Plugins[name] && this[name]);
        },

        destroyPlugins: function() {
            this.unplug();
        }
    };

    M.Plugin.Host = PluginHost;

    /**
     * 实现类似Y.Base功能，固定格式读取参数实现setter，getter
     */

    //插件
    function PluginBase() {
        //TODO  是否需要判断Plugin base已经实例化
        this._init.apply(this, arguments);
    }

    PluginBase.ATTRS = {
        // abc: {
        //     val: true,
        //     readOnly: true
        // },

        def: function() {}
    };

    PluginBase.NAME = 'plugin';

    PluginBase.NS = 'plugin';

    //为Plugin扩展一些方法
    //主要扩展事件回收和管理，设置自定义事件
    M.extend(PluginBase, M.Base, {
        _init: function(config) {
            this.initDataByAttrs();

            this.setter(config);

            this.init.apply(this, arguments);
        },
        //时间监听或AOP注入事件的列表
        _handles: null,

        //
        init: function() {
            this._handles = [];
            M.log('Old Plugin has init');

        },
        //销毁事件监听者
        destroy: function() {
            // remove all handles
            if (this._handles) {
                M.each(this._handles, function(handle) {
                    handle.detach();
                });
            }
        }
    });

    M.Plugin.Base = PluginBase;
    /**
     * 实例化插件
     * @param  {String} plugName 插件名
     * @param  {Object} cfg      插件属性，方法
     */
    M.plugin = function(plugName, cfg) {
        var plug = function() {
            plug.superclass.constructor.apply(this, arguments);
        };

        plug.NAME = cfg.NAME || plugName;
        plug.NS = cfg.NS || plugName;
        plug.ATTRS = cfg.ATTRS || {};

        M.extend(plug, M.EventTarget);
        M.extend(plug, M.Plugin.Base, cfg);

        M.Plugin[plugName] = plug;
    };
}); 
﻿

/**
 * 扩展node插件，AOP
 * @lends M.NodeList
 * @author: jiangjibing
 * @date: 2013/6/26
 */


Mo.define('node-plugin',function(M) {

    M.namespace('Plugin');

    var MArray = M.Array;

    M.extend(M.Node, M.Plugin.Host, null, null ,true);
    //M.NodeList.importMethod(M.Node.prototype, ['plug','unplug']);
    /**
     * 为list的元素添加插件
     * @return {NodeList} 返回此列表
     */
    M.NodeList.prototype.plug = function() {        
        var args = arguments,
            self = this;
        M.NodeList.each(this, function(node) {
            //debugger;
            M.Node.prototype.plug.apply(M.one(node), args);

        });
        return this;
    };
    /**
     * 为list的元素删除插件
     * @return {NodeList} 返回此列表
     */
    M.NodeList.prototype.unplug = function() {
        var args = arguments;
        M.NodeList.each(this, function(node) {
            M.Node.prototype.unplug.apply(M.one(node), args);
        });
        return this;
    };


    //M.namespace('Plugin').Base = Plugin;




});
 

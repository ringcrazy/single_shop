Mo.define('io-xdr', function(M) {
    M.namespace('io');
    var ioiframequeue = {},
        L = M.Lang;

    function IoXdr(config) {
        this.init.apply(this, arguments);
    }
    M.extend(IoXdr, M.EventTarget);
    M.extend(IoXdr, {
        init: function(options) {
            var self = this;
            self.opts = M.merge({}, options);

            this.on("xhrReady", function(o) {
                self.send(o);
                self._swfid = o[2];
            })
            return this;
        },
        buildXdr: function() {
            var self = this;
            self._swfnode = M.Node.create('<div style="height:0;overflow:hidden;"></div>');
            M.Lang.templayer(self._swfnode);

            var _swf = new M.SWF(self._swfnode, 'http://' + location.hostname + '/io.swf' + (M.UA.ie > 0 ? '?_=' + new Date() : ''), {
                width: 0,
                height: 0,
                loaderInfo: this.opts
            }, this.opts, 0);
            this.__id = _swf.__id;
        },
        send: function(o) {
            var self = this;
            M.one("#" + o[2]).getDOMNode().send(self.opts.url || "", self.opts);
        },
        destory: function(o) {
            var self = this;
            delete ioiframequeue[o.id];
            self._swfnode.remove();
        }
    });

    /**
    @description io操作
    @method io
    @static
    @param {options}
    @return {null}
     **/
    M.extend(M.io, {
        Xdr: function(options) {
            var _id = M.id;
            options.mid = _id;
            options.id = _id;
            ioiframequeue[_id] = new IoXdr(options);
            ioiframequeue[_id].buildXdr();
            return ioiframequeue[_id]
        },
        xdrReady: function(mid, uid, swfid) {
            ioiframequeue[mid].fire("xhrReady", [mid, uid, swfid]);
        },
        xdrResponse: function(e, o, c) {
            var io = this.io;
            try {
                switch (e) {
                    case 'start':
                        io.start(o, c);
                        break;
                    case 'success':
                        io.success(o, c);
                        delete ioiframequeue[o.mid];
                        break;
                    case 'timeout':
                    case 'abort':
                    case 'transport error':
                        o.c = {
                            status: 0,
                            statusText: e
                        };
                    case 'failure':
                        io.failure(o, c);
                        delete ioiframequeue[o.mid];
                        break;
                }
            } catch (error) {
                M.log('info', 'error in xdr.xdrResponse[' + e + ']:');
                M.log('error', error);
            }
        },
        success: function(o, c) {
            var ret = decodeURI(o.c.responseText),
                data;
            try {
                data = M.JSON.parse(ret);
            } catch (err) {
                data = {
                    code: 10001,
                    msg: 'xdr-io  success:返回格式不是JSON',
                    data: ret
                }
            }
            switch (data.code) {
                case 10000:
                case '10000':
                    L.isFunction(ioiframequeue[o.id].opts.on.success, function() {
                        ioiframequeue[o.id].opts.on.success(data, o);
                    });
                    break;
                case 4000002:
                case '4000002':
                    if (!ioiframequeue[o.id].opts.ignoreLogin && M.DialogLogin) {
                        M.DialogLogin();
                    }
                default:
                    L.isFunction(ioiframequeue[o.id].opts.on.failure, function() {
                        ioiframequeue[o.id].opts.on.failure(data, o);
                    });
            }
        },
        failure: function(o, c) {
            var ret = decodeURI(o.c.responseText),
                data;
            try {
                data = M.JSON.parse(ret);
            } catch (err) {
                data = {
                    code: 10001,
                    msg: 'xdr-io  failure:返回格式不是JSON',
                    data: ret
                }
            }
            L.isFunction(ioiframequeue[o.id].opts.on.failure, function() {
                ioiframequeue[o.id].opts.on.failure(o.c, o)
            });
        },
        start: function(o, c) {
            L.isFunction(ioiframequeue[o.id].opts.on.start, function() {
                ioiframequeue[o.id].opts.on.start(ioiframequeue[o.id]);
            })
        }
    })

});
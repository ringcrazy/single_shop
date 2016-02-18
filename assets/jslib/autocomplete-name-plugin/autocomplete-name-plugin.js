Mo.define('autocomplete-name-plugin', function(M) {
    var nc = function() {
        nc.superclass.constructor.apply(this, arguments);
    };

    nc.NAME = 'nameAutoComplete';
    nc.NS = 'nc';

    var focus = M.Focus,
        FLATG = '@',
        io = 'autocomplete-sina.json',
        REG_MATCHAT = new RegExp(['(', FLATG, ')([a-z,A-Z,0-9,\u4e00-\u9fa5,_]{1,20})$'].join('')),
        STL_FONTFAMILY = 'font-family:Tahoma,宋体;',
        DATA_USERS,
        L = M.Lang,
        _cloneStyle = (function(doc) {
            var rstyle = /^(number|string)$/,
            cloneName = '${cloneName}',
            sData = {},
            addHeadStyle = function(content) {
                var style = sData[doc];
                if (!style) {
                    style = sData[doc] = doc.createElement('style');
                    doc.getElementsByTagName('head')[0].appendChild(style);
                };
                style.styleSheet && (style.styleSheet.cssText += content) || style.appendChild(doc.createTextNode(content));
            },
            getStyle = 'getComputedStyle' in M.config.win ?
            function(elem, name) {
                return getComputedStyle(elem, null)[name];
            }: function(elem, name) {
                return elem.currentStyle[name];
            };
            return function(source, cache) {
                if (!cache && source[cloneName]) return source[cloneName];
                var className, name, cssText = [],
                sStyle = source.style;
                for (name in sStyle) {
                    val = getStyle(source, name);
                    if (val !== '' && rstyle.test(typeof val)) {
                        name = name.replace(/([A-Z])/g, "-$1").toLowerCase();
                        cssText.push(name);
                        cssText.push(':');
                        cssText.push(val);
                        cssText.push(';');
                    };
                };
                cssText = cssText.join('');
                source[cloneName] = className = 'clone' + (new Date).getTime();
                addHeadStyle('.' + className + '{' + cssText + '}');
                return className;
            };
        } (M.config.doc));

    M.extend(nc, M.EventTarget);
    M.extend(nc, M.Plugin.Base, {
        init: function() {
            var self = this,
                host = self.get('host'),
                apl = host.Autocomplete;

            if (!apl) {
                M.log('error', 'name-autocomplete', '宿主没有挂在autocomplate插件');
                return;
            }

            var replica = {};
            replica.wrapBox = M.Node.create('<div style="position:absolute;visibility:hidden; word-wrap:break-word;word-break:break-all;z-index:-999;visibility:hidden1;top:0; line-height:18px;break-all; outline-width: medium; outline-style: none;font-variant:normal;'+STL_FONTFAMILY+'font-size:12px;word-spacing:0;"><span style="color:red;" data-role="left"></span><span data-role="flag"></span><span data-role="key"></span><span style="color:blue;" data-role="right"></span></div>');
            replica.leftBox = replica.wrapBox.one('[data-role=left]');
            replica.rightBox = replica.wrapBox.one('[data-role=right]');
            replica.flagBox = replica.wrapBox.one('[data-role=flag]');
            replica.keyBox = replica.wrapBox.one('[data-role=key]');

            apl.set('target', replica.keyBox);
            apl.optlist.get('layer').flying.addClass('autocomplete-name');
            //apl.layer.get('layer').flying.addClass('autocomplete-name');

            self.set('replica', replica);
            
            // apl.set('io', io);

            // apl.set('tpl','<span><a href="javascript:;" class="ac-item"><img src="{{item["avatar"]}}" class="ac-avatar"/>{{item["value"]}}</a></span>');
            apl.set('tpl','<span><a href="javascript:;" class="ac-item">{{text}}</a></span>');


            apl.set('process', function(res){
                DATA_USERS = res.data.users;
                res.data.list = [];
                //first_letter
                //all_letter
                var v = apl.get('oldValue');
                M.each(DATA_USERS, function(i){
                    if(i.all_letter.indexOf(v) == 0 || i.first_letter.indexOf(v) == 0 ){
                        res.data.list.push(i.user_nick);
                    }
                });
                apl.set('source', function(input){
                    var ret = [];
                    M.each(DATA_USERS, function(i){
                        if(i.all_letter.indexOf(v) == 0 || i.first_letter.indexOf(v) == 0 ){
                            ret.push(i.user_nick);
                        }
                    });
                    return ret;
                });
            });

            self.bindEvent();

            L.templayer(replica.wrapBox);
            // M.one(document.body).append(replica.wrapBox);
        },
        bindEvent: function() {
            var self = this,
                host = self.get('host'),
                apl = host.Autocomplete,
                ele = host.getDOMNode();

            apl.on('enter', function(opt) {
                self._toScreen(opt.value);
                return false;
            });

            apl.set('getInput', function() {
                var v = self._getValue.apply(self);
                return v;;
            });
        },
        _getValue:function() {
            var self = this,
                host = self.get('host'),
                ac = host.Autocomplete,
                ele = host.getDOMNode(),
                focusIndex = focus.getRangeStart(ele),
                key,
                val = host.get('value').replace(/\r\n/g, '\n'),
                replica = self.get('replica'),
                tarRegion  = host.get('region');

                replica.left_text = val.substring(0, focusIndex);
                var f_right = val.substring(focusIndex);
                    f_matchs = REG_MATCHAT.exec(replica.left_text),
                    wrapBox = replica.wrapBox;// keyPos = replica.keyBox.getXY();

            if (f_matchs) {
                if (M.UA.ie > 0) {
                    wrapBox.setStyles({
                        'width': parseInt(host.getStyle('width')),
                        // 'width': tarRegion.width,
                        'height': host.getStyle('height'),
                        'fontSize': '12px',
                        'padding': '6px 9px',
                        'border': '1px solid #ccc',
                        'lineHeight': '16px'
                    });
                    //return '';
                } else {
                    wrapBox.set('className', _cloneStyle(ele));
                }
                //font-size:14px;padding:4px;border:red solid 1px;line-height:20px;
                //设置copy层内容
                //replica.left_text = replica.left_text.substring(0, f_matchs.index);
                replica.leftBox.set('innerHTML', self._format(replica.left_text.substring(0, f_matchs.index)));
                //replica.leftBox.set('innerHTML', self._format(f_matchs[0]));

                //alert(that.config.leftBox.get('innerHTML'))

                replica.flagBox.set('innerHTML', f_matchs[1]);
                replica.keyBox.set('innerHTML', f_matchs[2]);
                replica.rightBox.set('innerHTML', self._format(f_right));
                var _x = 0,
                _y = 0;
                if (M.UA.ie > 0) {
                    if (M.UA.ie === 6) {
                        _x = -5;
                        _y = -5;
                    } else if (M.UA.ie > 7) {
                        //                        _x = 1;
                        //                    }else {
                        // _x = 4;
                        // _y = 5;
                    }
                }
                //定位copy层
                replica.wrapBox.setStyles({
                    left: tarRegion.left + _x,
                    top: tarRegion.top - parseInt(ele.scrollTop) + _y
                });

                //flagRegion = replica.flagBox.get('region');
                key = replica.keyBox.get('innerHTML');
                return f_matchs[2];
            }

            return '';
        },
        _toScreen: function(val) {
            /*if(LANG.isFunction(self.config.beforeToScreen) && !self.config.beforeToScreen(self)){
                return;
            }*/
            var self = this,
                replica = self.get('replica'),
                ele = self.get('host').getDOMNode();

            ele.focus();
            //当前焦点插入@innerHTML
            //if (that.config.focus) {
                //if(that.config.ignoreat){
//                    focus.setRangeText(ele, val, focus.getRangeStart(ele), 0);
// debugger
              focus.setRangeText(ele, val + ' ', replica.left_text.length - replica.keyBox.get('innerHTML').length, replica.keyBox.get('innerHTML').length);
                //}
            //}
            //console.log('hide in toscreen');
            //隐藏 取消绑定事件
            //self.hide();
        },
        hide:function() {
            this.get('host').Autocomplete.hide();
        },
       _format: function(htm) {
            var self = this,
                replaceList = {
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "\\": "&#92;",
                    "&": "&amp;",
                    "'": "&#039;",
                    "\r": "",
                    //"\n": '<br />',
                    "\n": '<br style="word-wrap:pre-wrap;line-height:16px;_height:20px;_zoom:1;_position:_relative;_display:block;" />',
                    " ":M.UA.ie>0 && M.UA.ie<8?['<pre style="overflow:hidden;display:inline;line-height:16px;', STL_FONTFAMILY, ';word-wrap:break-word;"> </pre>'].join(""):'<span style="white-space:pre-wrap;'+STL_FONTFAMILY+'"> </span>'
                    //ie9
                    //' ':['<pre style="overflow:hidden;display:inline;', b, 'word-wrap:break-word;"> </pre>'].join('')
                    //ie8
                    //' ':['<pre style="overflow:hidden;display:inline;', b, 'word-wrap:break-word;"> </pre>'].join('')
                    //ie7
                    //' ':['<pre style="overflow:hidden;display:inline;', b, 'word-wrap:break-word;"> </pre>'].join('')

                    //sina weibo
                    //" ": (Y.UA.ie > 0 && Y.UA.ie < 8) ? ['<pre style="overflow:hidden;display:inline;', b, 'word-wrap:break-word;"> </pre>'].join("") : ['<span style="white-space:pre-wrap;', b, '"> </span>'].join("")

                };
            htm = htm.replace(/(<|>|\"|\\|&|\'|\n|\r| )/g, function(t) {
                return replaceList[t];
            });
            return htm;
        }
    });

    M.Plugin.NameAutocomplete = nc;
});
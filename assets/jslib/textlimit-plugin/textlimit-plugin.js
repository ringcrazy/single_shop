/**
 * Overlay
 * @author: zhangjian
 * @date: 2013/6/30
 */

Mo.define('textlimit-plugin', function (M) {
    M.namespace('Plugin');

    var DefaultAttrs = {
        maxLength : 100,
        includeList:[]
    },
    VAL = 'value',
    GT_CLS = 'count-gt',
    LT_CLS = 'count-lt',
    DOT = '.';

    function TextLimit() {
        TextLimit.superclass.constructor.apply(this, arguments);
    }
    TextLimit.NAME = 'TextLimit';
    TextLimit.NS = 'textlimit';
    M.extend(TextLimit, M.EventTarget);
    M.extend(TextLimit, M.Plugin.Base, {
        init : function (config) {
            var self = this;
            self.config = M.merge(DefaultAttrs, config);

            self.container = config.host;
            self.el = M.Node.create('<span class="text-count"><span class="'+ GT_CLS +'">1</span>/<span class="'+ LT_CLS +'">' + self.config.maxLength + '</span></span>');
            self.domCount = self.el.one(DOT + GT_CLS);
            self.domTotle = self.el.one(DOT + LT_CLS);
            self.container.ancestor().append(self.el);
            self.container.set(VAL, config.defaultContent || "");
            var _h6=(self.container.get('region').height || self.config.height);
	    if(_h6){
              self.el.setStyle('top',_h6- 24);
	    }

            //绑定事件 
            self._bindEvent();
            self.count();

        },
        getValue : function () {
            return this.container.get(VAL);
        },
        _bindEvent : function () {
            var self = this;
            self.container.on("keyup", function (ev) {
                var _code=ev.keyCode;
                //if(_code==13) return;
                self.count();
            });
            self.container.on("paste", function (ev) {
                setTimeout(function(){

                    self.count();
                },200)

            });
        },
        setValue:function(value){
            this.container.set("value",value || '');
            this.count();
        },
        appendValue:function(value){
            this.container.set("value",this.getValue()+value);
            this.count();
        },
        _update : function (x, y,flag) {
            var _o=this.config.includeList;
            M.each(_o,function(n){
                 x+=n.get("innerHTML").length;
            })
            this.domCount.setContent(x+"");
            this.domTotle.setContent(y);
            if(flag){
this.domCount.setStyle("color","#303030");
            }else{
            this.domCount.setStyle("color","#ff0000");
            }
            //this.el.setContent(x + "/" + y);
        },
        count : function () {
            var self = this;
            var target = self.container;
            var _maxlen = target.getAttr("maxlength") || (self.config.maxLength || 100);

            var content_len = self.getValue().length; //.replace(/[^\x00-\xff]/g,"xx")
            if (content_len <= _maxlen) {
                self._update(content_len, _maxlen,true);
                self.config.callback && self.config.callback.call(this, {
                    scope : self,
                    currentLength : content_len,
                    maxLength : _maxlen,
                    content : self.getValue(),
                    flag:true
                });
                self.fire("textareachange", {
                    scope : self,
                    currentLength : content_len,
                    maxLength : _maxlen,
                    content : self.getValue(),
                    flag:true
                })
            } else {
            self._update(content_len, _maxlen,false);
                self.config.callback && self.config.callback.call(this, {
                    scope : self,
                    currentLength : content_len,
                    maxLength : _maxlen,
                    content : self.getValue(),
                    flag:false
                });
                self.fire("textareachange", {
                    scope : self,
                    currentLength : content_len,
                    maxLength : _maxlen,
                    content : self.getValue(),
                    flag:false
                })
            }
        }
    });

    M.Plugin.TextLimit = TextLimit;
});

/**
 *   实现表单验证插件
 *
 * @module formvalidate-plugin
 * @author: jiangjibing
 * @date: 2013/7/4
 */

Mo.define('formvalidate-plugin', function(M) {

    /**
    表单验证插件实现表单准备、验证、提示、提交等操作，表单验证的使用以插件的形式调用：

        M.role('form').plug(M.Plugin.FormValidate, cfg);

    对应表单HTML结构:

        <div data-role="form">
            <input data-role="name" placeholder="用户名"/>
            <select data-role="select"></select><input type="hidden" data-role="province" />
            ...
            <textarea placeholder="文本框输入"></textarea>
            <button data-role="submit">提交</button>
        </div>

    @class FormValidate
    @param cfg {Object} 表单的配置对象，包含单项校验和表单提交配置
    @extends Plugin.Base
    @constructor
    @namespace Plugin
    @example 表单参数配置是表单必填配置，解释如下：

        cfg = {
            //action为表单提交类型设置，如异步提交、模拟Form提交（可设置跳转类型）
            action : {
                type : 'ajax', //可选form
                url  : 'url', //异步提交走封装后 Xpost IO；模拟Form提交如不填取 role（即form节点）的action地址；
                tipType : 'tl', //点击按钮提交后的Tip提示参照，如果不输出代表使用屏幕居中提示（常用于阴影弹层对话框交互）；
                data : {}, //预留key-value对象，将合并至表单数据一同提交；
                role : 'data-role-selector', //模拟Form提交时可选设置；
                method : 'POST', //默认是Post提交
                target : '_self', //模拟Form提交跳转目标，默认_self(当前页)，可选_blank, iframe#id
                tipCloseFn : function () {}, //关闭提示窗口后的回调（主要是出错后的提示窗）；
                submit : function (self) {}, //模拟Form提交时的回调，如果存在时Form不会主动提交，需人工提交；scope插件对象；
                beforeStart : function (self) {}, //验证成功后，Ajax提交之前的回调；scope插件对象；
                start : function (self) {}, //验证成功后，Ajax提交后的回调；scope插件对象；
                success : function (self, data) {}, //验证成功后，Ajax提交成功后的回调；arguments[0]为scope：插件本身；arguments[1]为返回数据；
                failure : function (self) {}, //验证成功后，Ajax提交失败后的回调；arguments[0]为scope：插件本身；
            },
            submit : 'submit',//提交按钮，形为：<button data-role="submit">按钮</button>
            //items为数组，第一项格式为常用显性的输入框，第二项为特殊输入框（如checkbox、radio、select、file...）
            items: [{
                role : 'name',
                name : 'data-name', //后端接收的attribute
                tip  : 'focus时的默认提示', //如果不加则无
                //rules为某一项表单项的验证规则，包含为空、长度、正则、回调四种，可为空代表不校验
                rules : [
                    ['为空时的提示'], //[固定格式] 如果此项格式存在则会判断为空状态
                    [0, 14, 'en', '长度不满足时的提示'], //[固定格式] 判断长度类型可选en、cn；表示中文、英文的长度判断，数组第一项第二项为范围值的上下限
                    [/^\d{0,}/ig, '不符合格式'], //[固定格式] 不符合正则项即提示问题
                    [fn, '回调后Return False时的提示语'] //[固定格式] fn为check每一项时执行回调，fn必须返回true or false, 例如检查密码一致等场景
                ],
                //io代表此项校验必须通过ajax校验
                io : {
                    url : 'path\file.json'
                },
                //bind为该单项初始化需要执行的函数,
                bind : function(this, roles, role, tip, formObj){
                    //常用于表单项初始化时的事件绑定、状态重置等
                }
            },{
                ...
            },{
                role : 'selector',
                name : 'data-province',
                roles : 'province',
                type : 'hidden',
                bind : function (this, roles, role, tip, formObj) {
                    // body...
                }
            }],
            //单项校验提示皮肤，默认是喜瓜皮肤
            tipSkin: 'tip-skin-theme'

        }

    */
    var Validate = function(cfg) {
        cfg = (cfg) ? M.merge(cfg) : {};
        cfg.node = cfg.host;
        Validate.superclass.constructor.apply(this, arguments);
    };

    //mail,password,nickname,phone,link,check-code,
    var enum_valtype = {
        mail: [
            [/^(\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+)$/, '邮箱格式错误']
        ],
        password: [
            ['密码不能为空']
        ],
        nickname: [
            [/^[a-z,A-Z,0-9,\-,\_,\(,\),\u4e00-\u9fa5]{2,20}$/, '昵称长度为2~20,支持中英文,数字及-_()']
        ],
        mobilePhone: [
            [/^1[3|5|8]\d{9}$/, "手机号码格式错误"]
        ],
        link: [
            [/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/, '链接格式错误']
        ],
        "checkcode": [
            ["请输入验证码"],
            [/[A-Za-z0-9]{4}/, "验证码为四位英文字符或数字"]
        ],
    }

    var L = M.Lang,
        ATTRS = {},
        EmtpyStr = '',
        IO = 'io',
        URL = 'url',
        OKAY = 'ok',
        ERROR = 'err',
        FAILURE = false,
        PASSED = true,
        LOADING = 'loading',
        DEFAULT = 'default',
        HIDDEN = 'hidden',
        VAL = 'value',
        TAG = 'tagName',
        SELECT = 'SELECT',
        INPUT = 'INPUT',
        TEXTAREA = 'TEXTAREA',
        BUTTONSIZE = "buttonSize",
        DEFAULT_VALUE = 'data-default-value',
        DEFAULT_TIP_SKIN = 'default-tip-skin',
        REG_NULL = new RegExp(/^\s*$/g);

    /**
     * 表单组件名称
     *
     * @property NAME
     * @type String
     * @static
     */
    Validate.NAME = "FormValidate";
    /**
     * 插件命名空间，可使用Host.NS得到当前插件的实例化对象
     *
     * @property NS
     * @type String
     * @static
     */
    Validate.NS = "FormValidate";


    ATTRS[DEFAULT_VALUE] = DEFAULT_VALUE;

    ATTRS[DEFAULT_TIP_SKIN] = 'clsname';

    ATTRS[BUTTONSIZE] = 'normal';

    /**
     * 表单验证的属性配置项
     *
     * @property ATTRS
     * @type {Object}
     * @private
     * @static
     */
    Validate.ATTRS = ATTRS;

    M.extend(Validate, M.Plugin.Base, {

        /**
        组件初始化入口
        @method init
        @param {Object} item 传入单项配置对象
        @protected
        */
        init: function(cfg) {
            this.config = cfg || {};
            this.host = cfg.host;
            //初始化表格
            this._initForm();
        },

        /**
        初始化表单：进行input/textarea的placeholder化，每个单项的初始化绑定，提交校验事件绑定

        @method _initForm
        @protected
        */
        _initForm: function() {
            //初始化输入框、选择框
            var self = this,
                _cfg = self.config,
                _delay = _cfg.delay || 700;

            //记录表单单项验证条件
            self.ITEM_TIP = {};
            self.ITEM_VAL = {};
            self.ITEM_VALIDATED = {};
            self.ITEM_LOADING = {};
            self.ITEM = PASSED;


            self.SubmitBtn = self.host.role(self.config.submit);



            //对表单的表单项进行placeholder初始化
            self.host.all('input[placeholder],textarea[placeholder]').plug(M.Plugin.Placeholder, {});


            //对表单中输入框或下拉框的初始化操作
            M.each(_cfg.items, function(item) {
                self._initItem(item);
            });


            /*
            递归检查等待表单验证返回
            */
            self.check_post = function() {
                if (self.SubmitBtn.button.isDisabled()) return false;
                self._checkAll();
                self.SubmitBtn.button.disabled();

                //  debugger;
                var count = 0,
                    _success = false,
                    retryValidate = function() {
                        if (count < 3 && !_success) {
                            M.later(_delay, null, function() {
                                count += 1;
                                if (self._checkForm()) {
                                    self._postForm();
                                    _success = true;
                                    return false;
                                } else {
                                    retryValidate();
                                }
                            });
                        } else {
                            self.SubmitBtn.button.usable();
                            //接口多次尝试出错
                            _cfg.inValid && _cfg.inValid(self);
                        }
                    };
                //递归检查
                if (M.Object.size(self.ITEM_LOADING) > 0) {
                    retryValidate();
                } else {
                    self.SubmitBtn.button.usable();
                    if (self._checkForm()) {
                        self._postForm();
                    }
                    return;
                }
            };

            //初始化按钮，并绑定事件
            self.SubmitBtn.plug(M.Plugin.Button, {
                type: _cfg.buttonType || 'light', //light,gray
                size: _cfg[BUTTONSIZE] || Validate.ATTRS[BUTTONSIZE] //normal,small
            }).on('click', function(e) {
                e.halt();
                self.config.buttonEvent && self.config.buttonEvent(this);
                self.check_post();

            });



        },
        /**
        单项初始化方法
        @method _initItem
        @param {Object} item 传入单项配置对象
        @private
        debugger
        */
        _initItem: function(item) {

            var self = this,
                _cfg = self.config,
                _tempItem,
                _tempItems,
                _val;
            if (item.type !== HIDDEN) {
                _tempItem = self.host.role(item.role);
                if (!_tempItem) {
                    M.log('error', 'formvalidate-->>未找到该节点:' + item.role);
                    return;
                }
                _val = _tempItem.get(VAL);
                //确定是input或textarea
                //M.log('绑定input的placeholder插件');
                if (_tempItem.get(TAG) === TEXTAREA) {
                    _val = _tempItem.get('innerHTML');
                    if (M.UA.ie > 9 && _val === _tempItem.getAttr('placeholder')) {
                        _val = '';
                    }
                }
                //初始值记录
                if (_val && _val.length > 0) {
                    _tempItem.setAttr(DEFAULT_VALUE, _val);
                }


                //倒计数文本框初始化
                if (item.iscount && _tempItem.get(TAG) === TEXTAREA) {
                    var __tempWrap = M.Node.create('<div class="text-limit-app"></div>');
                    _tempItem.insertBefore(__tempWrap);
                    __tempWrap.append(_tempItem);
                    _tempItem.plug(M.Plugin.TextLimit, {
                        defaultContent: _val,
                        height: _cfg.height,
                        maxLength: item.textLimit
                    });
                }

                //
            } else {
                _tempItems = self.host.roles(item.roles);
                if (_tempItems) {
                    _tempItems.each(function(el) {
                        // 判断如果是selector就美化
                        if (el.get(TAG) === SELECT) {
                            //M.log('美化Selector');

                            el.plug([{
                                fn: M.Plugin.OptionList
                            }, {
                                //fn: M.Plugin.Select
                            }]);
                            //TODO: 具有初始值时的赋值操作
                        }
                    })
                }
            }
            //支持初始化的那些类型
            //mail,password,nickname,phone,link,check-code,
            var lastRules = [];
            M.each(item.rules, function(rs, idx) {
                if (enum_valtype[rs[0]]) {
                    lastRules = lastRules.concat(enum_valtype[rs[0]]);
                } else {
                    lastRules.push(rs);
                }
            });
            item.rules = lastRules;
            //初始化提示
            self._initTip(item);
            //初始化完毕后绑定单项自身验证
            self._bindItem(item);
        },
        /**
        验证单项提示的初始化
        @method _initTip
        @param {Object} item 传入单项配置对象
        @private
        */
        _initTip: function(item) {
            var self = this,
                tempNode = M.Node.create('<span><span></span></span>'),
                parentNode;

            self.ITEM_TIP[item.role] = tempNode.cloneNode(true);
            //referNode = self.host.role(item.role);
            //以下特别为验证码提供
            /*if(referNode.next() && referNode.next().hasClass('m-code')){
                referNode = referNode.next();
            }*/
            //M.log(referNode.next())
            //debugger;
            //提示节点放到父节点之后
            parentNode = self.host.role(item.role).ancestor();
            if (parentNode.hasClass('placeholder')) {
                parentNode = parentNode.ancestor();
            }
            parentNode.append(self.ITEM_TIP[item.role]);

            self.ITEM_TIP[item.role].hide();
            return this;
        },
        /**
        单项的事件绑定
        @method _bindItem
        @param {Object} item 传入单项配置对象
        @private
        */
        _bindItem: function(item) {
            var self = this,
                _role = item.role;
            if (item.required === false) return;
            self.host.role(_role).on('focus', function(e) {
                e.halt();
                if (item.tip) {
                    self._tip(_role, DEFAULT, item.tip);
                }
            });

            self.host.role(_role).on('blur', function(e) {
                e.halt();

                M.later(100, null, function() {
                    self._checkItem(item, 'blur');
                });
            });

            //arguments:接受参数当前roles的Nodelist、用于存储变量的隐藏Input节点、提示
            if (item.bind) {
                item.bind.call(this, self.host.roles(item.roles), self.host.role(_role), self.ITEM_TIP[_role], self);
            }

        },
        /**
        单项上的事件解绑的方法
        @method _unBindItem
        @param {Object} item 传入单项配置对象
        @private
        */
        _unBindItem: function(item) {
            var self = this;
            self.host.role(item.role).off('focus, blur');
        },
        /**
        表单单项校验
        @method _checkItem
        @param {Object} item 传入单项配置对象
        @private
        */
        _checkItem: function(item, action) {
            var self = this,
                Host = self.config.host,
                _role = item.role,
                el = Host.role(_role),
                rules = item.rules || [],
                io = item.io,
                //是否光标移开检查
                isBlur = L.isUndefined(item.isBlur) ? true : false;
            //单项输入值
            if (el == null) return;
            var val = el.get('value').replace(/^\s+|\s+$/g, EmtpyStr),
                DefaultInput;

            /*
                //如果输入与初始值相同不做判断
                if(el.hasAttribute(DEFAULT_VALUE) && el.getAttr(DEFAULT_VALUE) == val){
                     self.ITEM_TIP[_role].hide();
                    return;
                }
                */
            //未输入时检查placeholder或空条件
            DefaultInput = (val === el.getAttr(DEFAULT_VALUE)) && val !== EmtpyStr;
            if (el.get('type') === 'checkbox') {
                val = el.get('checked') ? val : '';
            }

            self.ITEM = PASSED;
            //搜集该项值
            self.ITEM_VAL[item.name] = val.replace(/</g, "&lt;").replace(/>/g, "&gt;"); //
            if (rules.length === 0) {
                return self.ITEM_VALIDATED[_role] = self.ITEM;
            }
            //输入项为默认值时单独处理提示
            if (val.length === 0) {
                //直接跳过判断
                M.each(rules, function(rule) {
                    if (L.isString(rule[0])) {
                        if (L.isUndefined(action)) self._tip(_role, ERROR, rule[0]);
                        self.ITEM = FAILURE;
                        return false;
                    } else {
                        //可以为空的情况
                        self.ITEM = PASSED;
                    }
                });
            }
            if (val.length > 0 || el.getAttr('type') == 'hidden') {
                //是否设置默认值，用于修改表格时使用
                if (DefaultInput && io && !io.firstVerify) {
                    self.ITEM = PASSED;
                    self.ITEM_VALIDATED[_role] = self.ITEM === PASSED ? true : false;
                    self._tip(_role, OKAY)
                    return;
                }
                M.each(rules, function(rule) {
                    //遍历检查固定格式规则
                    var _r = rule[0],
                        _t = rule[1];
                    //不能为空的错误提示处理

                    //数字范围 格式[3,20,'cn','tips']
                    if ((L.isNumber(_r) && rule.length === 4) && self.ITEM) {
                        _t = rule[3];
                        var len = (rule[2] === 'cn') ? L.zh_strlen(val) : val.length;
                        if (!(_r < len && len < rule[1])) {
                            self._tip(_role, ERROR, _t);
                            self.ITEM = FAILURE;
                            return false;
                        } else {
                            self.ITEM = PASSED;
                        }
                    }
                    //if(!self.ITEM)return;
                    //正则时
                    if (_r.test && self.ITEM) {
                        _r = new RegExp(_r);
                        if (_r.test(val)) {
                            self.ITEM = PASSED;
                        } else {
                            self._tip(_role, ERROR, _t);
                            self.ITEM = FAILURE;
                            return false;
                        }
                    }
                    //if(!self.ITEM)return;
                    //如果需要回调时

                    if (L.isFunction(_r) && self.ITEM) {
                        if (!_r.call(this, self, self.host.role(_role))) {
                            self._tip(_role, ERROR, _t);
                            self.ITEM = FAILURE;
                            return false;
                        } else {
                            self.ITEM = PASSED;
                        }
                    }


                });
                //M.log(item[IO])
                if (item[IO] && self.ITEM) {
                    if (self.ITEM_LOADING[_role]) return;
                    M.xPost({
                        method: 'get',
                        url: item[IO][URL],
                        data: {
                            val: val
                        },
                        on: {
                            start: function() {
                                self._tip(_role, LOADING, '请稍后...');
                                //debugger;
                                self.ITEM = FAILURE;
                                //_itemchecked = FAILURE;
                                //如果正在校验，不在进行第二次
                                self.ITEM_LOADING[_role] = true;
                                if (item[IO]['start']) item[IO]['start']();

                            },
                            success: function(res) {
                                //self.ITEM = PASSED;
                                if (L.isString(res.msg)) {
                                    self._tip(_role, OKAY, res.msg);
                                }
                                self.ITEM_VALIDATED[_role] = PASSED;
                                self.ITEM_LOADING[_role] = false;
                                if (item[IO]['success']) item[IO]['success'](res, self);
                            },
                            failure: function(response) {
                                self._tip(_role, ERROR, response.msg);
                                self.ITEM_LOADING[_role] = false;
                                if (item[IO]['failure']) item[IO]['failure'](response);
                            }
                        }

                    });
                }

            }
            //M.log(self.ITEM)
            self.ITEM_VALIDATED[_role] = self.ITEM;

            if (self.ITEM && self.ITEM_VAL[item.name].length !== 0) {
                self._tip(_role, OKAY)
            }
            self.ITEM = null;



        },

        /**
        开始全部表单项检查
        @method _checkAll
        @private
        */
        _checkAll: function() {
            var self = this;
            M.each(self.config.items, function(item) {
                self._checkItem(item);
            });
        },
        /**
        表单验证检查
        @method _checkForm
        @return {Boolean} mark 如果通过检查返回true
        @private
        */
        _checkForm: function() {
            var self = this,
                item,
                mark = true;
            for (item in self.ITEM_VALIDATED) {
                if (!self.ITEM_VALIDATED[item]) {
                    return mark = false;
                }
            }
            return mark;
        },
        /**
        异步提交表单
        @method _asyncForm
        @private
        @param {Object} ajax 提交表单的attr对象,形式可参照cfg example
        */
        _asyncForm: function(ajax) {
            var self = this,
                _loadingLayer = null,
                _cfg = {};

            if (ajax.url) {
                //如果提示带尖角时
                var encodeITEM_VAL = {};
                if (ajax.tipType) {
                    _cfg.alignTo = [self.SubmitBtn, ajax.tipType, true]
                }

                if (ajax.beforeStart && ajax.beforeStart(self) == false) {
                    return false;
                }
                for (var item in self.ITEM_VAL) {
                    encodeITEM_VAL[item] = self.ITEM_VAL[item];
                }
                M.xPost({
                    url: ajax.url,
                    method: ajax.method || 'post',
                    data: M.merge(ajax.data, encodeITEM_VAL),
                    on: {
                        start: function() {
                            //开始时候弹出提示框
                            _loadingLayer = M.Caution('正在提交...', {
                                target:self.SubmitBtn,
                                pos:'tc',
                                show:true,
                                delay:0
                            });
                            //}
                            self.SubmitBtn.button.disabled();
                            if (ajax.start) ajax.start(self);
                            //debugger;
                        },
                        nologin: function() {
                            _loadingLayer.hide();
                            self.SubmitBtn.button.usable();
                        },
                        success: function(res) {
                            _loadingLayer.hide();
                            M.Caution(res.msg, {
                                target:self.SubmitBtn,
                                pos:'tc',
                                show:true,
                                afterHide:function(){
                                    if (ajax.tipCloseFn) {
                                        ajax.tipCloseFn(res, self);
                                    }
                                }
                            });

                            if (ajax.success) {
                                //debugger;
                                ajax.success(self, res.data || res);
                            }

                        },
                        failure: function(res) {
                            _loadingLayer.hide();
                            if (res) {
                                M.Caution((res.msg || '失败了, 你可以重试') + "<a href='#' class='fv-iknown'>知道了</a>", {
                                    target:self.SubmitBtn,
                                    pos:'tc',
                                    show:true,
                                    delay:0,
                                    afterShow:function(f){
                                        f.body.one('.fv-iknown').on('click', function(e) {
                                            e.halt();
                                            try{
                                                self.SubmitBtn.button.usable();
                                            }catch(eee){}
                                            f.hide();
                                            ajax.kownCb && ajax.kownCb.call(this);
                                        });
                                    }
                                });
                            }
                            if (ajax.failure) ajax.failure(self, res);
                        }

                    }

                });
            }
        },
        /**
        表单提交方法
        @method _postForm
        @protected
        */
        _postForm: function() {
            var self = this,
                _action = self.config.action,
                type = _action.type;
            if (type == 'ajax') {
                self._asyncForm(_action);
            }
            if (type == 'form') {
                //同步提交表单
                self._syncForm(_action);

            }
        },
        /**
        设置提交URL路径
        @method setUrl
        @param {String} url
        */
        setUrl: function(url) {
            this.config.action.url = url;
        },
        /**
        设置提交数据中Data值
        @method setData
        @param {Object} data 格式为key：value形式
        */
        setData: function(data) {
            if (!M.Lang.isObject(data)) return;
            var refData = this.config.action.data;
            this.config.action.data = M.merge(refData, data);
        },
        /**
        模拟form提交方法 同步提交表单
        @method _syncForm
        @private
        @param {Object} action 提交表单的attr对象,形式可参照cfg example
        */
        _syncForm: function(action) {
            var self = this,
                _form = self.host.role(action.role) || false,
                _url = action.url || _form.getAttr('action'),
                _method = action.method || _form.getAttr('method'),
                _data = M.merge(action.data, self.ITEM_VAL),
                _target = action.target || '_self';

            M.io.Iframe({
                url: _url,
                data: _data,
                form: _form,
                target: _target,
                start: action.submit

            })

        },

        /**
        单项提示显示

            FormNode.formvalidate._tip('name', 'err', '提示文本');

        @method _tip
        @private
        @param {String} role 单项的data-role
        @param {String} type 提示类型主要有err, ok, loading
        @param {String} tip 传入tip提示说明
        @return {Object} tipNode 返回tip节点本身
        */
        _tip: function(role, type, tip) {
            tip = tip || '';
            var self = this,
                cls = self.config.tipSkin || 'default-tip',
                _wspan = self.ITEM_TIP[role],
                _nspan = _wspan.one('span');

            //提示类型：1.default --> 换行提示 default-tip-， 2. 右侧提示  rich-tip-
            //self.ITEM_TIP[role].addClass( + type).set('innerHTML',tip).show();
            _nspan.set('innerHTML', tip);
            _wspan.setAttr('class', cls + '-' + type).show();
            return _wspan;

        },

        _showTip: function() {
            el.show();
        },

        _hideTip: function(el) {
            el.hide();
        },


        /**
        清空整个表单 //TODO:目前未遇到，暂缓开发
        @method clear
        */
        clear: function() {

        },

        /**
        中途注入表单项

            FormNode.formvalidate.addItem({
                role: '',
                rules: [[],[],...],
                bind: function(){}
                ...
            })

        @method addItem
        @param {Object} cfg 传入单项的属性
        */
        addItem: function(cfg) {
            //
            cfg = cfg || {};
            if (!cfg.role) return;

            var CONFIG = this.config,
                _mark = true,
                newItems = [];

            M.each(CONFIG.items, function(item) {
                if (item.role === cfg.role) {
                    _mark = false;
                    return false;
                }
            });
            if (!_mark) return;

            CONFIG.items.push(cfg);
            this._initItem(cfg);

        },

        /**
        删除某一项表单项

            FormNode.formvalidate.removeItem({
                role: '',
                rules: [[],[],...],
                bind: function(){}
                ...
            });

        @method removeItem
        @param {Object} cfg 传入单项的属性
        */
        removeItem: function(cfg) {
            var self = this,
                CONFIG = self.config;
            M.each(CONFIG.items, function(item) {
                if (item.role === cfg.role) {
                    M.Array.removeArray(item, CONFIG.items);
                    //delete item;
                    delete self.ITEM_VALIDATED[item.role];
                    self.ITEM_TIP[item.role].remove();
                    self._unBindItem(cfg);
                }
            });

        },

        /**
        隐藏所有提示
        @method clearTips
        */
        clearTips: function() {
            var items = this.ITEM_TIP;
            for (var item in items) {
                if (items[item]) {
                    items[item].hide();
                }
            }
        }

    });

    M.Plugin.FormValidate = Validate;
});
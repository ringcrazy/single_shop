/**
 * @module: amount-plug
 * @author: luxin
 * @date: 2014/11/10
 */
//@require node-plugin
Mo.define('amount-plugin', function(M) {
    M.namespace('Plug');

    var temp = {
            wrap: '<div class="f-numb"></div>',
            triggerp: '.i-plus',
            triggerj: '.i-minus',
            tip: '<i class="amount-tip"></i>'
        },
        BEFORE = 'before',
        AFTER = "after",
        EVT_CLICK = "click",
        EVT_REDUCE = "reduce",
        EVT_PLUS = "plus",
        VALUE = 'value',
        //配置默认参数
        CONFIG_DEFAULT = {
            defaultValue: 0, //默认值
            minValue: 0, //最小值
            maxValue: 9999 //最大值
        };

    M.plugin('amount', {
        init: function(config) {
            var self = this,
                config = config ? M.merge(CONFIG_DEFAULT, config) : CONFIG_DEFAULT;
            self.cfg = config;
            self.createUIButton();
            self._bindEvent();
        },
        destructor: function() {
            var self = this;

        },

        createUIButton: function() {
            var self = this,
                container, reduceTrigger, plusTrigger,
                cfg = self.cfg,
                host = cfg.host;

            // container = M.Node.create(temp.wrap);
            // reduceTrigger = M.Node.create(temp.triggerp);
            // plusTrigger = M.Node.create(temp.triggerj);

 

            self.container = host;
            self.reduceTrigger = host.one(temp.triggerj);;
            self.plusTrigger = host.one(temp.triggerp);
            self.numBox = host.one('em');
            // host.insert(container, BEFORE);
            // container.append(host);
            // host.insert(reduceTrigger, BEFORE);
            // host.insert(plusTrigger, AFTER);
            //初始化默认值
            //self.setValue(cfg.defaultValue);
            if(self.getValue()==0){
                self.reduceTrigger.hide();
                self.numBox.hide();
            }   
        },
        _bindEvent: function() {
            var self = this;
            //减少
            if(window.aaa){
            }
            self.reduceTrigger.on(EVT_CLICK, function(e) {
                    e.halt();
                    var _oldnum = self.numBox.getHTML();
                    var _num = self.getValue(-1);
                    if (_oldnum<=self.cfg.minValue) return;
                    if (self.cfg.maxValue < 1) return;
                    //无需对值处理，以服务器回传为准
                    //self.setValue(_num);
                    self.fire(EVT_REDUCE, {
                        scope: self
                    });
                });
                //增加

            self.plusTrigger.on(EVT_CLICK, function(e) {
                e.halt();
                var _oldnum = self.numBox.getHTML();
                var _num = self.getValue(+1);
                //无需对值处理，以服务器回传为准
                //self.setValue(_num);
                self.fire(EVT_PLUS, {
                    scope: self
                });
            })


        },
        getValue: function(o) {
            var self = this,
                _num = self.numBox.getHTML();
            if (M.Lang.trim(_num) == "") {
                _num = 0;
            }
            return parseInt(_num) + (M.Lang.isUndefined(o) ? 0 : parseFloat(o));
        },
        setValue: function(value, flag) {
            var self = this;
            if (flag) {
                self.numBox.setHTML(value);
                return;
            }
            if (!M.Lang.trim(value)) {
                value = self.cfg.minValue;
            } else if (value > self.cfg.maxValue) {
                value = self.cfg.maxValue;
            } else if (value < self.cfg.minValue) {
                value = self.cfg.minValue;
            }
            if(value==0){
                self.reduceTrigger.hide();
                self.numBox.hide();
            } else{
                self.reduceTrigger.show();
                self.numBox.show();
            }
            return self.numBox.setHTML(M.Lang.isUndefined(value) ? 0 : value);
        },

    });
});
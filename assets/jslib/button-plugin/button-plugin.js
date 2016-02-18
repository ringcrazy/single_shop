/**
 * @module: button-plug
 * @author: shenguozu
 * @date: 2013/7/5
 */
Mo.define('button-plugin', function(M) {
    M.namespace('Plug');

    var TABINDEX = 'tabIndex',
        BEFORE = 'before',
        ISICON = 'isIcon',
        WIDTH = 'width',
        FOCUSCLS = 'focused',
        HOVERCLS = 'hover',
        ACTIVECLS = 'active',
        DISABLECLS = 'disabled',
        LOADINGCLS = 'i-loading',
        ICONCLS = 'i-icon',
        TEMPLETS = {
            //TODO
            wrap: '<span class="m-btn {{=type}}" tabindex={{=tabIndex}}></span>',
            icon: '<i class="i-icon {{=icon}}"></i>'

        },
        //配置默认参数
        CONFIG_DEFAULT = {
            WIDTH : false,
            'icon': false,
            'type': 'light',
            'size': 'normal',
            'clsFocus': 'focused',
            'clsHover': 'hover',
            'clsActive': 'active',
            'clsDisabled': 'disabled',
            'tabIndex': '0',
            'prefix': '',
            'url' : false
        };

    M.plugin('button', {
        init: function (config) {
            var self = this;
            var config = config ? M.merge(CONFIG_DEFAULT, config) : {};
            config.clsPrefix = config.clsPrefix || 'btn-' + config.type.slice(0,1)+config.size.slice(0,1) + '-';
            self.cfg = config;
            self.createUIButton();
            self._bindEvent();
        },
        destructor: function () {
            var self = this;
            self.btn.detachAll();
            self.cfg.host.unplug().show();

            self.btn.remove();
            self = null;
        },

        createUIButton: function(){
            var self = this,
                cfg = self.cfg,
                host = cfg.host;
            self.btn = M.Node.create(M.Template(TEMPLETS.wrap)({type:cfg.clsPrefix.slice(0,-1),tabIndex:self.cfg.tabIndex}));
            var btn = self.btn;
            /*
            if(self.cfg.icon){
                //处理ICON替换
                btn.append(M.substitute(TEMPLETS.icon,{icon:self.cfg.icon}));
                //记录ICON位置
                self.icon = self.btn.one('.icon');
                //添加icon-button样式
                btn.addClass('btn-has-icon');
            }
            btn.append(M.substitute(TEMPLETS.text,{text: (self.cfg.text == '' ? host.get('innerHTML') : self.cfg.text)}));
            */
            //获取button的默认属性
            if(cfg.disabled || host.get('disabled')){
                self.disabled();
            }
            if(host.get(TABINDEX)){
                btn.set(TABINDEX,host.get(TABINDEX));
            }
            //自定义按钮宽度
            if(self.cfg.width){
                btn.setStyle(WIDTH,self.cfg.width);
            }
//debugger
            // host.addClass('btn-r');
            host.insert(btn,BEFORE);
            btn.appendChild(host);
            if(self.cfg.icon){
                var domIcon = M.Node.create(M.Template(TEMPLETS.icon)({icon:self.cfg.icon}));
                host.insert(domIcon,BEFORE);
            }

        },
        _bindEvent: function(undef){
            var self = this,
                btn = self.btn,
                cfg = self.cfg,
                host = cfg.host,
                prefix = cfg.clsPrefix,
				clickFn = function(){
                    if(cfg.disabled) return;
                    self.fire("click",{
                        btn: btn,
                        cfg: self.cfg,
                        icon: self.icon,
                        orginal: host,
                        disabled: self.disabled
                    });
				};
            btn.on({
                'click': function(){
                    if(host.get('href') || self.cfg.url){
                        window.location.href = host.get('href') || self.cfg.url;
                    }
					if(host.getAttr('url')){
						window.open(host.getAttr('url'));
					}
					clickFn();
                },
                'mousedown': function(){
                    if(cfg.disabled) return;
                    btn.addClass(cfg.clsPrefix + cfg.clsActive);
                    self.fire("mousedown",{
                        btn: btn,
                        cfg: self.cfg,
                        icon: self.icon,
                        orginal: host,
                        disabled: self.disabled
                    });
                },
                'mouseup': function(){
                    if(cfg.disabled) return;
                    btn.removeClass(cfg.clsPrefix + cfg.clsActive);
                },
                'mouseover': function(){
                    //M.log(cfg.disabled)
                    if(cfg.disabled) return;
                    btn.addClass(cfg.clsPrefix + cfg.clsHover);
                },
                'mouseout': function(){
                    if(cfg.disabled) return;
                    btn.removeClass(cfg.clsPrefix + cfg.clsHover);
                    btn.removeClass(cfg.clsPrefix + cfg.clsActive);
                },
                'focus': function(){
                    if(cfg.disabled) return;
                    btn.addClass(cfg.clsPrefix + cfg.clsFocus);
                },
                'blur': function(){
                    if(cfg.disabled) return;
                    btn.removeClass(cfg.clsPrefix + cfg.clsFocus);
                },
                //只处理焦点在button上的Enter和Space敲击
                'keyup': function(e){
                    if(cfg.disabled) return;
                    if(e.keyCode == '13' || e.keyCode == '32'){
                        return clickFn();
                    }
                    return e.keyCode == '32'

                }
            });

        },
        disabled: function(){
            var cfg = this.cfg;
            this.btn.addClass(cfg.clsPrefix + cfg.clsDisabled);
            cfg.disabled = true;
        },
        usable: function(){
            var cfg = this.cfg;
            this.btn.removeClass(cfg.clsPrefix + cfg.clsDisabled);
            cfg.disabled = false
        },
        isDisabled: function(){
            var cfg = this.cfg;
            if(this.btn.hasClass(cfg.clsPrefix + cfg.clsDisabled)){
                return true;
            }else{
                return false;
            }
        },
        loading: function(){
            var domIcon =this.btn.one('.'+ICONCLS),
                self = this,
                cfg = self.cfg,
                host = cfg.host;
            if(domIcon){
                if(domIcon.hasClass(LOADINGCLS))return
                if(self.cfg.icon){
                    domIcon.removeClass(self.cfg.icon);
                    domIcon.addClass(LOADINGCLS);
                }
            }else{
                var domLoanding = M.Node.create(M.Template(TEMPLETS.icon)({icon:LOADINGCLS}));
                host.insert(domLoanding,BEFORE);
            }
            cfg.disabled = true;
        },
        unLoading: function(){
            var domIcon =this.btn.one('.'+ICONCLS),
                self = this,
                cfg = self.cfg,
                host = cfg.host;
            if(domIcon){
                if(!domIcon.hasClass(LOADINGCLS))return
                if(self.cfg.icon){
                    domIcon.removeClass(LOADINGCLS);
                    domIcon.addClass(self.cfg.icon);
                }else{
                    domIcon.remove();
                }  
            }
            cfg.disabled = false;
        },
        setIcon: function(cls){
            var domIcon =this.btn.one('.'+ICONCLS),
                self = this,
                cfg = self.cfg,
                host = cfg.host;
            if(domIcon){
                if(domIcon.hasClass(cls))return
                if(self.cfg.icon){
                    domIcon.removeClass(self.cfg.icon);
                    domIcon.addClass(cls);
                    self.cfg.icon = cls;
                }
            }else{
                var domLoanding = M.Node.create(M.Template(TEMPLETS.icon)({icon:cls}));
                host.insert(domLoanding,BEFORE);
                self.cfg.icon = cls;
            }

        }

    });
});

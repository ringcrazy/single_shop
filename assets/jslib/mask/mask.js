/**
 * 全局蒙版组件
 * @lends M
 *
 */
//@require touch
Mo.define('mask', function(M) {
    var maskList = [];
    var maskDom;

    /**
     * 打开蒙版
     * @param  {Obejct} cfg 蒙版参数
     * @property {Boolean} cfg.click 是否点击自动隐藏，默认为true
     * @property {Number} cfg.zIndex 蒙版z-index值
     * @property {Boolean} cfg.scrollable  是否可以滚动，默认为false
     * @property {Node} cfg.ele  蒙版挂载节点，可选，默认为body
     * @property {Node} cfg.clickfn  点击背景触发事件
     */
    M.mask = function(cfg) {
        if (!!maskDom) {
            //将mask加入缓存
            M.mask.hide(false);
        }
        //压入弹层数组
        cfg = M.extend({
            click: true
        }, cfg);
        maskDom = M.Node.create('<div class="lay"></div>');
        var ele = cfg.ele || M.one(document.body);
        // var cbl = cfg.cbl;
        if (cfg.zIndex) {
            maskDom.setStyle('zIndex', cfg.zIndex);
        }
        ele.append(maskDom);
        // M.role('gotop').hide();
        maskDom.setData('cfg', cfg);
        //劫持touch事件
        maskDom.touch('start',function(){
            return;
        })
        if (!cfg.scrollable) {
            M.one('html').addClass('mask_html');
        }
        if (cfg.click) {
            maskDom.on('click', function() {
                M.mask.hide();
                if(cfg.clickfn){
                    cfg.clickfn();
                }
            });
        }
    };
    /**
     * 隐藏蒙版
     */
    M.mask.hide = function(type) {
        if (!maskDom) {
            return;
        }
        //加缓存
        var cfg = maskDom.getData('cfg');
        if(type===false){
            maskList.push(cfg);
            maskDom.remove();
        }else{
            var cbl = cfg.cbl;
            maskDom.remove();
            if (!cfg.scrollable) {
                M.one('html').removeClass('mask_html');
            }
            cbl && cbl();
            maskDom = null;
                M.one(document).fire('scroll');
            if(maskList.length>0){
                M.mask(maskList.pop());
            }else{
                
            }
        }
        
        
    }
});
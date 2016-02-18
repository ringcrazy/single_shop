Mo.define('popup', function (M) {
    //postion top left
    //top right
// required by  select autocomplate calendr
// 
// var p = M.widget('popup', {
    // targetNode://触发节点
    // triggerShow:默认触发事件 默认mouseenter
    // triggerHide:默认关闭事件 默认mouseleave
    // closeTrigger:关闭触发事件
    // showNode:绑定显示节点，默认和触发节点一样
    // arrow:false//default 是否有箭头
    // position:bottom center//default 定位
    // effect://动画效果
    // content://内容
    // arrowOffset://相对于图片边界的距离，根据对齐方式变化
    // popupOffset://弹层相对于箭头的距离，根据对齐方式计算相对距离
    // offset://整体偏移
    // afterShow: 回调函数，参数为弹出层dom
    // beforeShow: 回调函数，参数为弹出层dom
    // 
// })
    
        //定义有效的x轴，y轴参数
    var arrowPX = 6; //尖头预留x
    var arrowPY = 7;    //尖头预料y
    M.widget('popup', {
        init:function(cfg){
            var overlay;
            var self = this;
            var isShow =false;
            
            self.set('targetNode', cfg.targetNode || null);
            self.set('arrowX',cfg.arrowOffset || 5);
            self.set('popupX',cfg.popupOffset || 5);
            self.set('allOffset',cfg.offset || 0); //默认偏移
            self.set('isarrow',cfg.arrow != null?cfg.arrow:true);
            self.set('triggerShow',cfg.triggerShow || 'mouseenter');
            self.set('triggerHide',cfg.triggerHide || 'mouseleave');
            self.set('showNode',cfg.showNode || cfg.targetNode);
            self.set('isSetArrowX',cfg.arrowOffset && true);
            self.set('isSetPopupX',cfg.popupOffset && true);
            self.set('isSetOffX',cfg.offset && true);
            self.set('closeTrigger',cfg.closeTrigger && true);
            self.set('isShow',isShow);
            self.set('beforeShow',cfg.beforeShow);
            self.set('afterShow',cfg.afterShow);
            
            // if (cfg.targetNode == null) {
            //     return;
            // }
            //设置弹层
            var cfg_overlay = {
                    skin: 'popup-wrap',
                    bodyContent: cfg.content,
                    width: cfg.width,
                    height: cfg.height,
                    showNode : self.get('showNode'),
                    position : cfg.position
                };
            overlay = new M.Widget.overlay(cfg_overlay);
            this.set('stage', overlay);
            //弹层显示之前
            overlay.on('beforeShow', function() {
                var arrowDiv = '<div class="popup-arrow"></div>'
                var popup = this.get('dom');

                var arrow = popup.append(arrowDiv).one('.popup-arrow');

                arrow.setStyles({
                    'position': 'absolute'
                });
                if (!self.get('isarrow')) {
                    arrow.hide();
                };
                self.set('arrow', arrow);
                self.set('popup', popup);
                var beforeShow = self.get('beforeShow');
                if (beforeShow) {
                    beforeShow(dom);
                };
                var pos = this.get('pos');
                self._setPostionWithPosition(pos);
            });
            //绑定事件 同样事件特殊处理
            if(!self.get('closeTrigger')){
                if (self.get('triggerShow') == self.get('triggerHide')) {
                    M.one(cfg.targetNode).on(self.get('triggerShow'),function(){
                        if(!self.get('isShow')){
                            self.show();
                        }else{
                            self.destroy();
                        }
                        
                    });
                }else{

                    M.one(cfg.targetNode).on(self.get('triggerShow'),function(){
                        if(!self.get('isShow')){
                            self.show();
                        }
                        
                    });
                    M.one(cfg.targetNode).on(self.get('triggerHide'),function(){
                        if (self.get('isShow')) {
                            self.destroy();
                        }
                       
                    });
                }
            }
        },
        show : function()
        {
            this.get('stage').render();
            this.set('isShow',true);
            var afterShow = this.get('afterShow');
            if (afterShow) {
                afterShow(this.get('popup'));
            };
        },
        destroy : function()
        {
            this.get('stage').destroy();
            this.set('isShow',false);
        },
        //设置箭头
        _setPostionWithPosition : function(pos)
        {   
            //获取弹层宽高
            var overlay = this.get('stage'),
                width = overlay.getSize().realyWidth,
                height = overlay.getSize().realyHeight;

            //获取偏移数据
            var arrowOffX = this.get('arrowX'),
                popupOffX = this.get('popupX'),
                allOffX = this.get('allOffset');

            var arrowType,
                arrowX=0,arrowY=0,showXOffset,showYOffset,
                arrowOffY,popupOffY;

            var arrow = this.get('arrow');
            if(pos.x!='center'){
                arrowType = pos.x;
            }
            if(pos.y!='center'){
                arrowType = pos.y;
            }
            arrow.addClass('arrow-'+arrowType);
            //获取箭头宽高
            
            var arrowWidth = parseInt(arrow.getStyle('width')),
                arrowHeight = parseInt(arrow.getStyle('height'));

            //箭头在上下，左右位置处理不同
            if(pos.y == 'center')
            {
                //弹层在左右时
                arrowOffY = arrowOffX;
                arrowOffX = 0;

                popupOffY = popupOffX;
                popupOffX = 0;

                showXOffset = 0;
                showYOffset = allOffX + popupOffX;
            }else{
                //弹层在上下
                showXOffset = popupOffX+arrowWidth+arrowOffX+allOffX;
                showYOffset = 0;
            }
            //初始化各项参数
            switch (pos.x)
            {
                case 'left':
                        arrowX = width - popupOffX - arrowWidth;
                    break;
                case 'right':
                        arrowX = popupOffX;
                    break;
                case 'center':
                        if(!this.get('isSetArrowX')){
                            arrowOffX = 0;
                        }
                        if(!this.get('isSetPopupX')){
                            popupOffX = 0;
                        }
                        if(!this.get('isSetOffX')){
                            allOffX = 0;
                        }
                        showXOffset = popupOffX+allOffX;
                        arrowX = (width - arrowWidth)/2+arrowOffX-popupOffX
                    break;
            }

            switch (pos.y)
            {
                case 'bottom':
                        arrowY = -arrowPY;
                        showYOffset = showYOffset-arrowPY;
                    break;
                case 'top':

                        arrowY = height - arrowHeight + arrowPY;
                        showYOffset = showYOffset-arrowPY;
                    break;
                case 'center':
                        if(!this.get('isSetArrowX')){
                            arrowOffY = 0;
                        }
                        if(!this.get('isSetPopupX')){
                            popupOffY = 0;
                        }
                        if(!this.get('isSetOffX')){
                            allOffX = 0;
                        }
                        if(pos.x == 'left'){
                            arrowX = arrowX + arrowPX;
                        }else if(pos.x == 'right'){
                            arrowX = arrowX - arrowPX;
                        }
                        showXOffset =  -arrowPX;
                        showYOffset = popupOffY+allOffX;
                        arrowY = (height - arrowHeight)/2+arrowOffY-popupOffY;
                    break;
            }
            //根据参数设置ui
            //
            //设置箭头位置
            
            arrow.setStyles({
                'left':arrowX,
                'top':arrowY
            });
            overlay.set('offsetX',showXOffset);
            overlay.set('offsetY',showYOffset);
        }
    },M.overlay);
});
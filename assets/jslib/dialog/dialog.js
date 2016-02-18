/**
    弹窗提示
*/
Mo.define('dialog', function(M) {
    var instance = null;
    var dialog = {
        init : function(text,type,button,fn,condition){
            if(instance){
                instance.destroy();
            }
            instance = this;
            this.create(text,type,button,fn, condition);
        },
        destroy:function(){
            this.node.remove();
            M.mask.hide();
            instance = null;
        },
        create: function(text,type,button,fn,condition){
            var html = M.Template.get('_pages.takeout-ordering-dialog')({text:text,type:type,button:button,condition:condition}),
                node = M.Node.create(html);
            var self = this;
            self.node = node;
            M.one('body').append(node);
            M.mask({click:false});
            node.one('.btn-define-n').on('click',function(){
                if(fn && fn.ok){
                    fn.ok();
                }
                self.destroy();
            });
            if(node.one('.btn-cancel-n')){
                node.one('.btn-cancel-n').on('click',function(){
                    if(fn && fn.cancel){
                        fn.cancel();
                    }
                    self.destroy();
                });
            }
        }
    };
    /**
     * [a description]
     * @param  {String}   text [description]
     * @param  {Function} fn   [description]
     * @param  {String}   type 
     *         警告:doubt(默认值)  , 错误:error
     * @return {[type]}        [description]
     */
    M.hidedialog = function(){
        instance && instance.destroy();
    };

    // condition:条件判断，超区、打烊、两者都是
    M.dialog = function (text,fn,type,condition){
        var c = dialog.init(text,type||'error',true,fn, condition);
        //var node = M.Template.get('aap.dialog')();

    };
    //type:doubt,error
    M.alert = function(text,fn,type){
        var c = dialog.init(text,type||'doubt',false,fn);
        //var node = M.Template.get('aap.dialog')();

    };
});
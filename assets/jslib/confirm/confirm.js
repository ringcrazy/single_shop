/**
    弹窗提示
*/
//@require mask
Mo.define('confirm', function(M) {
    var instance = null;
	var confirm = {
		init : function(config){
            if(instance){
                instance.destroy();
            }
            instance = this;
			this.create(config);
		},
        destroy:function(){
            this.node.remove();
            M.mask.hide();
            instance = null;
        },
		create: function(config){
			//var html = M.Template.get('app.confirm')({text:text,type:type,button:button}),
			var html;
			var self = this;
			if(config.type == 'confirm'){
				html = '<div class="dialog" data-role="cleanCart">'+
					        '<h3 class="d-title">'+config.title+'</h3>'+
					        '<p>'+config.content+'</p>'+
					        '<div class="btn-box">'+
					            '<button class="m-btn btn-cancel-n">取消</button>'+
					            '<button class="m-btn btn-define-n">确认</button>'+
					        '</div>'+
					    '</div>'
				var node = M.Node.create(html);
	           
	            self.node = node;
				M.one('body').append(node);
				M.mask({
					click:false,
					zIndex:200
				});
				node.one('.btn-define-n').on('click',function(){
					self.destroy();
					if(config.ok){
						config.ok();
					}
					
				});
				if(node.one('.btn-cancel-n')){
					node.one('.btn-cancel-n').on('click',function(){
						if(config.cancel){
							config.cancel();
						}
						self.destroy();
					});
				}
			}else if(config.type == 'tips'){
				html = ' <div class="tips">'+
					        '<i class="m-icon i-check"></i>'+config.title+
					    '</div>';
				var node = M.Node.create(html);
				self.node = node;
				M.one('body').append(node);
				setTimeout(function(){
					self.destroy();
				},config.duration||1000);
			}

		}
	}
    /**
     * [a description]
     * @param  {String}   text [description]
     * @param  {Function} fn   [description]
     * @param  {String}   type 
     *         警告:doubt(默认值)  , 错误:error
     * @return {[type]}        [description]
     */
    M.hideConfirm = function(){
        instance && instance.destroy();
    }
	M.confirm = function (config){
		config.type='confirm';
		var c = confirm.init(config);
		//var node = M.Template.get('aap.confirm')();

	};
	//type:doubt,error
	M.tips = function(text){
		var config ={};
		config.title=text;
		config.type='tips';
		var argArr= Array.prototype.slice.call(arguments);
		if(argArr.length > 1){
			config.duration = argArr[1];
		}
		var c = confirm.init(config);
		//var node = M.Template.get('aap.confirm')();

	};
});
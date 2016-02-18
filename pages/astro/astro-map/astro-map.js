//@require qrcode
Mo.ready(function(M) {
    var domCodes = M.roles('view-code'),
        domQrCodes = M.roles('qrcode'),
        domPersonList = M.roles('person-list'),
        domTime = M.roles('time'),
        domDialog = M.one('.dialog'),
        domClosed = M.one('.closed');

    domCodes.on('click',function(e){
        e.halt();
        var ele = this;
        var url = ele.getAttr('data-url');
        var hostObj = M.Lang.getUrlHost();
            url= 'http://'+hostObj.host+url;
        M.xPost({
            url: url,
            method: 'get',
            on: {
                complete: function(data, config) {
                    // success
                    //console.log(data);return
                    domDialog.one('.d-content').set('value',data.responseText);
                    domDialog.show();
                }
            }
        });
    });

    domClosed.on('click',function(e){
    	e.halt();
		domDialog.hide();
	})

    domQrCodes.each(function(){
        var ele = this;
        var url = ele.getAttr('data-url'),
            color = ele.getAttr('data-color'),
            foreground = '#000000';
        var hostObj = M.Lang.getUrlHost();
            url= 'http://'+hostObj.host+url;
            if(color=='blue') {
                foreground='#56b7e8';
            }else if(color=='gray'){
                foreground='#999999';
            }else if(color=='gold'){
                foreground='#ff7e00';
            }else if(color=='orange'){
                foreground='#ff5f45';
            }
        var qrnode = new M.qrcode({
            render: "canvas",   //渲染方式，支持canvas,svg,table
            correctLevel: 1,    //纠错级别，可取0、1、2、3，数字越大说明所需纠错级别越大
            text: url, //要编码的字符串
            width: 100,
            height: 100,
            background: "#ffffff", //背景色
            foreground: foreground //前景色
        });
        var domCode = ele.one('.code');
        domCode.append(qrnode);
        ele.on({
        	mouseover: function(){
				domCode.show();
        	},
        	mouseout: function(){
				domCode.hide();
        	}
        });
    });

	domPersonList.on({
		mouseover: function(){
			var ele =this;
			ele.one('.members').show();
    	},
    	mouseout: function(){
    		var ele =this;
			ele.one('.members').hide();
    	}
	});

	domTime.on({
		mouseover: function(){
			var ele =this;
			ele.one('.updata').show();
    	},
    	mouseout: function(){
    		var ele =this;
			ele.one('.updata').hide();
    	}
	});
});
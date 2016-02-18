//@require qrcodealg
/**
 * qrcode 
 * @author: luxin
 * @date: 2015/3/13
 *
 *var qrnode = new M.qrcode({
 *		render: "canvas",   //渲染方式，支持canvas,svg,table
 *		correctLevel: 3,	//纠错级别，可取0、1、2、3，数字越大说明所需纠错级别越大
 *		text: "http://www.baidu.com", //要编码的字符串
 *		width: 200,
 *		height: 200,
 *		background: "#eeeeee", //背景色
 *		foreground: "#667766" //前景色
 *	});
 */

Mo.define('qrcode', function (M) {
	var qrcodeAlgObjCache = [],

	//设置默认参数
	DefaultAttrs = {
		text:"",
		render: "",
		width: 256,
		height: 256,
		correctLevel: 3,
		background: "#ffffff",
		foreground: "#000000"
	};

	function qrcode(cfg) {
		if (typeof cfg === 'string') { // 只编码ASCII字符串
			cfg = {
				text: cfg
			};
		}
		var self = this;
		self.cfg = M.merge(DefaultAttrs,cfg);

        return self.init();
	}

	M.extend(qrcode, {
		//初始化
		init: function(){
			//使用QRCodeAlg创建二维码结构
			var qrCodeAlg = null;
			for(var i = 0, l = qrcodeAlgObjCache.length; i < l; i++){
				if(qrcodeAlgObjCache[i].text == this.cfg.text && qrcodeAlgObjCache[i].text.correctLevel == this.cfg.correctLevel){
					qrCodeAlg = qrcodeAlgObjCache[i].obj;
					break;
				}
			}
			if(i == l){
			  qrCodeAlg = new M.QRCodeAlg(this.cfg.text, this.cfg.correctLevel);
			  qrcodeAlgObjCache.push({text:this.cfg.text, correctLevel: this.cfg.correctLevel, obj:qrCodeAlg});
			}

			if(this.cfg.render){
				switch (this.cfg.render){
					case "canvas":
						return this.createCanvas(qrCodeAlg);
					case "table":
						return this.createTable(qrCodeAlg);
					case "svg":
						return this.createSVG(qrCodeAlg);
					default:
						return this.createDefault(qrCodeAlg);
				}
			}
			return this.createDefault(qrCodeAlg);
        },
        createDefault: function(qrCodeAlg){
			var canvas = document.createElement('canvas');
			if(canvas.getContext)
				return this.createCanvas(qrCodeAlg);
			SVG_NS = 'http://www.w3.org/2000/svg';
		  	if( !!document.createElementNS && !!document.createElementNS(SVG_NS, 'svg').createSVGRect )
		  		return this.createSVG(qrCodeAlg);
			return this.createTable(qrCodeAlg);
		},
        createCanvas: function(qrCodeAlg){
        	//创建canvas节点
			var canvas = document.createElement('canvas');
			canvas.width = this.cfg.width;
			canvas.height = this.cfg.height;
			var ctx = canvas.getContext('2d');

			//计算每个点的长宽
			var tileW = (this.cfg.width / qrCodeAlg.getModuleCount()).toPrecision(4);
			var tileH = this.cfg.height / qrCodeAlg.getModuleCount().toPrecision(4);

			//绘制
			for (var row = 0; row < qrCodeAlg.getModuleCount(); row++) {
				for (var col = 0; col < qrCodeAlg.getModuleCount(); col++) {
					ctx.fillStyle = qrCodeAlg.modules[row][ col] ? this.cfg.foreground : this.cfg.background;
					var w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
					var h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
					ctx.fillRect(Math.round(col * tileW), Math.round(row * tileH), w, h);
				}
			}
			//返回绘制的节点
			return canvas;
        },
        createTable : function (qrCodeAlg) {
			//创建table节点
			var s = [];
			s.push('<table style="border:0px; margin:0px; padding:0px; border-collapse:collapse; background-color: '+
				this.cfg.background +
				';">');
			// 计算每个节点的长宽；取整，防止点之间出现分离
			var tileW = -1, tileH = -1, caculateW = -1, caculateH = -1;
			tileW = caculateW = Math.floor(this.cfg.width / qrCodeAlg.getModuleCount());
			tileH = caculateH = Math.floor(this.cfg.height / qrCodeAlg.getModuleCount());
			if(caculateW <= 0){
				if(qrCodeAlg.getModuleCount() < 80){
					tileW = 2;
				} else {
					tileW = 1;
				}
			}
			if(caculateH <= 0){
				if(qrCodeAlg.getModuleCount() < 80){
					tileH = 2;
				} else {
					tileH = 1;
				}
			}

			// 绘制二维码
					foreTd = '<td style="border:0px; margin:0px; padding:0px; width:'+tileW+'px; background-color: '+this.cfg.foreground+'"></td>',
					backTd = '<td style="border:0px; margin:0px; padding:0px; width:'+tileW+'px; background-color: '+this.cfg.background+'"></td>',
		  		l =  qrCodeAlg.getModuleCount();

			for (var row = 0; row < l; row++) {
				s.push('<tr style="border:0px; margin:0px; padding:0px; height: ' + tileH +'px">');
				for (var col = 0; col < l; col++) {
					s.push(qrCodeAlg.modules[row][col] ? foreTd : backTd);
				}
				s.push('</tr>');
			}
			s.push('</table>');
			var span = document.createElement("span");
		    span.innerHTML=s.join('');

			return span.firstChild;
		},
		createSVG:function(qrCodeAlg){
			var x, dx, y, dy,
		    	  moduleCount = qrCodeAlg.getModuleCount(),
		    	  scale = this.cfg.height / this.cfg.width,
		    	  svg = '<svg xmlns="http://www.w3.org/2000/svg" '
		      	    + 'width="'+ this.cfg.width + 'px" height="' + this.cfg.height + 'px" '
		                  + 'viewbox="0 0 ' + moduleCount * 10 + ' ' + moduleCount * 10 * scale + '">',
		        rectHead = '<path ',
		        foreRect = ' style="stroke-width:0.5;stroke:' + this.cfg.foreground
		            + ';fill:' + this.cfg.foreground + ';"></path>',
		        backRect = ' style="stroke-width:0.5;stroke:' + this.cfg.background
		            + ';fill:' + this.cfg.background + ';"></path>';

		    // draw in the svg
		    for (var row = 0; row < moduleCount; row++) {
		        for (var col = 0; col < moduleCount; col++) {
		            x = col * 10;
		            y = row * 10 * scale;
		            dx = (col + 1) * 10;
		            dy = (row + 1) * 10 * scale;
		            
		            svg += rectHead + 'd="M ' + x + ',' + y
		                + ' L ' + dx + ',' + y
		                + ' L ' + dx + ',' + dy
		                + ' L ' + x + ',' + dy
		                + ' Z"';
		                
		            svg += qrCodeAlg.modules[row][ col] ? foreRect : backRect;
		        }
		    }

		    svg += '</svg>';

		    // return just built svg
		    //return $(svg)[0];		
		    return M.Node.create(svg)._node;
		}
	});

	M.qrcode = qrcode;

});

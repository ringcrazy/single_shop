
// 创建二维码图片
$(function(){
	 var ua = navigator.userAgent.toLowerCase();
	 var url="",
	 	isIOS=false;
	 if (/iphone|ipod/.test(ua)) {
	 	url="ios版本审核中，敬请期待...";
	 	isIOS=true;
	 }else{
	 	url="http://www.baidu.com";
	 }

	 function utf16to8(str) {  
        var out, i, len, c;  
        out = "";  
        len = str.length;  
        for(i = 0; i < len; i++) {  
        c = str.charCodeAt(i);  
        if ((c >= 0x0001) && (c <= 0x007F)) {  
            out += str.charAt(i);  
        } else if (c > 0x07FF) {  
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));  
            out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));  
            out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));  
        } else {  
            out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));  
            out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));  
        }  
        }  
        return out;  
    }  

	$('#qrCode').qrcode({
         text: isIOS===true?utf16to8(url):url,
         height: 165,
         width: 165,
         src: "http://172.18.11.112:3404/single_shop/img/qcode.png"
    });

    $(".download").on("click", function(e){
    	if(isIOS){
    		alert("ios版本审核中，敬请期待...");
    	}else{
    		window.location.href=url;
    	}
    });




});
Mo.ready(function(M) {

    
    M.one('body').append('<div class="screen"><i class="m-icon i-screen"></i><p>为了更好的体验，请使用竖屏浏览</p></div>');
    // 横屏提示
    function hengshuping() {
    	//竖屏
        if (window.orientation == 180 || window.orientation == 0) {
            // document.body.className = document.body.className.replace(/landscape\-tips\-body/g, '');
            M.one('body').removeClass('landscape-tips-body');
           
        }
    	//横屏
        if (window.orientation == 90 || window.orientation == -90) {
            // document.body.className = document.body.className + ' ' + 'landscape-tips-body';
            M.one('body').addClass('landscape-tips-body');
           
        }
    }
    window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", hengshuping, false);
});

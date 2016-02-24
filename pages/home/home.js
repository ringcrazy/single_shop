
/*
    title:首页
    author:lihaihua
    createDate:2016.2.22
    Description:
        首页轮播图的滑动，依赖于swipe实现 
 */

// @require swiper
Mo.ready(function(M){
     /**
     * tap滑动组件，依赖于swipe
     * @param  {[type]} opts [classname]
     * @return {[type]}      [description]
     */
     var Dom_swiper = M.one('.swiper-container');
     var swiper =Dom_swiper.swiper({
        pagination: '.swiper-pagination',
        paginationClickable: true,
        spaceBetween: 30,
        autoplay : 2000
    });
    
});




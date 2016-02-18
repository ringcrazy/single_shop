/**
 * @title: 堂食-订单列表
 * @ctime: 2015/10/09
 * @edittime: 2015/10/09
 * @ui: 彭倩
 * @ux: 刘倩茹
 * @wd: 何伟
 * @router: /eatin-orderlist
 */
 var router = require('express').Router(); // 新建一个 router


// 在 router 上装备控制器与中间件
router.get('/eatin-orderlist', /*A, B, C,*/ function(req, res) {
    var theme = req.query.theme;
    res.render('eatin/orderlist', {
    	sbg:true,
        shop:true,
        notice:true,
        title:'堂食-订单列表',
        theme:theme,
        restaurant_closed:true
    }, function(err, html){
        // console.log(html);
        res.set('Content-Type', 'text/html');
        res.end(html);
    });
});

module.exports = router;
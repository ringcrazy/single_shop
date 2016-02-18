/**
 * @title: 外卖-订单详情页
 * @ctime: 2015/10/09
 * @edittime: 2015/10/09
 * @ui: 彭倩
 * @ux: 刘倩茹
 * @wd: 何伟
 * @router: /takeout-orderdetail
 */
 var router = require('express').Router(); // 新建一个 router

// 在 router 上装备控制器与中间件
router.get('/takeout-orderdetail', /*A, B, C,*/ function(req, res) {
    var theme = req.query.theme;
    res.render('takeout/orderdetail', {
        title:'',
        theme:theme
    }, function(err, html){
        // console.log(html);
        res.set('Content-Type', 'text/html');
        res.end(html);
    });
});

module.exports = router;
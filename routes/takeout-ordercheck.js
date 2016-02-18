/**
 * @title: 外卖-核对订单页
 * @ctime: 2015/10/09
 * @edittime: 2015/10/09
 * @ui: 彭倩
 * @ux: 刘倩茹
 * @wd: 何伟
 * @router: /takeout-ordercheck
 */
 var router = require('express').Router(); // 新建一个 router

// 在 router 上装备控制器与中间件
router.get('/takeout-ordercheck', /*A, B, C,*/ function(req, res) {
    var theme = req.query.theme;
    res.render('takeout/ordercheck', {
        title:'',
        theme:theme
    }, function(err, html){
        // console.log(html);
        res.set('Content-Type', 'text/html');
        res.end(html);
    });
});

module.exports = router;
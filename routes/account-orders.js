/**
 * @title: 订单
 * @ctime: 2015/10/09
 * @edittime: 2015/10/09
 * @ui: 彭倩
 * @ux: 刘倩茹
 * @wd: 苏宁
 * @router: /orders
 */
 var router = require('express').Router(); // 新建一个 router


// 在 router 上装备控制器与中间件
router.get('/orders', /*A, B, C,*/ function(req, res) {
    var theme = req.query.theme;
    res.render('/account/orders', {
        title:'订单'
    }, function(err, html){
        // console.log(html);
        res.set('Content-Type', 'text/html');
        res.end(html)
    });
});

module.exports = router
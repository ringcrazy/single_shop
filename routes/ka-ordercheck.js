/**
 * @title: KA 核对订单页
 * @ctime: 2016/1/29
 * @edittime: 2016/1/29
 * @ui: 徐蓉
 * @wd: 苏宁
 * @router: /ka-ordercheck
 */
 var router = require('express').Router(); // 新建一个 router


// 在 router 上装备控制器与中间件
router.get('/ka-ordercheck', /*A, B, C,*/ function(req, res) {
    var theme = req.query.theme;
    res.render('/ka/order-check', {
        title:'眉州东坡酒楼(北苑店)-5号桌'
    }, function(err, html){
        // console.log(html);
        res.set('Content-Type', 'text/html');
        res.end(html)
    });
});

module.exports = router
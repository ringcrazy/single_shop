/**
 * @title: KA 支付页
 * @ctime: 2016/1/20
 * @edittime: 2016/1/20
 * @ui: 徐蓉
 * @wd: 苏宁
 * @router: /ka-pay
 * 
 */
 var router = require('express').Router(); // 新建一个 router


// 在 router 上装备控制器与中间件
router.get('/ka-pay', /*A, B, C,*/ function(req, res) {
    var theme = req.query.theme;
    res.render('/ka/pay', {
        title:'眉州东坡酒楼(北苑店)-5号桌'
    }, function(err, html){
        // console.log(html);
        res.set('Content-Type', 'text/html');
        res.end(html)
    });
});

module.exports = router
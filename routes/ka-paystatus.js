/**
 * @title: KA 支付状态页
 * @ctime: 2016/2/1
 * @edittime: 2016/2/1
 * @ui: 徐蓉
 * @wd: 苏宁
 * @router: /ka-paystatus
 * 
 */
 var router = require('express').Router(); // 新建一个 router


// 在 router 上装备控制器与中间件
router.get('/ka-paystatus', /*A, B, C,*/ function(req, res) {
    var theme = req.query.theme;
    res.render('/ka/paystatus', {
        title:'支付'
    }, function(err, html){
        // console.log(html);
        res.set('Content-Type', 'text/html');
        res.end(html)
    });
});

module.exports = router
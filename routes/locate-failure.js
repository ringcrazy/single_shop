/**
 * @title: 定位失败
 * @ctime: 2015/9/20
 * @edittime: 2015/9/22
 * @ui: 彭倩
 * @ux: 刘倩茹
 * @wd: 周宇,苏宁
 * @router: /locate-failure
 */
var router = require('express').Router(); // 新建一个 router


// 在 router 上装备控制器与中间件
router.get('/locate-failure', /*A, B, C,*/ function(req, res) {
    var theme = req.query.theme;
    res.render('location/locate-failure', {
        home:true,
        adr:true,
        title:'定位失败',
        theme:theme
    }, function(err, html){
        // console.log(html);
        res.set('Content-Type', 'text/html');
        res.end(html)
    });
});

module.exports = router
/**
 * @title: 手动定位-搜索
 * @ctime: 2015/9/28
 * @edittime: 2015/9/28
 * @ui: 彭倩
 * @ux: 刘倩茹
 * @wd: 周宇,苏宁
 * @router: /locate-manual
 */
var router = require('express').Router(); // 新建一个 router


// 在 router 上装备控制器与中间件
router.get('/locate-manual', /*A, B, C,*/ function(req, res) {
    var theme = req.query.theme;
    res.render('location/locate-manual', {
        locate_map:true,
        adr:true,
        title:'选择地址',
        theme:theme
    }, function(err, html){
        // console.log(html);
        res.set('Content-Type', 'text/html');
        res.end(html)
    });
});

module.exports = router
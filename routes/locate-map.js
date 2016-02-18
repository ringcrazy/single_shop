/**
 * @title: 地图定位
 * @ctime: 2015/9/29
 * @edittime: 2015/9/29
 * @ui: 彭倩
 * @ux: 刘倩茹
 * @wd: 周宇,苏宁
 * @router: /locate-map
 */
var router = require('express').Router(); // 新建一个 router


// 在 router 上装备控制器与中间件
router.get('/locate-map', /*A, B, C,*/ function(req, res) {
    var theme = req.query.theme;
    res.render('location/locate-map', {
        // locate_map:true,
        tips:true,
        title:'选择地址',
        theme:theme
    }, function(err, html){
        // console.log(html);
        res.set('Content-Type', 'text/html');
        res.end(html)
    });
});

module.exports = router
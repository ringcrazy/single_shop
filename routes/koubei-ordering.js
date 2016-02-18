/**
 * @title: 口碑-点菜页
 * @ctime: 2016/1/18
 * @edittime: 2016/1/18
 * @ui: 胡雪
 * @wd: 苏宁
 * @router: /koubei-ordering
 */
var router = require('express').Router(); // 新建一个 router


// 在 router 上装备控制器与中间件
router.get('/koubei-ordering', /*A, B, C,*/ function(req, res) {
    var theme = req.query.theme;
    res.render('koubei/ordering', {
        home:true,
        adr:true,
        title:'口碑-点菜页',
        theme:theme
    }, function(err, html){
        // console.log(html);
        res.set('Content-Type', 'text/html');
        res.end(html);
    });
});

module.exports = router;
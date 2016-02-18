/**
 * @title: 微店-APP下载页
 * @ctime: 2015/12/22
 * @edittime: 2015/12/22
 * @ui: 徐蓉
 * @wd: 苏宁
 * @router: /vdian-download
 */
var router = require('express').Router(); // 新建一个 router


// 在 router 上装备控制器与中间件
router.get('/vdian-download', /*A, B, C,*/ function(req, res) {
    var theme = req.query.theme;
    res.render('vdian/download', {
        title:''
    }, function(err, html){
        // console.log(html);
        res.set('Content-Type', 'text/html');
        res.end(html)
    });
});

module.exports = router
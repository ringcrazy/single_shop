var router = require('express').Router(); // 新建一个 router
var fs = require('fs'),
	path = require('path'),
	sep = path.sep,
	http = require('http'),
    reg_note = /@(\S+):\s+(\S+)/g;

    // site_url = 'http://10.8.8.149:3201';
	// site_url = 'http://127.0.0.1:3201';
     site_url = 'http://127.0.0.1:3201';

	// site_url = 'http://127.0.0.1:3201';
    // site_url = 'http://10.8.7.168:3201'; 

	// site_url = 'http://172.30.0.129:3201';
    //site_url = 'http://127.0.0.1:3201'; 

// 在 router 上装备控制器与中间件
router.get('/', /*A, B, C,*/ function(req, res) {
	var site_pages = [];
	var files = getAllFilesSync(__dirname);
	// console.log(files);return
	if (files.length) {
		files.forEach(function(file){		
			var fileContent = fs.readFileSync(file,'utf8'); //同步读原图
			//console.log(fileContent);
            var site_page={},flag=false;
            fileContent.replace(reg_note,function(s,k,v){
                site_page[k] = v.split(',');
                flag = true;
            });
            if(flag){
                console.log("1____________"+site_page['router']);
                site_page['url'] = site_page['router'][0];
                site_pages.push(site_page);
            }         
		});
	}
	res.render('astro/astro-map', {
        title:'astro首页',
        list:site_pages
    }, function(err, html){
        // console.log(html);
        res.set('Content-Type', 'text/html');
        res.end(html);
    });
});

function getAllFilesSync(filePath, ext, filter) {
    filter = (filter ? filter : []).concat(['.svn', '.DS_Store']);
    var res = [],
        ext = ext,
        files = fs.readdirSync(filePath);
    files.forEach(function(file) {
        var pathname = path.join(filePath, file);
        stat = fs.lstatSync(pathname);
        if (!stat.isDirectory()) {
            var fileExt = path.extname(file),
                fileExt = fileExt ? fileExt.slice(1) : 'unknown';
            if (!ext || (fileExt === ext && !in_array(file, filter))) {
                res.push(pathname);
            }
        } else {
            pathname += sep;
            if(!in_array(path.basename(file), filter)){
                res = res.concat(mfile.getAllFilesSync(pathname, ext, filter));
            }
        }
    });
    return res
}

function in_array(item, arr) {
    if (!arr) return;
    for (var i = 0, len = arr.length; i < len; ++i) {
        if (arr[i] === item) {
            return true;
        }
    }
    return false;
}
module.exports = router;
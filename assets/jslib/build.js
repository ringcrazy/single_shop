/*
 * require:nodejs
 * author:wanhu
 * contact:wanhu88@gmail.com
*/
var fs = require('fs'),
    version = '1.0.5',
    filelist = [
        'mo',
        'lang',
        'array',
        'base',
        'dom',
        'dom-extend',
        'node-core',
        'node-attrs',
        'node-dom',
        'node-style',
        'selector',
        'event',
        'node-cls',
        'node-data',
        'node-event',
        'node-list',
        'node',
        'template',
        'widget',
        'localstorage',
        'io-core',
        'io',
        'xpost',
        'plugin',
        'node-plugin'
    ],
    mojs = '';
/**
 * 遍历文件,并合成一个
*/
function process (filelist,bywatch) {
    var file,i=0;
    while(file = filelist[i++]){
        /*
        if(!bywatch){
            fs.watchFile(file,function(){
                process(filelist,true);
            });
        }
        */
        //mojs += fs.readFileSync(__dirname+'\\'+version+'\\'+file,encoding='utf8') +' \n';
        mojs += fs.readFileSync(__dirname+'/'+file+'/'+file+'.js',encoding='utf8') +' \n';
    }
}
process(filelist);
fs.writeFile(require('path').join(require('path').dirname(__dirname),'js','mo.js'),mojs,encoding='utf8',function(e) {
    if (e) throw e;
    console.log('success:'+new Date());
})

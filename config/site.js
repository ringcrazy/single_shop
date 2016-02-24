var nodeFS = require('fs');
var nodePath = require('path');

module.exports = {
    // env: 'development',
    // 项目名称
    name: 'astro',
    // 服务器端口
    port: 3401,
    // 站点根目录
    root: require('path').join(__dirname, '..'),
    // 页面存储路径
    // page: require('path').join(__dirname, '..', 'pages'),
    // 接口代理
    /*proxy: {
        '/aj': {
            hostname: 'www.baidu.com',
            port: 80,
            url: '/',
            headers: {}
        }
    },*/
    // 模板全局属性
    globalVariables: {
        // 预上线
        //cdn: 'http://10.8.8.43:81/single_shop_preview/single_shop',
        // 上线
        // cdn: 'http://10.8.8.43:81/single_shop',
        // 开发
        // cdn:'http://172.18.11.112:3404/single_shop',
        // 苏宁ip
        //cdn:'http://172.18.111.65:3404/single_shop',
          cdn:'http://172.18.11.43:3404/single_shop',
        
        // 静态资源版本号
        ver: function() {
            return Date.now;
        },
        theme:''
    }
};
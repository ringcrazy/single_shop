// 静态资源服务器配置
module.exports = {
    // debug: true,
    // 站点根目录
    port: 3404,
    root: require('path').join(__dirname, '..'),
    // 页面存储路径
    // page: require('path').join(__dirname, '..', 'pages'),
    // 自定发布目录
    // release: require('path').join(__dirname, '..', 'build'),
    // JS文件后缀名，默认为js
    // jsExt:'js',
    // CSS文件后缀名
    // cssExt:'less',
    // htmlExt : 'html',
    // JS 相关配置
    cdnPrefix: '/single_shop',
    // 交错属性开关
    //interlace:true,
    //打开图片、字体资源MD5
    //imgMd5 : true,
    jsImgRefer : {
        rule : '$.res(.__path__.)'
    },
    jsTpl: "$addTpl('{name}','{file}',{content})",
    // 是否压缩CSS
    // 注意： 如果不开启，发布时也不会压缩CSS
    //compressCss:true,
    // 是否压缩JS
    // compressJs:true,
    js: {
        // 模块对应的外网引用地址
        // source: {
        //     'jquery': 'http://cdn.baidu.com/jquery.js',
        // },
        // 不合并的组件
        unCombine: ['jquery', 'mo', 'zepto']
    },
    // 引用的插件，根据书写顺序加载
    middlewares: [
        'et-astros-theme',
        'et-astros-theme-variable',
        'astros-asset-parse',
        'astros-resource-refer',
        'astros-webcom-refer',
        'astros-2ximg',
        'astros-js-dep',
        'astros-js-process',
        'astros-js-tpl',
        {
            name:'astros-js-minify',
            filter:{
                modType:['page', 'static', 'webCom']
            }
        },
        'astros-css-less',
    ],
    // cdn:'',
    // 发布的配置
    rel: {
        // 发布时需要忽略的目录
        ignore: ['jslib', 'less'],
        // 发布时需要加载的插件，开发、调试时不会加载
        middlewares: [
            // 多模板时，修正URL地址
            'et-astros-theme',
            // 多模板时，把variable定位到variable-thtme
            'et-astros-theme-variable',
            // 解析资源
            'astros-asset-parse',
            // 多模板 发布支持
            'et-astros-theme-relpath',
            // 解析页面引用了哪些Web组件
            'astros-resource-refer',
            // JS、CSS内部对图片、字体的相对引用
            'astros-webcom-refer',
            // 支持二倍图自动转一倍图
            'astros-2ximg',
            // 发布时交错属性 
            'astros-img-interlace',
            //js之间的依赖
            'astros-js-dep',
            // 解析JS
            'astros-js-process',        
            //js模版处理
            'astros-js-tpl',
            // 压缩JS
            {
                name:'astros-js-minify',
                filter:{
                    modType:['page', 'static', 'webCom']
                }
            },
            // 解析LESS
            'astros-css-less',
            // 图片精灵
            'astros-css-sprite'
        ]
    }
}
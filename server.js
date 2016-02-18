#!/usr/bin/env node

var nodePath = require('path');
var nodeUtil = require('util');

var util = require('lang-utils');

require('console-prettify')({
    prefix:1
});

//启动静态服务器
    console.log('--------------');
    require('astros');

    astro.setProject(__dirname);
    astro.listen();
//启动静态服务器 END


//启动Web服务

    var app = (require('express'))();

    var pandora = new(require('pandorajs'));

    var appCfg = require('./config/site.js');
    app.set('env', appCfg.env);

    process.env.NODE_ENV = appCfg.env;

    pandora.init(app, __dirname);

    require('pandora-proxy')(app);

    app.listen(appCfg.port);

    var ips = util.getLocalIp();

    console.log(nodeUtil.format('server is listening on %d', appCfg.port));
    console.log('you can visit with:')

    ips.forEach(function(ip){
        console.info('  http://%s:%s',ip, appCfg.port);
    });
//启动Web服务 END
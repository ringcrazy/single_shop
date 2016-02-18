#!/usr/bin/env node

'use strict';

var async = require('async');

var nodePath = require('path'),
    nodeFs = require('fs'),
    filePlus = require('file-plus');

// astro.debug = 1;


let builder = require('astros').builder;
builder = new builder(require('../config/static.js'));

let themes = ['blue', 'gray', 'gold'];


builder.build(function(argument) {

    /*let prjCfg = astro.getProject(builder.project);
    let files = filePlus.getAllFilesSync(prjCfg.page, ['.' + prjCfg.cssExt]);

    async.eachSeries(themes, function(theme, nextTheme) {
        console.log('发布主题：%s', theme);
        async.eachSeries(files, function(file, next) {
            let asset = new astro.Asset({
                project: builder.project,
                modType: 'page',
                name: nodePath.dirname(nodePath.relative(prjCfg.page, file)),
                fileType: 'css',
                theme: theme
            });
            // console.info(asset.info);
            asset.release(next);
        }, function() {
            nextTheme();
        });
    }, function(){
        builder.imgMd5();
        console.log('发布完成');
    })*/
});
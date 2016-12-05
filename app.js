"use strict";

const fs = require('fs');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const FileStreamRotator = require('file-stream-rotator');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const CONFIG = require('./config/config');
const routes = require('./common/routes');

const app = express();
/*
// webpack
if (CONFIG.fe.developing) {
    var webpackConfig = require('./build/webpack.dev.conf');
    var webpack = require('webpack');
    var webpackDevMiddleware = require('webpack-dev-middleware');
    var compiler = webpack(webpackConfig);
    var devMiddleware = webpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
        stats: {
            colors: true,
            chunks: true,
            progress: true
        }
    });
    var hotMiddleware = require('webpack-hot-middleware')(compiler);
    app.use(devMiddleware);
    app.use(hotMiddleware);
}
*/
// 爬蟲任務
const Job = require('./common/util/task');
const Spider = require('./common/util/spider');
const API = require('./common/api/api');
//測試最後一篇文章
//Spider.day(225317103);

Spider.updateForumsInfo();
//Spider.day(225322597);
/*
if (CONFIG.spider.fire) {
    Spider.fire(CONFIG.spider.start, CONFIG.spider.end);
}
if (CONFIG.spider.openTask) {
    Spider.latest();
    Job.fire();
}
*/
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    // next(err);
    res.render('error', {
        message: err.message,
        error: err
    });
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// ============== log4js init ==============

var log4js = require('log4js');
log4js.loadAppender('file');
log4js.configure({
    appenders: [{
        type: 'console',
        layout: {
            type: 'pattern',
            pattern: '[%r] [%[%5.5p%]] - %m%n'
        }
    }, {
        type: 'dateFile',
        filename: './log/access',
        pattern: '-yyyy-MM-dd.log',
        alwaysIncludePattern: true,
        category: 'access'
    }]
});
app.use(log4js.connectLogger(log4js.getLogger('access'), { level: log4js.levels.INFO }));

app.set('port', process.env.PORT || 9000);
var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});


module.exports = app;
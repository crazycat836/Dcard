"use strict";

const fs = require('fs');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const FileStreamRotator = require('file-stream-rotator');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const CONFIG = require('./config/config');
const routes = require('./common/route');

const app = express();

// webpack
if(CONFIG.fe.developing){
    require("nodejs-dashboard");
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

// 爬虫任务
const Job = require('./common/util/task');
const SpiderMan = require('./common/util/spider');

if(CONFIG.spider.fire) {
    SpiderMan.fire(CONFIG.spider.start, CONFIG.spider.end);
}
if(CONFIG.spider.openTask) {
    SpiderMan.latest();
    Job.fire();
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

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

app.set('port', process.env.PORT || 5502);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;
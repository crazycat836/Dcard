"use strict";
const fs = require('fs');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const routes = require('./common/routes');
const Kafka = require('no-kafka');

// 爬蟲任務
 //const Job = require('./common/util/task');
 //Job.fire();
// 測試區
//const Spider = require('./common/util/spider');
//Spider.streamTag();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// ============== log4js init ==============

const log4js = require('log4js');
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


// ============== socket init ==============
/*
io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});
*/
/*
app.get('/', function(req, res){
    res.sendFile('/public/index.html');
});
*/
app.set('port', process.env.PORT || 9000);
const Server = http.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + Server.address().port);
});


// ============== kafka consumer init ==============
/*
const consumer = new Kafka.SimpleConsumer();
const NewMsg = [];
// data handler function can return a Promise
const dataHandler = function(messageSet, topic, partition) {
    messageSet.forEach(function(m) {
        const msg = JSON.parse(m.message.value.toString('utf8'));
        //console.log(topic, partition, m.offset, msg);
        const formatString = { name: msg[0], size: msg[1] };
        //console.log("length of NewMsg: " + NewMsg.length);
        if (NewMsg.length == 10) {
            io.emit("message", JSON.stringify({ name: "flare", children: NewMsg }));
            io.emit("domain",NewMsg);
            //console.log("NewMsg: " + JSON.stringify(NewMsg));
            NewMsg.length = 0;
        } else {
            NewMsg.push(formatString);
        }
    });

};

return consumer.init()
    .then(function() {
        // Subscribe partition 0 in a topic:
        return consumer.subscribe('processed-data', 0, dataHandler);
    });

*/
module.exports = app;

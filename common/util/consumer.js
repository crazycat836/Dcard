const kafka = require('kafka-node');
const Consumer = kafka.Consumer;
const client = new kafka.Client('127.0.0.1:2181');
const consumer = new Consumer(
    client, [
        { topic: 'test'}
    ], {
        autoCommit: true,
        fromOffset: false
    }
);

consumer.on('message', function(message) {
    console.log(message.value);
});
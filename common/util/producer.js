const Kafka = require('no-kafka');
const producer = new Kafka.Producer({
    connectionString : "192.168.4.71:9092,192.168.4.72:9092,192.168.4.73:9092,192.168.4.74:9092,192.168.4.75:9092"
});

const tagProducer = {
    Stream: function(d) {
        return producer.init().then(function() {
            return producer.send({
                topic: 'data',
                partition: 0,
                message: {
                    value: d
                }
            });
        });
    }
};

module.exports = tagProducer;

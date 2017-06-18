const Kafka = require('no-kafka');
const producer = new Kafka.Producer();

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

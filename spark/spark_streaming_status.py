# -*- coding: utf-8 -*-
from pyspark import SparkContext
from pyspark.streaming import StreamingContext
from pyspark.streaming.kafka import KafkaUtils
from pykafka import KafkaClient
import json
import sys
import pprint

def pushTagCountInKafka(top_ten_tags):
    client = KafkaClient(hosts="192.168.4.71:9092,192.168.4.72:9092,192.168.4.73:9092,192.168.4.74:9092,192.168.4.75:9092")
    topic = client.topics['processed-data']
    for tags in top_ten_tags:
	    with topic.get_producer(linger_ms=100) as producer:
		    producer.produce(json.dumps(tags).encode('utf-8'))


zkQuorum = '192.168.4.70:2181/dcos-service-kafka'
topic = 'data'
sc = SparkContext(appName="DcardTagCount")
sc.setLogLevel("ERROR")
ssc = StreamingContext(sc,10)
kvs = KafkaUtils.createStream(ssc, zkQuorum, "spark-streaming-consumer", {topic: 1})
lines = kvs.map(lambda x: x[1])

lines.count().map(lambda x:'Process in this batch: %s' % x).pprint()

tags_count = lines.flatMap(lambda line: line.split(","))\
             .map(lambda tag_status: (tag_status, 1)) \
              .reduceByKey(lambda a, b: a+b)

sort_tag = tags_count.transform((lambda foo:foo.sortBy(lambda x:( -x[1]))))

top_ten_tags = sort_tag.transform(lambda rdd:sc.parallelize(rdd.take(10)))

top_ten_tags.pprint()

top_ten_tags.foreachRDD(lambda rdd: rdd.foreachPartition(pushTagCountInKafka))

ssc.start()
ssc.awaitTermination()

from pyspark import SparkContext
from pyspark.streaming import StreamingContext
from pyspark.streaming.kafka import KafkaUtils
from kafka import KafkaProducer
import json
import sys
import pprint



def pushTagCountInKafka(tags_counts):
    producer = KafkaProducer(bootstrap_servers='localhost:9092')
    for tag in tags_counts:
        tag_string = json.dumps(tag)
        producer.send('one-min-data', tag_string.encode('utf-8'))

zkQuorum, topic = sys.argv[1:]
sc = SparkContext(appName="DcardTagCount")
sc.setLogLevel("ERROR")
ssc = StreamingContext(sc, 120)
kvs = KafkaUtils.createStream(ssc, zkQuorum, "spark-streaming-consumer", {topic: 1})
lines = kvs.map(lambda x: x[1])
lines.pprint()
tags_count = lines.flatMap(lambda line: line.split(","))\
             .map(lambda tag_status: (tag_status, 1)) \
              .reduceByKey(lambda a, b: a+b)
tags_count.pprint()

tags_count.foreachRDD(lambda rdd: rdd.foreachPartition(pushTagCountInKafka))
ssc.start()
ssc.awaitTermination()

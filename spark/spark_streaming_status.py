from pyspark import SparkContext
from pyspark.streaming import StreamingContext
from pyspark.streaming.kafka import KafkaUtils
from pykafka import KafkaClient
import json
import sys
import pprint
reload(sys)
sys.setdefaultencoding('utf8')

#def pushOrderStatusInKafka(tags_counts):
#   client = KafkaClient(hosts="localhost:9092")
#   topic = client.topics['order-one-min-data']
#    for tags_count in tags_counts:
#	    with topic.get_producer() as producer:
#		    producer.produce(json.dumps(tags_count))

zkQuorum, topic = sys.argv[1:]
sc = SparkContext(appName="DcardTagCount")
ssc = StreamingContext(sc, 45)
kvs = KafkaUtils.createStream(ssc, zkQuorum, "spark-streaming-consumer", {topic: 1})
lines = kvs.map(lambda x: x[1])
lines.pprint()
tags_count = lines.map(lambda line: line.split(",")) \
              .map(lambda tag_status: (tag_status, 1)) \
              .reduceByKey(lambda a, b: a+b)
tags_count.pprint()
#tags_count.foreachRDD(lambda rdd: rdd.foreachPartition(pushOrderStatusInKafka))
ssc.start()
ssc.awaitTermination()

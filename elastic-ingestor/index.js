require("dotenv").config();
const { Kafka } = require("kafkajs");
const elastic = require("./elastic");
const { server, io } = require("./alertServer");

const kafka_connection = new Kafka({
  clientId: "my-app",
  brokers: [process.env.KAFKA_HOSTNAME || ""],
  ssl: true,
  sasl: {
    mechanism: "scram-sha-512", // scram-sha-256 or scram-sha-512
    username: process.env.USERNAME || "",
    password: process.env.PASSWORD || "",
  },
});

const consumer = kafka_connection.consumer({ groupId: "qhagfczs-" });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "qhagfczs-test-topic",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async (messagePayload) => {
      const { topic, partition, message } = messagePayload;

      const parsedMessage = JSON.parse(message.value.toString());
      if (parsedMessage.urgency > 1) {
        io.emit("alert", message.value.toString());
      }

      elastic
        .getClient()
        .index({
          index: elastic.index,
          body: message.value,
        })
        .then((result) => {
          console.log(`insert result : ${result.statusCode}, ${result.body}`);
        })
        .catch((err) => {
          console.error(`insert error : ${err}`);
        });

      //   const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
      //   console.log(`- ${prefix} ${message.key}#${message.value}`);
    },
  });
};

const main = async () => {
  await elastic.connectToElasticsearch();
  const esClient = elastic.getClient();
  const elasticIndex = await esClient.indices.exists({
    index: elastic.index,
  });

  if (!elasticIndex.body) {
    await elastic.createIndex(elastic.index);
  }

  server.listen(3000, () => {
    console.log("listening on *:3000");
  });

  run()
    .then((res) => console.log(res))
    .catch((e) => console.error(e));
};

main().catch((e) => console.error(`error eccured! : ${e}`));

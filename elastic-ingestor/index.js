require("dotenv").config();
const { Kafka } = require("kafkajs");
const elastic = require("./elastic");
const { server, io } = require("./alertServer");

// Build Kafka configuration based on environment variables
const kafkaConfig = {
  clientId: "elastic-ingestor",
  brokers: [process.env.KAFKA_HOSTNAME || "localhost:9092"],
};

// Only add SSL if enabled
if (process.env.KAFKA_USE_SSL === "true") {
  kafkaConfig.ssl = true;
}

// Only add SASL auth if enabled
if (process.env.KAFKA_USE_AUTH === "true") {
  kafkaConfig.sasl = {
    mechanism: "plain", // Using simpler PLAIN authentication
    username: process.env.KAFKA_USERNAME || "",
    password: process.env.KAFKA_PASSWORD || "",
  };
}

const kafka_connection = new Kafka(kafkaConfig);

const consumer = kafka_connection.consumer({ groupId: "elastic-ingestor-group" });

const run = async () => {
  try {
    await consumer.connect();
    console.log("Connected to Kafka successfully");

    const topic = process.env.KAFKA_TOPIC || "cosmic-events-topic";
    await consumer.subscribe({
      topic: topic,
      fromBeginning: true,
    });
    console.log(`Subscribed to topic: ${topic}`);

    await consumer.run({
      eachMessage: async (messagePayload) => {
        const { topic, partition, message } = messagePayload;

        try {
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
              console.log(`Insert result: ${result.statusCode}, ${result.body}`);
            })
            .catch((err) => {
              console.error(`Insert error: ${err}`);
            });
        } catch (error) {
          console.error(`Error processing message: ${error}`);
        }
      },
    });
  } catch (error) {
    console.error(`Kafka consumer error: ${error}`);
    throw error;
  }
};

const main = async () => {
  try {
    await elastic.connectToElasticsearch();
    const esClient = elastic.getClient();
    const elasticIndex = await esClient.indices.exists({
      index: elastic.index,
    });

    if (!elasticIndex.body) {
      await elastic.createIndex(elastic.index);
    }

    server.listen(3000, () => {
      console.log("Alert server listening on *:3000");
    });

    await run();
    console.log("Kafka consumer is running");
  } catch (error) {
    console.error(`Error in main function: ${error}`);
    process.exit(1);
  }
};

main().catch((e) => console.error(`Error occurred: ${e}`));
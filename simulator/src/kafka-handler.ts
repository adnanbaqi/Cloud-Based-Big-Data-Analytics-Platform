import { Kafka, Producer, Message } from "kafkajs";

export class KafkaHandler {
  private kafka_connection;
  private producer: Producer;

  constructor() {
    if (
      process.env.USERNAME === undefined ||
      process.env.PASSWORD === undefined
    ) {
      throw new Error("Please define username and password in the env");
    }

    this.kafka_connection = new Kafka({
      clientId: "my-app",
      brokers: [process.env.KAFKA_HOSTNAME || ""],
      ssl: true,
      sasl: {
        mechanism: "scram-sha-512", // scram-sha-256 or scram-sha-512
        username: process.env.USERNAME || "",
        password: process.env.PASSWORD || "",
      },
    });

    this.producer = this.kafka_connection.producer();
  }

  async connectKafka() {
    return this.producer.connect();
  }

  async sendMessage(message: Message) {
    console.log(
      `Sending an event to ${process.env.SIMULATOR_TOPIC_NAME} ,with the following content: ${message.value}`
    );
    return this.producer.send({
      topic: process.env.SIMULATOR_TOPIC_NAME || "",
      messages: [message],
    });
  }
}

// const consumer = kafka.consumer({ groupId: "qhagfczs-" });

// const run = async () => {
//   // Producing
//   await producer.connect();
//   await producer.send({
//     topic: "qhagfczs-test-topic",
//     messages: [{ value: "Hello KafkaJS u123ser!" }],
//   });
//   await consumer.connect();
//   await consumer.subscribe({
//     topic: "qhagfczs-test-topic",
//     fromBeginning: true,
//   });

//   await consumer.run({
//     eachMessage: async (messagePayload: EachMessagePayload) => {
//       const { topic, partition, message } = messagePayload;
//       const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
//       console.log(`- ${prefix} ${message.key}#${message.value}`);
//     },
//   });

//   // Consuming
//   return;
// };

// run()
//   .then(() => {
//     console.log("message sent");
//   })
//   .catch(console.error);

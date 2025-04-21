const { Client } = require("@elastic/elasticsearch");
const elasticUrl = process.env.ELASTIC_URL || "http://localhost:9200";
let esclient;
const index = "stars";
const maxAttempts = 5;
const timeout = 5000; // milliseconds

/**
 * @function createIndex
 * @returns {void}
 * @description Creates an index in ElasticSearch.
 */
async function createIndex(index) {
  try {
    await esclient.indices.create({ index });
    console.log(`Created index ${index}`);
  } catch (err) {
    console.error(`An error occurred while creating the index ${index}:`);
    console.error(err);
  }
}

async function isAlive() {
  try {
    await esclient.ping({ index, requestTimeout: 10000 });
    return true;
  } catch (error) {
    return false;
  }
}

async function connectToElasticsearch() {
  let attempts = 0;
  let connected = false;

  while (attempts < maxAttempts && !connected) {
    attempts++;
    try {
      esclient = new Client({
        node: elasticUrl,
        maxRetries: 3,
        requestTimeout: 10000,
      });
      await esclient.ping();
      connected = true;
      console.log("Successfully connected to Elasticsearch!");
    } catch (error) {
      console.log(`Connection attempt ${attempts} failed: ${error.message}`);
    }
    if (!connected) {
      console.log(`Retrying in ${timeout}ms...`);
      await new Promise((resolve) => setTimeout(resolve, timeout));
    }
  }

  if (!connected) {
    throw new Error(
      `Failed to connect to Elasticsearch after ${maxAttempts} attempts.`
    );
  }
  return true;
}

function getClient(){
  return esclient
}

module.exports = {
  getClient,
  createIndex,
  index,
  isAlive,
  connectToElasticsearch,
};

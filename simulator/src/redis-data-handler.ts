import Redis from "ioredis";
import axios from "axios";

const maxRetries = 5;
const redisClient = new Redis(6379, process.env.REDIS_HOSTNAME || "127.0.0.1", {
  maxRetriesPerRequest: maxRetries,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    if (times > 10) {
        throw new Error("Redis connection problems")
    }
    return delay;
  },
});
let isConnected = false;

const CATALOG_URL =
  "https://raw.githubusercontent.com/aduboisforge/Bright-Star-Catalog-JSON/master/BSC.json";

const keyPrefix = "starData";

redisClient.on("ready", () => {
  isConnected = true;
});

const getCatalogData = async (): Promise<any> => {
  const response = await axios.get(CATALOG_URL);
  const { data } = response;
  return data;
};

export const ingestCatalogToRedis = async () => {
  let attempts = 0;
  while (!isConnected && attempts < maxRetries) {
    attempts + 1;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (attempts == maxRetries && !isConnected) {
    throw new Error("Redis not connected");
  }

  try {
    const dataToInsert = await getCatalogData();
    const insertOps = await Promise.all(
      dataToInsert.map((item: any, index: number) => {
        redisClient.set(`${keyPrefix}-${index}`, JSON.stringify(item));
      })
    );
    return dataToInsert.length;
  } catch (error) {
    console.log("ERROR while inserting catalog to redis");
    throw error;
  }
};

export const getStarObjectByKey = async (index: number) => {
  const data = await redisClient.get(`${keyPrefix}-${index}`);
  if (data == null) {
    return {};
  }
  return JSON.parse(data);
};

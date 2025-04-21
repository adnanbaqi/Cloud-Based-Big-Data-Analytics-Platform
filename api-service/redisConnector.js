import Redis from "ioredis";

const maxRetries = 5;
const redisClient = new Redis(6379, process.env.REDIS_HOSTNAME || "127.0.0.1", {
	maxRetriesPerRequest: maxRetries,
	retryStrategy(times) {
		const delay = Math.min(times * 50, 2000);
		if (times > 10) {
			throw new Error("Redis connection problems");
		}
		return delay;
	},
});
let isConnected = false;

redisClient.on("ready", () => {
	isConnected = true;
});

export const setDataInCache = async (key, data) => {
	try {
		await redisClient.setex(key, 3600, JSON.stringify(data));
		return;
	} catch (error) {
		console.error(error);
	}
};

export const getDataFromCache = async (key) => {
	try {
		const data = (await redisClient.get(key)) || {};
		if (Object.keys(data).length === 0) {
			return ;
		}
		return JSON.parse(data);
	} catch (error) {
		console.error(`failed fetching data from cache: ${error}`);
		return;
	}
};

import Redis from "ioredis";

const redisClient = new Redis({
	host: process.env.REDIS_HOSTNAME || "redis", // 🧠 Use Docker service name
	port: parseInt(process.env.REDIS_PORT || "6379", 10),
	maxRetriesPerRequest: 5,
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
	console.log("✅ Redis connection established.");
});

redisClient.on("error", (err) => {
	console.error("❌ Redis connection error:", err);
});

export const setDataInCache = async (key, data) => {
	try {
		await redisClient.setex(key, 3600, JSON.stringify(data));
	} catch (error) {
		console.error(`❌ Failed to set cache: ${error}`);
	}
};

export const getDataFromCache = async (key) => {
	try {
		const data = await redisClient.get(key);
		if (!data) return;
		return JSON.parse(data);
	} catch (error) {
		console.error(`❌ Failed fetching data from cache: ${error}`);
		return;
	}
};

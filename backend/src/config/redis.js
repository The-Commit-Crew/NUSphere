import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL, {
  enableAutoPipelining: true,
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
});

redisClient.on("error", (error) => {
  console.error("Redis connection error:", error);
});

export default redisClient;

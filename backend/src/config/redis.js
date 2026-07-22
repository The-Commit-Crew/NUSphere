import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL, {
  enableAutoPipelining: true,
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  lazyConnect: !!process.env.JEST_WORKER_ID,
});

redisClient.on("error", (error) => {
  // eslint-disable-next-line no-console
  console.error("Redis connection error:", error);
});

export default redisClient;

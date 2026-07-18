import { RateLimiterRedis } from "rate-limiter-flexible";
import redisClient from "../config/redis.js";

const globalRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "global_limit",
  points: 500,
  duration: 15 * 60,
  blockDuration: 60 * 15,
});

const strictRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "ai_limit",
  points: 10,
  duration: 60,
  blockDuration: 60,
});

const strictDailyLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "ai_daily_limit",
  points: 250,
  duration: 24 * 60 * 60,
});

const moderationRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "moderation_limit",
  points: 15,
  duration: 60,
});

const authRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "auth_limit",
  points: 5,
  duration: 15 * 60,
  blockDuration: 15 * 60,
});

const rateLimiterMiddleware = (limiter) => async (req, res, next) => {
  if (process.env.JEST_WORKER_ID) {
    return next();
  }
  try {
    await limiter.consume(req.ip);
    next();
  } catch (rejRes) {
    if (rejRes instanceof Error) {
      // eslint-disable-next-line no-console
      console.error("Rate Limiter Redis Error. Failing open.", rejRes.message);
      return next();
    }
    res.status(429).json({
      message: "Too many requests, please try again later.",
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 60,
    });
  }
};

export const globalLimiter = rateLimiterMiddleware(globalRateLimiter);
export const aiLimiter = rateLimiterMiddleware(strictRateLimiter);
export const aiDailyLimiter = rateLimiterMiddleware(strictDailyLimiter);
export const moderationLimiter = rateLimiterMiddleware(moderationRateLimiter);
export const authLimiter = rateLimiterMiddleware(authRateLimiter);

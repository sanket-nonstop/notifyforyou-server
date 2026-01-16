// ================================
// FILE: src/core/redis.ts
// ================================
/**
 * Redis connection (Production-grade)
 * - Used for sessions, rate limiting, caching, sockets
 */

import Redis, { RedisOptions } from "ioredis";

import { env } from "@config/env.config";
import { redisConfig } from "@config/index";
import { logger } from "@logger/index";
import { AppError } from "@utils/AppError.util";

export let redisClient: Redis | null = null;

export const connectRedis = async (): Promise<Redis> => {
  try {
    if (!env.REDIS_URL) {
      throw new Error("❌ REDIS_URL is not defined in environment variables.");
    }

    const options: RedisOptions = {
      maxRetriesPerRequest: redisConfig.MAX_RETRIES,
      enableReadyCheck: true,
      lazyConnect: true,
      reconnectOnError: (err) => {
        const targetErrors = ["READONLY", "ETIMEDOUT"];
        if (targetErrors.some((e) => err.message.includes(e))) {
          logger.warn({ err }, "🔁 Redis reconnect triggered due to error:");
          return true;
        }
        return false;
      },
    };

    redisClient = new Redis(env.REDIS_URL, options);

    redisClient.on("connect", () => {
      logger.info("🟢 Redis connection established.");
    });

    redisClient.on("ready", () => {
      logger.info("✅ Redis is ready to accept commands.");
    });

    redisClient.on("error", (err) => {
      logger.error(`❌ Redis connection error: ${err.message}`);
    });

    redisClient.on("close", () => {
      logger.warn("🔴 Redis connection closed.");
    });

    redisClient.on("reconnecting", () => {
      logger.warn("🔁 Redis reconnecting...");
    });

    // Explicit connect (lazyConnect = true)
    await redisClient.connect();

    // Graceful shutdown handling
    process.on("SIGINT", async () => {
      if (redisClient) {
        await redisClient.quit();
        logger.info("Redis connection closed due to app termination.");
      }
      process.exit(0);
    });

    return redisClient;
  } catch (err) {
    logger.error(`❌ Redis initialization failed: ${(err as Error).message}`);
    process.exit(1);
  }
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new AppError(
      // "Redis client is not initialized. Call connectRedis() first."
      "Service temporarily unavailable. Please try again later.",
      503
    );
  }

  return redisClient;
};

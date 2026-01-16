// ================================
// FILE: src/core/database.ts
// ================================
/**
 * MongoDB connection (Atlas)
 */

import mongoose, { ConnectOptions } from "mongoose";

import { env } from "@config/env.config";
import { dbConfig } from "@config/index";
import { logger } from "@logger/index";

export const connectDatabase = async (): Promise<void> => {
  try {
    if (!env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is not defined in environment variables.");
    }

    mongoose.set("strictQuery", true); // optional: suppresses strict query warnings

    const options: ConnectOptions = {
      maxPoolSize: dbConfig.MAX_POOL_SIZE, // ⚙️ adjust for load/performance
      autoIndex: dbConfig.AUTO_INDEX, // optional: disable auto index creation in production for performance
      connectTimeoutMS: dbConfig.CONNECT_TIMEOUT_MS,
      socketTimeoutMS: dbConfig.SOCKET_TIMEOUT_MS,
    };

    await mongoose.connect(env.MONGO_URI, options);

    logger.info("✅ MongoDB connected successfully.");

    mongoose.connection.on("connected", () => {
      logger.info("🟢 Mongoose connection established.");
    });

    mongoose.connection.on("error", (err) => {
      logger.error(`❌ Mongoose connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("🔴 Mongoose connection disconnected.");
    });

    // Graceful shutdown handling
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed due to app termination.");
      process.exit(0);
    });
  } catch (err) {
    logger.error(`❌ MongoDB connection failed: ${(err as Error).message}`);
    process.exit(1);
  }
};

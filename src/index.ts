// ================================
// FILE: src/index.ts
// ================================
/**
 * Application Entry Point (Production-grade)
 * - Loads environment & config
 * - Boots core server
 * - Handles fatal & async errors
 * - Prevents silent crashes
 */

import { env } from "@config/env.config";
import { startServer } from "@core/server";
import { logger } from "./logger";

/**
 * Bootstrap function
 */
const bootstrap = async (): Promise<void> => {
  try {
    logger.info({ env: env.NODE_ENV }, "🚀 Starting application");
    await startServer();
  } catch (error) {
    logger.fatal({ error }, "❌ Failed to start server");
    process.exit(1);
  }
};

/**
 * Handle unhandled promise rejections
 */
process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "❌ Unhandled Promise Rejection");
  process.exit(1);
});

/**
 * Handle uncaught exceptions
 */
process.on("uncaughtException", (error) => {
  logger.fatal({ error }, "❌ Uncaught Exception");
  process.exit(1);
});

// Start application
bootstrap();

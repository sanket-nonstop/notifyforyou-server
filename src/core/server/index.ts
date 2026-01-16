// ================================
// FILE: src/core/server.ts
// ================================
/**
 * Server bootstrap
 * - DB connections
 * - HTTP server
 * - Socket.IO
 * - Graceful shutdown
 */

import http from "http";

import { env } from "@config/env.config";
import { connectDatabase } from "@core/database";
import { connectRedis } from "@core/redis";
import { initSocket } from "@core/socket";
import { logger } from "@logger/index";
import { createApp } from "app";

export const startServer = async () => {
  // Connect core services
  await connectDatabase();
  await connectRedis();

  const app = await createApp(); // Inside we will setup Rest APIs and Graphql
  const server = http.createServer(app);

  // Initialize sockets
  initSocket(server);

  server.listen(env.PORT, () => {
    logger.info(`🚀 Server running on port ${env.PORT}`);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => shutdown(server));
  process.on("SIGINT", () => shutdown(server));
};

const shutdown = (server: http.Server) => {
  logger.warn("⚠️ Shutting down server...");

  server.close(() => {
    logger.info("✅ HTTP server closed");
    process.exit(0);
  });
};

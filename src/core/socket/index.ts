// ================================
// FILE: src/core/socket.ts
// ================================
/**
 * Socket.IO bootstrap (Production-grade)
 * - Central socket server initialization
 * - Auth handshake placeholder
 * - Namespace-ready
 * - Graceful shutdown support
 */

import http from "http";
import { Server, Socket } from "socket.io";

import { socketConfig } from "@config/index";
import { logger } from "@logger/index";
import { registerSocketHandlers } from "@sockets/index";
import { env } from "@config/env.config";
import { AppError } from "@utils/AppError.util";

let io: Server | null = null;

/**
 * Initialize Socket.IO server
 */
export const initSocket = (server: http.Server): Server => {
  if (io) {
    logger.warn("⚠️ Socket.IO already initialized. Reusing existing instance.");
    return io;
  }

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // allow server-to-server / Postman / curl
        if (!origin) return callback(null, true);

        const allowedOrigins = (env.CORS_ORIGIN || "")
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean);

        if (allowedOrigins.includes(origin)) return callback(null, true);

        return callback(new Error(`Socket CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    },
    transports: ["websocket"], // prefer websocket for performance
    pingInterval: socketConfig.PING_INTERVAL,
    pingTimeout: socketConfig.PING_TIMEOUT,
  });

  logger.info("✅ Socket.IO server initialized");

  // Global connection handler
  io.on("connection", (socket: Socket) => {
    logger.info({ socketId: socket.id }, "🔌 Socket connected");

    // TODO: Add socket authentication middleware here
    // validate access token from handshake

    registerSocketHandlers(io!, socket); // 👈 load all socket modules here

    socket.on("disconnect", (reason) => {
      logger.info({ socketId: socket.id, reason }, "❌ Socket disconnected");
    });

    socket.on("error", (error) => {
      logger.error({ socketId: socket.id, error }, "❌ Socket error");
    });
  });

  return io;
};

/**
 * Get active Socket.IO instance
 */
export const getSocketIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO is not initialized. Call initSocket() first.");
  }
  return io;
};

/**
 * Gracefully shutdown Socket.IO
 */
export const closeSocket = async (): Promise<void> => {
  if (!io) return;

  logger.warn("⚠️ Closing Socket.IO server...");

  await io.close();
  io = null;

  logger.info("✅ Socket.IO server closed");
};

import { Server, Socket } from "socket.io";
import { logger } from "@logger/index";
import { rooms } from "@sockets/rooms";

/**
 * Test Socket Events
 * Used to verify:
 * - socket connection
 * - room join/leave
 * - send/receive/broadcast
 */
export const registerTestSocket = (io: Server, socket: Socket) => {
  /**
   * Join user room
   * Client -> server: user:join { userId }
   */
  socket.on("user:join", (payload: { userId: string }) => {
    try {
      if (!payload?.userId) {
        socket.emit("error:bad_request", {
          message: "userId is required",
        });
        return;
      }

      const room = rooms.user(payload.userId);
      socket.join(room);

      logger.info(
        { socketId: socket.id, userId: payload.userId, room },
        "✅ user:join"
      );

      socket.emit("user:joined", {
        success: true,
        room,
      });
    } catch (error) {
      logger.error({ socketId: socket.id, error }, "❌ user:join failed");
      socket.emit("error:internal", { message: "Something went wrong" });
    }
  });

  /**
   * Leave user room
   * Client -> server: user:leave { userId }
   */
  socket.on("user:leave", async (payload: { userId: string }) => {
    try {
      if (!payload?.userId) {
        socket.emit("error:bad_request", {
          message: "userId is required",
        });
        return;
      }

      const room = rooms.user(payload.userId);
      await socket.leave(room);

      logger.info(
        { socketId: socket.id, userId: payload.userId, room },
        "👋 user:leave"
      );

      socket.emit("user:left", {
        success: true,
        room,
      });
    } catch (error) {
      logger.error({ socketId: socket.id, error }, "❌ user:leave failed");
      socket.emit("error:internal", { message: "Something went wrong" });
    }
  });

  /**
   * Send message test
   * Client -> server: test:send { message }
   */
  socket.on("test:send", (payload: { message: string }) => {
    try {
      if (!payload?.message || typeof payload.message !== "string") {
        socket.emit("error:bad_request", {
          message: "message must be a string",
        });
        return;
      }

      const cleanMessage = payload.message.trim();
      if (!cleanMessage) {
        socket.emit("error:bad_request", {
          message: "message cannot be empty",
        });
        return;
      }

      logger.info(
        { socketId: socket.id, message: cleanMessage },
        "📩 test:send"
      );

      // 1) Send back to same client
      socket.emit("test:receive", {
        success: true,
        message: cleanMessage,
        from: socket.id,
        time: new Date().toISOString(),
      });

      // 2) Broadcast to all clients (including sender)
      io.emit("test:broadcast", {
        success: true,
        message: cleanMessage,
        from: socket.id,
        time: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ socketId: socket.id, error }, "❌ test:send failed");
      socket.emit("error:internal", { message: "Something went wrong" });
    }
  });

  /**
   * Send message to a specific user room
   * Client -> server: test:sendToUser { userId, message }
   */
  socket.on(
    "test:sendToUser",
    (payload: { userId: string; message: string }) => {
      try {
        if (!payload?.userId) {
          socket.emit("error:bad_request", { message: "userId is required" });
          return;
        }

        if (!payload?.message || typeof payload.message !== "string") {
          socket.emit("error:bad_request", {
            message: "message must be a string",
          });
          return;
        }

        const cleanMessage = payload.message.trim();
        if (!cleanMessage) {
          socket.emit("error:bad_request", {
            message: "message cannot be empty",
          });
          return;
        }

        const room = rooms.user(payload.userId);

        logger.info(
          {
            socketId: socket.id,
            targetUserId: payload.userId,
            room,
            message: cleanMessage,
          },
          "🎯 test:sendToUser"
        );

        // Emit only to that user room
        io.to(room).emit("test:userMessage", {
          success: true,
          message: cleanMessage,
          from: socket.id,
          targetUserId: payload.userId,
          time: new Date().toISOString(),
        });

        // Confirm to sender
        socket.emit("test:sendToUser:ok", {
          success: true,
          targetUserId: payload.userId,
          room,
        });
      } catch (error) {
        logger.error(
          { socketId: socket.id, error },
          "❌ test:sendToUser failed"
        );
        socket.emit("error:internal", { message: "Something went wrong" });
      }
    }
  );

  /**
   * Simple ping test
   * Client -> server: test:ping
   */
  socket.on("test:ping", () => {
    socket.emit("test:pong", {
      success: true,
      time: new Date().toISOString(),
      socketId: socket.id,
    });
  });
};

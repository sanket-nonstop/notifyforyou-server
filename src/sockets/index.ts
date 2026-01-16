import type { Server, Socket } from "socket.io";

import { registerTestSocket } from "./events/test.socket";

/**
 * =====================================================
 * SOCKET EVENT REGISTRAR
 * Centralized registration of all socket event handlers
 * =====================================================
 */
export const registerSocketHandlers = (io: Server, socket: Socket): void => {
  /* =====================================================
   * Test-related socket events
   * ===================================================== */
  registerTestSocket(io, socket);
};

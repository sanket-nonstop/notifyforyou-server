// ================================
// FILE: src/middlewares/requestContext.middleware.ts
// ================================
/**
 * Request Context Middleware (Production-grade)
 * - Attaches a unique requestId to each request
 * - Propagates existing request-id if provided by upstream (API Gateway / Load Balancer)
 * - Enables end-to-end request tracing across logs, GraphQL, sockets
 */

import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";

// Augment Express Request type locally (avoids `any` usage everywhere)
declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
  }
}

export const requestContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Reuse request id from upstream if available
  const incomingRequestId =
    (req.headers["x-request-id"] as string) ||
    (req.headers["x-correlation-id"] as string);

  const requestId = incomingRequestId || randomUUID();

  // Attach to request object
  req.requestId = requestId;

  // Echo back for client & downstream services
  res.setHeader("x-request-id", requestId);

  next();
};

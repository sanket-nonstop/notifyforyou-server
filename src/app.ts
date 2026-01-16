// ================================
// FILE: src/app.ts
// ================================
/**
 * Application bootstrap (Production-grade)
 * - Express app initialization
 * - Security & performance middlewares
 * - REST (auth/system)
 * - GraphQL (post-login)
 * - Centralized error handling
 */

import cors from "cors";
import express, { Application } from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "@config/env.config";
import { applyGraphQL } from "@core/graphql";
import { errorMiddleware } from "@middlewares/error.middleware";
import { requestContextMiddleware } from "@middlewares/requestContext.middleware";
import { restModule } from "@modules/rest.module";
import { AppError } from "@utils/AppError.util";
import { logger } from "./logger";

export const createApp = async (): Promise<Application> => {
  const app = express();

  /**
   * ------------------------------------
   * Trust proxy
   * Required when behind load balancers
   * (NGINX, Cloudflare, AWS ALB)
   * ------------------------------------
   */
  app.set("trust proxy", true);

  /**
   * ------------------------------------
   * Security middlewares
   * ------------------------------------
   */
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  app.use(
    cors({
      // origin: env.CORS_ORIGIN,
      origin: (origin, callback) => {
        // allow server-to-server / Postman / curl
        if (!origin) return callback(null, true);

        const allowedOrigins = (env.CORS_ORIGIN || "")
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean);
        if (allowedOrigins.includes(origin)) return callback(null, true);

        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
  );

  /**
   * ------------------------------------
   * Body parsers
   * ------------------------------------
   */
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  /**
   * ------------------------------------
   * Request context & HTTP logging
   * ------------------------------------
   */
  app.use(requestContextMiddleware);

  // Use morgan only in non-production
  if (env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
  }

  /**
   * ------------------------------------
   * REST APIs (AUTH + SYSTEM ONLY)
   * ------------------------------------
   */
  /**
   * ------------------------------------
   * Root Page (HTML Landing)
   * ------------------------------------
   */
  app.get("/", (_req, res) => {
    res.status(200).send(`
    <!doctype html>
    <html>
      <head>
        <title>NotifyForYou Server</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style="font-family: Arial; padding: 30px;">
        <h2>🚀 NotifyForYou API is Running</h2>
        <p>This is the backend service.</p>
        <a href="${env.APP_CLIENT_BASE_URL}" style="display:inline-block;padding:10px 14px;background:#000;color:#fff;text-decoration:none;border-radius:8px;">
          Open Client App
        </a>
      </body>
    </html>
  `);
  });
  app.use("/api/v1", restModule);

  /**
   * ------------------------------------
   * GraphQL APIs (POST-LOGIN FEATURES)
   * ------------------------------------
   */
  await applyGraphQL(app);

  /**
   * ------------------------------------
   * Fallback route (404)
   * ------------------------------------
   */
  app.use((req, _res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`) as any;
    error.statusCode = 404;
    next(error);
  });

  /**
   * ------------------------------------
   * Global error handler
   * ------------------------------------
   */
  app.use(errorMiddleware);

  logger.info("✅ Express application initialized");

  return app;
};

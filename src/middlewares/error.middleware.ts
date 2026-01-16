// ================================
// FILE: src/middlewares/error.middleware.ts
// ================================
/**
 * Global error handler (Production-grade)
 * - Normalizes all errors
 * - Prevents stack leaks in production
 * - Structured logging
 */

import { NextFunction, Request, Response } from "express";
import { MongoError } from "mongodb";
import { ZodError } from "zod";

import { env } from "@config/env.config";
import { logger } from "@logger/index";
import { AppError } from "@utils/AppError.util";

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = (err as AppError).statusCode || 500;

  // Structured log with request context
  logger.error(
    {
      err,
      requestId: (req as any).requestId,
      path: req.originalUrl,
      method: req.method,
      statusCode,
    },
    "Unhandled application error"
  );

  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // // ---------- Multer Errors ----------
  // if (err instanceof multer.MulterError) {
  //   // Type error
  //   if (err.code === "LIMIT_UNEXPECTED_FILE") {
  //     const _errors = [];

  //     if (err.field === "profilePicture") {
  //       _errors.push("Profile picture must be JPG, JPEG, or PNG.");
  //     }

  //     if (err.field === "introVideo") {
  //       _errors.push("Intro video must be MP4 or GIF.");
  //     }

  //     return res.status(400).json({
  //       success: false,
  //       message: "Invalid request data",
  //       errors: _errors,
  //     });
  //   }

  //   // Size error
  //   if (err.code === "LIMIT_FILE_SIZE") {
  //     const _errors = [];

  //     if (err.field === "profilePicture") {
  //       _errors.push("Profile picture must be smaller than 1MB.");
  //     }

  //     if (err.field === "introVideo") {
  //       _errors.push("Intro video must be smaller than 10MB.");
  //     }

  //     return res.status(413).json({
  //       success: false,
  //       message: "Invalid request data",
  //       errors: _errors,
  //     });
  //   }
  // }

  // ---------- Zod Validation Errors ----------
  if (err instanceof ZodError) {
    // Group errors by field (path)
    const formatted: Record<string, string> = {};

    for (const issue of err.issues) {
      const field = issue.path.join(".");

      // Only take the first error per field
      if (!formatted[field]) {
        formatted[field] = issue.message;
      }
    }

    // Convert to array format
    const errorArray = Object.entries(formatted).map(([path, message]) => ({
      path,
      message,
    }));

    return res.status(400).json({
      success: false,
      message: "Invalid request data",
      errors: errorArray,
    });
  }

  // ---------- Mongoose Duplicate Key Errors ----------
  if (
    err &&
    typeof err === "object" &&
    "code" in err &&
    (err as { code: number }).code === 11000
  ) {
    const mongoError = err as {
      code: number;
      keyPattern?: Record<string, unknown>;
    };
    const field = Object.keys(mongoError.keyPattern || {}).join(", ");
    return res.status(409).json({
      success: false,
      message: `Duplicate field value: ${field}. Please use another value.`,
    });
  }

  // ---------- Mongoose general Errors ----------
  if (err instanceof MongoError) {
    return res.status(500).json({
      success: false,
      message: "Database error occurred",
    });
  }

  // ---------- Generic Error Response ----------
  const response: Record<string, unknown> = {
    success: false,
    message:
      statusCode >= 500
        ? "Internal Server Error"
        : (err as Error).message || "Request failed",
  };

  // Expose extra error info only in non-production
  if (env.NODE_ENV !== "production") {
    response.details = (err as Error).message;
    response.stack = (err as Error).stack;
  }

  return res.status(statusCode).json(response);
};

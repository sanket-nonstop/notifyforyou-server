// ================================
// FILE: src/middlewares/rateLimit.middleware.ts
// ================================
/**
 * Rate Limiting Middleware (Production-grade)
 * - Redis-based distributed rate limiting
 * - Configurable per route
 * - Returns proper HTTP headers
 */

import { NextFunction, Request, Response } from "express";

import { getRedisClient } from "@core/redis";
import { AppError } from "@utils/AppError.util";

/* ----------------------------------
 * RATE LIMIT CONFIGURATION
 * ---------------------------------- */

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string; // Custom error message
  keyGenerator?: (req: Request) => string; // Custom key generator
}

/* ----------------------------------
 * RATE LIMIT MIDDLEWARE FACTORY
 * ---------------------------------- */

/**
 * Creates a rate limiting middleware with specified options
 */
export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    max,
    message = "Too many requests. Please try again later.",
    keyGenerator = (req: Request) => {
      // Default: use IP address
      return req.ip || req.socket.remoteAddress || "unknown";
    },
  } = options;

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const redisClient = getRedisClient();
      const key = `rateLimit:${keyGenerator(req)}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Get current count
      const count = await redisClient.incr(key);

      // Set expiration on first request
      if (count === 1) {
        await redisClient.pexpire(key, windowMs);
      }

      // Get TTL to calculate remaining time
      const ttl = await redisClient.pttl(key);
      const resetTime = now + ttl;

      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", max.toString());
      res.setHeader(
        "X-RateLimit-Remaining",
        Math.max(0, max - count).toString()
      );
      res.setHeader("X-RateLimit-Reset", new Date(resetTime).toISOString());

      // Check if limit exceeded
      if (count > max) {
        res.setHeader("Retry-After", Math.ceil(ttl / 1000).toString());
        throw new AppError(message, 429);
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        return next(error);
      }
      // On Redis error, allow request (fail open)
      next();
    }
  };
};

/* ----------------------------------
 * PRE-CONFIGURED RATE LIMITERS
 * ---------------------------------- */

/**
 * Signup rate limiter: 5 requests per 15 minutes
 */
export const signupRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: "Too many signup attempts. Please try again in 15 minutes.",
  keyGenerator: (req: Request) => {
    // Use IP + email if available
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const email = req.body?.email?.toLowerCase() || "";

    return email ? `${ip}:signup:${email}` : `${ip}:signup`;
  },
});

/**
 * Signin rate limiter: 10 requests per 15 minutes
 */
export const signinRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many signin attempts. Please try again in 15 minutes.",
  keyGenerator: (req: Request) => {
    // Use IP + identifier if available
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const identifier = req.body?.identifier?.toLowerCase() || "";
    return identifier ? `${ip}:signin:${identifier}` : `${ip}:signin`;
  },
});

/**
 * OTP verification rate limiter: 5 requests per 10 minutes
 */
export const otpVerificationRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message:
    "Too many OTP verification attempts. Please try again in 10 minutes.",
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const sessionToken =
      req.body?.sessionToken || req.query?.sessionToken || "";
    return `${ip}:otp:${sessionToken}`;
  },
});

/**
 * Password reset rate limiter: 3 requests per hour
 */
export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: "Too many password reset attempts. Please try again in 1 hour.",
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const identifier =
      req.body?.identifier?.toLowerCase() || req.body?.sessionToken || "";
    return identifier
      ? `${ip}:passwordReset:${identifier}`
      : `${ip}:passwordReset`;
  },
});

/**
 * General auth rate limiter: 10 requests per minute
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: "Too many requests. Please try again in a minute.",
});

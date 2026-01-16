// ================================
// FILE: src/config/env.config.ts
// ================================
/**
 * Environment Configuration (Production-grade)
 * - Centralized, typed access to environment variables
 * - Validates required variables at startup
 * - Prevents runtime undefined errors
 */

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Helper to require environment variables
 */
const required = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;

  if (value === undefined || value === "") {
    throw new Error(
      `❌ Environment variable ${key} is required but not defined.`
    );
  }

  return value;
};

/**
 * Helper to parse number env vars
 */
const number = (key: string, defaultValue?: number): number => {
  const raw = process.env[key];
  const value = raw !== undefined ? Number(raw) : defaultValue;

  if (value === undefined || Number.isNaN(value)) {
    throw new Error(`❌ Environment variable ${key} must be a valid number.`);
  }

  return value;
};

/**
 * Helper to parse boolean env vars
 */
const boolean = (key: string, defaultValue = false): boolean => {
  const raw = process.env[key];
  if (raw === undefined) return defaultValue;
  return raw === "true" || raw === "1";
};

/**
 * Application environment config
 */
export const env = {
  // --------------------------------
  // App
  // --------------------------------
  NODE_ENV: required("NODE_ENV", "development") as "development" | "production",
  PORT: number("PORT", 5000),

  // --------------------------------
  // CORS
  // --------------------------------
  CORS_ORIGIN: required("CORS_ORIGIN"),

  // --------------------------------
  // CLIENT BASE URLS
  // --------------------------------
  APP_CLIENT_BASE_URL: required("APP_CLIENT_BASE_URL"),

  // --------------------------------
  // MongoDB Atlas
  // --------------------------------
  MONGO_URI: required("MONGO_URI"),

  // --------------------------------
  // Redis
  // --------------------------------
  REDIS_URL: required("REDIS_URL"),

  // --------------------------------
  // JWT / Auth
  // --------------------------------
  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES_IN: required("JWT_ACCESS_EXPIRES_IN", "15m"),
  JWT_REFRESH_EXPIRES_IN: required("JWT_REFRESH_EXPIRES_IN", "7d"),

  // --------------------------------
  // Cloudinary
  // --------------------------------
  CLOUDINARY_CLOUD_NAME: required("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: required("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: required("CLOUDINARY_API_SECRET"),
  CLOUDINARY_FOLDER: required("CLOUDINARY_FOLDER", "app-media"),

  // --------------------------------
  // Gmail Service
  // --------------------------------
  SMTP_HOST: required("SMTP_HOST"),
  SMTP_PORT: required("SMTP_PORT"),
  SMTP_USER: required("SMTP_USER"),
  SMTP_PASS: required("SMTP_PASS"),
  SMTP_FROM: required("SMTP_FROM"),

  // --------------------------------
  // Twilio Service
  // --------------------------------
  TWILIO_ACCOUNT_SID: required("TWILIO_ACCOUNT_SID"),
  TWILIO_AUTH_TOKEN: required("TWILIO_AUTH_TOKEN"),
  TWILIO_FROM_NUMBER: required("TWILIO_FROM_NUMBER"),
};

/**
 * Freeze env to prevent runtime mutation
 */
Object.freeze(env);

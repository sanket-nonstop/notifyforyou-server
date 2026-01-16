// ==================================================
// FILE: src/config/app.config.ts
// ==================================================
/**
 * Application-level configuration
 * Controls general app behavior (NOT infra)
 */

export const appConfig = {
  /* ----------------------------------
   * Application
   * ---------------------------------- */
  APP_NAME: "NotifyForYou",
  APP_LOGO: "",
  API_VERSION: "v1",

  APP_CLIENT_ENDPOINTS: {
    VERIFY_EMAIL: "/auth/verify",
    PASSWORD_VERIFY: "/auth/reset-password",
  },

  /* ----------------------------------
   * Pagination
   * ---------------------------------- */
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  /* ----------------------------------
   * Media Upload Limits
   * ---------------------------------- */
  UPLOAD_LIMITS_MB: {
    IMAGE: 5,
    VIDEO: 20,
  },

  /* ----------------------------------
   * JWT & Session Expiry
   * ---------------------------------- */
  TOKEN_EXPIRY: {
    ACCESS: "15m", // short-lived
    EXPIRES_IN_SECONDS: 900, // 15 minutes
    REFRESH: "15d", // decided value
    SESSION_TTL_SECONDS: 1296000, // 15 days
  },

  /* ----------------------------------
   * OTP Configuration
   * ---------------------------------- */
  OTP: {
    SECRET: "4e8d756b8d4bca2d75b9b41061d20602def4012b",
    LENGTH: 6, // 6-digit OTP
    EXPIRES_IN_SECONDS: 600, // 10 minutes
    MAX_ATTEMPTS: 5,
    MAX_RESENDS: 3,
    SESSION_TTL_SECONDS: 86400, // 24 hours
  },

  /* ----------------------------------
   * Authentication Behavior Flags
   * ---------------------------------- */
  AUTH_FEATURES: {
    ENABLE_MULTI_DEVICE_LOGIN: true,
    ENABLE_INACTIVITY_LOGOUT: true,
    INACTIVITY_LOGOUT_DAYS: 7,

    ALLOW_LOGIN_BEFORE_EMAIL_VERIFIED: false,

    ENABLE_SMS_OTP: false, // FUTURE (email only for now)
  },

  /* ----------------------------------
   * Rate Limiting (Auth-sensitive)
   * ---------------------------------- */
  RATE_LIMIT: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 100,
  },
};

// ==========================================
// FILE: src/constants/enums.ts
// ==========================================
/**
 * System-wide Enums
 * -------------------------------------------------
 * Central place for all shared enums used across:
 * - Models (Mongoose)
 * - Services
 * - REST Controllers
 * - GraphQL schema/resolvers
 * - Zod validation
 *
 * NOTE:
 * Keep enum values stable once in production,
 * because they are stored in DB and used in clients.
 */

// =================================================
// Account / User
// =================================================
export enum AccountType {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

/**
 * Auth provider used during signup/signin
 */
export enum AuthProvider {
  LOCAL = "LOCAL",
  GOOGLE = "GOOGLE",
}

/**
 * Used when admin/super-admin performs any account action
 */
export enum AccountActionBy {
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

/**
 * Account status lifecycle
 * - ACTIVE: user can use platform
 * - SUSPENDED: temporarily disabled
 * - BLOCKED: restricted due to policy violation
 * - SOFT_DELETED: hidden but recoverable
 * - DELETED: permanently removed
 */
export enum AccountStatus {
  ACTIVE = "ACTIVE",

  // Suspensions
  SUSPENDED = "SUSPENDED",
  SUSPENDED_BY_ADMIN = "SUSPENDED_BY_ADMIN",
  SUSPENDED_BY_SUPER_ADMIN = "SUSPENDED_BY_SUPER_ADMIN",

  // Blocks
  BLOCKED_BY_ADMIN = "BLOCKED_BY_ADMIN",
  BLOCKED_BY_SUPER_ADMIN = "BLOCKED_BY_SUPER_ADMIN",

  // Deletions
  SOFT_DELETED = "SOFT_DELETED",
  DELETED = "DELETED",
  DELETED_BY_ADMIN = "DELETED_BY_ADMIN",
  DELETED_BY_SUPER_ADMIN = "DELETED_BY_SUPER_ADMIN",
}

// =================================================
// Auth Session
// =================================================
/**
 * Session type stored in Redis / DB to identify the flow
 */
export enum SessionType {
  SIGNUP_VERIFY = "SIGNUP_VERIFY",
  RESET_PASSWORD = "RESET_PASSWORD",
  SIGNIN = "SIGNIN",
  SOCIAL_LOGIN = "SOCIAL_SIGNIN",
}

/**
 * Session state lifecycle
 */
export enum SessionStatus {
  ACTIVE = "ACTIVE",
  USED = "USED",
  REVOKED = "REVOKED",
  EXPIRED = "EXPIRED",
}

// =================================================
// User Profile
// =================================================
export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

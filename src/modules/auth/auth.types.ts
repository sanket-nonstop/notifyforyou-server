// ==========================================
// FILE: src/rest/auth/auth.types.ts
// ==========================================
/**
 * Authentication types & contracts
 * Used by controller, service, validators
 */

import { DialCode } from "@constants/country.constants";
import { Gender, SessionType } from "@constants/enum.constants";
import { Types } from "mongoose";

/* =====================================================
 * AUTHENTICATION – DATA TRANSFER OBJECTS (DTOs)
 * ===================================================== */

/**
 * Signup Request Payload
 * Used to register a new user account
 */
export interface SignupInput {
  username: string;
  email: string;

  firstName?: string | undefined;
  lastName?: string | undefined;

  dialCode?: DialCode | undefined;
  phoneNumber?: string | undefined;

  // Optional uploaded media (already uploaded by middleware) - NOT saved directly to DB
  profilePicture?: File | undefined;
  coverPicture?: File | undefined;
  introVideo?: File | undefined;

  gender?: Gender | undefined;
  dateOfBirth?: Date | undefined;
  bio?: string | undefined;

  password: string;
}

/**
 * Validate Signup Session
 * Used to verify whether a signup session is still active
 */
export interface SignupValidateSessionInput {
  sessionToken: string;
}

/**
 * Resend Signup Verification OTP
 * Accepts either sessionToken or identifier
 */
export interface SignupResendVerificationInput {
  sessionToken?: string;
  identifier?: string;
}

/**
 * Verify Signup OTP
 * Confirms OTP against a valid signup session
 */
export interface SignupVerifyOtpInput {
  sessionToken: string;
  otp: string;
}

/**
 * Signin request
 */
export interface SigninInput {
  identifier: string; // email | username | phone
  password: string;
}

/**
 * Refresh access token
 */
export interface RefreshTokenInput {
  refreshToken: string;
}

/**
 * Forgot Password OTP
 * Accepts either sessionToken or identifier
 */
export interface ForgotPasswordInput {
  sessionToken?: string;
  identifier?: string;
}

/**
 * Validate Forgot Password Session
 * Used to verify whether a forgot password session is still active
 */
export interface ForgotPasswordValidateSessionInput {
  sessionToken: string;
}

/**
 * Resend Password
 * Confirms OTP against a valid Resent link
 */
export interface ResetPasswordInput {
  sessionToken: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Logout Input
 * Logs out current session
 */
export interface LogoutInput {
  sessionId: string;
  userId: string;
}

/**
 * Logout All Input
 * Logs out all user sessions
 */
export interface LogoutAllInput {
  userId: string;
}

/* ----------------------------------
 * RESPONSE TYPES
 * ---------------------------------- */

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/* ----------------------------------
 * REDIS SESSION TYPES
 * ---------------------------------- */

/**
 * Base Redis auth session
 * Stored as JSON in Redis
 */
export interface RedisAuthSession {
  type: SessionType;

  email?: string | undefined;
  phoneNumber?: string | undefined;
  username?: string | undefined;
  userId?: Types.ObjectId | string | undefined;

  otp?: string | undefined;
  otpHash?: string | undefined;
  otpExpiresAt?: number | undefined;
  otpAttempts?: number | undefined;
  otpResendCount?: number | undefined;

  used: boolean;
  verified: boolean;

  lastActivityAt?: number; // for inactivity logout
  createdAt: number;
}

/* ----------------------------------
 * JWT PAYLOAD TYPES
 * ---------------------------------- */

/**
 * Access token payload
 * Short-lived
 */
export interface AccessTokenPayload {
  sub: string; // userId
  sessionId: string;
  type: "ACCESS";
}

/**
 * Refresh token payload
 * Long-lived
 */
export interface RefreshTokenPayload {
  sub: string; // userId
  sessionId: string;
  type: "REFRESH";
}

/* ----------------------------------
 * INTERNAL SERVICE TYPES
 * ---------------------------------- */

/**
 * Normalized identifier
 */
export interface NormalizedIdentifier {
  type: "email" | "username" | "phone";
  value: string;
}

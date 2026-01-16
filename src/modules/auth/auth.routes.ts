// ================================
// FILE: src/rest/auth/auth.module.ts
// ================================
/**
 * REST Module Entry (Production-grade)
 * - Exposes REST endpoints (Auth + system only)
 * - Versioned routing
 * - Central place to register Auth REST routes
 */

import {
  otpVerificationRateLimiter,
  passwordResetRateLimiter,
  signinRateLimiter,
  signupRateLimiter,
} from "@middlewares/rateLimit.middleware";
import { validatorMiddleware } from "@middlewares/validator.middleware";
import { Router } from "express";
import { AuthController } from "./auth.controller";
import { signinValidator, signupValidator } from "./auth.validator";

// Route versioning
const router = Router();

/**
 * Signup & Verification email
 */
router.post(
  "/signup",
  validatorMiddleware(signupValidator),
  signupRateLimiter,
  AuthController.signupController
);
router.post(
  "/signup/validate-session",
  AuthController.signupValidateSessionController
);
router.post(
  "/signup/resend-verification",
  signupRateLimiter,
  AuthController.signupResendVerificationController
);
router.post(
  "/signup/verify-otp",
  otpVerificationRateLimiter,
  AuthController.signupVerifyOtpController
);

/**
 * Signin & Refresh token
 */
router.post(
  "/signin",
  validatorMiddleware(signinValidator),
  signinRateLimiter,
  AuthController.signinController
);
router.post("/token/refresh", AuthController.refreshAccessTokenController);
router.post(
  "/token/refresh/rotate",
  AuthController.rotateRefreshTokenController
);

/**
 * Forgot password
 */
router.post(
  "/password/forgot",
  passwordResetRateLimiter,
  AuthController.forgotPasswordController
);
router.post(
  "/password/forgot/validate-session",
  AuthController.validateForgotPasswordSessionController
);
router.post(
  "/password/forgot/resend-otp",
  passwordResetRateLimiter,
  AuthController.forgotResendPasswordController
);
router.post(
  "/password/reset",
  otpVerificationRateLimiter,
  AuthController.resetPasswordController
);

// router.post("/logout", authenticate, AuthController.logoutController);
// router.post("/logout/all", authenticate, AuthController.logoutAllController);

export default router;

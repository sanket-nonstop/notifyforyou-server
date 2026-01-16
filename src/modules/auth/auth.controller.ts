// ==========================================
// FILE: src/rest/auth/auth.controller.ts
// ==========================================
/**
 * Authentication Service
 * ------------------------------------------
 * Validations for services
 * - Signup
 * - OTP verification
 * - Signin
 * - Token refresh
 * - Forgot / Reset password
 * - Logout (single & all devices)
 */

import { AppError } from "@utils/AppError.util";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import {
  ForgotPasswordInput,
  SignupResendVerificationInput,
} from "./auth.types";
import {
  identifierValidator,
  refreshTokenValidator,
  resetPasswordValidator,
  sessionTokenBodyOrQueryValidator,
  sessionTokenValidator,
  signupVerifyOtpValidator,
} from "./auth.validator";

export class AuthController {
  /**
   * POST /auth/signup
   */
  static async signupController(req: Request, res: Response) {
    // 1. Call Service
    const result = await AuthService.signupService(req.body);

    // 2. Respond
    res.status(201).json({
      success: true,
      message:
        "Your account has been created. A verification code has been sent to your email. Please verify to continue.",
      data: result,
    });
  }

  /**
   * POST /auth/signup/validate-session
   */
  static async signupValidateSessionController(req: Request, res: Response) {
    // 1. Validate request
    const parsedData = sessionTokenBodyOrQueryValidator.parse({
      sessionToken: req.body?.sessionToken || req.query?.sessionToken,
    });

    // 2. Call Service
    const result = await AuthService.signupValidateSessionService({
      sessionToken: parsedData.sessionToken!,
    });

    // 3. Respond
    res.status(200).json({
      success: true,
      message: "Verification session is valid.",
      data: result,
    });
  }

  /**
   * POST /auth/signup/resend-verification
   */
  static async signupResendVerificationController(req: Request, res: Response) {
    // 1. Validate request
    const parsedData: SignupResendVerificationInput = {};

    const _query = req.query || {};
    const _body = req.body || {};

    if ("sessionToken" in _body || "sessionToken" in _query) {
      const sessionToken = sessionTokenValidator.parse(
        _body.sessionToken || _query.sessionToken
      );

      parsedData.sessionToken = sessionToken;
    } else if ("identifier" in _body) {
      const identifier = identifierValidator.parse(_body.identifier);

      parsedData.identifier = identifier;
    } else {
      throw new AppError(
        "Please provide a session token or a valid email, username, or phone number as a identifier.",
        400
      );
    }

    // 2. Call Service
    const result = await AuthService.signupResendVerificationService(
      parsedData
    );

    // 3. Respond
    res.status(200).json({
      success: true,
      message:
        "A new verification code has been sent. Please check your email.",
      data: result,
    });
  }

  /**
   * POST /auth/signup/verify-otp
   */
  static async signupVerifyOtpController(req: Request, res: Response) {
    // 1. Validate request
    const parsedData = signupVerifyOtpValidator.parse({
      sessionToken: req.body?.sessionToken || req.query?.sessionToken,
      otp: req.body?.otp,
    });

    // 2. Call Service
    await AuthService.signupVerifyOtpService(parsedData);

    // 3. Respond
    res.status(200).json({
      success: true,
      message: "Account verified successfully. You can now log in.",
      data: null,
    });
  }

  /**
   * Signin
   */
  static async signinController(req: Request, res: Response) {
    // 1. Call Service
    const result = await AuthService.signinService(req.body);

    // 2. Respond
    res.status(200).json({
      success: true,
      message: "Signed in successfully.",
      data: result,
    });
  }

  /**
   * Refresh Access Token
   */
  static async refreshAccessTokenController(req: Request, res: Response) {
    // 1. Validate request
    const parsedData = refreshTokenValidator.parse(req.body || req.query || {});

    // 2. Call Service
    const result = await AuthService.refreshAccessTokenService(
      parsedData.refreshToken
    );

    // 3. Respond
    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully.",
      data: result,
    });
  }

  /**
   * Rotate Refresh Token
   */
  static async rotateRefreshTokenController(req: Request, res: Response) {
    // 1. Validate request
    const input = refreshTokenValidator.parse(req.body);

    // 2. Call Service
    const result = await AuthService.rotateRefreshTokenService(
      input.refreshToken
    );

    // 3. Respond
    res.status(200).json({
      success: true,
      message: "Session refreshed successfully.",
      data: result,
    });
  }

  /**
   * Forgot Password
   */
  static async forgotPasswordController(req: Request, res: Response) {
    // 1. Validate request
    const identifier = identifierValidator.parse(req.body?.identifier);

    // 2. Call Service
    const result = await AuthService.forgotPasswordService({ identifier });

    // 3. Respond
    res.status(200).json({
      success: true,
      message:
        "If an account exists with the provided identifier, a verification code has been sent.",
      data: result,
    });
  }

  /**
   * Forgot Resend Password
   */
  static async forgotResendPasswordController(req: Request, res: Response) {
    // 1. Validate request
    const parsedData: ForgotPasswordInput = {};

    const _query = req.query || {};
    const _body = req.body || {};

    if ("sessionToken" in _body || "sessionToken" in _query) {
      const sessionToken = sessionTokenValidator.parse(
        _body.sessionToken || _query.sessionToken
      );

      parsedData.sessionToken = sessionToken;
    } else if ("identifier" in _body) {
      const identifier = identifierValidator.parse(_body.identifier);

      parsedData.identifier = identifier;
    } else {
      throw new AppError(
        "Please provide a session token or a valid email, username, or phone number as a identifier.",
        400
      );
    }

    // 2. Call Service
    const result = await AuthService.forgotPasswordService(parsedData);

    // 3. Respond
    res.status(200).json({
      success: true,
      message:
        "If an account exists with the provided identifier, a verification code has been sent.",
      data: result,
    });
  }

  /**
   * Validate Forgot Password Session
   */
  static async validateForgotPasswordSessionController(
    req: Request,
    res: Response
  ) {
    // 1. Validate request
    const parsedData = sessionTokenBodyOrQueryValidator.parse({
      sessionToken: req.body?.sessionToken || req.query?.sessionToken,
    });

    // 2. Call Service
    const result = await AuthService.validateForgotPasswordSessionService({
      sessionToken: parsedData.sessionToken!,
    });

    // 3. Respond
    res.status(200).json({
      success: true,
      message: "Password reset session is valid.",
      data: result,
    });
  }

  /**
   * Reset Password
   */
  static async resetPasswordController(req: Request, res: Response) {
    // 1. Validate request
    const input = resetPasswordValidator.parse({
      ...(req.body || {}),
      sessionToken: req.body?.sessionToken || req.query?.sessionToken,
    });

    // 2. Call Service
    await AuthService.resetPasswordService(input);

    // 3. Respond
    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now sign in.",
      data: null,
    });
  }

  /**
   * Logout - Logout current session
   */
  static async logoutController(req: Request, res: Response) {
    // Session ID and user ID should come from authenticated request
    // This will be set by auth middleware
    const sessionId = (req as any).sessionId;
    const userId = (req as any).userId;

    if (!sessionId || !userId) {
      throw new AppError("Authentication required.", 401);
    }

    // Call Service
    await AuthService.logoutService({ sessionId, userId });

    // Respond
    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
      data: null,
    });
  }

  /**
   * Logout All - Logout all user sessions
   */
  static async logoutAllController(req: Request, res: Response) {
    // User ID should come from authenticated request
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError("Authentication required.", 401);
    }

    // Call Service
    await AuthService.logoutAllSessionsService({ userId });

    // Respond
    res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully.",
      data: null,
    });
  }
}

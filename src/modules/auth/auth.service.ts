// ==========================================
// FILE: src/rest/auth/auth.service.ts
// ==========================================
/**
 * Authentication Service
 * ------------------------------------------
 * Core business logic for authentication
 * - Signup
 * - OTP verification
 * - Signin
 * - Token refresh
 * - Forgot / Reset password
 * - Logout (single & all devices)
 */

import { v4 as uuidv4 } from "uuid";

import { generateOtp, hashOtp, verifyOtp } from "@utils/otp.util";

import { hashPassword, verifyPassword } from "@utils/password.util";

import { appConfig } from "@config/app.config";
import {
  AccountStatus,
  AuthProvider,
  SessionType,
} from "@constants/enum.constants";
import { getRedisClient } from "@core/redis";
import { IUser, UserModel } from "@models/User.model";
import { AppError } from "@utils/AppError.util";
import {
  cleanObject,
  formatRemainingTime,
  removeDuplicates,
} from "@utils/index";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@utils/token.util";
import {
  sendForgotPasswordEmail,
  sendResendVerificationEmail,
  sendResetPasswordSuccessEmail,
  sendSignupVerificationEmail,
  sendVerificationConfirmedEmail,
} from "helpers/email";
import {
  AuthTokens,
  ForgotPasswordInput,
  LogoutAllInput,
  LogoutInput,
  RedisAuthSession,
  ResetPasswordInput,
  SigninInput,
  SignupInput,
  SignupResendVerificationInput,
  SignupValidateSessionInput,
  SignupVerifyOtpInput,
} from "./auth.types";

/* ----------------------------------
 * INTERNAL HELPERS
 * ---------------------------------- */

const getSessionKey = (sessionId: string) => `auth:session:${sessionId}`;
const getUserAccountKey = (userKey: string) => `auth:signup:${userKey}`;
const getUserForgotKey = (userKey: string) => `auth:forgot:${userKey}`;
const getUserSessionsKey = (userId: string) => `auth:user:${userId}:sessions`;

/* ----------------------------------
 * AUTH SERVICE
 * ---------------------------------- */

export class AuthService {
  /**
   * SIGNUP SERVICE - Creates a user and initiates signup verification flow
   */
  static async signupService(
    input: SignupInput
  ): Promise<{ sessionToken: string }> {
    /* =====================================================
     * 1️⃣ Ensure account does not already exist
     * ===================================================== */
    const orConditions: any[] = [{ email: input.email }];

    if (input.username) orConditions.push({ username: input.username });
    if (input.phoneNumber)
      orConditions.push({ phoneNumber: input.phoneNumber });

    const existingUser = await UserModel.findOne({
      $or: orConditions,
    }).lean();

    if (existingUser) {
      throw new AppError(
        "An account already exists with the provided credentials.",
        409 // Conflict
      );
    }

    /* =====================================================
     * 2️⃣ & 3️⃣ Securely hash user password and Persist user record
     * Only validated & cleaned fields are stored
     * ===================================================== */
    const passwordHash = await hashPassword(input.password);

    const payload = cleanObject({
      username: input.username,
      firstName: input.firstName,
      lastName: input.lastName,

      email: input.email,

      dialCode: input.dialCode,
      phoneNumber: input.phoneNumber,

      gender: input.gender,
      dateOfBirth: input.dateOfBirth,
      bio: input.bio,

      password: passwordHash,
    });

    const user = await UserModel.create(payload);

    const sessionId = uuidv4();
    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    /* =====================================================
     * 4️⃣ Initialize signup verification session (Redis)
     * ===================================================== */
    const redisTransaction = getRedisClient()?.multi();

    // Map identifiers → session for quick lookup
    removeDuplicates([user.email, user.phoneNumber, user.username]).map((x) => {
      if (x) {
        redisTransaction.setex(
          getUserAccountKey(x),
          appConfig.OTP.SESSION_TTL_SECONDS,
          sessionId
        );
      }
    });

    /* =====================================================
     * 5️⃣ Generate and store OTP session data
     * ===================================================== */
    const session: RedisAuthSession = {
      type: SessionType.SIGNUP_VERIFY,

      email: user.email,
      phoneNumber: user.phoneNumber,
      username: user.username,
      userId: user._id,

      otp,
      otpHash,
      otpExpiresAt: Date.now() + appConfig.OTP.EXPIRES_IN_SECONDS * 1000,
      otpAttempts: 0,
      otpResendCount: 0,

      used: false,
      verified: false,

      createdAt: Date.now(),
    };

    redisTransaction.setex(
      getSessionKey(sessionId),
      appConfig.OTP.SESSION_TTL_SECONDS,
      JSON.stringify(session)
    );

    await redisTransaction.exec();

    /* =====================================================
     * 6️⃣ Dispatch verification OTP
     * ===================================================== */
    if (user.email) {
      sendSignupVerificationEmail({
        email: user.email,
        otp,
        sessionId,
      });
    }

    return { sessionToken: sessionId };
  }

  /**
   * SIGNUP SESSION VALIDATION SERVICE - Validates whether a signup verification session is active
   */
  static async signupValidateSessionService(
    input: SignupValidateSessionInput
  ): Promise<{ email?: string; phoneNumber?: string; username?: string }> {
    /* =====================================================
     * 1️⃣ Fetch signup verification session from Redis
     * ===================================================== */
    const redisKey = getSessionKey(input.sessionToken);
    const sessionData = await getRedisClient().get(redisKey);

    if (!sessionData) {
      throw new AppError(
        "Verification session has expired. Please request a new verification code.",
        410 // Gone
      );
    }

    /* =====================================================
     * 2️⃣ Ensure session type is valid for signup verification
     * ===================================================== */
    const session: RedisAuthSession = JSON.parse(sessionData);

    if (session.type !== SessionType.SIGNUP_VERIFY) {
      throw new AppError("Invalid verification session token.", 400);
    }

    if (!session.otpExpiresAt || Date.now() > session.otpExpiresAt) {
      throw new AppError(
        "Verification session token is invalid. Please request a new verification code.",
        410
      );
    }

    const filteredData = cleanObject({
      email: session.email,
      phoneNumber: session.email ? undefined : session.phoneNumber,
      username:
        session.email || session.phoneNumber ? undefined : session.username,
    });

    return filteredData;
  }

  /**
   * SIGNUP OTP RESEND SERVICE - Resends OTP for an active signup verification session
   */
  static async signupResendVerificationService(
    input: SignupResendVerificationInput
  ): Promise<{ sessionToken: string }> {
    let sessionId: string | null = null;
    let session: RedisAuthSession | null = null;

    const redisClient = getRedisClient();

    /* =====================================================
     * 1️⃣ Resolve existing session via sessionToken
     * ===================================================== */
    if (input.sessionToken) {
      const redisKey = getSessionKey(input.sessionToken);
      const sessionData = await redisClient.get(redisKey);

      if (!sessionData) {
        throw new AppError(
          "Verification session has expired. Please request a new code.",
          410 // Gone
        );
      }

      sessionId = input.sessionToken;
      session = JSON.parse(sessionData);
    }

    /* =====================================================
     * 2️⃣ Resolve session via identifier (email / username / phone)
     * ===================================================== */
    if (!session && input.identifier) {
      const redisUserKey = getUserAccountKey(input.identifier);
      const storedSessionId = await redisClient.get(redisUserKey);

      if (storedSessionId) {
        const redisSessionKey = getSessionKey(storedSessionId);
        const sessionData = await redisClient.get(redisSessionKey);

        if (sessionData) {
          sessionId = storedSessionId;
          session = JSON.parse(sessionData);
        }
      }
    }

    /* =====================================================
     * 3️⃣ Validate resolved session (if present)
     * ===================================================== */
    if (session) {
      if (session.type !== SessionType.SIGNUP_VERIFY) {
        throw new AppError("Invalid verification session.", 400);
      }

      /* =====================================================
       * 3️⃣.1️⃣ Enforce resend limit
       * ===================================================== */
      session.otpResendCount = (session.otpResendCount ?? 0) + 1;

      let remainingMs: number | undefined;
      if (session.createdAt) {
        const createdAtMs = new Date(session.createdAt).getTime();
        const expiryMs = createdAtMs + appConfig.OTP.EXPIRES_IN_SECONDS * 1000;
        remainingMs = Math.max(expiryMs - Date.now(), 0);
      }

      const retryAfter = formatRemainingTime(remainingMs || 0);

      if (session.otpResendCount > appConfig.OTP.MAX_RESENDS) {
        if (remainingMs) {
          throw new AppError(
            retryAfter
              ? `OTP resend limit reached. Try again after ${retryAfter}.`
              : "OTP resend limit reached. Please try again later.",
            429 // Too Many Requests
          );
        }

        session.otpResendCount = 1;
      }
    }

    const redisTransaction = redisClient.multi();

    /* =====================================================
     * 4️⃣ No active session → fallback to DB validation
     * ===================================================== */
    let user: IUser | null = null;

    if (!session) {
      if (!input.identifier) {
        throw new AppError(
          "An email, username, or phone number is required.",
          400 // Bad Request
        );
      }

      user = await UserModel.findOne({
        $or: [
          { email: input.identifier.toLowerCase() },
          { username: input.identifier },
          { phoneNumber: input.identifier },
        ],
      })
        .select("+status +statusMeta")
        .lean();

      if (!user) {
        throw new AppError(
          "No account found with the provided identifier.",
          404 // Not Found
        );
      }

      if (user.status !== AccountStatus.ACTIVE || user.statusMeta) {
        throw new AppError(
          "Your account is not active. Please contact support.",
          403 // Forbidden
        );
      }

      if (user.emailIsVerified) {
        throw new AppError(
          "This account is already verified.",
          409 // Conflict
        );
      }
    }

    /* =====================================================
     * 5️⃣ Generate SessionID and update OTP session
     * ===================================================== */
    if (sessionId) redisClient.del(getSessionKey(sessionId));

    // Create new session ID
    const newSessionId: string = uuidv4();

    // Map identifiers → session for quick lookup
    removeDuplicates([
      input.identifier,
      session?.email,
      user?.email,
      session?.phoneNumber,
      user?.phoneNumber,
      session?.username,
      user?.username,
    ]).map((x) => {
      if (x) {
        redisTransaction.setex(
          getUserAccountKey(x),
          appConfig.OTP.SESSION_TTL_SECONDS,
          newSessionId
        );
      }
    });

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    const updatedSession: RedisAuthSession = {
      type: session?.type || SessionType.SIGNUP_VERIFY,

      email: session?.email || user?.email,
      phoneNumber: session?.phoneNumber || user?.phoneNumber,
      username: session?.username || user?.username,
      userId: session?.userId || user?._id,

      otp,
      otpHash,
      otpExpiresAt: Date.now() + appConfig.OTP.EXPIRES_IN_SECONDS * 1000,
      otpAttempts: session?.otpAttempts || 0,
      otpResendCount: session?.otpResendCount || 1,

      used: false,
      verified: false,

      createdAt: Date.now(),
    };

    /* =====================================================
     * 6️⃣ Persist session (same Redis key)
     * ===================================================== */
    redisTransaction.setex(
      getSessionKey(newSessionId),
      appConfig.OTP.SESSION_TTL_SECONDS,
      JSON.stringify(updatedSession)
    );

    await redisTransaction.exec();

    /* =====================================================
     * 7️⃣ Dispatch verification OTP
     * ===================================================== */
    if (updatedSession.email) {
      sendResendVerificationEmail({
        email: updatedSession.email,
        otp,
        sessionId: newSessionId,
      });
    }

    return { sessionToken: newSessionId };
  }

  /**
   * SIGNUP OTP VERIFICATION SERVICE - Verifies OTP and activates user email
   */
  static async signupVerifyOtpService(input: SignupVerifyOtpInput) {
    const redisClient = getRedisClient();

    /* =====================================================
     * 1️⃣ Retrieve verification session from Redis
     * ===================================================== */
    const redisKey = getSessionKey(input.sessionToken);
    const sessionData = await redisClient.get(redisKey);

    if (!sessionData) {
      throw new AppError(
        "Verification session has expired. Please request a new code.",
        410 // Gone
      );
    }

    const session: RedisAuthSession = JSON.parse(sessionData);

    /* =====================================================
     * 2️⃣ Validate session type
     * ===================================================== */
    if (session.type !== SessionType.SIGNUP_VERIFY) {
      throw new AppError("Invalid verification session.", 400);
    }

    // /* =====================================================
    //  * 3️⃣ Validate OTP expiration
    //  * ===================================================== */
    // if (!session.otpExpiresAt || Date.now() > session.otpExpiresAt) {
    //   throw new AppError(
    //     "Verification code has expired. Please request a new one.",
    //     410 // Gone
    //   );
    // }

    // /* =====================================================
    //  * 3️⃣.1️⃣ Check and increment OTP attempt counter
    //  * ===================================================== */
    // session.otpAttempts = (session.otpAttempts || 0) + 1;

    // if (session.otpAttempts > appConfig.OTP.MAX_ATTEMPTS) {
    //   throw new AppError(
    //     "Maximum OTP verification attempts exceeded. Please request a new code.",
    //     429 // Too Many Requests
    //   );
    // }

    // // Update session with incremented attempts
    // await redisClient.setex(
    //   redisKey,
    //   appConfig.OTP.SESSION_TTL_SECONDS,
    //   JSON.stringify(session)
    // );

    /* =====================================================
     * 4️⃣ Validate OTP value
     * ===================================================== */
    const isValidOtp = verifyOtp(input.otp, session.otpHash || "");
    if (!isValidOtp) throw new AppError("Invalid verification code.", 400);

    /* =====================================================
     * 5️⃣ Mark user email as verified
     * ===================================================== */
    const updatedUser = await UserModel.findByIdAndUpdate(
      session.userId,
      { $set: { emailIsVerified: true } },
      { new: true }
    ).lean();

    if (!updatedUser) {
      throw new AppError(
        "Verification session is no longer valid. Please request a new code.",
        410 // Gone
      );
    }

    /* =====================================================
     * 6️⃣ Clean up verification session data (Redis)
     * ===================================================== */
    const redisTransaction = redisClient.multi();

    if (updatedUser.email) {
      redisTransaction.del(getUserAccountKey(updatedUser.email));
    }
    if (updatedUser.phoneNumber) {
      redisTransaction.del(getUserAccountKey(updatedUser.phoneNumber));
    }
    if (updatedUser.username) {
      redisTransaction.del(getUserAccountKey(updatedUser.username));
    }

    redisTransaction.del(redisKey);

    await redisTransaction.exec();

    /* =====================================================
     * 7️⃣ Send verification confirmation notification
     * ===================================================== */
    if (updatedUser?.email) {
      sendVerificationConfirmedEmail(updatedUser.email);
    }

    return;
  }

  /**
   * SIGNIN SERVICE - Authenticates user and issues access & refresh tokens
   */
  static async signinService(
    input: SigninInput
  ): Promise<{ user: IUser; tokens: AuthTokens }> {
    /* =====================================================
     * 1️⃣ Resolve user by identifier (email / username / phone)
     * ===================================================== */
    const user = await UserModel.findOne({
      $or: [
        { email: input.identifier.toLowerCase() },
        { username: input.identifier },
        { phoneNumber: input.identifier },
      ],
    }).select("+password +provider +status +statusMeta");

    if (!user) throw new AppError("Invalid credentials.", 401);

    /* =====================================================
     * 2️⃣ Ensure local authentication is allowed
     * ===================================================== */
    if (user.provider !== AuthProvider.LOCAL) {
      throw new AppError(
        "This account uses social login. Please sign in with the appropriate provider.",
        400 // Bad Request
      );
    }

    /* =====================================================
     * 3️⃣ Enforce account verification & status
     * ===================================================== */
    if (!user.emailIsVerified) {
      throw new AppError(
        "Please verify your email address before signing in.",
        403 // Forbidden
      );
    }

    if (user.status !== AccountStatus.ACTIVE || user.statusMeta) {
      throw new AppError(
        "Your account is not active. Please contact support.",
        403 // Forbidden
      );
    }

    /* =====================================================
     * 4️⃣ Validate user password
     * ===================================================== */
    const isValidPassword = await verifyPassword(
      input.password,
      user.password!
    );

    if (!isValidPassword) throw new AppError("Invalid credentials.", 401);

    /* ----------------------------------
     * 3️⃣ Create auth session (Redis)
     * ---------------------------------- */
    const sessionId = uuidv4();

    const session: RedisAuthSession = {
      type: SessionType.SIGNIN,

      email: user.email,
      username: user.username,
      phoneNumber: user.phoneNumber,
      userId: user.id,

      verified: true,
      used: false,

      lastActivityAt: Date.now(),
      createdAt: Date.now(),
    };

    const redisTransaction = getRedisClient().multi();

    // Store Refresh session
    redisTransaction.setex(
      getSessionKey(sessionId),
      appConfig.TOKEN_EXPIRY.SESSION_TTL_SECONDS,
      JSON.stringify(session)
    );

    // Track session in user's sessions set
    redisTransaction.sadd(getUserSessionsKey(user.id), sessionId);
    redisTransaction.expire(
      getUserSessionsKey(user.id),
      appConfig.TOKEN_EXPIRY.SESSION_TTL_SECONDS
    );

    await redisTransaction.exec();

    /* =====================================================
     * 6️⃣ Issue access & refresh tokens
     * ===================================================== */
    const accessToken = generateAccessToken({
      sub: user.id,
      sessionId,
      type: "ACCESS",
    });

    const refreshToken = generateRefreshToken({
      sub: user.id,
      sessionId,
      type: "REFRESH",
    });

    return { user, tokens: { accessToken, refreshToken } };
  }

  /**
   * REFRESH ACCESS TOKEN SERVICE - Issues a new access token using a valid refresh token
   */
  static async refreshAccessTokenService(
    refreshToken: string
  ): Promise<{ newAccessToken: string }> {
    /* =====================================================
     * 1️⃣ Validate refresh token and extract payload
     * ===================================================== */
    const payload = verifyRefreshToken(refreshToken);

    if (payload.type !== "REFRESH") {
      throw new AppError("Invalid refresh token.", 401);
    }

    /* =====================================================
     * 2️⃣ Resolve authentication session from Redis
     * ===================================================== */
    const redisClient = getRedisClient();
    const redisKey = getSessionKey(payload.sessionId);

    const sessionData = await redisClient.get(redisKey);

    if (!sessionData) {
      throw new AppError(
        "Session has expired. Please sign in again.",
        401 // Unauthorized
      );
    }

    const session: RedisAuthSession = JSON.parse(sessionData);

    /* =====================================================
     * 3️⃣ Enforce inactivity-based logout (if enabled)
     * ===================================================== */

    if (
      appConfig.AUTH_FEATURES.ENABLE_INACTIVITY_LOGOUT &&
      session.lastActivityAt &&
      Date.now() - session.lastActivityAt >
        appConfig.AUTH_FEATURES.INACTIVITY_LOGOUT_DAYS * 24 * 60 * 60 * 1000
    ) {
      throw new AppError(
        "Session expired due to inactivity. Please sign in again.",
        401 // Unauthorized
      );
    }

    /* =====================================================
     * 4️⃣ Update session activity timestamp
     * ===================================================== */
    session.lastActivityAt = Date.now();

    await redisClient.setex(
      redisKey,
      appConfig.TOKEN_EXPIRY.SESSION_TTL_SECONDS,
      JSON.stringify(session)
    );

    /* =====================================================
     * 5️⃣ Issue new access token
     * ===================================================== */
    const newAccessToken = generateAccessToken({
      sub: payload.sub,
      sessionId: payload.sessionId,
      type: "ACCESS",
    });

    return { newAccessToken };
  }

  /**
   * ROTATE REFRESH TOKEN SERVICE - Invalidates the old session and issues a new token pair
   */
  static async rotateRefreshTokenService(
    refreshToken: string
  ): Promise<{ newAccessToken: string; newRefreshToken: string }> {
    /* =====================================================
     * 1️⃣ Validate refresh token and extract payload
     * ===================================================== */
    const payload = verifyRefreshToken(refreshToken);

    if (payload.type !== "REFRESH") {
      throw new AppError(
        "Invalid refresh token.",
        401 // Unauthorized
      );
    }

    /* =====================================================
     * 2️⃣ Resolve existing session from Redis
     * ===================================================== */
    const redisClient = getRedisClient();
    const oldKey = getSessionKey(payload.sessionId);

    const sessionData = await redisClient.get(oldKey);

    if (!sessionData) {
      throw new AppError(
        "Session has expired. Please sign in again.",
        401 // Unauthorized
      );
    }

    const oldSession: RedisAuthSession = JSON.parse(sessionData);

    /* =====================================================
     * 3️⃣ Create a new authenticated session
     * ===================================================== */
    const newSessionId = uuidv4();

    const newSession: RedisAuthSession = {
      ...oldSession,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
    };

    const userId = oldSession.userId?.toString() || payload.sub;

    const redisTransaction = redisClient.multi();

    // Store new session
    redisTransaction.setex(
      getSessionKey(newSessionId),
      appConfig.TOKEN_EXPIRY.REFRESH,
      JSON.stringify(newSession)
    );

    // Add new session to user's sessions set
    redisTransaction.sadd(getUserSessionsKey(userId), newSessionId);
    redisTransaction.expire(
      getUserSessionsKey(userId),
      appConfig.TOKEN_EXPIRY.REFRESH
    );

    /* =====================================================
     * 4️⃣ Invalidate previous session
     * ===================================================== */
    redisTransaction.del(oldKey);
    redisTransaction.srem(getUserSessionsKey(userId), payload.sessionId);

    await redisTransaction.exec();

    /* =====================================================
     * 5️⃣ Issue new access & refresh tokens
     * ===================================================== */
    const newAccessToken = generateAccessToken({
      sub: payload.sub,
      sessionId: newSessionId,
      type: "ACCESS",
    });

    const newRefreshToken = generateRefreshToken({
      sub: payload.sub,
      sessionId: newSessionId,
      type: "REFRESH",
    });

    return {
      newAccessToken,
      newRefreshToken,
    };
  }

  /**
   * FORGOT PASSWORD SERVICE - Initiates or reuses a password reset verification session
   */
  static async forgotPasswordService(
    input: ForgotPasswordInput
  ): Promise<{ sessionToken: string }> {
    let sessionId: string | null = null;
    let session: RedisAuthSession | null = null;

    const redisClient = getRedisClient();

    /* =====================================================
     * 1️⃣ Resolve existing reset session via sessionToken
     * ===================================================== */
    if (input.sessionToken) {
      const redisKey = getSessionKey(input.sessionToken);
      const sessionData = await redisClient.get(redisKey);

      if (!sessionData) {
        throw new AppError(
          "Password reset session has expired. Please request a new code.",
          410 // Gone
        );
      }

      sessionId = input.sessionToken;
      session = JSON.parse(sessionData);
    }

    /* =====================================================
     * 2️⃣ Resolve session via identifier (email / username / phone)
     * ===================================================== */
    if (!session && input.identifier) {
      const redisUserKey = getUserForgotKey(input.identifier);
      const storedSessionId = await redisClient.get(redisUserKey);

      if (storedSessionId) {
        const redisSessionKey = getSessionKey(storedSessionId);
        const sessionData = await redisClient.get(redisSessionKey);

        if (sessionData) {
          sessionId = storedSessionId;
          session = JSON.parse(sessionData);
        }
      }
    }

    /* =====================================================
     * 3️⃣ Validate resolved session (if present)
     * ===================================================== */
    if (session) {
      if (session.type !== SessionType.RESET_PASSWORD) {
        throw new AppError("Invalid password reset session.", 400);
      }

      /* -----------------------------------------------------
       * Enforce OTP resend rate limit
       * ----------------------------------------------------- */
      session.otpResendCount = (session.otpResendCount ?? 0) + 1;

      let remainingMs: number | undefined;
      if (session.createdAt) {
        const createdAtMs = new Date(session.createdAt).getTime();
        const expiryMs = createdAtMs + appConfig.OTP.EXPIRES_IN_SECONDS * 1000;
        remainingMs = Math.max(expiryMs - Date.now(), 0);
      }

      const retryAfter = formatRemainingTime(remainingMs || 0);
      if (session.otpResendCount > appConfig.OTP.MAX_RESENDS) {
        if (remainingMs) {
          throw new AppError(
            retryAfter
              ? `Password reset limit reached. Try again after ${retryAfter}.`
              : "Password reset limit reached. Please try again later.",
            429 // Too Many Requests
          );
        }

        session.otpResendCount = 1;
      }
    }

    const redisTransaction = redisClient.multi();

    /* =====================================================
     * 4️⃣ No active session → fallback to DB validation
     * ===================================================== */
    let user: IUser | null = null;

    if (!session) {
      if (!input.identifier) {
        throw new AppError(
          "An email, username, or phone number is required.",
          400 // Bad Request
        );
      }

      user = await UserModel.findOne({
        $or: [
          { email: input.identifier.toLowerCase() },
          { username: input.identifier },
          { phoneNumber: input.identifier },
        ],
      })
        .select("+status +statusMeta")
        .lean();

      if (!user) {
        throw new AppError(
          "No account found with the provided identifier.",
          404 // Not Found
        );
      }

      if (user.status !== AccountStatus.ACTIVE || user.statusMeta) {
        throw new AppError(
          "Your account is not active. Please contact support.",
          403 // Forbidden
        );
      }
    }

    /* =====================================================
     * 5️⃣ Generate and update password reset OTP
     * ===================================================== */
    if (sessionId) redisClient.del(getSessionKey(sessionId));

    // Create new session ID
    const newSessionId: string = uuidv4();

    // Map identifiers → session for quick lookup
    removeDuplicates([
      input.identifier,
      session?.email,
      user?.email,
      session?.phoneNumber,
      user?.phoneNumber,
      session?.username,
      user?.username,
    ]).map((x) => {
      if (x) {
        redisTransaction.setex(
          getUserForgotKey(x),
          appConfig.OTP.SESSION_TTL_SECONDS,
          newSessionId
        );
      }
    });

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    const updatedSession: RedisAuthSession = {
      type: session?.type || SessionType.RESET_PASSWORD,

      email: session?.email || user?.email,
      username: session?.username || user?.username,
      phoneNumber: session?.phoneNumber || user?.phoneNumber,
      userId: session?.userId || user?._id,

      otp,
      otpHash,
      otpExpiresAt: Date.now() + appConfig.OTP.EXPIRES_IN_SECONDS * 1000,
      otpAttempts: session?.otpAttempts || 0,
      otpResendCount: session?.otpResendCount || 1,

      used: false,
      verified: false,

      createdAt: Date.now(),
    };

    /* =====================================================
     * 6️⃣ Persist reset session (Redis)
     * ===================================================== */
    redisTransaction.setex(
      getSessionKey(newSessionId),
      appConfig.OTP.SESSION_TTL_SECONDS,
      JSON.stringify(updatedSession)
    );

    await redisTransaction.exec();

    /* =====================================================
     * 7️⃣ Dispatch password reset OTP
     * ===================================================== */
    if (updatedSession.email) {
      sendForgotPasswordEmail({
        email: updatedSession.email,
        otp,
        resetToken: newSessionId,
      });
    }

    return { sessionToken: newSessionId };
  }

  /**
   * VALIDATE FORGOT PASSWORD SESSION SERVICE - Confirms whether a password reset session is active
   */
  static async validateForgotPasswordSessionService(
    input: SignupValidateSessionInput
  ): Promise<{
    email?: string;
    phoneNumber?: string;
    username?: string;
  }> {
    /* =====================================================
     * 1️⃣ Retrieve password reset session from Redis
     * ===================================================== */
    const redisKey = getSessionKey(input.sessionToken);
    const sessionData = await getRedisClient().get(redisKey);

    if (!sessionData) {
      throw new AppError(
        "Password reset session has expired. Please request a new code.",
        410 // Gone
      );
    }

    /* =====================================================
     * 2️⃣ Validate session type
     * ===================================================== */
    const session: RedisAuthSession = JSON.parse(sessionData);

    if (session.type !== SessionType.RESET_PASSWORD) {
      throw new AppError("Invalid password reset session.", 400);
    }

    /* =====================================================
     * 3️⃣ Validate OTP expiration window
     * ===================================================== */
    if (!session.otpExpiresAt || Date.now() > session.otpExpiresAt) {
      throw new AppError(
        "Password reset code has expired. Please request a new one.",
        410
      );
    }

    const filteredData = cleanObject({
      email: session.email,
      phoneNumber: session.email ? undefined : session.phoneNumber,
      username:
        session.email || session.phoneNumber ? undefined : session.username,
    });

    return filteredData;
  }

  /**
   * RESET PASSWORD SERVICE - Verifies reset OTP and updates user password
   */
  static async resetPasswordService(input: ResetPasswordInput) {
    const redisClient = getRedisClient();

    /* =====================================================
     * 1️⃣ Retrieve password reset session from Redis
     * ===================================================== */
    const redisKey = getSessionKey(input.sessionToken);
    const sessionData = await redisClient.get(redisKey);

    if (!sessionData) {
      throw new AppError(
        "Password reset session has expired. Please request a new code.",
        410 // Gone
      );
    }

    const session: RedisAuthSession = JSON.parse(sessionData);

    /* =====================================================
     * 2️⃣ Validate session type
     * ===================================================== */
    if (session.type !== SessionType.RESET_PASSWORD) {
      throw new AppError("Invalid password reset session.", 400);
    }

    // /* =====================================================
    //  * 3️⃣ Validate OTP expiration
    //  * ===================================================== */
    // if (!session.otpExpiresAt || Date.now() > session.otpExpiresAt) {
    //   throw new AppError(
    //     "Password reset code has expired. Please request a new one.",
    //     410 // Gone
    //   );
    // }

    // /* =====================================================
    //  * 3️⃣.1️⃣ Check and increment OTP attempt counter
    //  * ===================================================== */
    // session.otpAttempts = (session.otpAttempts || 0) + 1;

    // if (session.otpAttempts > appConfig.OTP.MAX_ATTEMPTS) {
    //   throw new AppError(
    //     "Maximum OTP verification attempts exceeded. Please request a new code.",
    //     429 // Too Many Requests
    //   );
    // }

    // // Update session with incremented attempts
    // await redisClient.setex(
    //   redisKey,
    //   appConfig.OTP.SESSION_TTL_SECONDS,
    //   JSON.stringify(session)
    // );

    /* =====================================================
     * 4️⃣ Validate OTP value
     * ===================================================== */
    const isValidOtp = verifyOtp(input.otp, session.otpHash || "");
    if (!isValidOtp) throw new AppError("Invalid password reset code.", 400);

    /* =====================================================
     * 5️⃣ Securely hash new password
     * ===================================================== */
    const passwordHash = await hashPassword(input.newPassword);

    /* =====================================================
     * 6️⃣ Update user password
     * ===================================================== */
    const updatedUser = await UserModel.findByIdAndUpdate(
      session.userId,
      { $set: { password: passwordHash } },
      { new: true }
    ).lean();

    if (!updatedUser) {
      throw new AppError(
        "Password reset session is no longer valid. Please request a new code.",
        410 // Gone
      );
    }

    /* =====================================================
     * 7️⃣ Clean up password reset session data (Redis)
     * ===================================================== */
    const redisTransaction = redisClient.multi();

    if (updatedUser.username) {
      redisTransaction.del(getUserForgotKey(updatedUser.username));
    }
    if (updatedUser.email) {
      redisTransaction.del(getUserForgotKey(updatedUser.email));
    }
    if (updatedUser.phoneNumber) {
      redisTransaction.del(getUserForgotKey(updatedUser.phoneNumber));
    }

    redisTransaction.del(redisKey);

    await redisTransaction.exec();

    /* =====================================================
     * 8️⃣ Send password reset confirmation notification
     * ===================================================== */
    if (updatedUser?.email) sendResetPasswordSuccessEmail(updatedUser.email);

    return;
  }

  /**
   * LOGOUT SERVICE - Invalidates a single session
   */
  static async logoutService(input: LogoutInput): Promise<void> {
    const redisClient = getRedisClient();
    const redisKey = getSessionKey(input.sessionId);

    // Verify session exists and belongs to user
    const sessionData = await redisClient.get(redisKey);

    if (!sessionData) {
      throw new AppError("Session not found or already expired.", 404);
    }

    const session: RedisAuthSession = JSON.parse(sessionData);

    if (session.userId?.toString() !== input.userId) {
      throw new AppError("Session does not belong to this user.", 403);
    }

    // Delete session and remove from user's sessions set
    const redisTransaction = redisClient.multi();
    redisTransaction.del(redisKey);
    redisTransaction.srem(getUserSessionsKey(input.userId), input.sessionId);
    await redisTransaction.exec();
  }

  /**
   * LOGOUT ALL SESSIONS SERVICE - Invalidates all sessions for a user
   */
  static async logoutAllSessionsService(input: LogoutAllInput): Promise<void> {
    const redisClient = getRedisClient();
    const userSessionsKey = getUserSessionsKey(input.userId);

    // Get all session IDs for this user
    const sessionIds = await redisClient.smembers(userSessionsKey);

    if (sessionIds.length === 0) {
      return; // No sessions to logout
    }

    // Delete all sessions and the user sessions set
    const redisTransaction = redisClient.multi();

    for (const sessionId of sessionIds) {
      redisTransaction.del(getSessionKey(sessionId));
    }

    redisTransaction.del(userSessionsKey);

    await redisTransaction.exec();
  }
}

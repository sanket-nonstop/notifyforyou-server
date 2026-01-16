// ==========================================
// FILE: src/utils/token.util.ts
// ==========================================
/**
 * JWT token utilities
 * - Access & Refresh token handling
 */

import jwt, { SignOptions } from "jsonwebtoken";

import { appConfig } from "@config/app.config";
import { env } from "@config/env.config";

/* ----------------------------------
 * ACCESS TOKEN
 * ---------------------------------- */

export const generateAccessToken = (
  payload: any,
  expiresIn: string | number = appConfig.TOKEN_EXPIRY.ACCESS,
  options: SignOptions = {}
): string => {
  const signOptions: SignOptions = {
    ...options,
    expiresIn: expiresIn as any, // 👈 Explicitly cast fixes overload error
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, signOptions);
};

export const verifyAccessToken = (token: string): any => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
};

/* ----------------------------------
 * REFRESH TOKEN
 * ---------------------------------- */

export const generateRefreshToken = (
  payload: any,
  expiresIn: string | number = appConfig.TOKEN_EXPIRY.REFRESH,
  options: SignOptions = {}
): string => {
  const signOptions: SignOptions = {
    ...options,
    expiresIn: expiresIn as any, // 👈 Explicitly cast fixes overload error
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, signOptions);
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as any;
};

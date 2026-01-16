// ==========================================
// FILE: src/utils/otp.util.ts
// ==========================================
/**
 * OTP utilities
 * - Generate numeric OTP
 * - Hash & compare OTP securely
 */

import { appConfig } from "@config/app.config";
import crypto from "crypto";

/**
 * Generate numeric OTP
 */
export const generateOtp = (): string => {
  const length = appConfig.OTP.LENGTH;
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  return crypto.randomInt(min, max).toString();
};

/**
 * Hash OTP using HMAC (fast + secure)
 */
export const hashOtp = (otp: string): string => {
  return crypto
    .createHmac("sha256", appConfig.OTP.SECRET)
    .update(otp)
    .digest("hex");
};

/**
 * Compare OTP with stored hash
 */
export const verifyOtp = (otp: string, hashedOtp: string): boolean => {
  const otpHash = hashOtp(otp);

  return crypto.timingSafeEqual(
    Buffer.from(otpHash, "hex"),
    Buffer.from(hashedOtp, "hex")
  );
};

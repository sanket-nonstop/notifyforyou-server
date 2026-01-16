// ==========================================
// FILE: src/rest/auth/auth.validator.ts
// ==========================================
/**
 * Authentication validators
 * ------------------------------------------
 * - Request-level validation only
 * - Supports optional media (file or url-based)
 * - No DB / Redis / Cloudinary logic
 */

import { DialCode } from "@constants/country.constants";
import { Gender } from "@constants/enum.constants";
import {
  BIO_REGEX,
  EMAIL_REGEX,
  NAME_REGEX,
  OTP_REGEX,
  PASSWORD_REGEX,
  PHONE_NUMBER_REGEX,
  USERNAME_REGEX,
} from "@constants/regex.constants";
import { z } from "zod";

const imageMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
const fileSchema = z
  .instanceof(File, { message: "File is required" })
  .refine((file) => file.size > 0, {
    message: "File is empty",
  })
  .refine((file) => file.size <= 5 * 1024 * 1024, {
    message: "File size must be less than 1MB",
  })
  .refine((file) => imageMimeTypes.includes(file.type), {
    message: "Invalid file type. Only JPG, or PNG allowed",
  });

const videoMimeTypes = ["video/mp4", "video/gif"];
const videoFileSchema = z
  .instanceof(File, { message: "File is required" })
  .refine((file) => file.size > 0, {
    message: "File is empty",
  })
  .refine((file) => file.size <= 5 * 1024 * 1024, {
    message: "File size must be less than 5MB",
  })
  .refine((file) => videoMimeTypes.includes(file.type), {
    message: "Invalid file type. Only MP4 or GIF allowed",
  });

/* ----------------------------------
 * SIGNUP
 * Validate user details
 * ---------------------------------- */

export const signupValidator = z
  .object({
    username: z
      .string()
      .trim()
      .regex(
        USERNAME_REGEX,
        "Username must be 3-20 characters and can contain letters, numbers, dots, and underscores."
      )
      .optional(),

    firstName: z
      .string()
      .trim()
      .regex(NAME_REGEX, "First name must be 3-20 characters.")
      .optional(),

    lastName: z
      .string()
      .trim()
      .regex(NAME_REGEX, "Last name must be 3-20 characters.")
      .optional(),

    email: z
      .string({ error: "Email address is required." })
      .trim()
      .regex(EMAIL_REGEX, "Invalid email address.")
      .transform((v) => v.toLowerCase()),

    dialCode: z.enum(DialCode).optional(),

    phoneNumber: z
      .string()
      .regex(
        PHONE_NUMBER_REGEX,
        "Phone number must be between 7 and 15 digits."
      )
      .optional(),

    // OPTIONAL MEDIA (INPUT ONLY)
    profilePicture: fileSchema.optional(),
    coverPicture: fileSchema.optional(),
    introVideo: videoFileSchema.optional(),

    gender: z.enum(Gender).optional(),

    dateOfBirth: z
      .preprocess(
        (value) => (value ? new Date(value as string) : undefined),
        z.date().max(new Date(), "Date of birth must be in the past")
      )
      .optional(),

    bio: z
      .string()
      .regex(BIO_REGEX, "Bio name must be 3-200 characters.")
      .optional(),

    password: z
      .string({ error: "Password is required" })
      .regex(
        PASSWORD_REGEX,
        "Password must be 8-24 characters and include uppercase, lowercase, number, and special character."
      ),
  })
  .superRefine((data, ctx) => {
    if (data.phoneNumber && !data.dialCode) {
      ctx.addIssue({
        path: ["dialCode"],
        message: "Dial code is required when phone number is provided",
        code: "custom",
      });
    }

    if (data.dialCode && !data.phoneNumber) {
      ctx.addIssue({
        path: ["phoneNumber"],
        message: "Phone number is required when dial code is provided",
        code: "custom",
      });
    }
  });

/* =====================================================
 * SESSION TOKEN VALIDATOR
 * Used across auth flows to validate sessionToken
 * ===================================================== */

export const sessionTokenValidator = z
  .string({
    error: "Session token is required.",
  })
  .min(10, {
    message: "Invalid or malformed session token.",
  });

/* =====================================================
 * SESSION TOKEN VALIDATORS (Body & Query)
 * Used for validate-session endpoints
 * ===================================================== */
export const sessionTokenBodyOrQueryValidator = z
  .object({
    sessionToken: sessionTokenValidator.optional(),
  })
  .refine(
    (data) => data.sessionToken !== undefined && data.sessionToken !== null,
    {
      message: "Session token is required in body or query.",
      path: ["sessionToken"],
    }
  )
  .transform((data) => ({
    sessionToken: data.sessionToken!,
  }));

/* =====================================================
 * IDENTIFIER VALIDATOR
 * Accepts email, username, or phone number
 * ===================================================== */
const _identifierRegex = `${USERNAME_REGEX.source}|${EMAIL_REGEX.source}|${PHONE_NUMBER_REGEX.source}`;
export const identifierValidator = z
  .string({
    error: "Identifier is required.",
  })
  .regex(new RegExp(_identifierRegex), {
    message: "Identifier must be a valid email, username, or phone number.",
  });

/* =====================================================
 * SIGNUP OTP VERIFICATION VALIDATOR
 * Validates session token and one-time password
 * ===================================================== */

export const signupVerifyOtpValidator = z.object({
  sessionToken: sessionTokenValidator,

  otp: z
    .string({
      error: "One-time password (OTP) is required.",
    })
    .regex(OTP_REGEX, {
      message: "Invalid OTP format.",
    }),
});

/* ----------------------------------
 * SIGNIN
 * ---------------------------------- */

export const signinValidator = z.object({
  identifier: z
    .string({ error: "Identifier is required" })
    .regex(
      new RegExp(
        `${USERNAME_REGEX.source}|${EMAIL_REGEX.source}|${PHONE_NUMBER_REGEX.source}`
      ),
      "Invalid identifier"
    ),

  password: z
    .string({ error: "Password is required" })
    .regex(PASSWORD_REGEX, "Invalid password"),
});

/* ----------------------------------
 * REFRESH ACCESS TOKEN
 * ---------------------------------- */

export const refreshTokenValidator = z.object({
  refreshToken: z
    .string({ error: "Refresh token is required" })
    .min(20, "Invalid refresh token"),
});

/* ----------------------------------
 * RESET PASSWORD
 * ---------------------------------- */

export const resetPasswordValidator = z
  .object({
    sessionToken: z
      .string({ error: "Session token is required" })
      .min(10, "Invalid session token"),

    otp: z
      .string({ error: "OTP is required" })
      .regex(OTP_REGEX, "Invalid OTP format"),

    newPassword: z
      .string({ error: "Password is required" })
      .regex(
        PASSWORD_REGEX,
        "Password must be 8-24 characters and include uppercase, lowercase, number, and special character."
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

// ==========================================
// FILE: src/constants/regex.ts
// ==========================================
/**
 * Centralized validation regex patterns
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const USERNAME_REGEX = /^[a-zA-Z0-9._]{3,20}$/;

// Allows max 3 spaces, not continuous, min 3 chars (if provided)
export const NAME_REGEX = /^(?=.{2,20}$)(?!.*\s{2,})[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

// Allows max 3 spaces, not continuous, min 3 chars (if provided)
export const BIO_REGEX = /^(?!.*\s{2,})(?=(?:.*\s){0,3})[A-Za-z ]{3,200}$/;

// Strong password (8–24, upper, lower, digit, special)
export const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,24}$/;

export const PHONE_NUMBER_REGEX = /^[0-9]{7,15}$/;

export const OTP_REGEX = /^[0-9]{4,8}$/;

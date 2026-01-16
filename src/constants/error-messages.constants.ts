// ======================================
// FILE: src/constants/error.messages.ts
// ======================================

import { ErrorCode } from "./error-codes.constants";
import { LanguageCode } from "./language.constants";

/**
 * Error messages in multiple languages
 * -----------------------------------
 * - Always use ErrorCode as keys
 * - Add translations per language
 */
export const ERROR_MESSAGES: Record<LanguageCode, Record<ErrorCode, string>> = {
  [LanguageCode.EN]: {
    // Common
    [ErrorCode.INTERNAL_SERVER_ERROR]: "Internal server error.",
    [ErrorCode.INVALID_REQUEST]: "Invalid request.",
    [ErrorCode.UNAUTHORIZED]: "Unauthorized access.",
    [ErrorCode.FORBIDDEN]: "You do not have permission to perform this action.",
    [ErrorCode.NOT_FOUND]: "Resource not found.",
    [ErrorCode.TOO_MANY_REQUESTS]: "Too many requests. Please try again later.",

    // Required
    [ErrorCode.EMAIL_REQUIRED]: "Email address is required.",
    [ErrorCode.PASSWORD_REQUIRED]: "Password is required.",
    [ErrorCode.USERNAME_REQUIRED]: "Username is required.",
    [ErrorCode.PHONE_REQUIRED]: "Phone number is required.",
    [ErrorCode.DIAL_CODE_REQUIRED]: "Dial code is required.",
    [ErrorCode.OTP_REQUIRED]: "One-time password (OTP) is required.",
    [ErrorCode.SESSION_TOKEN_REQUIRED]: "Session token is required.",
    [ErrorCode.ACCESS_TOKEN_REQUIRED]: "Access token is required.",
    [ErrorCode.REFRESH_TOKEN_REQUIRED]: "Refresh token is required.",
    [ErrorCode.IDENTIFIER_REQUIRED]:
      "Identifier is required (email, username, or phone number).",

    // Validation
    [ErrorCode.INVALID_EMAIL]: "Invalid email address.",
    [ErrorCode.INVALID_PASSWORD]: "Invalid password format.",
    [ErrorCode.INVALID_USERNAME]: "Invalid username.",
    [ErrorCode.INVALID_PHONE_NUMBER]: "Invalid phone number.",
    [ErrorCode.INVALID_DIAL_CODE]: "Invalid dial code.",
    [ErrorCode.INVALID_OTP]: "Invalid OTP format.",
    [ErrorCode.PASSWORDS_DO_NOT_MATCH]: "Passwords do not match.",

    // Auth
    [ErrorCode.INVALID_CREDENTIALS]: "Invalid credentials.",
    [ErrorCode.USER_ALREADY_EXISTS]:
      "An account already exists with the provided credentials.",
    [ErrorCode.USER_NOT_FOUND]: "User not found.",
    [ErrorCode.EMAIL_NOT_VERIFIED]:
      "Please verify your email address before signing in.",

    // Session / OTP
    [ErrorCode.SESSION_NOT_FOUND]: "Session not found.",
    [ErrorCode.SESSION_EXPIRED]:
      "Session has expired. Please request a new one.",
    [ErrorCode.SESSION_INVALID]: "Invalid session token.",
    [ErrorCode.OTP_EXPIRED]: "OTP has expired. Please request a new one.",
    [ErrorCode.OTP_ATTEMPTS_EXCEEDED]:
      "Maximum OTP verification attempts exceeded. Please request a new code.",
    [ErrorCode.OTP_RESEND_LIMIT_REACHED]:
      "OTP resend limit reached. Please try again later.",
  },

  [LanguageCode.HI]: {
    // Common
    [ErrorCode.INTERNAL_SERVER_ERROR]: "सर्वर में समस्या है।",
    [ErrorCode.INVALID_REQUEST]: "गलत अनुरोध।",
    [ErrorCode.UNAUTHORIZED]: "अनधिकृत एक्सेस।",
    [ErrorCode.FORBIDDEN]: "आपको यह कार्य करने की अनुमति नहीं है।",
    [ErrorCode.NOT_FOUND]: "रिकॉर्ड नहीं मिला।",
    [ErrorCode.TOO_MANY_REQUESTS]:
      "बहुत अधिक अनुरोध किए गए हैं। कृपया बाद में प्रयास करें।",

    // Required
    [ErrorCode.EMAIL_REQUIRED]: "ईमेल पता आवश्यक है।",
    [ErrorCode.PASSWORD_REQUIRED]: "पासवर्ड आवश्यक है।",
    [ErrorCode.USERNAME_REQUIRED]: "यूज़रनेम आवश्यक है।",
    [ErrorCode.PHONE_REQUIRED]: "मोबाइल नंबर आवश्यक है।",
    [ErrorCode.DIAL_CODE_REQUIRED]: "डायल कोड आवश्यक है।",
    [ErrorCode.OTP_REQUIRED]: "OTP आवश्यक है।",
    [ErrorCode.SESSION_TOKEN_REQUIRED]: "सेशन टोकन आवश्यक है।",
    [ErrorCode.ACCESS_TOKEN_REQUIRED]: "ऐक्सेस टोकन आवश्यक है।",
    [ErrorCode.REFRESH_TOKEN_REQUIRED]: "रिफ्रेश टोकन आवश्यक है।",
    [ErrorCode.IDENTIFIER_REQUIRED]: "पहचान (ईमेल/यूज़रनेम/फोन) आवश्यक है।",

    // Validation
    [ErrorCode.INVALID_EMAIL]: "अमान्य ईमेल पता।",
    [ErrorCode.INVALID_PASSWORD]: "पासवर्ड फॉर्मेट गलत है।",
    [ErrorCode.INVALID_USERNAME]: "अमान्य यूज़रनेम।",
    [ErrorCode.INVALID_PHONE_NUMBER]: "अमान्य मोबाइल नंबर।",
    [ErrorCode.INVALID_DIAL_CODE]: "अमान्य डायल कोड।",
    [ErrorCode.INVALID_OTP]: "OTP फॉर्मेट गलत है।",
    [ErrorCode.PASSWORDS_DO_NOT_MATCH]: "पासवर्ड मैच नहीं कर रहा।",

    // Auth
    [ErrorCode.INVALID_CREDENTIALS]: "गलत जानकारी दी गई है।",
    [ErrorCode.USER_ALREADY_EXISTS]: "दिए गए विवरण से अकाउंट पहले से मौजूद है।",
    [ErrorCode.USER_NOT_FOUND]: "यूज़र नहीं मिला।",
    [ErrorCode.EMAIL_NOT_VERIFIED]:
      "लॉगिन करने से पहले कृपया ईमेल वेरिफाई करें।",

    // Session / OTP
    [ErrorCode.SESSION_NOT_FOUND]: "सेशन नहीं मिला।",
    [ErrorCode.SESSION_EXPIRED]: "सेशन समाप्त हो गया है। कृपया नया सेशन लें।",
    [ErrorCode.SESSION_INVALID]: "सेशन टोकन अमान्य है।",
    [ErrorCode.OTP_EXPIRED]: "OTP समाप्त हो गया है। कृपया नया OTP लें।",
    [ErrorCode.OTP_ATTEMPTS_EXCEEDED]:
      "OTP प्रयास की सीमा पार हो गई है। कृपया नया OTP लें।",
    [ErrorCode.OTP_RESEND_LIMIT_REACHED]:
      "OTP भेजने की सीमा पूरी हो गई है। कृपया बाद में प्रयास करें।",
  },
};

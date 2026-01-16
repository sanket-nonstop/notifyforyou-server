// email/types.ts
export type VerificationEmailOptions = {
  email: string;
  otp: string;
  sessionId: string;
  frontendUrl?: string | undefined; // e.g. https://app.example.com
  verifyPath?: string | undefined; // e.g. /verify (will combine with sessionId/otp as query)
  otpExpiryMinutes?: number | undefined; // used in copy
};

export type ForgotPasswordEmailOptions = {
  email: string;
  otp?: string | undefined;
  resetToken?: string | undefined;
  frontendUrl?: string | undefined;
  resetPath?: string | undefined; // e.g. /reset-password
  otpExpiryMinutes?: number | undefined;
  resetExpiresMinutes?: number | undefined;
};

export type LoginNotificationOptions = {
  email: string;
  ip?: string | undefined;
  device?: string | undefined;
  location?: string | undefined;
  time?: string | undefined;
};

export type LogoutNotificationOptions = {
  email: string;
  time?: string | undefined;
  device?: string | undefined;
};

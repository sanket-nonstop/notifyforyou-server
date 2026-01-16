import { appConfig } from "@config/app.config";
import { env } from "@config/env.config";

const { APP_NAME, APP_LOGO } = appConfig;

// small helper to build CTA button
const ctaButton = (url: string, label = "Verify") => `
  <div style="text-align:center;margin:24px 0;">
    <a href="${url}" style="background:#0d6efd;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block;">
      ${label}
    </a>
  </div>
`;

// 1. Signup / verification email (with OTP + link)
export const signupVerificationTemplate = (opts: {
  otp: string;
  verifyUrl?: string | undefined;
  otpExpiryMinutes?: number | undefined;
}) => {
  const { otp, verifyUrl, otpExpiryMinutes = 15 } = opts;
  const subject = `${APP_NAME} — Verify your email`;
  const html = `
  <div style="font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#333; max-width:600px;margin:0 auto;padding:24px;">
    <div style="text-align:center;">
      ${
        APP_LOGO
          ? `<img src="${APP_LOGO}" alt="${APP_NAME}" style="max-height:56px; margin-bottom:12px;" />`
          : `<h2 style="margin:0;color:#0d6efd">${APP_NAME}</h2>`
      }
    </div>

    <h3 style="color:#111;">Verify your email</h3>
    <p>Thanks for creating an account. Use the following One-Time Passcode (OTP) to verify your email address:</p>

    <div style="text-align:center;margin:20px 0;">
      <span style="display:inline-block;font-size:28px;letter-spacing:2px;background:#f7f9fc;padding:14px 22px;border-radius:8px;border:1px solid #e6eef8;">
        <strong>${otp}</strong>
      </span>
    </div>

    ${verifyUrl ? ctaButton(verifyUrl, "Verify account") : ""}

    <p style="color:#555;font-size:13px">This OTP will expire in ${otpExpiryMinutes} minutes. If you did not request this, please ignore this email or contact <a href="mailto:${
    env.SMTP_FROM
  }">${env.SMTP_FROM}</a>.</p>

    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
    <p style="font-size:12px;color:#888">If the button does not work, copy & paste the following link into your browser:</p>
    ${
      verifyUrl
        ? `<p style="font-size:12px;word-break:break-all"><a href="${verifyUrl}">${verifyUrl}</a></p>`
        : ""
    }
  </div>
  `;
  return { subject, html };
};

// 2. Resend verification: uses identical template but different subject/copy
export const resendVerificationTemplate = (opts: {
  otp: string;
  verifyUrl?: string | undefined;
  otpExpiryMinutes?: number | undefined;
}) => {
  const tpl = signupVerificationTemplate(opts);
  tpl.subject = `${APP_NAME} — Your verification OTP`;
  return tpl;
};

// 3. Confirm verification (success)
export const verificationConfirmedTemplate = (opts: { email: string }) => {
  const subject = `${APP_NAME} — Email verified`;
  const html = `
    <div style="font-family:Inter, sans-serif; max-width:600px;margin:0 auto;padding:24px;color:#222">
      <h2 style="color:#0d6efd">${APP_NAME}</h2>
      <h3>Verification complete</h3>
      <p>Your email <strong>${opts.email}</strong> has been successfully verified. You can now sign in to your account.</p>
      <p style="font-size:13px;color:#666">If you didn't verify your email, please contact ${env.SMTP_FROM} immediately.</p>
    </div>
  `;
  return { subject, html };
};

// 4. Login notification
export const loginNotificationTemplate = (opts: {
  device?: string | undefined;
  ip?: string | undefined;
  location?: string | undefined;
  time?: string | undefined;
}) => {
  const subject = `${APP_NAME} — New sign-in detected`;
  const html = `
    <div style="font-family:Inter, sans-serif; max-width:600px;margin:0 auto;padding:24px;color:#222">
      <h2 style="color:#0d6efd">${APP_NAME}</h2>
      <h3>New sign-in to your account</h3>
      <p>We detected a new sign-in to your account with the following details:</p>
      <ul>
        ${opts.device ? `<li><strong>Device:</strong> ${opts.device}</li>` : ""}
        ${opts.ip ? `<li><strong>IP address:</strong> ${opts.ip}</li>` : ""}
        ${
          opts.location
            ? `<li><strong>Location:</strong> ${opts.location}</li>`
            : ""
        }
        ${opts.time ? `<li><strong>Time:</strong> ${opts.time}</li>` : ""}
      </ul>
      <p>If this was you, no action is needed. If you don't recognize this activity, please reset your password or contact <a href="mailto:${
        env.SMTP_FROM
      }">${env.SMTP_FROM}</a>.</p>
    </div>
  `;
  return { subject, html };
};

// 5. Logout notification
export const logoutNotificationTemplate = (opts: {
  time?: string | undefined;
  device?: string | undefined;
}) => {
  const subject = `${APP_NAME} — You signed out`;
  const html = `
    <div style="font-family:Inter, sans-serif; max-width:600px;margin:0 auto;padding:24px;color:#222">
      <h2 style="color:#0d6efd">${APP_NAME}</h2>
      <h3>You signed out</h3>
      <p>Your account was signed out${
        opts.device ? ` from ${opts.device}` : ""
      }${opts.time ? ` at ${opts.time}` : ""}.</p>
      <p>If this wasn't you, please sign in and reset your password immediately or contact <a href="mailto:${
        env.SMTP_FROM
      }">${env.SMTP_FROM}</a>.</p>
    </div>
  `;
  return { subject, html };
};

// 6. Forgot password (OTP or link)
export const forgotPasswordTemplate = (opts: {
  otp?: string | undefined;
  resetUrl?: string | undefined;
  resetExpiresMinutes?: number | undefined;
}) => {
  const { otp, resetUrl, resetExpiresMinutes = 60 } = opts;
  const subject = `${APP_NAME} — Password reset request`;
  const html = `
    <div style="font-family:Inter, sans-serif; max-width:600px;margin:0 auto;padding:24px;color:#222">
      <h2 style="color:#0d6efd">${APP_NAME}</h2>
      <h3>Password reset requested</h3>
      <p>We received a request to reset your password. Use the code below or click the link to reset your password.</p>

      ${
        otp
          ? `<div style="text-align:center;margin:20px 0;"><strong style="font-size:20px">${otp}</strong></div>`
          : ""
      }

      ${resetUrl ? ctaButton(resetUrl, "Reset password") : ""}

      <p style="font-size:13px;color:#666">This link/code will expire in ${resetExpiresMinutes} minutes. If you did not request a password reset, ignore this email or contact <a href="mailto:${
    env.SMTP_FROM
  }">${env.SMTP_FROM}</a>.</p>
      ${
        resetUrl
          ? `<p style="font-size:12px;word-break:break-all"><a href="${resetUrl}">${resetUrl}</a></p>`
          : ""
      }
    </div>
  `;
  return { subject, html };
};

// 7. Resend forgot password (same as forgotPasswordTemplate but different subject)
export const resendForgotPasswordTemplate = (opts: {
  otp?: string | undefined;
  resetUrl?: string | undefined;
  resetExpiresMinutes?: number | undefined;
}) => {
  const tpl = forgotPasswordTemplate(opts);
  tpl.subject = `${APP_NAME} — Your password reset code`;
  return tpl;
};

// 8. Reset password success
export const resetPasswordSuccessTemplate = () => {
  const subject = `${APP_NAME} — Password changed successfully`;
  const html = `
    <div style="font-family:Inter, sans-serif; max-width:600px;margin:0 auto;padding:24px;color:#222">
      <h2 style="color:#0d6efd">${APP_NAME}</h2>
      <h3>Password changed</h3>
      <p>Your password has been changed successfully. If you did not perform this action, please contact ${env.SMTP_FROM} immediately.</p>
    </div>
  `;
  return { subject, html };
};

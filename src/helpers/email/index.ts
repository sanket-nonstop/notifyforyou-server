import { appConfig } from "@config/app.config";
import { env } from "@config/env.config";
import { logger } from "@logger/index";
import {
  forgotPasswordTemplate,
  loginNotificationTemplate,
  logoutNotificationTemplate,
  resendForgotPasswordTemplate,
  resendVerificationTemplate,
  resetPasswordSuccessTemplate,
  signupVerificationTemplate,
  verificationConfirmedTemplate,
} from "./templates";
import { transporter } from "./transporter";
import {
  type ForgotPasswordEmailOptions,
  type LoginNotificationOptions,
  type LogoutNotificationOptions,
  type VerificationEmailOptions,
} from "./types";

const FROM = `"${appConfig.APP_NAME}" <${env.SMTP_FROM}>`;

/** helper to build verify url */
const buildVerifyUrl = (
  frontendUrl?: string,
  path?: string,
  sessionId?: string,
  otp?: string
) => {
  if (!frontendUrl) return undefined;
  const url = new URL(path || "", frontendUrl);
  if (sessionId) url.searchParams.set("session", sessionId);
  if (otp) url.searchParams.set("otp", otp);
  return url.toString();
};

export const sendSignupVerificationEmail = async (
  opts: VerificationEmailOptions
) => {
  try {
    const verifyUrl = buildVerifyUrl(
      env.APP_CLIENT_BASE_URL,
      appConfig.APP_CLIENT_ENDPOINTS.VERIFY_EMAIL,
      opts.sessionId
    );

    const tpl = signupVerificationTemplate({
      otp: opts.otp,
      verifyUrl: verifyUrl,
      otpExpiryMinutes: opts.otpExpiryMinutes,
    });

    await transporter.sendMail({
      from: FROM,
      to: opts.email,
      subject: tpl.subject,
      html: tpl.html,
    });
  } catch (err) {
    logger.error(`sendResetPasswordSuccessEmail ${err}`);
  }
};

export const sendResendVerificationEmail = async (
  opts: VerificationEmailOptions
) => {
  try {
    const verifyUrl = buildVerifyUrl(
      env.APP_CLIENT_BASE_URL,
      appConfig.APP_CLIENT_ENDPOINTS.VERIFY_EMAIL,
      opts.sessionId
    );

    const tpl = resendVerificationTemplate({
      otp: opts.otp,
      verifyUrl,
      otpExpiryMinutes: opts.otpExpiryMinutes,
    });

    await transporter.sendMail({
      from: FROM,
      to: opts.email,
      subject: tpl.subject,
      html: tpl.html,
    });
  } catch (err) {
    logger.error(`sendResendVerificationEmail ${err}`);
  }
};

export const sendVerificationConfirmedEmail = async (email: string) => {
  try {
    const tpl = verificationConfirmedTemplate({ email });

    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: tpl.subject,
      html: tpl.html,
    });
  } catch (err) {
    logger.error(`sendVerificationConfirmedEmail ${err}`);
  }
};

export const sendLoginNotificationEmail = async (
  opts: LoginNotificationOptions
) => {
  try {
    const tpl = loginNotificationTemplate({
      device: opts.device,
      ip: opts.ip,
      location: opts.location,
      time: opts.time,
    });

    await transporter.sendMail({
      from: FROM,
      to: opts.email,
      subject: tpl.subject,
      html: tpl.html,
    });
  } catch (err) {
    logger.error(`sendLoginNotificationEmail ${err}`);
  }
};

export const sendLogoutNotificationEmail = async (
  opts: LogoutNotificationOptions
) => {
  try {
    const tpl = logoutNotificationTemplate({
      device: opts.device,
      time: opts.time,
    });

    await transporter.sendMail({
      from: FROM,
      to: opts.email,
      subject: tpl.subject,
      html: tpl.html,
    });
  } catch (err) {
    logger.error(`sendLogoutNotificationEmail ${err}`);
  }
};

export const sendForgotPasswordEmail = async (
  opts: ForgotPasswordEmailOptions
) => {
  try {
    const resetUrl = buildVerifyUrl(
      env.APP_CLIENT_BASE_URL,
      appConfig.APP_CLIENT_ENDPOINTS.PASSWORD_VERIFY,
      opts.resetToken
    );

    const tpl = forgotPasswordTemplate({
      otp: opts.otp,
      resetUrl,
      resetExpiresMinutes: opts.resetExpiresMinutes,
    });

    await transporter.sendMail({
      from: FROM,
      to: opts.email,
      subject: tpl.subject,
      html: tpl.html,
    });
  } catch (err) {
    logger.error(`sendForgotPasswordEmail ${err}`);
  }
};

export const sendResendForgotPasswordEmail = async (
  opts: ForgotPasswordEmailOptions
) => {
  try {
    const resetUrl = buildVerifyUrl(
      env.APP_CLIENT_BASE_URL,
      appConfig.APP_CLIENT_ENDPOINTS.PASSWORD_VERIFY,
      opts.resetToken
    );

    const tpl = resendForgotPasswordTemplate({
      otp: opts.otp,
      resetUrl,
      resetExpiresMinutes: opts.resetExpiresMinutes,
    });

    await transporter.sendMail({
      from: FROM,
      to: opts.email,
      subject: tpl.subject,
      html: tpl.html,
    });
  } catch (err) {
    logger.error(`sendResendForgotPasswordEmail ${err}`);
  }
};

export const sendResetPasswordSuccessEmail = async (email: string) => {
  try {
    const tpl = resetPasswordSuccessTemplate();

    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: tpl.subject,
      html: tpl.html,
    });
  } catch (err) {
    logger.error(`sendResetPasswordSuccessEmail ${err}`);
  }
};

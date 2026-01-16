import { env } from "@config/env.config";
import nodemailer from "nodemailer";

// export const transporter = nodemailer.createTransport({
//   host: env.SMTP_HOST,
//   port: Number(env.SMTP_PORT),
//   secure: Number(env.SMTP_PORT) === 465, // true for 465, false for other ports
//   // service: env.smtpService,
//   auth: {
//     user: env.SMTP_USER,
//     pass: env.SMTP_PASS,
//   },
// });

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST, // smtp.gmail.com
  port: Number(env.SMTP_PORT), // 587
  secure: Number(env.SMTP_PORT) === 465, // true only for 465

  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS, // MUST be Gmail App Password
  },

  // Important for Gmail + cloud hosting
  requireTLS: Number(env.SMTP_PORT) === 587,

  // tls: { minVersion: "TLSv1.2" },

  // Prevent hanging forever
  connectionTimeout: 20_000,
  greetingTimeout: 20_000,
  socketTimeout: 20_000,
});

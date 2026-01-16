// ==========================================
// FILE: src/utils/password.util.ts
// ==========================================
/**
 * Password utilities
 * - Hash & compare passwords securely
 */

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash plain password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password with hash
 */
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

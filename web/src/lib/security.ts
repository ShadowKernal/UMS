import bcrypt from "bcryptjs";
import crypto from "crypto";

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;
export const isValidEmail = (email: string) => EMAIL_RE.test(email.trim());

export const passwordHash = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const passwordHashSync = (password: string) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

export const passwordVerify = async (password: string, stored: string) => bcrypt.compare(password, stored);

export const sha256Hex = (value: string) =>
  crypto.createHash("sha256").update(value, "utf8").digest("hex");

export const randomToken = (length = 32) => crypto.randomBytes(length).toString("base64url");

export const generateCode = (length = 9) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  // Using Node randomBytes keeps this compatible with server-side and edge environments.
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
};

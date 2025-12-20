import nodemailer from "nodemailer";

type MailSpec = { to: string; subject: string; text: string };
type MailConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: boolean;
};

const normalizeValue = (value: string) => value.trim();
const normalizePass = (value: string) => value.trim().replace(/\s+/g, "");

const getMailConfig = (): MailConfig => {
  const host = normalizeValue(process.env.SMTP_HOST || "");
  const port = Number(process.env.SMTP_PORT || 0) || 587;
  const user = normalizeValue(process.env.SMTP_USER || "");
  const pass = normalizePass(process.env.SMTP_PASS || "");
  const from = normalizeValue(process.env.SMTP_FROM || "") || user;
  const secure = (process.env.SMTP_SECURE || "").toLowerCase() === "true";
  return { host, port, user, pass, from, secure };
};

let transporter: nodemailer.Transporter | null = null;
let transporterKey = "";

export const mailConfigured = () => {
  const cfg = getMailConfig();
  return Boolean(cfg.host && cfg.port && cfg.user && cfg.pass && cfg.from);
};

const getTransporter = () => {
  const cfg = getMailConfig();
  if (!(cfg.host && cfg.port && cfg.user && cfg.pass && cfg.from)) return null;
  const nextKey = `${cfg.host}|${cfg.port}|${cfg.user}|${cfg.from}|${cfg.secure}`;
  if (transporter && transporterKey === nextKey) return transporter;
  transporterKey = nextKey;
  transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure, // false for STARTTLS on 587
    auth: { user: cfg.user, pass: cfg.pass }
  });
  return transporter;
};

export const sendEmail = async (spec: MailSpec) => {
  const tx = getTransporter();
  if (!tx) {
    return { sent: false, error: "SMTP not configured" };
  }
  const cfg = getMailConfig();
  try {
    await tx.sendMail({
      from: cfg.from,
      to: spec.to,
      subject: spec.subject,
      text: spec.text
    });
    return { sent: true };
  } catch (err) {
    console.error("SMTP send failed", err);
    return { sent: false, error: err };
  }
};

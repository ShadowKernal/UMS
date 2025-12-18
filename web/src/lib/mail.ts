import nodemailer from "nodemailer";

type MailSpec = { to: string; subject: string; text: string };

const smtpHost = process.env.SMTP_HOST || "";
const smtpPort = Number(process.env.SMTP_PORT || 0) || 587;
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
const smtpFrom = process.env.SMTP_FROM || smtpUser || "";
const smtpSecure = (process.env.SMTP_SECURE || "").toLowerCase() === "true";

let transporter: nodemailer.Transporter | null = null;

export const mailConfigured = () => Boolean(smtpHost && smtpPort && smtpUser && smtpPass && smtpFrom);

const getTransporter = () => {
  if (!mailConfigured()) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure, // false for STARTTLS on 587
    auth: { user: smtpUser, pass: smtpPass }
  });
  return transporter;
};

export const sendEmail = async (spec: MailSpec) => {
  const tx = getTransporter();
  if (!tx) {
    return { sent: false, error: "SMTP not configured" };
  }
  try {
    await tx.sendMail({
      from: smtpFrom,
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

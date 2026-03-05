import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM_NAME,
  SMTP_FROM_EMAIL,
} = process.env;

const port = Number(SMTP_PORT || 587);
const secure = port === 465;

const FROM_NAME = SMTP_FROM_NAME || "TalentBridge";
const FROM_EMAIL = SMTP_FROM_EMAIL || SMTP_USER;
const FROM = `"${FROM_NAME}" <${FROM_EMAIL}>`;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port,
  secure,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 12000,
});

const sendMail = async ({ to, subject, text, html }) => {
  const info = await transporter.sendMail({
    from: FROM,
    to,
    subject,
    text,
    html,
  });
  console.log("✅ Email sent:", subject, "=>", info.messageId);
  return info;
};

export const sendVerificationEmail = async (toEmail, name, verifyLink) => {
  return sendMail({
    to: toEmail,
    subject: "TalentBridge - Verify your email",
    text: `Hi ${name || "User"}, verify: ${verifyLink}`,
    html: `<p>Hi ${name || "User"},</p><p><a href="${verifyLink}">Verify Email</a></p>`,
  });
};

export const sendResetEmail = async (toEmail, name, resetLink) => {
  return sendMail({
    to: toEmail,
    subject: "TalentBridge - Reset your password",
    text: `Hi ${name || "User"}, reset: ${resetLink}`,
    html: `<p>Hi ${name || "User"},</p><p><a href="${resetLink}">Reset Password</a></p>`,
  });
};

// non-blocking helpers
export const sendWelcomeEmail = async () => Promise.resolve();
export const sendLoginAlertEmail = async () => Promise.resolve();
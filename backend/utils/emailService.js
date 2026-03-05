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

  // ✅ Prevent hanging forever
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 12000,
});

const sendMail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: FROM,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent:", subject, "=>", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Email send failed:", subject, err.message);
    throw err;
  }
};

// ✅ Password Reset Email (USED BY ADMIN + USER)
export const sendResetEmail = async (toEmail, name, resetLink) => {
  const subject = "TalentBridge - Reset your password";

  const text = `Hi ${name || "User"},

Reset your password using this link (valid for limited time):
${resetLink}

If you didn’t request this, ignore.

— TalentBridge Team
`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2>Password Reset</h2>
      <p>Hi ${name || "User"},</p>
      <p>Click below to reset your password:</p>
      <p>
        <a href="${resetLink}"
           style="display:inline-block;padding:10px 16px;background:#4f46e5;color:white;text-decoration:none;border-radius:10px">
          Reset Password
        </a>
      </p>
      <p style="font-size:12px;color:#555">If you didn't request this, ignore.</p>
      <p>— TalentBridge Team</p>
    </div>
  `;

  return sendMail({ to: toEmail, subject, text, html });
};

// ✅ Verification Email (USER)
export const sendVerificationEmail = async (toEmail, name, verifyLink) => {
  const subject = "TalentBridge - Verify your email";

  const text = `Hi ${name || "User"},

Verify your email:
${verifyLink}

— TalentBridge Team
`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2>Verify Email</h2>
      <p>Hi ${name || "User"},</p>
      <p>
        <a href="${verifyLink}"
           style="display:inline-block;padding:10px 16px;background:#16a34a;color:white;text-decoration:none;border-radius:8px">
          Verify Email
        </a>
      </p>
      <p>— TalentBridge Team</p>
    </div>
  `;

  return sendMail({ to: toEmail, subject, text, html });
};

// ✅ Optional (non-blocking emails)
export const sendWelcomeEmail = async () => Promise.resolve();
export const sendLoginAlertEmail = async () => Promise.resolve();
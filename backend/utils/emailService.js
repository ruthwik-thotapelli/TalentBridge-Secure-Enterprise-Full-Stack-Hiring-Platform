import nodemailer from "nodemailer";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM_NAME,
  SMTP_FROM_EMAIL,
  FRONTEND_URL,
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
  family: 4,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  tls: {
    servername: SMTP_HOST,
  },
});

const appButton = (label, url, bg = "#6d28d9") => `
  <div style="margin:28px 0;text-align:center;">
    <a href="${url}"
       style="
         display:inline-block;
         padding:14px 24px;
         background:${bg};
         color:#ffffff;
         text-decoration:none;
         border-radius:12px;
         font-weight:700;
         font-size:15px;
       ">
      ${label}
    </a>
  </div>
`;

const baseTemplate = ({ title, subtitle, content, buttonHtml = "", footer = "" }) => `
  <div style="margin:0;padding:24px;background:#f5f3ff;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 12px 40px rgba(76,29,149,0.18);">
      <div style="background:linear-gradient(135deg,#312e81,#6d28d9,#9333ea);padding:34px 28px;text-align:center;">
        <div style="font-size:34px;font-weight:900;color:#ffffff;letter-spacing:0.4px;">
          TalentBridge
        </div>
        <div style="margin-top:8px;font-size:14px;color:#ede9fe;">
          Smart Hiring • Better Careers • Secure Access
        </div>
      </div>

      <div style="padding:34px 30px;color:#1f2937;">
        <h2 style="margin:0 0 10px;font-size:28px;line-height:1.2;color:#3b0764;">
          ${title}
        </h2>

        <p style="margin:0 0 22px;font-size:15px;line-height:1.8;color:#5b4b8a;">
          ${subtitle}
        </p>

        <div style="font-size:15px;line-height:1.9;color:#374151;">
          ${content}
        </div>

        ${buttonHtml}

        ${
          footer
            ? `<div style="margin-top:20px;padding:14px 16px;background:#faf5ff;border:1px solid #ede9fe;border-radius:12px;font-size:13px;line-height:1.7;color:#6b7280;">${footer}</div>`
            : ""
        }
      </div>

      <div style="padding:18px 24px;text-align:center;background:#faf5ff;border-top:1px solid #ede9fe;">
        <div style="font-size:12px;color:#7c3aed;">
          © ${new Date().getFullYear()} TalentBridge. All rights reserved.
        </div>
      </div>
    </div>
  </div>
`;

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
    console.error("❌ Email send failed:", subject, err);
    throw err;
  }
};

export const verifyMailConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ SMTP connection verified");
  } catch (err) {
    console.error("❌ SMTP verify failed:", err);
  }
};

export const sendVerificationEmail = async (toEmail, name, verifyLink) => {
  const subject = "Verify your TalentBridge email";
  const text = `Hi ${name || "User"},

Welcome to TalentBridge.

Please verify your email by opening this link:
${verifyLink}

If you did not create this account, you can ignore this email.

- TalentBridge Team`;

  const html = baseTemplate({
    title: "Verify Your Email ✅",
    subtitle: `Hi ${name || "User"}, welcome to TalentBridge. Please verify your email address to activate your account.`,
    content: `
      <p>You're just one step away from getting started.</p>
      <p>Once verified, you can log in, build your profile, upload resumes, and use ATS features inside TalentBridge.</p>
    `,
    buttonHtml: appButton("Verify Email", verifyLink, "#16a34a"),
    footer: `
      If the button does not work, copy and paste this link into your browser:<br/>
      <span style="word-break:break-all;color:#4f46e5;">${verifyLink}</span>
    `,
  });

  return sendMail({ to: toEmail, subject, text, html });
};

export const sendResetEmail = async (toEmail, name, resetLink) => {
  const subject = "Reset your TalentBridge password";
  const text = `Hi ${name || "User"},

We received a request to reset your TalentBridge password.

Use this link to reset it:
${resetLink}

If you did not request this, you can ignore this email.

- TalentBridge Team`;

  const html = baseTemplate({
    title: "Reset Your Password 🔐",
    subtitle: `Hi ${name || "User"}, we received a request to reset your password.`,
    content: `
      <p>Click the button below to create a new password for your TalentBridge account.</p>
      <p>This link is valid only for a limited time for your security.</p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
    `,
    buttonHtml: appButton("Reset Password", resetLink, "#4f46e5"),
    footer: `
      If the button does not work, copy and paste this link into your browser:<br/>
      <span style="word-break:break-all;color:#4f46e5;">${resetLink}</span>
    `,
  });

  return sendMail({ to: toEmail, subject, text, html });
};

export const sendWelcomeEmail = async (toEmail, name) => {
  const subject = "Welcome to TalentBridge 🎉";
  const text = `Hi ${name || "User"},

Your email has been verified successfully.

Open TalentBridge:
${FRONTEND_URL}

- TalentBridge Team`;

  const html = baseTemplate({
    title: "Welcome to TalentBridge 🎉",
    subtitle: `Hi ${name || "User"}, your email has been verified successfully and your account is now active.`,
    content: `
      <p>We’re excited to have you on TalentBridge.</p>
      <p>You can now log in, complete your profile, upload your resume, and start using TalentBridge features.</p>
    `,
    buttonHtml: appButton("Open TalentBridge", `${FRONTEND_URL}/login`, "#22c55e"),
  });

  return sendMail({ to: toEmail, subject, text, html });
};

export const sendLoginAlertEmail = async (toEmail, name, meta = {}) => {
  const subject = "New login to your TalentBridge account";
  const text = `Hi ${name || "User"},

A new login was detected for your TalentBridge account.

IP Address: ${meta.ip || "N/A"}
Time: ${meta.time || "N/A"}

If this was not you, reset your password:
${FRONTEND_URL}/forgot-password

- TalentBridge Team`;

  const html = baseTemplate({
    title: "New Login Detected",
    subtitle: `Hi ${name || "User"}, a login was detected on your TalentBridge account.`,
    content: `
      <p><strong>IP Address:</strong> ${meta.ip || "N/A"}</p>
      <p><strong>Time:</strong> ${meta.time || "N/A"}</p>
      <p>If this was not you, please reset your password immediately.</p>
    `,
    buttonHtml: appButton("Reset Password", `${FRONTEND_URL}/forgot-password`, "#dc2626"),
  });

  return sendMail({ to: toEmail, subject, text, html });
};
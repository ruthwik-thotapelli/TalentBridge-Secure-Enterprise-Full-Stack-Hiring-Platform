import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM_NAME,
  SMTP_FROM_EMAIL,
} = process.env;

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.error("❌ SMTP env missing:", {
    SMTP_HOST: !!SMTP_HOST,
    SMTP_USER: !!SMTP_USER,
    SMTP_PASS: !!SMTP_PASS,
  });
}

const port = Number(SMTP_PORT || 587);
const secure = port === 465; // 465 = SSL true, 587 = TLS false

const FROM_NAME = SMTP_FROM_NAME || "TalentBridge";
const FROM_EMAIL = SMTP_FROM_EMAIL || SMTP_USER;
const FROM = `"${FROM_NAME}" <${FROM_EMAIL}>`;

// ✅ Create ONE transporter (do NOT recreate per email)
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port,
  secure,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },

  // ✅ Prevent hanging forever (THIS FIXES “Creating…”)
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 12000,

  // ✅ Gmail (587) works fine without rejectUnauthorized false
  // tls: { rejectUnauthorized: false },  // ❌ remove
});

const sendMail = async ({ to, subject, text, html }) => {
  try {
    // ✅ verify once (optional)
    // await transporter.verify(); // enable if you want extra strict check

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
    throw err; // important
  }
};

/* =========================
   EMAIL TEMPLATES
========================= */

// ✅ Email Verification
export const sendVerificationEmail = async (toEmail, name, verifyLink) => {
  const subject = "TalentBridge - Verify your email";

  const text = `Hi ${name || "User"},

Thanks for registering on TalentBridge.

Please verify your email using the link below:
${verifyLink}

If you didn't create this account, ignore this email.

— TalentBridge Team
`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2>Verify your Email</h2>
      <p>Hi ${name || "User"},</p>
      <p>Thanks for registering on <b>TalentBridge</b>.</p>
      <p>Click the button below to verify your email:</p>
      <p>
        <a href="${verifyLink}"
           style="display:inline-block;padding:10px 16px;background:#16a34a;color:white;text-decoration:none;border-radius:8px">
          Verify Email
        </a>
      </p>
      <p style="font-size:12px;color:#555">If you didn’t create this account, ignore this email.</p>
      <p>— TalentBridge Team</p>
    </div>
  `;

  return sendMail({ to: toEmail, subject, text, html });
};

// ✅ Welcome Email
export const sendWelcomeEmail = async (toEmail, name) => {
  const subject = "Welcome to TalentBridge 🎉";

  const text = `Hi ${name || "User"},

Your email is verified successfully ✅
Welcome to TalentBridge!

— TalentBridge Team
`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2>Welcome to TalentBridge 🎉</h2>
      <p>Hi ${name || "User"},</p>
      <p>Your email is verified successfully ✅</p>
      <p>Now you can login and apply for jobs.</p>
      <p>— TalentBridge Team</p>
    </div>
  `;

  return sendMail({ to: toEmail, subject, text, html });
};

// ✅ Login Alert Email
export const sendLoginAlertEmail = async (toEmail, name, meta = {}) => {
  const subject = "TalentBridge - Login Successful ✅";

  const text = `Hi ${name || "User"},

You logged in successfully to TalentBridge.

IP: ${meta.ip || "N/A"}
Time: ${meta.time || "N/A"}

If this wasn't you, reset your password immediately.

— TalentBridge Team
`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2>Login Successful ✅</h2>
      <p>Hi ${name || "User"},</p>
      <p>You logged in successfully to <b>TalentBridge</b>.</p>
      <ul>
        <li><b>IP:</b> ${meta.ip || "N/A"}</li>
        <li><b>Time:</b> ${meta.time || "N/A"}</li>
      </ul>
      <p style="font-size:12px;color:#555">If this wasn’t you, reset your password immediately.</p>
      <p>— TalentBridge Team</p>
    </div>
  `;

  return sendMail({ to: toEmail, subject, text, html });
};

// ✅ Password Reset Email
export const sendResetEmail = async (toEmail, name, resetLink) => {
  const subject = "TalentBridge - Reset your password";

  const text = `Hi ${name || "User"},

We received a request to reset your password.
Reset link (valid for limited time):
${resetLink}

If you didn’t request this, ignore this email.

— TalentBridge Team
`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2>Password Reset</h2>
      <p>Hi ${name || "User"},</p>
      <p>We received a request to reset your password.</p>
      <p>
        <a href="${resetLink}"
           style="display:inline-block;padding:10px 16px;background:#4f46e5;color:white;text-decoration:none;border-radius:10px">
          Reset Password
        </a>
      </p>
      <p style="font-size:12px;color:#555">
        If the button doesn't work, copy this link:
        <br />
        <span style="color:#4f46e5">${resetLink}</span>
      </p>
      <p style="font-size:12px;color:#555">If you didn’t request this, ignore this email.</p>
      <p>— TalentBridge Team</p>
    </div>
  `;

  return sendMail({ to: toEmail, subject, text, html });
};
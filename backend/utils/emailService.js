import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,                 // smtp.gmail.com
    port: Number(process.env.SMTP_PORT) || 587,  // 587 for TLS
    secure: false,                               // true only for 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,               // 16-char app password (no spaces)
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// ✅ Email Verification
export const sendVerificationEmail = async (toEmail, name, verifyLink) => {
  const transporter = createTransporter();

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
      <p>If you didn’t create this account, ignore this email.</p>
      <p>— TalentBridge Team</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"TalentBridge" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject,
    text,
    html,
  });
};

// ✅ Welcome Email (after registration)
export const sendWelcomeEmail = async (toEmail, name) => {
  const transporter = createTransporter();

  const subject = "Welcome to TalentBridge 🎉";

  const text = `Hi ${name || "User"},

Your account is created successfully on TalentBridge.
Please verify your email to activate your account.

— TalentBridge Team
`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2>Welcome to TalentBridge 🎉</h2>
      <p>Hi ${name || "User"},</p>
      <p>Your account has been created successfully.</p>
      <p>Please verify your email to activate your account.</p>
      <p>— TalentBridge Team</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"TalentBridge" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject,
    text,
    html,
  });
};

// ✅ Login Success / Alert Email (after login)
export const sendLoginAlertEmail = async (toEmail, name, meta = {}) => {
  const transporter = createTransporter();

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
      <p>If this wasn’t you, reset your password immediately.</p>
      <p>— TalentBridge Team</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"TalentBridge" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject,
    text,
    html,
  });
};

// ✅ Password Reset
export const sendResetEmail = async (toEmail, name, resetLink) => {
  const transporter = createTransporter();

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
      <p>Click below to reset your password (valid for limited time):</p>
      <p>
        <a href="${resetLink}"
           style="display:inline-block;padding:10px 16px;background:#4f46e5;color:white;text-decoration:none;border-radius:8px">
          Reset Password
        </a>
      </p>
      <p>If you didn’t request this, ignore this email.</p>
      <p>— TalentBridge Team</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"TalentBridge" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject,
    text,
    html,
  });
};

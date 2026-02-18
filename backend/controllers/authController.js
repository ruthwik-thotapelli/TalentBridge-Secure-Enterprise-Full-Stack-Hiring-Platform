import bcrypt from "bcrypt";
import crypto from "crypto";
import db from "../config/db.js";
import { signToken } from "../utils/tokenUtil.js";
import {
  sendResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendLoginAlertEmail,
} from "../utils/emailService.js";

// ✅ REGISTER (if email exists + not verified => resend verify link)
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, password required" });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // ✅ check if email already exists
    const [rows] = await db.query(
      "SELECT id, name, is_verified, provider FROM users WHERE email=?",
      [cleanEmail]
    );

    // ✅ If already exists
    if (rows.length > 0) {
      const user = rows[0];

      // if user registered using google/github
      if (user.provider !== "local") {
        return res.status(409).json({
          message: `This email is already registered using ${user.provider}. Please login using ${user.provider}.`,
        });
      }

      // ✅ If already verified => stop
      if (user.is_verified === 1) {
        return res.status(409).json({ message: "Email already registered" });
      }

      // ✅ Not verified => resend verification link
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expires = new Date(Date.now() + 30 * 60 * 1000);

      await db.query(
        "UPDATE users SET verify_token_hash=?, verify_token_expiry=? WHERE id=?",
        [tokenHash, expires, user.id]
      );

      const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}&email=${encodeURIComponent(
        cleanEmail
      )}`;

      await sendVerificationEmail(cleanEmail, user.name || cleanName, verifyLink);

      return res.status(200).json({
        message: "Account already exists but not verified. Verification email re-sent ✅",
      });
    }

    // ✅ Create new user (not verified)
    const hashed = await bcrypt.hash(cleanPass, 10);

    const [result] = await db.query(
      "INSERT INTO users (name,email,password,role,provider,is_verified) VALUES (?,?,?,?,?,?)",
      [cleanName, cleanEmail, hashed, "user", "local", 0]
    );

    // generate verify token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 30 * 60 * 1000);

    await db.query(
      "UPDATE users SET verify_token_hash=?, verify_token_expiry=? WHERE id=?",
      [tokenHash, expires, result.insertId]
    );

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}&email=${encodeURIComponent(
      cleanEmail
    )}`;

    await sendVerificationEmail(cleanEmail, cleanName, verifyLink);

    // ✅ better: send welcome after verify (optional)
    // sendWelcomeEmail(cleanEmail, cleanName).catch(() => {});

    return res.status(201).json({
      message: "Account created! Please verify your email, then login.",
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) return res.status(400).send("Invalid verification link");

    const cleanEmail = String(email).trim().toLowerCase();
    const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");

    const [rows] = await db.query(
      `SELECT id, name, is_verified, verify_token_hash, verify_token_expiry
       FROM users
       WHERE email=?`,
      [cleanEmail]
    );

    if (rows.length === 0) return res.status(400).send("Invalid verification link");

    const user = rows[0];

    // ✅ already verified
    if (user.is_verified === 1) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?verified=1`);
    }

    if (!user.verify_token_hash || !user.verify_token_expiry) {
      return res.status(400).send("Verification link invalid");
    }

    const expired = new Date(user.verify_token_expiry).getTime() < Date.now();
    const mismatch = user.verify_token_hash !== tokenHash;

    if (expired || mismatch) return res.status(400).send("Verification link expired or invalid");

    await db.query(
      `UPDATE users
       SET is_verified=1, verify_token_hash=NULL, verify_token_expiry=NULL
       WHERE id=?`,
      [user.id]
    );

    // ✅ Send welcome email after verify (optional)
    sendWelcomeEmail(cleanEmail, user.name).catch(() => {});

    return res.redirect(`${process.env.FRONTEND_URL}/login?verified=1`);
  } catch (err) {
    console.error("VERIFY EMAIL ERROR:", err);
    return res.status(500).send("Server error");
  }
};

// ✅ LOGIN (blocks unverified local users, sends login alert email)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const cleanEmail = email.trim().toLowerCase();

    const [rows] = await db.query(
      "SELECT id,name,email,password,role,provider,is_verified FROM users WHERE email=?",
      [cleanEmail]
    );
    if (rows.length === 0) return res.status(401).json({ message: "Invalid email or password" });

    const user = rows[0];

    // local accounts must verify email
    if (user.provider === "local" && user.is_verified === 0) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    if (!user.password) {
      return res.status(401).json({ message: "Use Google/GitHub login for this account" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    // ✅ send login alert email (do not block login if email fails)
    const meta = {
      ip:
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "N/A",
      time: new Date().toLocaleString(),
    };
    sendLoginAlertEmail(user.email, user.name, meta).catch(() => {});

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ FORGOT PASSWORD (blocked if email not verified)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const cleanEmail = email.trim().toLowerCase();

    const [users] = await db.query(
      "SELECT id, name, email, is_verified, provider FROM users WHERE email=?",
      [cleanEmail]
    );

    // don’t reveal existence
    if (users.length === 0) return res.json({ message: "If the email exists, reset link sent ✅" });

    const user = users[0];

    // ✅ block reset if not verified (local accounts)
    if (user.provider === "local" && user.is_verified === 0) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await db.query("DELETE FROM password_resets WHERE user_id=?", [user.id]);

    await db.query(
      "INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?,?,?)",
      [user.id, tokenHash, expires]
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(
      user.email
    )}`;

    await sendResetEmail(user.email, user.name, resetLink);

    return res.json({ message: "If the email exists, reset link sent ✅" });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({ message: "token, email, newPassword required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userTokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const [users] = await db.query("SELECT id FROM users WHERE email=?", [cleanEmail]);
    if (users.length === 0) return res.status(400).json({ message: "Invalid request" });

    const userId = users[0].id;

    const [rows] = await db.query(
      `SELECT id FROM password_resets
       WHERE user_id=? AND token_hash=? AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [userId, userTokenHash]
    );

    if (rows.length === 0) return res.status(400).json({ message: "Token invalid or expired" });

    const hashed = await bcrypt.hash(String(newPassword), 10);

    await db.query("UPDATE users SET password=?, provider='local' WHERE id=?", [hashed, userId]);
    await db.query("DELETE FROM password_resets WHERE user_id=?", [userId]);

    return res.json({ message: "Password updated successfully ✅" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

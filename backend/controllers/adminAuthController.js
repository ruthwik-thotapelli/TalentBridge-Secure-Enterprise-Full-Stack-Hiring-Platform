import bcrypt from "bcrypt";
import crypto from "crypto";
import db from "../config/db.js";
import { sendResetEmail } from "../utils/emailService.js";

// ✅ ADMIN FORGOT PASSWORD
export const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const cleanEmail = String(email).trim().toLowerCase();

    const [rows] = await db.query(
      "SELECT id, name, email, role, provider, is_verified FROM users WHERE email=? LIMIT 1",
      [cleanEmail]
    );

    // ✅ Don’t reveal existence
    if (rows.length === 0) {
      return res.json({ message: "If the email exists, reset link sent ✅" });
    }

    const user = rows[0];

    // ✅ Only admins (still don’t reveal)
    if (user.role !== "admin") {
      return res.json({ message: "If the email exists, reset link sent ✅" });
    }

    // ✅ If local admin but not verified
    if (user.provider === "local" && Number(user.is_verified) === 0) {
      return res.status(403).json({ message: "Admin email is not verified yet." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await db.query("DELETE FROM password_resets WHERE user_id=?", [user.id]);
    await db.query(
      "INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?,?,?)",
      [user.id, tokenHash, expires]
    );

    const resetLink = `${process.env.FRONTEND_URL}/admin/reset-password?token=${rawToken}&email=${encodeURIComponent(
      user.email
    )}`;

    // ✅ EMAIL MUST NOT BREAK API
    try {
      await sendResetEmail(user.email, user.name || "Admin", resetLink);
    } catch (e) {
      console.error("❌ ADMIN reset email failed:", e.message);
      // still continue
    }

    return res.json({ message: "If the email exists, reset link sent ✅" });
  } catch (err) {
    console.error("ADMIN FORGOT PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ ADMIN RESET PASSWORD
export const adminResetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({ message: "token, email, newPassword required" });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const [users] = await db.query("SELECT id, role FROM users WHERE email=? LIMIT 1", [
      cleanEmail,
    ]);

    if (users.length === 0) return res.status(400).json({ message: "Invalid request" });

    const user = users[0];
    if (user.role !== "admin") return res.status(400).json({ message: "Invalid request" });

    const userTokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");

    const [rows] = await db.query(
      `SELECT id FROM password_resets
       WHERE user_id=? AND token_hash=? AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [user.id, userTokenHash]
    );

    if (rows.length === 0) return res.status(400).json({ message: "Token invalid or expired" });

    const hashed = await bcrypt.hash(String(newPassword), 10);

    await db.query("UPDATE users SET password=?, provider='local' WHERE id=?", [hashed, user.id]);
    await db.query("DELETE FROM password_resets WHERE user_id=?", [user.id]);

    return res.json({ message: "Admin password updated successfully ✅" });
  } catch (err) {
    console.error("ADMIN RESET PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
import jwt from "jsonwebtoken";
import db from "../config/db.js";

// ✅ Strict protect (token required)
export const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;

    if (!token) {
      return res
        .status(401)
        .json({ ok: false, message: "Not authorized, token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query(
      "SELECT id, name, email, role, provider FROM users WHERE id=?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ ok: false, message: "User not found" });
    }

    req.user = rows[0];
    return next();
  } catch (err) {
    return res
      .status(401)
      .json({ ok: false, message: "Not authorized, invalid token" });
  }
};

// ✅ Optional protect (token not required)
// Use this for ATS score/history so it works for both logged-in and guest users
export const protectOptional = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query(
      "SELECT id, name, email, role, provider FROM users WHERE id=?",
      [decoded.id]
    );

    req.user = rows.length > 0 ? rows[0] : null;
    return next();
  } catch (err) {
    // ✅ If token invalid, still allow request (guest mode)
    req.user = null;
    return next();
  }
};

// ✅ Admin middleware
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ ok: false, message: "Admin only" });
  }
  return next();
};

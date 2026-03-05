import jwt from "jsonwebtoken";

/**
 * ✅ Generate JWT Token
 * Used during login, OAuth login, admin login, etc.
 */
export const signToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * ✅ Verify JWT Token
 * Used in auth middleware to protect routes
 */
export const verifyToken = (token) => {
  try {
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return null;
  }
};
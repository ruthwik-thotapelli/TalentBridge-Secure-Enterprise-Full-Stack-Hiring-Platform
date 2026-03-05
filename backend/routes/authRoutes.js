import express from "express";
import passport from "passport";
import { signToken } from "../utils/tokenUtil.js";

import {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from "../controllers/authController.js";

const router = express.Router();

// ---------------- LOCAL AUTH ----------------
router.post("/register", register);
router.post("/login", login);

// Email verify
router.get("/verify-email", verifyEmail);

// Password reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ---------------- OAUTH (GOOGLE) ----------------
// ✅ FIX: force account chooser screen every time
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "consent select_account", // ✅ THIS IS THE MAIN CHANGE
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?oauth=failed`,
  }),
  (req, res) => {
    const user = req.user;

    // ✅ JWT
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    // ✅ Redirect to frontend with token
    const redirectUrl = `${process.env.FRONTEND_URL}/oauth-success?token=${encodeURIComponent(
      token
    )}&name=${encodeURIComponent(user.name || "")}&email=${encodeURIComponent(
      user.email || ""
    )}&provider=${encodeURIComponent(user.provider || "google")}`;

    return res.redirect(redirectUrl);
  }
);

// ---------------- OAUTH (GITHUB) ----------------
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
    session: false,
  })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?oauth=failed`,
  }),
  (req, res) => {
    const user = req.user;

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    const redirectUrl = `${process.env.FRONTEND_URL}/oauth-success?token=${encodeURIComponent(
      token
    )}&name=${encodeURIComponent(user.name || "")}&email=${encodeURIComponent(
      user.email || ""
    )}&provider=${encodeURIComponent(user.provider || "github")}`;

    return res.redirect(redirectUrl);
  }
);

export default router;
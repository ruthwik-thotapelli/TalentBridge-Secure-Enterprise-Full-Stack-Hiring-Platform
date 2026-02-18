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

// Local auth
router.post("/register", register);
router.post("/login", login);

// Email verify
router.get("/verify-email", verifyEmail);

// Password reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ---------------- OAUTH (GOOGLE) ----------------
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => {
    // ✅ Generate JWT token and send to frontend
    const user = req.user;
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    // ✅ Redirect to frontend with token + basic user info
    const redirectUrl = `${process.env.FRONTEND_URL}/oauth-success?token=${token}&name=${encodeURIComponent(
      user.name || ""
    )}&email=${encodeURIComponent(user.email || "")}&provider=${encodeURIComponent(user.provider || "google")}`;

    res.redirect(redirectUrl);
  }
);

// ---------------- OAUTH (GITHUB) ----------------
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => {
    const user = req.user;
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    const redirectUrl = `${process.env.FRONTEND_URL}/oauth-success?token=${token}&name=${encodeURIComponent(
      user.name || ""
    )}&email=${encodeURIComponent(user.email || "")}&provider=${encodeURIComponent(user.provider || "github")}`;

    res.redirect(redirectUrl);
  }
);

export default router;

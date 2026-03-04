import express from "express";
import {
  adminForgotPassword,
  adminResetPassword,
} from "../controllers/adminAuthController.js";

const router = express.Router();

/*
  Final endpoints will be:

  POST /api/admin/auth/forgot-password
  POST /api/admin/auth/reset-password
*/

// 🔐 Admin Forgot Password
router.post("/forgot-password", adminForgotPassword);

// 🔐 Admin Reset Password
router.post("/reset-password", adminResetPassword);

export default router;
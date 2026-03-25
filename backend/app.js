import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import passport from "passport";
import path from "path";
import db from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";

import { initPassport } from "./config/passport.js";
import {
  notFoundHandler,
  globalErrorHandler,
} from "./middleware/globalErrorHandler.js";

dotenv.config();
const app = express();

// ===================================
// ✅ CORS
// ===================================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// ===================================
// ✅ Middlewares
// ===================================
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===================================
// ✅ Static Files (Note: Vercel /tmp for uploads)
// ===================================
const uploadsPath = path.join("/tmp", "uploads");
app.use("/uploads", express.static(uploadsPath));

// ===================================
// ✅ Passport
// ===================================
app.use(passport.initialize());
initPassport();

// ===================================
// ✅ Health Check / DB Test
// ===================================
app.get("/", (req, res) =>
  res.json({ message: "TalentBridge API Running ✅" })
);

app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS result");
    res.json({ message: "DB OK ✅", dbTest: rows[0] });
  } catch (err) {
    res.status(500).json({ message: "DB Error ❌", error: err.message });
  }
});

// ===================================
// ✅ Routes
// ===================================
app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/resume", resumeRoutes);

// ===================================
// ✅ Error Handlers
// ===================================
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
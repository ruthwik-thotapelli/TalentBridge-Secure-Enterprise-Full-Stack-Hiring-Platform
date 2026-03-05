import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import path from "path";

import db from "./config/db.js"; // ✅ DB import for health check

import authRoutes from "./routes/authRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import { initPassport } from "./config/passport.js";

dotenv.config();

const app = express();

/* ===============================
   CORS
================================ */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

/* ===============================
   Body Parser
================================ */
app.use(express.json());

/* ===============================
   Static Uploads
================================ */
const uploadsPath = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));

/* ===============================
   Passport OAuth
================================ */
app.use(passport.initialize());
initPassport();

/* ===============================
   Root Route
================================ */
app.get("/", (req, res) => {
  res.send("✅ TalentBridge Backend running");
});

/* ===============================
   HEALTH CHECK (DB TEST)
================================ */
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS ok");

    res.json({
      status: "ok",
      db: rows?.[0]?.ok === 1,
      message: "Database connected successfully",
    });
  } catch (error) {
    console.error("❌ Health check failed:", error);

    res.status(500).json({
      status: "error",
      db: false,
      message: error.message,
    });
  }
});

/* ===============================
   API ROUTES
================================ */
app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/resume", resumeRoutes);

/* ===============================
   Global Error Handler
================================ */
app.use((err, req, res, next) => {
  console.error("❌ Global error:", err);

  res.status(500).json({
    message: err.message || "Server error",
  });
});

/* ===============================
   Server Start
================================ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 TalentBridge backend running on port ${PORT}`);
});
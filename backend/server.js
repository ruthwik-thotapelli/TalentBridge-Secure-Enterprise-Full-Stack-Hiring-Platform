import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import path from "path";
import fs from "fs";

import authRoutes from "./routes/authRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import { initPassport } from "./config/passport.js";

dotenv.config();

const app = express();

/* =====================================================
   ✅ CORS CONFIGURATION
   Allows:
   - Vercel frontend
   - Localhost development
   - Postman / curl
===================================================== */

const allowedOrigins = [
  process.env.FRONTEND_URL, // Vercel frontend
  "http://localhost:3000",  // React dev
  "http://localhost:5173",  // Vite dev
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow Postman / curl

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("⚠️ CORS blocked for:", origin);
      return callback(new Error("CORS not allowed"), false);
    },
    credentials: true,
  })
);

/* =====================================================
   ✅ BODY PARSERS
===================================================== */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =====================================================
   ✅ STATIC FILES (UPLOADS)
===================================================== */

const uploadsPath = path.join(process.cwd(), "uploads");

// create uploads folder if missing
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

app.use("/uploads", express.static(uploadsPath));

/* =====================================================
   ✅ PASSPORT AUTH INITIALIZATION
===================================================== */

app.use(passport.initialize());
initPassport();

/* =====================================================
   ✅ HEALTH CHECK
   Used by Railway to check if server is alive
===================================================== */

app.get("/", (req, res) => {
  res.send("✅ TalentBridge Backend running");
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "TalentBridge API",
  });
});

/* =====================================================
   ✅ API ROUTES
===================================================== */

app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/resume", resumeRoutes);

/*
Admin endpoints example:

POST /api/admin/auth/login
POST /api/admin/auth/forgot-password
POST /api/admin/auth/reset-password
*/

/* =====================================================
   ❌ GLOBAL ERROR HANDLER
===================================================== */

app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* =====================================================
   🚀 START SERVER
===================================================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 TalentBridge backend running on port ${PORT}`);
});
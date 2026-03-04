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
   ✅ CORS (Works with Vercel + localhost + Railway)
   - Allows your FRONTEND_URL
   - Allows any *.vercel.app preview deployments
   - Allows localhost dev
===================================================== */

const allowedOrigins = [
  process.env.FRONTEND_URL, // e.g. https://talentbridge.vercel.app
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow Postman/curl/no-origin requests
      if (!origin) return callback(null, true);

      // allow exact matches
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // allow any vercel preview domains
      if (origin.endsWith(".vercel.app")) return callback(null, true);

      console.warn("⚠️ CORS blocked for:", origin);
      return callback(null, false); // don't throw hard error
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
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
app.use("/uploads", express.static(uploadsPath));

/* =====================================================
   ✅ PASSPORT
===================================================== */
app.use(passport.initialize());
initPassport();

/* =====================================================
   ✅ HEALTH + DEBUG (IMPORTANT FOR RAILWAY)
===================================================== */
app.get("/", (req, res) => res.send("✅ TalentBridge Backend running"));

// ✅ Railway check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "TalentBridge API" });
});

// ✅ Debug: check if Railway is running latest code
app.get("/__debug", (req, res) => {
  res.json({
    ok: true,
    message: "✅ Latest server.js running",
    frontendUrl: process.env.FRONTEND_URL || null,
    nodeEnv: process.env.NODE_ENV || null,
    time: new Date().toISOString(),
  });
});

/* =====================================================
   ✅ ROUTES
===================================================== */
app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/resume", resumeRoutes);

/* =====================================================
   ✅ GLOBAL ERROR HANDLER
===================================================== */
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* =====================================================
   ✅ START SERVER
===================================================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 TalentBridge backend running on port ${PORT}`));
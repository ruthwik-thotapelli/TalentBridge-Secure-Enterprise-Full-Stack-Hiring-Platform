import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import { initPassport } from "./config/passport.js";

dotenv.config();

const app = express();

/**
 * ✅ CORS
 * - supports localhost:3000 (CRA) and localhost:5173 (Vite)
 * - supports PROD via FRONTEND_URL in .env
 */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests like Postman/curl (no origin)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  })
);

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploads
const uploadsPath = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));

// ✅ Passport init
app.use(passport.initialize());
initPassport();

// ✅ Health check
app.get("/", (req, res) => res.send("✅ TalentBridge Backend running"));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes); // ✅ your admin endpoints:
                                             // POST /api/admin/auth/forgot-password
                                             // POST /api/admin/auth/reset-password
app.use("/api/profile", profileRoutes);
app.use("/api/resume", resumeRoutes);

// ✅ Error handler (helps debugging)
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.message);
  res.status(500).json({ message: err.message || "Server error" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
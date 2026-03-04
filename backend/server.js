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

// ---------------- CORS ----------------
const allowedOrigins = [
  process.env.FRONTEND_URL,     // ✅ Vercel
  "http://localhost:3000",      // ✅ local dev
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (Postman / curl)
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

// ---------------- PARSERS ----------------
app.use(express.json());

// ---------------- STATIC UPLOADS ----------------
const uploadsPath = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));

// ---------------- PASSPORT ----------------
app.use(passport.initialize());
initPassport();

// ---------------- HEALTH CHECK ----------------
app.get("/", (req, res) => {
  res.send("✅ TalentBridge Backend running");
});

// ---------------- ROUTES ----------------
app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/resume", resumeRoutes);

// ---------------- ERROR HANDLER ----------------
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err);
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

// ---------------- START ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
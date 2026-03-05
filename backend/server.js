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

// ---------------- PARSERS ----------------
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ IMPORTANT for register body

// ---------------- CORS ----------------
const allowedOrigins = [
  process.env.FRONTEND_URL, // ✅ Vercel production URL
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (Postman/curl)
      if (!origin) return cb(null, true);

      // ✅ Allow exact matches
      if (allowedOrigins.includes(origin)) return cb(null, true);

      // ✅ Allow Vercel preview domains also (optional but useful)
      if (origin.endsWith(".vercel.app")) return cb(null, true);

      return cb(null, false); // ✅ Do not throw error object here
    },
    credentials: true,
  })
);

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

// ---------------- 404 HANDLER ----------------
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// ---------------- ERROR HANDLER ----------------
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// ---------------- START ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
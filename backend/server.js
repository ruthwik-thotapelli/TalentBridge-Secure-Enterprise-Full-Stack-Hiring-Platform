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
import { verifyMailConnection } from "./utils/emailService.js";
import { testDBConnection } from "./config/db.js";

dotenv.config();

console.log("🚀 SERVER DEPLOY MARKER - TalentBridge");

// ---------------- APP INIT ----------------
const app = express();

// ---------------- CORS ----------------
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// ---------------- BODY PARSER ----------------
app.use(express.json());

// ---------------- STATIC FILES ----------------
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

// ---------------- TEST CONNECTIONS ----------------
testDBConnection();
verifyMailConnection();

// ---------------- SERVER START ----------------
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 TalentBridge backend running on port ${PORT}`);
});
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js"; // ✅ ATS / Resume routes
import { initPassport } from "./config/passport.js";

dotenv.config();

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// ✅ Serve uploaded resumes (optional but useful for preview/debug)
const uploadsPath = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));

// Passport init (OAuth)
app.use(passport.initialize());
initPassport();

// Health check
app.get("/", (req, res) => res.send("✅ TalentBridge Backend running"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

// ✅ ATS Resume routes
app.use("/api/resume", resumeRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);

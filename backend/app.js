import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import db from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js"; // ✅ ADD THIS
import profileRoutes from "./routes/profileRoutes.js";

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
// ✅ Health Check
// ===================================
app.get("/", (req, res) =>
  res.json({ message: "TalentBridge Backend Running ✅" })
);

// ===================================
// ✅ DB Test
// ===================================
app.get("/db-test", async (req, res) => {
  const [rows] = await db.query("SELECT 1 + 1 AS result");
  res.json({ message: "DB OK ✅", dbTest: rows[0] });
});

// ===================================
// ✅ Routes
// ===================================
app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes); // ✅ ADD THIS
app.use("/api/profile", profileRoutes);

// ===================================
// ✅ Error Handlers
// ===================================
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import db from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import { notFoundHandler, globalErrorHandler } from "./middleware/globalErrorHandler.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.json({ message: "TalentBridge Backend Running ✅" }));

app.get("/db-test", async (req, res) => {
  const [rows] = await db.query("SELECT 1 + 1 AS result");
  res.json({ message: "DB OK ✅", dbTest: rows[0] });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;

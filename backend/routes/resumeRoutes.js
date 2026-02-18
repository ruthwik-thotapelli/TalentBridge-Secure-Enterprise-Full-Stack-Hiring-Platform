import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import { uploadAndScoreResume } from "../controllers/resumeController.js";
import {
  getATSHistory,
  downloadATSReportPDF, // ✅ ADD
} from "../controllers/atsHistoryController.js";
import { protectOptional } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ✅ Multer storage with safer filenames
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeName = (file.originalname || "resume")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_\.]/g, "")
      .replace(ext, "");

    cb(null, `${safeName}-${Date.now()}${ext}`);
  },
});

// ✅ File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const isPdf = file.mimetype === "application/pdf" || ext === ".pdf";
  const isDocx =
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === ".docx";

  const ok = isPdf || isDocx;
  cb(ok ? null : new Error("Only PDF/DOCX allowed"), ok);
};

// ✅ Upload config
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter,
});

// ✅ Score + Save History
router.post(
  "/score",
  protectOptional,
  upload.single("resume"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          ok: false,
          message: "Resume file is required (PDF/DOCX)",
        });
      }

      await uploadAndScoreResume(req, res);
    } catch (err) {
      return next(err);
    } finally {
      // ✅ Auto delete uploaded file after scoring
      if (req.file?.path) {
        fs.unlink(req.file.path, () => {});
      }
    }
  }
);

// ✅ Get History (latest 10)
router.get("/history", protectOptional, getATSHistory);

// ✅ Download ATS report PDF by report id
router.get("/report/:id/pdf", protectOptional, downloadATSReportPDF);

// ✅ Multer error handler
router.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ ok: false, message: err.message });
  }
  next();
});

export default router;

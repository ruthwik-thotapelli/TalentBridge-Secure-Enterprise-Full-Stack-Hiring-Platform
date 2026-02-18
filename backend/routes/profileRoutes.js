import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { me, admin } from "../controllers/profileController.js";

const router = express.Router();

router.get("/me", protect, me);
router.get("/admin", protect, adminOnly, admin);

export default router;

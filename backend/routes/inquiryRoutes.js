import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  submitContact,
  submitSchedule,
  getAllInquiries,
  getInquiryById,
  updateInquiryStatus,
} from "../controllers/inquiryController.js";

const router = express.Router();

// Public routes
router.post("/contact", submitContact);
router.post("/schedule", submitSchedule);

// Admin only routes
router.get("/all", protect, adminOnly, getAllInquiries);
router.get("/:id", protect, adminOnly, getInquiryById);
router.put("/:id/status", protect, adminOnly, updateInquiryStatus);

export default router;

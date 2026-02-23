import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  checkAdmin,
  getAllUsers,
  getStudents,
  getCustomers,
  getDashboardStats,
} from "../controllers/authController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= AUTH ROUTES ================= */

router.get(
  "/check-admin",
  (req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  },
  checkAdmin
);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

/* ================= ADMIN ROUTES ================= */

router.get("/admin/stats", protect, adminOnly, getDashboardStats);
router.get("/admin/users", protect, adminOnly, getAllUsers);
router.get("/admin/students", protect, adminOnly, getStudents);
router.get("/admin/customers", protect, adminOnly, getCustomers);

export default router;
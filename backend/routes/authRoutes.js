import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  checkAdmin,
} from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.get("/check-admin", checkAdmin);
router.post("/register", registerUser);  // This must exist
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

export default router;

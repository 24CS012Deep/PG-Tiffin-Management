import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  checkAdmin,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/check-admin", checkAdmin);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

export default router;
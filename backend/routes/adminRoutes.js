import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  getTiffinPlans,
  createTiffinPlan,
  updateTiffinPlan,
  deleteTiffinPlan,
  setTodaysMenu
} from "../controllers/tiffinController.js";

import {
  createRoom,
  getAllRooms,
  updateRoom,
  deleteRoom,
  assignStudent,
  removeStudent
} from "../controllers/roomController.js";

import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  sendOrderOTP,
  verifyOrderOTP
} from "../controllers/orderController.js";

import {
  getAllBillings,
  generateBills,
  updateBillingStatus,
  deleteBilling,
  sendBillEmail
} from "../controllers/billingController.js";

import {
  generateBillReport,
  exportBillCSV
} from "../controllers/billGenerationController.js";

import {
  getAllQueries,
  answerQuery,
  deleteQuery
} from "../controllers/queryController.js";

import {
  getAllUsers,
  updateUser,
  deleteUser,
  getDashboardStats
} from "../controllers/authController.js";

import {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword
} from "../controllers/adminSettingsController.js";

import { getReportsData } from "../controllers/reportsController.js";
import {
  getPGStudents,
  getStudentMealRecord,
  getAllMealRecords,
  saveMealRecord,
  generateMealBill,
  updateMealBillStatus
} from "../controllers/mealController.js";

const router = express.Router();

// Dashboard
router.get("/stats", protect, adminOnly, getDashboardStats);

// Reports & Analytics
router.get("/reports", protect, adminOnly, getReportsData);

// Admin Profile & Settings
router.get("/profile", protect, adminOnly, getAdminProfile);
router.put("/profile", protect, adminOnly, updateAdminProfile);
router.put("/change-password", protect, adminOnly, changeAdminPassword);

// User Management
router.get("/users", protect, adminOnly, getAllUsers);
router.put("/users/:id", protect, adminOnly, updateUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);

// Tiffin Plan Routes
router.get("/tiffin-plans", protect, adminOnly, getTiffinPlans);
router.post("/tiffin-plans", protect, adminOnly, createTiffinPlan);
router.put("/tiffin-plans/:id", protect, adminOnly, updateTiffinPlan);
router.delete("/tiffin-plans/:id", protect, adminOnly, deleteTiffinPlan);
router.post("/tiffin-plans/set-menu", protect, adminOnly, setTodaysMenu);

// Room Routes
router.get("/rooms", protect, adminOnly, getAllRooms);
router.post("/rooms", protect, adminOnly, createRoom);
router.put("/rooms/:id", protect, adminOnly, updateRoom);
router.delete("/rooms/:id", protect, adminOnly, deleteRoom);
router.post("/rooms/assign", protect, adminOnly, assignStudent);
router.post("/rooms/remove", protect, adminOnly, removeStudent);

// Order Routes
router.get("/orders", protect, adminOnly, getAllOrders);
router.put("/orders/:id/status", protect, adminOnly, updateOrderStatus);
router.post("/orders/:id/send-otp", protect, adminOnly, sendOrderOTP);
router.post("/orders/verify-otp", protect, adminOnly, verifyOrderOTP);
router.delete("/orders/:id", protect, adminOnly, deleteOrder);

// Billing Routes
router.get("/billings", protect, adminOnly, getAllBillings);
router.post("/billings/generate", protect, adminOnly, generateBills);

// Bill Generation Report Routes — MUST come before /:id routes!
router.post("/billings/generate-report", protect, adminOnly, generateBillReport);
router.get("/billings/export-csv", protect, adminOnly, exportBillCSV);

// Parameterized billing routes
router.put("/billings/:id/status", protect, adminOnly, updateBillingStatus);
router.post("/billings/:id/send-email", protect, adminOnly, sendBillEmail);
router.delete("/billings/:id", protect, adminOnly, deleteBilling);

// Query Routes
router.get("/queries", protect, adminOnly, getAllQueries);
router.put("/queries/:id/answer", protect, adminOnly, answerQuery);
router.delete("/queries/:id", protect, adminOnly, deleteQuery);

// Test Email Route (for debugging SMTP configuration)
router.post("/test-email", protect, adminOnly, async (req, res) => {
  try {
    const sendEmail = (await import("../utils/sendEmail.js")).default;
    const { email } = req.body;
    const target = email || req.user.email;

    await sendEmail({
      to: target,
      subject: "✅ SwadBox Test Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 2px solid #f97316; border-radius: 10px;">
          <h2 style="color: #f97316;">✅ SMTP Configuration Working!</h2>
          <p>This is a test email from SwadBox admin panel.</p>
          <p>If you're receiving this, your email configuration is correct.</p>
          <hr>
          <p style="color: #999; font-size: 12px;">Sent at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
        </div>
      `
    });

    res.json({ success: true, message: `Test email sent to ${target}` });
  } catch (error) {
    console.error("❌ Test email failed:", error);
    res.status(500).json({
      success: false,
      message: "Email failed to send",
      error: error.message,
      hint: "Check EMAIL_USER / EMAIL_PASS in .env — Gmail requires an App Password (not your account password). See: https://myaccount.google.com/apppasswords"
    });
  }
});

// Meal Tracking & Bill Generation Routes
router.get("/meals/students", protect, adminOnly, getPGStudents);
router.get("/meals/all/:month", protect, adminOnly, getAllMealRecords);
router.get("/meals/:studentId/:month", protect, adminOnly, getStudentMealRecord);
router.post("/meals/save", protect, adminOnly, saveMealRecord);
router.post("/meals/generate-bill", protect, adminOnly, generateMealBill);
router.put("/meals/:id/status", protect, adminOnly, updateMealBillStatus);

export default router;
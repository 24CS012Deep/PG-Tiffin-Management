import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  getTiffinPlans,
  createTiffinPlan,
  updateTiffinPlan,
  deleteTiffinPlan,
  setTodaysMenu,
  getTiffinHistory
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
  verifyOrderOTP,
  verifyPayment
} from "../controllers/orderController.js";

import {
  getAllBillings,
  generateBills,
  updateBillingStatus,
  deleteBilling,
  sendBillEmail,
  resetOldHistory
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
router.get("/tiffin-plans/history", protect, adminOnly, getTiffinHistory);
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
router.post("/orders/verify-payment", protect, adminOnly, verifyPayment);
router.delete("/orders/:id", protect, adminOnly, deleteOrder);

// Billing Routes
router.get("/billings", protect, adminOnly, getAllBillings);
router.post("/billings/generate", protect, adminOnly, generateBills);
router.post("/billings/reset-history", protect, adminOnly, resetOldHistory);

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



// Meal Tracking & Bill Generation Routes
router.get("/meals/students", protect, adminOnly, getPGStudents);
router.get("/meals/all/:month", protect, adminOnly, getAllMealRecords);
router.get("/meals/:studentId/:month", protect, adminOnly, getStudentMealRecord);
router.post("/meals/save", protect, adminOnly, saveMealRecord);
router.post("/meals/generate-bill", protect, adminOnly, generateMealBill);
router.put("/meals/:id/status", protect, adminOnly, updateMealBillStatus);

export default router;
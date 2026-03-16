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
  deleteOrder
} from "../controllers/orderController.js";

import {
  getAllBillings,
  generateBills,
  updateBillingStatus,
  deleteBilling
} from "../controllers/billingController.js";

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

const router = express.Router();

// Dashboard
router.get("/stats", protect, adminOnly, getDashboardStats);

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
router.delete("/orders/:id", protect, adminOnly, deleteOrder);

// Billing Routes
router.get("/billings", protect, adminOnly, getAllBillings);
router.post("/billings/generate", protect, adminOnly, generateBills);
router.put("/billings/:id/status", protect, adminOnly, updateBillingStatus);
router.delete("/billings/:id", protect, adminOnly, deleteBilling);

// Query Routes
router.get("/queries", protect, adminOnly, getAllQueries);
router.put("/queries/:id/answer", protect, adminOnly, answerQuery);
router.delete("/queries/:id", protect, adminOnly, deleteQuery);

export default router;
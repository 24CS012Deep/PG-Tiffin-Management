import express from "express";
import { protect, customerOnly } from "../middleware/authMiddleware.js";
import {
  getCustomerProfile,
  updateCustomerProfile,
  getCustomerDashboard,
  verifyCustomerPassword,
} from "../controllers/customerController.js";
import { 
  createOrder, 
  getUserOrders, 
  cancelOrder
} from "../controllers/orderController.js";  // ✅ These now exist
import { getUserBillings } from "../controllers/billingController.js";
import { createQuery, getUserQueries } from "../controllers/queryController.js";
import { getTiffinPlans } from "../controllers/tiffinController.js";

const router = express.Router();

router.use(protect, customerOnly);

router.get("/dashboard", getCustomerDashboard);
router.get("/profile", getCustomerProfile);
router.put("/profile", updateCustomerProfile);
router.post("/profile/verify-password", verifyCustomerPassword);
router.get("/tiffin-plans", getTiffinPlans);
router.get("/orders", getUserOrders);           // ✅ Now works
router.post("/orders", createOrder);             // ✅ Now works
router.put("/orders/:id/cancel", cancelOrder);   // ✅ Now works
router.get("/billings", getUserBillings);
router.get("/queries", getUserQueries);
router.post("/queries", createQuery);

export default router;
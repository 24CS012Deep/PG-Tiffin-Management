import express from "express";
import User from "../models/User.js";
import Room from "../models/Room.js";
import TiffinPlan from "../models/TiffinPlan.js";
import Order from "../models/Order.js";

const router = express.Router();

// Get Public Stats for Homepage
router.get("/stats", async (req, res) => {
  try {
    const [totalStudents, totalCustomers, totalRooms, totalPlans, totalOrders] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "customer" }),
      Room.countDocuments(),
      TiffinPlan.countDocuments({ isActive: true }),
      Order.countDocuments()
    ]);

    res.json({
      success: true,
      stats: {
        students: totalStudents > 0 ? totalStudents : "50+",
        customers: totalCustomers > 0 ? totalCustomers : "100+",
        rooms: totalRooms > 0 ? totalRooms : "20+",
        mealsDelivered: totalOrders > 0 ? totalOrders * 30 : "10k+", // Simplified multiple
        plans: totalPlans
      }
    });
  } catch (error) {
    console.error("Public stats error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Get Today's Menu publicly
router.get("/todays-menu", async (req, res) => {
  try {
    const today = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    // Find all active plans
    const plans = await TiffinPlan.find({ isActive: true });
    
    // Filter to only return plans that have menu items for today
    const todaysMenuPlans = plans.filter(plan => {
      const menuForToday = plan.menu?.find(m => m.date === today);
      return menuForToday && menuForToday.items && menuForToday.items.length > 0;
    }).map(plan => {
      const menuForToday = plan.menu?.find(m => m.date === today);
      return {
        _id: plan._id,
        name: plan.name,
        price: plan.price,
        items: menuForToday.items
      };
    });

    res.json({
      success: true,
      date: today,
      menus: todaysMenuPlans
    });
  } catch (error) {
    console.error("Public menu error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;

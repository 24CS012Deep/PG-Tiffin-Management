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

    const vacancy = Math.max(0, 7 - totalStudents);

    res.json({
      success: true,
      stats: {
        students: totalStudents,
        customers: totalCustomers > 0 ? totalCustomers : "100+",
        rooms: totalRooms > 0 ? totalRooms : "20+",
        vacancy: vacancy,
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
    
    const plans = await TiffinPlan.find({ isActive: true });
    
    const formattedPlans = plans.map(plan => {
      // Check if plan date matches today or if it's a general plan
      const isToday = plan.date === today;
      
      // Split items by newline or comma
      const itemsArray = plan.items ? plan.items.split(/[,\n]/).filter(item => item.trim() !== "") : [];
      
      return {
        _id: plan._id,
        name: plan.name || plan.planNumber,
        price: plan.price || plan.tiffinPrice,
        items: itemsArray,
        isMenuSet: itemsArray.length > 0,
        isToday: isToday
      };
    });

    res.json({
      success: true,
      date: today,
      menus: formattedPlans
    });
  } catch (error) {
    console.error("Public menu error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;

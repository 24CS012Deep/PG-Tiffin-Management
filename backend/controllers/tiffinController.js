import TiffinPlan from "../models/TiffinPlan.js";
import Order from "../models/Order.js";

/* ================= CREATE TIFFIN PLAN ================= */
export const createTiffinPlan = async (req, res) => {
  try {
    const { name, price, description, photo, maxCustomers, type, mealTypes } = req.body;

    const plan = await TiffinPlan.create({
      name,
      price,
      description,
      photo: photo || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      maxCustomers: maxCustomers || 50,
      currentCustomers: 0,
      type: type || "veg",
      mealTypes: mealTypes || ["lunch", "dinner"],
      createdBy: req.user.id,
      isActive: true,
      menu: []
    });

    res.status(201).json(plan);
  } catch (error) {
    console.error("Create plan error:", error);
    res.status(500).json({ message: "Failed to create plan" });
  }
};

/* ================= GET ALL TIFFIN PLANS ================= */
// This function should already exist
export const getTiffinPlans = async (req, res) => {
  try {
    const plans = await TiffinPlan.find({ isActive: true }).populate("createdBy", "name").sort("-createdAt");
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch plans" });
  }
};

/* ================= UPDATE TIFFIN PLAN ================= */
export const updateTiffinPlan = async (req, res) => {
  try {
    const { name, price, description, photo, maxCustomers, type, mealTypes, isActive } = req.body;
    
    const plan = await TiffinPlan.findByIdAndUpdate(
      req.params.id,
      { name, price, description, photo, maxCustomers, type, mealTypes, isActive },
      { new: true }
    );

    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: "Failed to update plan" });
  }
};

/* ================= DELETE TIFFIN PLAN ================= */
export const deleteTiffinPlan = async (req, res) => {
  try {
    const plan = await TiffinPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const activeOrders = await Order.countDocuments({ tiffinPlan: req.params.id, status: "live" });
    if (activeOrders > 0) {
      return res.status(400).json({ message: "Cannot delete plan with active orders" });
    }

    await TiffinPlan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete plan" });
  }
};

/* ================= SET TODAY'S MENU ================= */
export const setTodaysMenu = async (req, res) => {
  try {
    const { planId, items } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    const plan = await TiffinPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const existingMenuIndex = plan.menu.findIndex(m => m.date === today);
    if (existingMenuIndex >= 0) {
      plan.menu[existingMenuIndex].items = items;
    } else {
      plan.menu.push({ date: today, items });
    }
    
    await plan.save();

    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ message: "Failed to set menu" });
  }
};
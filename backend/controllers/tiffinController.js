import TiffinPlan from "../models/TiffinPlan.js";
import Order from "../models/Order.js";

/* ================= CREATE TIFFIN PLAN ================= */
export const createTiffinPlan = async (req, res) => {
  try {
    const { name, price, description, photo, maxCustomers, type, mealTypes, targetDate, cutOffTime } = req.body;

    console.log("📝 Creating tiffin plan with:", { name, price, type, mealTypes, targetDate, cutOffTime });

    const plan = await TiffinPlan.create({
      name,
      price,
      description,
      photo: photo || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      maxCustomers: maxCustomers || 50,
      currentCustomers: 0,
      type: type || "veg",
      mealTypes: mealTypes || ["lunch", "dinner"],
      targetDate: targetDate || "",
      cutOffTime: cutOffTime || "",
      createdBy: req.user.id,
      isActive: true,
      menu: []
    });

    console.log("✅ Plan created successfully:", plan._id);
    res.status(201).json(plan);
  } catch (error) {
    console.error("❌ Create plan error:", error);
    res.status(500).json({ message: "Failed to create plan", error: error.message });
  }
};

/* ================= GET ALL TIFFIN PLANS ================= */
export const getTiffinPlans = async (req, res) => {
  try {
    console.log("📋 Fetching tiffin plans...");
    
    const plans = await TiffinPlan.find()
      .populate("createdBy", "name")
      .lean()
      .sort("-createdAt");
    
    console.log(`✅ Found ${plans.length} tiffin plans`);
    
    if (plans.length === 0) {
      console.log("⚠️  No tiffin plans found in database");
    }
    
    // Ensure all plans have the required fields
    const processedPlans = plans.map(plan => ({
      ...plan,
      isActive: plan.isActive !== false,
      currentCustomers: plan.currentCustomers || 0,
      maxCustomers: plan.maxCustomers || 50,
      type: plan.type || "veg",
      mealTypes: plan.mealTypes || ["lunch", "dinner"],
      menu: plan.menu || []
    }));
    
    res.json(processedPlans);
  } catch (error) {
    console.error("❌ Get plans error:", error);
    res.status(500).json({ message: "Failed to fetch plans", error: error.message });
  }
};

/* ================= UPDATE TIFFIN PLAN ================= */
export const updateTiffinPlan = async (req, res) => {
  try {
    const { name, price, description, photo, maxCustomers, type, mealTypes, isActive, targetDate, cutOffTime } = req.body;
    
    const plan = await TiffinPlan.findByIdAndUpdate(
      req.params.id,
      { name, price, description, photo, maxCustomers, type, mealTypes, isActive, targetDate, cutOffTime },
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

/* ================= SET MENU FOR DATE ================= */
export const setTodaysMenu = async (req, res) => {
  try {
    const { planId, items, date } = req.body;
    
    // Provide a fallback to today in local timezone format if not provided
    const targetDate = date || new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    const plan = await TiffinPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const existingMenuIndex = plan.menu.findIndex(m => m.date === targetDate);
    if (existingMenuIndex >= 0) {
      plan.menu[existingMenuIndex].items = items;
    } else {
      plan.menu.push({ date: targetDate, items });
    }
    
    await plan.save();

    res.json({ success: true, plan, date: targetDate, items });
  } catch (error) {
    console.error("Set menu error:", error);
    res.status(500).json({ message: "Failed to set menu" });
  }
};
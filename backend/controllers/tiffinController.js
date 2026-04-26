import TiffinPlan from "../models/TiffinPlan.js";
import Order from "../models/Order.js";
import { notifyCustomersOfNewMenu } from "../utils/notifyCustomers.js";

/* ================= CREATE TIFFIN PLAN ================= */
export const createTiffinPlan = async (req, res) => {
  try {
    console.log(" Creating Tiffin Plan:", req.body);
    console.log(" By User:", req.user);
    const { planNumber, tiffinPrice, maxCapacity, date, description, items, isActive, mealShifts } = req.body;

    const plan = await TiffinPlan.create({
      planNumber,
      tiffinPrice,
      maxCapacity: maxCapacity || 50,
      date,
      description,
      items: items || "",
      isActive: isActive !== undefined ? isActive : true,
      mealShifts: mealShifts || ["lunch"],
      createdBy: req.user.id
    });

    console.log(" Plan created successfully:", plan._id);
    
    // Notify customers after 1 minute if plan is active
    if (plan.isActive) {
      notifyCustomersOfNewMenu(plan);
    }

    res.status(201).json(plan);
  } catch (error) {
    console.error(" Create plan error:", error);
    res.status(500).json({ message: "Failed to create plan", error: error.message });
  }
};

/* ================= GET ALL TIFFIN PLANS ================= */
export const getTiffinPlans = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    let filter = {};
    
    const todayStr = new Date().toISOString().split('T')[0];
    if (activeOnly === 'true') {
      filter = { 
        isActive: true,
        date: { $gte: todayStr }
      };
    } else {
      // For Admin, show plans from today onwards by default, but allow showing all
      filter = { date: { $gte: todayStr } };
    }
    
    const plans = await TiffinPlan.find(filter)
      .populate("createdBy", "name")
      .sort("date"); // Sort by date ascending for active plans
    
    // Calculate orders count for each plan
    const plansWithCounts = await Promise.all(plans.map(async (plan) => {
      const ordersCount = await Order.countDocuments({ 
        tiffinPlan: plan._id, 
        status: { $ne: "cancelled" } 
      });
      return { ...plan.toObject(), ordersCount };
    }));
    
    res.json(plansWithCounts);
  } catch (error) {
    console.error(" Get plans error:", error);
    res.status(500).json({ message: "Failed to fetch plans", error: error.message });
  }
};

/* ================= GET TIFFIN HISTORY ================= */
export const getTiffinHistory = async (req, res) => {
  try {
    console.log("📜 Fetching Tiffin History...");
    const todayStr = new Date().toISOString().split('T')[0];
    const plans = await TiffinPlan.find({ date: { $lt: todayStr } })
      .populate("createdBy", "name")
      .sort("-date")
      .lean();
    
    const historyPlans = await Promise.all(plans.map(async (plan) => {
      const ordersCount = await Order.countDocuments({ tiffinPlan: plan._id, status: "completed" });
      const cancelledCount = await Order.countDocuments({ tiffinPlan: plan._id, status: "cancelled" });
      const totalRevenue = ordersCount * plan.tiffinPrice;
      return { ...plan, ordersCount, cancelledCount, totalRevenue };
    }));
    
    res.json(historyPlans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tiffin history" });
  }
};

/* ================= GET TIFFIN HISTORY (CUSTOMER) ================= */
export const getTiffinHistoryForCustomer = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const plans = await TiffinPlan.find({ date: { $lt: todayStr } })
      .select("-totalRevenue") // Hide revenue from customers
      .sort("-date")
      .lean();
    
    const historyPlans = await Promise.all(plans.map(async (plan) => {
      const ordersCount = await Order.countDocuments({ tiffinPlan: plan._id, status: "completed" });
      return { ...plan, ordersCount };
    }));
    
    res.json(historyPlans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tiffin history" });
  }
};

/* ================= UPDATE TIFFIN PLAN ================= */
export const updateTiffinPlan = async (req, res) => {
  try {
    const { planNumber, tiffinPrice, maxCapacity, date, description, items, isActive, mealShifts } = req.body;
    
    const plan = await TiffinPlan.findByIdAndUpdate(
      req.params.id,
      { planNumber, tiffinPrice, maxCapacity, date, description, items, isActive, mealShifts },
      { new: true }
    );

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // Notify customers if the plan just became active or was updated while active
    // (Wait: maybe only if it just became active? Or any change to items?)
    // The user said "when the admin created the plan then active".
    if (plan.isActive) {
      notifyCustomersOfNewMenu(plan);
    }

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

/* ================= SET MENU FOR DATE (DEPRECATED) ================= */
export const setTodaysMenu = async (req, res) => {
  try {
    const { planId, items, date } = req.body;
    const plan = await TiffinPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    plan.items = Array.isArray(items) ? items.join(", ") : items;
    plan.date = date || plan.date;
    
    await plan.save();
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ message: "Failed to set menu" });
  }
};

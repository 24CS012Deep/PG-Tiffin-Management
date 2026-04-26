import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Order from "../models/Order.js";
import Billing from "../models/Billing.js";
import Query from "../models/Query.js";
import TiffinPlan from "../models/TiffinPlan.js";

// @desc    Get current customer profile
// @route   GET /api/customer/profile
// @access  Private (Customer only)
export const getCustomerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -resetPasswordToken -resetPasswordExpire");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// @desc    Update customer profile
// @route   PUT /api/customer/profile
// @access  Private (Customer only)
export const updateCustomerProfile = async (req, res) => {
  try {
    const { name, email, phone, address, deliveryPreference, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    // Update basic fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (deliveryPreference) user.deliveryPreference = deliveryPreference;

    // If password change requested
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      user.password = newPassword; // Will be hashed by pre-save hook
    }

    await user.save();

    // Return updated user without sensitive fields
    const updatedUser = await User.findById(user._id).select("-password -resetPasswordToken -resetPasswordExpire");
    res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// @desc    Verify customer's current password before password change
// @route   POST /api/customer/profile/verify-password
// @access  Private (Customer only)
export const verifyCustomerPassword = async (req, res) => {
  try {
    const { currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ message: "Current password is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    return res.json({ success: true, message: "Password verified" });
  } catch (error) {
    console.error("Verify password error:", error);
    res.status(500).json({ message: "Failed to verify password" });
  }
};

// @desc    Get customer dashboard data
// @route   GET /api/customer/dashboard
// @access  Private (Customer only)
export const getCustomerDashboard = async (req, res) => {
  try {
    const customerId = req.user.id;

    const [orders, bills, queries, availablePlans] = await Promise.all([
      Order.find({ customer: customerId })
        .populate("tiffinPlan", "name")
        .sort("-createdAt"),
      Billing.find({ user: customerId }).sort("-generatedAt"),
      Query.find({ user: customerId }).sort("-createdAt"),
      TiffinPlan.countDocuments({ isActive: true }),
    ]);

    const totalOrders = orders.length;
    const activeOrders = orders.filter((o) => o.status === "live").length;
    const totalBills = bills.length;
    const pendingBills = bills.filter((b) => b.status === "pending").length;
    const totalQueries = queries.length;
    const openQueries = queries.filter((q) => q.status === "open").length;

    res.json({
      success: true,
      stats: {
        totalOrders,
        activeOrders,
        totalBills,
        pendingBills,
        totalQueries,
        openQueries,
        availablePlans,
      },
      recentOrders: orders.slice(0, 3),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};

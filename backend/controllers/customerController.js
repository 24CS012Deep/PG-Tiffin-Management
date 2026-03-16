import User from "../models/User.js";
import bcrypt from "bcryptjs";

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
    if (phone) user.phone = phone;
    if (address) user.address = address;
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

// @desc    Get customer dashboard data
// @route   GET /api/customer/dashboard
// @access  Private (Customer only)
export const getCustomerDashboard = async (req, res) => {
  try {
    // This is a placeholder - actual data will come from other controllers
    res.json({ 
      message: "Customer Dashboard",
      user: req.user 
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};
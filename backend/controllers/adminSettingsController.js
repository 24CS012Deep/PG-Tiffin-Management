import User from "../models/User.js";
import bcrypt from "bcryptjs";

/* ================= GET ADMIN PROFILE ================= */
export const getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -resetPasswordToken -resetPasswordExpire"
    );
    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({ message: "Failed to fetch admin profile" });
  }
};

/* ================= UPDATE ADMIN PROFILE ================= */
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email.toLowerCase();
    }

    // Update basic fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();

    // Return updated user without sensitive fields
    const updatedUser = await User.findById(user._id).select(
      "-password -resetPasswordToken -resetPasswordExpire"
    );

    // Also update localStorage on the frontend side by returning the user
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update admin profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

/* ================= CHANGE ADMIN PASSWORD ================= */
export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Check new password is different
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res
        .status(400)
        .json({ message: "New password must be different from current password" });
    }

    // Set new password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change admin password error:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
};

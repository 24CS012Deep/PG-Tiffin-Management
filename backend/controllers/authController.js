import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

export const checkAdmin = async (req, res) => {
  try {
    const admin = await User.exists({ role: "admin" });

    res.status(200).json({
      success: true,
      adminExists: !!admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking admin",
    });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });
    if (await User.findOne({ email })) return res.status(400).json({ message: "Email already exists" });
    if (role === "admin" && await User.exists({ role: "admin" })) {
      return res.status(400).json({ message: "Admin account already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    res.status(201).json({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    console.log("[LOGIN] Attempting login for email:", email);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log("[LOGIN] User not found:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    console.log("[LOGIN] User found:", user.email, "Role:", user.role);
    
    if (user.isBlocked) {
      console.log("[LOGIN] User account is blocked:", email);
      return res.status(403).json({ message: "Account is blocked" });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("[LOGIN] Password match:", isMatch);
    
    if (!isMatch) {
      console.log("[LOGIN] Password mismatch for:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "secretkey", { expiresIn: "1d" });
    
    // Send login email notification
    try {
      await sendEmail({
        to: user.email,
        subject: "Login Notification - SwadBox",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <h2 style="color:#f97316;text-align:center;">🍱 Welcome Back to SwadBox!</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Your account has been successfully logged in at <strong>${new Date().toLocaleString()}</strong></p>
            <p>If this wasn't you, please reset your password immediately.</p>
            <hr>
            <p style="text-align:center;font-size:13px;color:#777;">Homemade Taste Delivered with Love ❤️</p>
          </div>
        `,
      });
      console.log("[LOGIN] Email sent successfully to:", user.email);
    } catch (emailErr) {
      console.log("[LOGIN] Email notification failed:", emailErr.message);
    }
    
    console.log("[LOGIN] Success for:", user.email, "Role:", user.role);
    res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role }, role: user.role });
  } catch (error) {
    console.error("[LOGIN] Server error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset Password - SwadBox 🔐",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color:#f97316;text-align:center;">🔐 Reset Your Password</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>We received a password reset request. Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="background:#f97316;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;display:inline-block;margin:20px 0;">
            Reset Password
          </a>
          <p><strong>This link expires in 15 minutes.</strong></p>
          <p>If you didn't request this, ignore this email.</p>
          <hr>
          <p style="text-align:center;font-size:13px;color:#777;">Homemade Taste Delivered with Love ❤️</p>
        </div>
      `,
    });

    res.json({ success: true, message: "Password reset email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Password is required" });
    
    const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Password Changed - SwadBox",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color:#f97316;text-align:center;">✓ Password Changed Successfully</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Your password has been successfully reset.</p>
          <p>You can now login with your new password.</p>
          <hr>
          <p style="text-align:center;font-size:13px;color:#777;">Homemade Taste Delivered with Love ❤️</p>
        </div>
      `,
    });

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= ADMIN USER MANAGEMENT ================= */

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("-password");

    res.status(200).json({
      success: true,
      customers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= DASHBOARD STATS ================= */

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalCustomers = await User.countDocuments({ role: "customer" });

    res.json({
      success: true,
      totalUsers,
      totalStudents,
      totalCustomers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
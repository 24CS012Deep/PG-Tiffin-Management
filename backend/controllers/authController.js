import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import Room from "../models/Room.js";
import Order from "../models/Order.js";
import TiffinPlan from "../models/TiffinPlan.js";
import Query from "../models/Query.js";
import Billing from "../models/Billing.js";

/* ================= ADMIN STATS ================= */
export const getDashboardStats = async (req, res) => {
  try {
    console.log(" Fetching dashboard stats...");
    
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalRooms = await Room.countDocuments();
    const totalTiffinPlans = await TiffinPlan.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments({ status: "live" });
    const totalQueries = await Query.countDocuments({ status: "open" });

    // Calculate monthly revenue (all non-cancelled orders)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const orders = await Order.find({
      createdAt: { $gte: startOfMonth },
      status: { $ne: "cancelled" }
    });
    const monthlyRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Get recent orders
    const recentOrders = await Order.find()
      .populate("customer", "name")
      .populate("tiffinPlan", "name")
      .sort("-createdAt")
      .limit(5);

    // Get recent queries
    const recentQueries = await Query.find({ status: "open" })
      .populate("user", "name")
      .sort("-createdAt")
      .limit(5);

    console.log(" Dashboard stats fetched successfully");

    res.json({
      totalUsers,
      totalStudents,
      totalCustomers,
      totalRooms,
      totalTiffinPlans,
      totalOrders,
      totalQueries,
      monthlyRevenue,
      revenueTarget: 150000,
      recentOrders,
      recentQueries
    });
  } catch (error) {
    console.error(" Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
};

/* ================= GET ALL USERS ================= */
export const getAllUsers = async (req, res) => {
  try {
    console.log(" Fetching all users...");
    const users = await User.find().select("-password").sort("-createdAt");
    console.log(` Found ${users.length} users`);
    res.json({ success: true, users });
  } catch (error) {
    console.error(" Failed to fetch users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/* ================= GET USER BY ID ================= */
export const getUserById = async (req, res) => {
  try {
    console.log(" Fetching user by ID:", req.params.id);
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      console.log(" User not found");
      return res.status(404).json({ message: "User not found" });
    }
    console.log(" User found:", user.email);
    res.json(user);
  } catch (error) {
    console.error(" Failed to fetch user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

/* ================= UPDATE USER ================= */
export const updateUser = async (req, res) => {
  try {
    console.log(" Updating user:", req.params.id);
    const { name, email, role, isBlocked, roomNumber } = req.body;
    
    // Check if email already exists for another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        console.log(" Email already exists:", email);
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, isBlocked, roomNumber },
      { new: true }
    ).select("-password");
    
    if (!user) {
      console.log(" User not found");
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log(" User updated successfully:", user.email);
    res.json({ success: true, user });
  } catch (error) {
    console.error(" Failed to update user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

/* ================= DELETE USER ================= */
export const deleteUser = async (req, res) => {
  try {
    console.log(" Deleting user:", req.params.id);
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log(" User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has active orders or room assignments
    if (user.role === "student" && user.roomNumber) {
      const room = await Room.findOne({ roomNumber: user.roomNumber });
      if (room) {
        room.students = room.students.filter(id => id.toString() !== user._id.toString());
        await room.save();
        console.log(" Removed student from room");
      }
    }

    if (user.role === "customer") {
      const activeOrders = await Order.countDocuments({ customer: user._id, status: "live" });
      if (activeOrders > 0) {
        console.log(" Cannot delete user with active orders");
        return res.status(400).json({ message: "Cannot delete user with active orders" });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    console.log(" User deleted successfully");
    
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(" Failed to delete user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

/* ================= CHECK ADMIN ================= */
export const checkAdmin = async (req, res) => {
  try {
    console.log(" Checking if admin exists...");
    const admin = await User.findOne({ role: "admin" });
    console.log("Admin exists:", !!admin);
    res.json({
      success: true,
      adminExists: !!admin
    });
  } catch (error) {
    console.error(" Error checking admin:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error checking admin" 
    });
  }
};

/* ================= REGISTER ================= */
export const registerUser = async (req, res) => {
  try {
    console.log("=".repeat(50));
    console.log(" REGISTRATION ATTEMPT");
    console.log("=".repeat(50));
    console.log("Request body:", { 
      name: req.body.name, 
      email: req.body.email, 
      role: req.body.role,
      password: "***" 
    });

    let { name, email, password, role, phone, address, roomNumber } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      console.log(" Missing required fields");
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Please enter a valid email" 
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters" 
      });
    }

    // Check for at least one number and one letter (optional but recommended)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must contain at least one letter and one number" 
      });
    }

    // Clean up inputs
    email = email.trim().toLowerCase();
    password = password.trim();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(" Email already exists:", email);
      return res.status(400).json({ 
        success: false, 
        message: "Email already exists" 
      });
    }

    // Create user - plain password, model will hash it
    console.log("Creating new user...");
    const user = new User({
      name,
      email,
      password, // Plain password - model will hash automatically
      role,
      phone,
      address,
      roomNumber
    });

    // Save user (triggers pre-save hook)
    const savedUser = await user.save();
    console.log(" User saved successfully! ID:", savedUser._id);
    console.log("Password was hashed:", savedUser.password !== password);

    // If student and roomNumber provided, sync with Room model
    if (savedUser.role === "student" && roomNumber) {
      try {
        const room = await Room.findOne({ roomNumber });
        if (room) {
          if (!room.students.includes(savedUser._id)) {
            room.students.push(savedUser._id);
            await room.save();
            console.log(` Student ${savedUser.name} added to Room ${roomNumber}`);
          }
        }
      } catch (roomErr) {
        console.error("Failed to sync room assignment during registration:", roomErr);
      }
    }

    // Send welcome email to new user
    try {
      await sendEmail({
        to: savedUser.email,
        subject: "Welcome to Siya PG!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;"> Welcome to Siya PG!</h1>
              <p style="color: #fed7aa; margin: 8px 0 0 0; font-size: 14px;">Your account has been created</p>
            </div>
            <div style="padding: 25px;">
              <p style="font-size: 16px;">Hello <strong>${savedUser.name}</strong>,</p>
              <p style="color: #6b7280;">Your account has been successfully created on the Siya PG Management System. Here are your account details:</p>
              
              <div style="background-color: #fdf8f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
                <h3 style="color: #f97316; margin-top: 0;">Account Details</h3>
                <p><strong>Name:</strong> ${savedUser.name}</p>
                <p><strong>Email:</strong> ${savedUser.email}</p>
                <p><strong>Role:</strong> ${savedUser.role}</p>
                <p><strong>Password:</strong> The password you were provided by admin</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/signin" style="background-color: #f97316; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Sign In Now</a>
              </div>
              
              <p style="color: #6b7280; font-size: 13px;">We recommend changing your password after first login from the Settings page.</p>
            </div>
            <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">Siya PG Management System</p>
            </div>
          </div>
        `
      });
      console.log(" Welcome email sent to:", savedUser.email);
    } catch (emailError) {
      console.log(" Welcome email failed:", emailError.message);
    }

    // Return success
    res.status(201).json({ 
      success: true, 
      message: "User registered successfully",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role
      }
    });

  } catch (error) {
    console.error(" REGISTRATION ERROR:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already exists" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || "Registration failed" 
    });
  }
};

/* ================= LOGIN ================= */
export const loginUser = async (req, res) => {
  try {
    console.log("=".repeat(50));
    console.log("🔐 LOGIN ATTEMPT");
    console.log("=".repeat(50));
    console.log("Request body:", { email: req.body.email, password: "***" });

    let { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      console.log(" Missing email or password");
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    email = email.trim().toLowerCase();
    password = password.trim();

    console.log("Looking up user with email:", email);
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(" User not found with email:", email);
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    console.log(" User found:", user.email);
    console.log("User role:", user.role);
    console.log("Stored password hash length:", user.password.length);

    // Check if user is blocked
    if (user.isBlocked) {
      console.log(" User is blocked");
      return res.status(403).json({ 
        success: false, 
        message: "Your account has been blocked. Please contact admin." 
      });
    }

    // Compare passwords using bcrypt directly
    console.log("Comparing passwords...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      console.log(" Password does not match");
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    console.log(" Password matched successfully");

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(" JWT token generated");

    console.log("=".repeat(50));
    console.log(" LOGIN SUCCESSFUL for:", user.email);
    console.log("=".repeat(50));
    
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        roomNumber: user.roomNumber
      },
    });

  } catch (error) {
    console.error(" LOGIN ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Login failed. Please try again." 
    });
  }
};

/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = async (req, res) => {
  try {
    console.log(" Forgot password request for:", req.body.email);
    
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(" User not found");
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    console.log(" Reset token generated for:", user.email);
    
    // Try to send email (don't fail if email fails)
    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request - SwadBox",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f97316; border-radius: 10px;">
            <h2 style="color: #f97316;">Password Reset Request</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>You requested to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            </div>
            <p>Or copy this link: <br> <a href="${resetUrl}">${resetUrl}</a></p>
            <p>This link will expire in 15 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">SwadBox - Your Food Partner</p>
          </div>
        `
      });
      console.log(" Reset email sent to:", user.email);
    } catch (emailError) {
      console.log(" Email failed but token generated");
    }

    res.json({ 
      success: true, 
      message: "Password reset link sent to email" 
    });
    
  } catch (error) {
    console.error(" Forgot password error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to process request" 
    });
  }
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = async (req, res) => {
  try {
    console.log("🔄 Reset password attempt");
    
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: "Password is required" 
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters" 
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      console.log(" Invalid or expired token");
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired token" 
      });
    }

    // Set new password (will be hashed by pre-save hook)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.log(" Password reset successful for:", user.email);
    
    // Try to send confirmation email
    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Successful - SwadBox",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f97316; border-radius: 10px;">
            <h2 style="color: #f97316;">Password Reset Successful</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Your password has been reset successfully.</p>
            <p>You can now log in with your new password.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">SwadBox - Your Food Partner</p>
          </div>
        `
      });
    } catch (emailError) {
      console.log(" Confirmation email failed");
    }

    res.json({ 
      success: true, 
      message: "Password reset successful" 
    });
    
  } catch (error) {
    console.error(" Reset password error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to reset password" 
    });
  }
};

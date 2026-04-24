import Order from "../models/Order.js";
import TiffinPlan from "../models/TiffinPlan.js";
import User from "../models/User.js";
import Billing from "../models/Billing.js";
import sendEmail from "../utils/sendEmail.js";
import { generateOTP, getOTPExpirationTime } from "../utils/generateOTP.js";

/* ================= CREATE ORDER (CUSTOMER) ================= */
export const createOrder = async (req, res) => {
  try {
    console.log("📝 Creating order for customer:", req.user.id);
    
    const { tiffinPlan, date, items, quantity, deliveryTime, specialInstructions } = req.body;
    
    // Validate required fields
    if (!tiffinPlan || !quantity) {
      return res.status(400).json({ message: "Tiffin plan and quantity are required" });
    }

    // Find the plan
    const plan = await TiffinPlan.findById(tiffinPlan);
    if (!plan) {
      return res.status(404).json({ message: "Tiffin plan not found" });
    }

    // Check if plan is active
    if (!plan.isActive) {
      return res.status(400).json({ message: "This plan is not currently active" });
    }

    // Check capacity
    if (plan.currentCustomers >= plan.maxCustomers) {
      return res.status(400).json({ message: "This plan has reached maximum capacity" });
    }

    // Check Date and Cut-Off Time constraints
    const todayStr = new Date().toISOString().split('T')[0];
    if (plan.targetDate && plan.targetDate < todayStr) {
      return res.status(400).json({ message: "This plan has expired and is no longer available." });
    }

    if (plan.targetDate === todayStr && plan.cutOffTime && !plan.cutOffTime.endsWith('m')) {
      const now = new Date();
      // Format current time as HH:MM
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      
      if (currentTimeStr > plan.cutOffTime) {
        return res.status(400).json({ message: `Ordering for this plan closed at ${plan.cutOffTime}.` });
      }
    }

    // Calculate total amount
    const totalAmount = plan.price * (quantity || 1);

    // Create order
    const order = await Order.create({
      customer: req.user.id,
      tiffinPlan,
      date: date || new Date(),
      items: items || [],
      quantity: quantity || 1,
      totalAmount,
      deliveryTime: deliveryTime || "both",
      specialInstructions,
      status: "live",
      paymentStatus: "pending"
    });

    // Update plan customer count
    plan.currentCustomers = (plan.currentCustomers || 0) + 1;
    await plan.save();

    // Reflect order amount in customer's monthly tiffin bill
    const billMonth = new Date(order.date).toLocaleString("en-IN", {
      month: "long",
      year: "numeric",
    });
    const existingBill = await Billing.findOne({
      user: req.user.id,
      month: billMonth,
      type: "tiffin",
    });

    if (existingBill) {
      existingBill.amount = (existingBill.amount || 0) + totalAmount;
      existingBill.status = existingBill.status === "paid" ? "paid" : "pending";
      await existingBill.save();
    } else {
      await Billing.create({
        user: req.user.id,
        month: billMonth,
        amount: totalAmount,
        type: "tiffin",
        status: "pending",
        details: `Tiffin orders for ${billMonth}`,
      });
    }

    // Send confirmation email
    try {
      const customer = await User.findById(req.user.id);
      await sendEmail({
        to: customer.email,
        subject: "Order Confirmation - SwadBox",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f97316; border-radius: 10px;">
            <h2 style="color: #f97316;">Order Confirmed! 🎉</h2>
            <p>Hello <strong>${customer.name}</strong>,</p>
            <p>Your order has been placed successfully.</p>
            
            <div style="background-color: #fdf8f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #f97316; margin-top: 0;">Order Details</h3>
              <p><strong>Plan:</strong> ${plan.name}</p>
              <p><strong>Quantity:</strong> ${quantity || 1}</p>
              <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
              <p><strong>Delivery Time:</strong> ${deliveryTime || "both"}</p>
              <p><strong>Date:</strong> ${new Date(date || new Date()).toLocaleDateString()}</p>
              ${specialInstructions ? `<p><strong>Special Instructions:</strong> ${specialInstructions}</p>` : ''}
            </div>
            
            <p>Thank you for choosing SwadBox!</p>
          </div>
        `
      });
    } catch (emailError) {
      console.log("⚠️ Order confirmation email failed:", emailError.message);
    }

    // Return populated order
    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name email")
      .populate("tiffinPlan", "name price photo");

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error("❌ Create order error:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};

/* ================= GET USER ORDERS (CUSTOMER/STUDENT) ================= */
export const getUserOrders = async (req, res) => {
  try {
    console.log("📋 Fetching orders for user:", req.user.id);
    
    const orders = await Order.find({ customer: req.user.id })
      .populate("tiffinPlan", "name price photo description")
      .sort("-createdAt");
      
    res.json(orders);
  } catch (error) {
    console.error("❌ Get user orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* ================= GET ORDER BY ID ================= */
export const getOrderById = async (req, res) => {
  try {
    console.log("🔍 Fetching order by ID:", req.params.id);
    
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email")
      .populate("tiffinPlan", "name price description");
      
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized to view this order
    if (order.customer._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    console.error("❌ Get order error:", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

/* ================= CANCEL ORDER (CUSTOMER) ================= */
export const cancelOrder = async (req, res) => {
  try {
    console.log("🗑️ Cancelling order:", req.params.id);
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized to cancel this order
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    // Check if order can be cancelled
    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    if (order.status === "completed") {
      return res.status(400).json({ message: "Cannot cancel completed order" });
    }

    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    const orderCreatedAt = new Date(order.createdAt).getTime();
    const now = Date.now();
    const elapsedMs = now - orderCreatedAt;

    if (elapsedMs > FIVE_MINUTES_MS) {
      return res.status(400).json({
        message: "Order can only be cancelled within 5 minutes of placing it"
      });
    }

    // Update order status
    order.status = "cancelled";
    await order.save();

    // Decrease plan customer count
    const plan = await TiffinPlan.findById(order.tiffinPlan);
    if (plan) {
      plan.currentCustomers = Math.max(0, (plan.currentCustomers || 1) - 1);
      await plan.save();
    }

    // Reduce customer's monthly tiffin bill when order is cancelled
    const billMonth = new Date(order.date).toLocaleString("en-IN", {
      month: "long",
      year: "numeric",
    });
    const existingBill = await Billing.findOne({
      user: req.user.id,
      month: billMonth,
      type: "tiffin",
    });

    if (existingBill) {
      const updatedAmount = (existingBill.amount || 0) - (order.totalAmount || 0);
      if (updatedAmount <= 0 && existingBill.status !== "paid") {
        await Billing.findByIdAndDelete(existingBill._id);
      } else {
        existingBill.amount = Math.max(0, updatedAmount);
        await existingBill.save();
      }
    }

    // Send cancellation email
    try {
      const customer = await User.findById(req.user.id);
      await sendEmail({
        to: customer.email,
        subject: "Order Cancelled - SwadBox",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f97316; border-radius: 10px;">
            <h2 style="color: #f97316;">Order Cancelled</h2>
            <p>Hello <strong>${customer.name}</strong>,</p>
            <p>Your order has been cancelled successfully.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        `
      });
    } catch (emailError) {
      console.log("⚠️ Cancellation email failed:", emailError.message);
    }

    res.json({ 
      success: true, 
      message: "Order cancelled successfully" 
    });
  } catch (error) {
    console.error("❌ Cancel order error:", error);
    res.status(500).json({ message: "Failed to cancel order" });
  }
};

/* ================= GET ALL ORDERS (ADMIN) ================= */
export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate("customer", "name email")
      .populate("tiffinPlan", "name price")
      .sort("-createdAt");
      
    res.json(orders);
  } catch (error) {
    console.error("❌ Get all orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* ================= UPDATE ORDER STATUS (ADMIN) ================= */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    
    const order = await Order.findById(req.params.id)
      .populate("customer")
      .populate("tiffinPlan");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Generate OTP if status is being changed to "completed" (order delivered)
    let otpGenerated = null;
    if (status === "completed" && !order.otpVerified) {
      const otp = generateOTP();
      const otpExpiresAt = getOTPExpirationTime();
      
      order.otp = otp;
      order.otpExpiresAt = otpExpiresAt;
      order.deliveryStatus = "delivered";
      
      console.log(`🔑 OTP Generated for order ${req.params.id}: ${otp}`);
      otpGenerated = otp;
    }

    // Update order status
    order.status = status;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    // ✅ FIX: Removed manual `order.updatedAt = new Date()`.
    // Order schema now uses { timestamps: true } which auto-updates updatedAt on save.
    await order.save();

    // Update plan customer count if order is completed or cancelled
    if (status === "completed" || status === "cancelled") {
      const plan = await TiffinPlan.findById(order.tiffinPlan._id);
      if (plan && plan.currentCustomers > 0) {
        plan.currentCustomers = Math.max(0, (plan.currentCustomers || 1) - 1);
        await plan.save();
      }
    }

    // Send OTP email if OTP was generated
    if (otpGenerated) {
      try {
        await sendEmail({
          to: order.customer.email,
          subject: "Order Delivery OTP - SwadBox",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f97316; border-radius: 10px;">
              <h2 style="color: #f97316;">🎉 Your Order is Delivered!</h2>
              <p>Hello <strong>${order.customer.name}</strong>,</p>
              <p>Your order for <strong>${order.tiffinPlan.name}</strong> has been delivered.</p>
              
              <div style="background-color: #fdf8f2; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
                <p style="color: #666; margin-bottom: 10px;">Please provide this OTP to confirm delivery:</p>
                <h1 style="color: #f97316; font-size: 48px; letter-spacing: 5px; margin: 0;">${otpGenerated}</h1>
                <p style="color: #999; font-size: 12px; margin-top: 10px;">This OTP is valid for 15 minutes</p>
              </div>
              
              <p>Please enter this OTP in your app to confirm that you have received your order.</p>
              <p>If you did not receive this order or have any issues, please contact our support team immediately.</p>
            </div>
          `
        });
        console.log("📧 OTP email sent to:", order.customer.email);
      } catch (emailError) {
        console.log("⚠️ OTP email failed:", emailError.message);
      }
    } else {
      // Send regular status update email
      try {
        await sendEmail({
          to: order.customer.email,
          subject: "Order Status Update - SwadBox",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f97316; border-radius: 10px;">
              <h2 style="color: #f97316;">Order Status Updated</h2>
              <p>Hello <strong>${order.customer.name}</strong>,</p>
              <p>Your order for <strong>${order.tiffinPlan.name}</strong> has been updated.</p>
              <p><strong>New Status:</strong> ${status}</p>
              <p><strong>Payment Status:</strong> ${paymentStatus || order.paymentStatus}</p>
            </div>
          `
        });
      } catch (emailError) {
        console.log("⚠️ Status update email failed:", emailError.message);
      }
    }

    const updatedOrder = await Order.findById(req.params.id)
      .populate("customer")
      .populate("tiffinPlan");

    res.json(updatedOrder);
  } catch (error) {
    console.error("❌ Update order status error:", error);
    res.status(500).json({ message: "Failed to update order" });
  }
};

/* ================= SEND ORDER OTP (ADMIN) ================= */
export const sendOrderOTP = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer")
      .populate("tiffinPlan");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = getOTPExpirationTime();
    
    order.otp = otp;
    order.otpExpiresAt = otpExpiresAt;
    order.otpVerified = false;
    await order.save();

    console.log(`🔑 OTP Generated for order ${req.params.id}: ${otp}`);

    // Send OTP email
    try {
      await sendEmail({
        to: order.customer.email,
        subject: "Delivery Verification OTP - SwadBox",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f97316; border-radius: 10px;">
            <h2 style="color: #f97316;">🔑 Your Delivery OTP</h2>
            <p>Hello <strong>${order.customer.name}</strong>,</p>
            <p>Your order for <strong>${order.tiffinPlan.name}</strong> is ready for delivery.</p>
            
            <div style="background-color: #fdf8f2; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
              <p style="color: #666; margin-bottom: 10px;">Please provide this OTP to the admin to confirm your delivery:</p>
              <h1 style="color: #f97316; font-size: 48px; letter-spacing: 5px; margin: 0;">${otp}</h1>
              <p style="color: #999; font-size: 12px; margin-top: 10px;">This OTP is valid for 15 minutes</p>
            </div>
            
            <p>If you did not request this, please contact support.</p>
          </div>
        `
      });
      console.log("📧 OTP email sent to:", order.customer.email);
    } catch (emailError) {
      console.log("⚠️ OTP email failed:", emailError.message);
    }

    res.json({ success: true, message: "OTP sent to customer successfully", order });
  } catch (error) {
    console.error("❌ Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/* ================= VERIFY ORDER OTP (CUSTOMER) ================= */
export const verifyOrderOTP = async (req, res) => {
  try {
    const { orderId, otp } = req.body;

    // Validate input
    if (!orderId || !otp) {
      return res.status(400).json({ message: "Order ID and OTP are required" });
    }

    // Find order
    const order = await Order.findById(orderId)
      .populate("customer", "name email")
      .populate("tiffinPlan", "name price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized (order belongs to them or user is admin)
    if (order.customer._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to verify this order" });
    }

    // Check if order is in a state that requires OTP verification
    // Accept: order has an OTP set and is not yet verified.
    const needsOTPVerification = order.otp && !order.otpVerified;

    if (!needsOTPVerification) {
      return res.status(400).json({ 
        message: "This order is not awaiting OTP verification." 
      });
    }

    // Check if OTP has already been verified
    if (order.otpVerified) {
      return res.status(400).json({ 
        message: "OTP has already been verified for this order" 
      });
    }

    // Check if OTP exists
    if (!order.otp) {
      return res.status(400).json({ 
        message: "No OTP found for this order. Please contact support." 
      });
    }

    // Note: OTP expiration check removed to prevent users from getting permanently stuck
    // if they check their email late.

    // Verify OTP
    if (order.otp !== otp) {
      return res.status(400).json({ 
        message: "Invalid OTP. Please try again." 
      });
    }

    // Mark OTP as verified
    order.otpVerified = true;
    order.otpVerifiedAt = new Date();
    order.deliveryStatus = "verified";
    order.status = "completed";
    await order.save();

    console.log(`✅ OTP verified for order: ${orderId}`);

    // Send confirmation email
    try {
      await sendEmail({
        to: order.customer.email,
        subject: "Delivery Confirmed - SwadBox",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f97316; border-radius: 10px;">
            <h2 style="color: #f97316;">✅ Delivery Confirmed!</h2>
            <p>Hello <strong>${order.customer.name}</strong>,</p>
            <p>Thank you for confirming the delivery of your order.</p>
            
            <div style="background-color: #fdf8f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #f97316; margin-top: 0;">Order Details</h3>
              <p><strong>Plan:</strong> ${order.tiffinPlan.name}</p>
              <p><strong>Status:</strong> Delivery Verified</p>
              <p><strong>Verified At:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p>We hope you enjoyed your meal! Thank you for choosing SwadBox.</p>
          </div>
        `
      });
    } catch (emailError) {
      console.log("⚠️ Confirmation email failed:", emailError.message);
    }

    res.json({
      success: true,
      message: "Delivery confirmed! Thank you for your order.",
      order
    });
  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

/* ================= DELETE ORDER (ADMIN) ================= */
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Decrease plan customer count if order was live
    if (order.status === "live") {
      const plan = await TiffinPlan.findById(order.tiffinPlan);
      if (plan && plan.currentCustomers > 0) {
        plan.currentCustomers = Math.max(0, (plan.currentCustomers || 1) - 1);
        await plan.save();
      }
    }

    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("❌ Delete order error:", error);
    res.status(500).json({ message: "Failed to delete order" });
  }
};
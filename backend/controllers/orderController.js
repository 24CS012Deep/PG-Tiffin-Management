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
    
    const { tiffinPlan, date, items, quantity, deliveryTime, deliveryAddress, specialInstructions } = req.body;
    
    // Validate required fields
    if (!tiffinPlan || !quantity || !deliveryAddress) {
      return res.status(400).json({ message: "Tiffin plan, quantity, and address are required" });
    }

    // Check if user already ordered this plan for this date
    const existingOrder = await Order.findOne({
      customer: req.user.id,
      tiffinPlan,
      date: date || new Date().toISOString().split('T')[0],
      status: { $ne: "cancelled" }
    });

    if (existingOrder) {
      return res.status(400).json({ message: "You have already ordered this plan. Please check your orders." });
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

    // Check Date constraints
    const todayStr = new Date().toISOString().split('T')[0];
    if (plan.date && plan.date < todayStr) {
      return res.status(400).json({ message: "This plan has expired and is no longer available." });
    }

    // Calculate total amount
    const totalAmount = plan.tiffinPrice * (quantity || 1);

    // Create order
    const order = await Order.create({
      customer: req.user.id,
      tiffinPlan,
      date: date || new Date(),
      items: Array.isArray(items) ? items : [plan.items],
      quantity: quantity || 1,
      totalAmount,
      deliveryTime: deliveryTime || (plan.mealShifts && plan.mealShifts[0]) || "lunch",
      deliveryAddress,
      specialInstructions,
      status: "live",
      paymentStatus: "pending"
    });

    // Send confirmation email
    try {
      const customer = await User.findById(req.user.id);
      await sendEmail({
        to: customer.email,
        subject: "Order Confirmation - SwadBox",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ff8c00; border-radius: 10px;">
            <h2 style="color: #ff8c00;">Order Confirmed! 🎉</h2>
            <p>Hello <strong>${customer.name}</strong>,</p>
            <p>Your order has been placed successfully.</p>
            
            <div style="background-color: #fffaf0; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #ff8c00; margin-top: 0;">Order Details</h3>
              <p><strong>Plan:</strong> ${plan.planNumber}</p>
              <p><strong>Quantity:</strong> ${quantity || 1}</p>
              <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
              <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
              <p><strong>Date:</strong> ${new Date(date || new Date()).toLocaleDateString()}</p>
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
      .populate("tiffinPlan", "planNumber tiffinPrice");

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error("❌ Create order error:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};

/* ================= VERIFY ORDER OTP (ADMIN/CUSTOMER) ================= */
export const verifyOrderOTP = async (req, res) => {
  try {
    const { orderId, otp } = req.body;

    if (!orderId || !otp) {
      return res.status(400).json({ message: "Order ID and OTP are required" });
    }

    const order = await Order.findById(orderId)
      .populate("customer", "name email")
      .populate("tiffinPlan", "planNumber tiffinPrice");

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    // Update order status after verification
    order.otpVerified = true;
    order.otpVerifiedAt = new Date();
    order.deliveryStatus = "verified";
    order.status = "completed";
    order.paymentStatus = "unpaid"; // Move to unpaid after delivery
    await order.save();

    // Create billing entry
    const billMonth = new Date(order.date).toLocaleString("en-IN", { month: "long", year: "numeric" });
    await Billing.create({
      user: order.customer._id,
      month: billMonth,
      amount: order.totalAmount,
      type: "tiffin",
      status: "pending",
      details: `Tiffin order ${order.tiffinPlan.planNumber} delivered on ${new Date(order.date).toLocaleDateString()}`,
      breakdown: {
        customerOrder: {
          items: order.items.join(", "),
          quantity: order.quantity,
          address: order.deliveryAddress,
          planNumber: order.tiffinPlan.planNumber
        }
      }
    });

    console.log(`✅ OTP verified and order completed for: ${orderId}`);

    res.json({
      success: true,
      message: "Order verified and completed successfully!",
      order
    });
  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

/* ================= VERIFY PAYMENT (ADMIN) ================= */
export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate("customer").populate("tiffinPlan");

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.paymentStatus = "paid";
    order.paymentVerified = true;
    await order.save();

    // Send payment confirmation email
    try {
      await sendEmail({
        to: order.customer.email,
        subject: "Payment Confirmed - SwadBox",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #22c55e; border-radius: 10px;">
            <h2 style="color: #22c55e;">Payment Received! ✅</h2>
            <p>Hello <strong>${order.customer.name}</strong>,</p>
            <p>We have received your payment for order <strong>${order.tiffinPlan.planNumber}</strong>.</p>
            <p><strong>Amount Paid:</strong> ₹${order.totalAmount}</p>
            <p>Thank you for your business!</p>
          </div>
        `
      });
    } catch (emailError) {
      console.log("⚠️ Payment confirmation email failed:", emailError.message);
    }

    res.json({ success: true, message: "Payment verified successfully", order });
  } catch (error) {
    console.error("❌ Verify payment error:", error);
    res.status(500).json({ message: "Failed to verify payment" });
  }
};

/* ================= GET USER ORDERS (CUSTOMER/STUDENT) ================= */
export const getUserOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { customer: req.user.id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate("tiffinPlan")
      .sort("-createdAt");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* ================= GET ALL ORDERS (ADMIN) ================= */
export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate("customer", "name email phone address")
      .populate("tiffinPlan")
      .sort("-createdAt");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* ================= SEND ORDER OTP (ADMIN) ================= */
export const sendOrderOTP = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("customer").populate("tiffinPlan");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const otp = generateOTP();
    order.otp = otp;
    order.otpExpiresAt = getOTPExpirationTime();
    order.otpVerified = false;
    await order.save();

    await sendEmail({
      to: order.customer.email,
      subject: "Delivery OTP - SwadBox",
      html: `<h1>Your Delivery OTP is ${otp}</h1><p>Please share this with the delivery person.</p>`
    });

    res.json({ success: true, message: "OTP sent to customer" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/* ================= UPDATE ORDER STATUS (ADMIN) ================= */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status" });
  }
};

/* ================= CANCEL ORDER (CUSTOMER/STUDENT) ================= */
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Ensure only the owner can cancel
    if (order.customer.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (order.status !== "live") {
      return res.status(400).json({ message: "Only live orders can be cancelled" });
    }

    order.status = "cancelled";
    await order.save();
    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel order" });
  }
};

/* ================= DELETE ORDER (ADMIN) ================= */
export const deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete order" });
  }
};
import Order from "../models/Order.js";
import TiffinPlan from "../models/TiffinPlan.js";
import User from "../models/User.js";
import Billing from "../models/Billing.js";
import sendEmail from "../utils/sendEmail.js";

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
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        paymentStatus,
        updatedAt: new Date()
      },
      { new: true }
    ).populate("customer").populate("tiffinPlan");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Update plan customer count if order is completed or cancelled
    if (status === "completed" || status === "cancelled") {
      const plan = await TiffinPlan.findById(order.tiffinPlan._id);
      if (plan && plan.currentCustomers > 0) {
        plan.currentCustomers = Math.max(0, (plan.currentCustomers || 1) - 1);
        await plan.save();
      }
    }

    // Send status update email to customer
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

    res.json(order);
  } catch (error) {
    console.error("❌ Update order status error:", error);
    res.status(500).json({ message: "Failed to update order" });
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
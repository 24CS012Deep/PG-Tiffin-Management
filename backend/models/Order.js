import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  tiffinPlan: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "TiffinPlan", 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  items: [String],
  status: { 
    type: String, 
    enum: ["live", "completed", "cancelled"], 
    default: "live" 
  },
  quantity: {
    type: Number,
    default: 1
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  deliveryAddress: String,
  deliveryTime: {
    type: String,
    enum: ["breakfast", "lunch", "dinner", "both"],
    default: "both"
  },
  specialInstructions: String,
  // OTP verification fields
  otp: {
    type: String,
    default: null
  },
  otpExpiresAt: {
    type: Date,
    default: null
  },
  otpVerified: {
    type: Boolean,
    default: false
  },
  otpVerifiedAt: {
    type: Date,
    default: null
  },
  deliveryStatus: {
    type: String,
    enum: ["pending", "delivered", "verified"],
    default: "pending"
  },
  // ✅ FIX: Removed manual createdAt/updatedAt fields.
  // Using timestamps:true below so Mongoose auto-manages them reliably.
  // This fixes the canCancelOrder() bug where order.createdAt was sometimes null.
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
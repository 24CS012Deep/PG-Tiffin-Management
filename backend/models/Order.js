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
    enum: ["live", "completed", "cancelled", "inactive"], 
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
    enum: ["pending", "unpaid", "paid", "failed"],
    default: "pending"
  },
  paymentVerified: {
    type: Boolean,
    default: false
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  deliveryTime: {
    type: String,
    enum: ["lunch", "dinner", "both"],
    default: "lunch"
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
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
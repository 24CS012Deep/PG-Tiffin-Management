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
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
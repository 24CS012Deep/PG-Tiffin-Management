import mongoose from "mongoose";

const billingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  month: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  details: { 
    type: String 
  },
  type: {
    type: String,
    enum: ["room", "tiffin", "mess", "monthly"],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending"
  },
  dueDate: Date,
  paidAt: Date,
  paymentMethod: String,
  transactionId: String,
  breakdown: {
    roomRent: Number,
    foodCharges: Number,
    mealCounts: {
      breakfast: Number,
      lunch: Number,
      dinner: Number
    },
    dailyRecords: Array, // Optional detailed breakdown
    // Customer specific fields
    customerOrder: {
      items: String,
      quantity: Number,
      address: String,
      planNumber: String
    }
  },
  generatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Billing = mongoose.models.Billing || mongoose.model("Billing", billingSchema);
export default Billing;

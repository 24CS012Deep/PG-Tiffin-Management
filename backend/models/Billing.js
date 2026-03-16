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
    enum: ["room", "tiffin"],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "paid", "overdue"],
    default: "pending"
  },
  dueDate: Date,
  paidAt: Date,
  paymentMethod: String,
  transactionId: String,
  generatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Billing = mongoose.models.Billing || mongoose.model("Billing", billingSchema);
export default Billing;
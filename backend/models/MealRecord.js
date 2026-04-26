import mongoose from "mongoose";

const dailyRecordSchema = new mongoose.Schema({
  day: { type: Number, required: true }, // 1-31
  breakfast: { type: Boolean, default: false },
  lunch: { type: Boolean, default: false },
  dinner: { type: Boolean, default: false },
  dailyTotal: { type: Number, default: 0 }
}, { _id: false });

const mealRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  month: {
    type: String,
    required: true  // Format: "2026-04"
  },
  roomRent: {
    type: Number,
    required: true,
    default: 0
  },
  mealPrices: {
    breakfast: { type: Number, default: 20 },
    lunch:     { type: Number, default: 40 },
    dinner:    { type: Number, default: 40 }
  },
  dailyRecords: [dailyRecordSchema],
  foodCharges: { type: Number, default: 0 },
  totalAmount:  { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending"
  },
  paidAt: Date,
  paymentMethod: String,
  transactionId: String,
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound index: one record per student per month
mealRecordSchema.index({ student: 1, month: 1 }, { unique: true });

const MealRecord = mongoose.models.MealRecord || mongoose.model("MealRecord", mealRecordSchema);
export default MealRecord;

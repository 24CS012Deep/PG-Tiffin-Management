import mongoose from "mongoose";

const tiffinPlanSchema = new mongoose.Schema({
  planNumber: { 
    type: String, 
    required: true 
  },
  tiffinPrice: { 
    type: Number, 
    required: true 
  },
  maxCapacity: {
    type: Number,
    default: 50
  },
  date: { 
    type: String, // YYYY-MM-DD
    required: true
  },
  description: { 
    type: String 
  },
  photo: { 
    type: String,
    default: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
  },
  items: {
    type: String, // User wants to write items directly
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  mealShifts: {
    type: [String],
    enum: ["breakfast", "lunch", "dinner"],
    default: ["lunch"]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

// Backward compatibility for old code that might use "name" or "price"
tiffinPlanSchema.virtual('name').get(function() { return this.planNumber; });
tiffinPlanSchema.virtual('price').get(function() { return this.tiffinPrice; });

const TiffinPlan = mongoose.models.TiffinPlan || mongoose.model("TiffinPlan", tiffinPlanSchema);
export default TiffinPlan;

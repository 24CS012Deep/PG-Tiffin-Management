import mongoose from "mongoose";

const tiffinPlanSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String 
  },
  photo: { 
    type: String,
    default: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
  },
  maxCustomers: { 
    type: Number, 
    default: 50 
  },
  currentCustomers: {
    type: Number,
    default: 0
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  menu: [
    {
      date: String,
      items: [String],
    },
  ],
  isActive: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    enum: ["veg", "non-veg", "both"],
    default: "veg"
  },
  mealTypes: [{
    type: String,
    enum: ["breakfast", "lunch", "dinner"],
    default: ["lunch", "dinner"]
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const TiffinPlan = mongoose.models.TiffinPlan || mongoose.model("TiffinPlan", tiffinPlanSchema);
export default TiffinPlan;
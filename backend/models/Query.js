import mongoose from "mongoose";

const querySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  question: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ["open", "closed"], 
    default: "open" 
  },
  answer: { 
    type: String 
  },
  category: {
    type: String,
    enum: ["room", "food", "billing", "general"],
    default: "general"
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

const Query = mongoose.models.Query || mongoose.model("Query", querySchema);
export default Query;
import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    type: {
      type: String,
      enum: ["contact", "schedule"],
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    // For schedule visits only
    preferredDate: {
      type: Date,
      default: null,
    },
    preferredTime: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "completed", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Inquiry = mongoose.models.Inquiry || mongoose.model("Inquiry", inquirySchema);
export default Inquiry;

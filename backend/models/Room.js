import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  capacity: { 
    type: Number, 
    required: true,
    min: 1,
    max: 4
  },
  students: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  details: { 
    type: String 
  },
  rent: { 
    type: Number, 
    required: true,
    default: 5000
  },
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
  amenities: [{
    type: String,
    enum: ["AC", "Attached Bathroom", "Study Table", "Wardrobe", "Geyser", "WiFi"]
  }],
  floor: {
    type: Number,
    required: true
  },
  images: [String],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);
export default Room;

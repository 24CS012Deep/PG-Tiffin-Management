import Room from "../models/Room.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

/* ================= CREATE ROOM ================= */
export const createRoom = async (req, res) => {
  try {
    const { roomNumber, capacity, rent, floor, details, amenities } = req.body;
    
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ message: "Room number already exists" });
    }

    const room = await Room.create({
      roomNumber,
      capacity,
      rent,
      floor,
      details,
      amenities: amenities || [],
      isAvailable: true,
      students: []
    });

    res.status(201).json(room);
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ message: "Failed to create room" });
  }
};

/* ================= GET ALL ROOMS ================= */
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("students", "name email");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
};

/* ================= UPDATE ROOM ================= */
export const updateRoom = async (req, res) => {
  try {
    const { roomNumber, capacity, rent, floor, details, amenities, isAvailable } = req.body;
    
    if (roomNumber) {
      const existingRoom = await Room.findOne({ roomNumber, _id: { $ne: req.params.id } });
      if (existingRoom) {
        return res.status(400).json({ message: "Room number already exists" });
      }
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { roomNumber, capacity, rent, floor, details, amenities, isAvailable },
      { new: true }
    ).populate("students", "name email");

    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Failed to update room" });
  }
};

/* ================= DELETE ROOM ================= */
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.students && room.students.length > 0) {
      return res.status(400).json({ message: "Cannot delete room with assigned students" });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete room" });
  }
};

/* ================= ASSIGN STUDENT TO ROOM ================= */
export const assignStudent = async (req, res) => {
  try {
    const { roomId, studentId } = req.body;
    
    console.log("Assign request received with:", { roomId, studentId });

    // Validate input
    if (!roomId || !studentId) {
      console.log("Validation failed: Missing roomId or studentId");
      return res.status(400).json({ message: "Room ID and Student ID are required" });
    }
    
    // Find room and student
    const room = await Room.findById(roomId);
    const student = await User.findById(studentId);

    console.log("Room found:", !!room, "Student found:", !!student);
    
    if (!room) {
      console.log("Room not found with ID:", roomId);
      return res.status(404).json({ message: "Room not found" });
    }
    
    if (!student) {
      console.log("Student not found with ID:", studentId);
      return res.status(404).json({ message: "Student not found" });
    }

    console.log("Student role:", student.role, "Expected: student");
    
    if (student.role !== "student") {
      return res.status(400).json({ message: "User is not a student" });
    }

    // Check if student is already in a room
    if (student.roomNumber) {
      console.log("Student already assigned to room:", student.roomNumber);
      return res.status(400).json({ 
        message: `Student is already assigned to room ${student.roomNumber}. Please remove them from that room first.` 
      });
    }

    // Ensure students array exists and capacity is a number
    const currentOccupancy = (room.students || []).length;
    const roomCapacity = parseInt(room.capacity, 10);
    
    console.log(`Room ${room.roomNumber}: Capacity=${roomCapacity}, CurrentOccupancy=${currentOccupancy}`);

    if (currentOccupancy >= roomCapacity) {
      return res.status(400).json({ 
        message: `Room is full (${currentOccupancy}/${roomCapacity} occupied)` 
      });
    }

    if (!room.students) {
      room.students = [];
    }
    room.students.push(studentId);
    student.roomNumber = room.roomNumber;
    
    await room.save();
    await student.save();
    student.roomNumber = room.roomNumber;
    
    await room.save();
    await student.save();

    // Send room assignment email to student
    try {
      await sendEmail({
        to: student.email,
        subject: "Room Assigned - Siya PG",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f97316; border-radius: 10px;">
            <h2 style="color: #f97316;">🏠 Room Assigned!</h2>
            <p>Hello <strong>${student.name}</strong>,</p>
            <p>You have been assigned to a room in Siya PG. Here are your room details:</p>
            <div style="background-color: #fdf8f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #f97316; margin-top: 0;">Room Details</h3>
              <p><strong>Room Number:</strong> ${room.roomNumber}</p>
              <p><strong>Floor:</strong> ${room.floor}</p>
              <p><strong>Rent:</strong> ₹${room.rent}/month</p>
              <p><strong>Capacity:</strong> ${room.capacity} person(s)</p>
              ${room.amenities?.length > 0 ? `<p><strong>Amenities:</strong> ${room.amenities.join(", ")}</p>` : ""}
            </div>
            <p>If you have any questions, please contact the administration.</p>
            <p>Welcome to Siya PG!</p>
          </div>
        `
      });
    } catch (emailError) {
      console.log("⚠️ Room assignment email failed:", emailError.message);
    }

    const updatedRoom = await Room.findById(roomId).populate("students", "name email");
    res.json({ success: true, room: updatedRoom });
  } catch (error) {
    console.error("Assignment failed:", error);
    res.status(500).json({ message: "Assignment failed" });
  }
};

/* ================= REMOVE STUDENT FROM ROOM ================= */
export const removeStudent = async (req, res) => {
  try {
    const { roomId, studentId } = req.body;
    
    const room = await Room.findById(roomId);
    const student = await User.findById(studentId);

    if (!room || !student) {
      return res.status(404).json({ message: "Room or student not found" });
    }

    room.students = room.students.filter(id => id.toString() !== studentId);
    student.roomNumber = null;
    
    await room.save();
    await student.save();

    // Send room removal notification email
    try {
      await sendEmail({
        to: student.email,
        subject: "Room Update - Siya PG",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f97316; border-radius: 10px;">
            <h2 style="color: #f97316;">Room Update</h2>
            <p>Hello <strong>${student.name}</strong>,</p>
            <p>This is to inform you that you have been removed from <strong>Room ${room.roomNumber}</strong> in Siya PG.</p>
            <p>If you have any questions or concerns, please contact the administration.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Siya PG Management</p>
          </div>
        `
      });
    } catch (emailError) {
      console.log("⚠️ Room removal email failed:", emailError.message);
    }

    const updatedRoom = await Room.findById(roomId).populate("students", "name email");
    res.json({ success: true, room: updatedRoom });
  } catch (error) {
    res.status(500).json({ message: "Removal failed" });
  }
};

/* ================= GET STUDENT'S ROOM ================= */
export const getStudentRoom = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Find room where this student ID is in the students array
    const room = await Room.findOne({ students: studentId })
      .populate("students", "name email _id");

    if (!room) {
      return res.json(null);
    }

    res.json(room);
  } catch (error) {
    console.error("Failed to fetch student room:", error);
    res.status(500).json({ message: "Failed to fetch room details" });
  }
};
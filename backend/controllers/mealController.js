import MealRecord from "../models/MealRecord.js";
import User from "../models/User.js";
import Room from "../models/Room.js";
import sendEmail from "../utils/sendEmail.js";
import Billing from "../models/Billing.js";

/* helpers */
const computeTotals = (dailyRecords, mealPrices) => {
  let foodCharges = 0;
  const records = dailyRecords.map(r => {
    const d =
      (r.breakfast ? mealPrices.breakfast : 0) +
      (r.lunch     ? mealPrices.lunch     : 0) +
      (r.dinner    ? mealPrices.dinner    : 0);
    foodCharges += d;
    return { ...r, dailyTotal: d };
  });
  return { records, foodCharges };
};

/* GET /admin/meals (list all students with PG rooms) */
export const getPGStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("name email roomNumber");
    // Attach room rent for each student
    const rooms = await Room.find({ students: { $in: students.map(s => s._id) } })
      .select("roomNumber rent students");

    const roomMap = {};
    for (const room of rooms) {
      for (const sid of room.students) {
        roomMap[sid.toString()] = { roomNumber: room.roomNumber, rent: room.rent };
      }
    }

    const data = students.map(s => ({
      _id: s._id,
      name: s.name,
      email: s.email,
      roomNumber: roomMap[s._id.toString()]?.roomNumber || s.roomNumber || "—",
      rent: roomMap[s._id.toString()]?.rent || 0
    }));

    res.json(data);
  } catch (err) {
    console.error("getPGStudents error:", err);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

/* GET /admin/meals/:studentId/:month */
export const getStudentMealRecord = async (req, res) => {
  try {
    const { studentId, month } = req.params;
    let record = await MealRecord.findOne({ student: studentId, month }).populate("student", "name email roomNumber");

    if (!record) {
      // Return empty scaffold
      const student = await User.findById(studentId).select("name email roomNumber");
      if (!student) return res.status(404).json({ message: "Student not found" });

      const room = await Room.findOne({ students: studentId }).select("rent roomNumber");
      return res.json({
        student: { _id: student._id, name: student.name, email: student.email, roomNumber: room?.roomNumber || student.roomNumber || "—" },
        month,
        roomRent: room?.rent || 0,
        mealPrices: { breakfast: 20, lunch: 40, dinner: 40 },
        dailyRecords: [],
        foodCharges: 0,
        totalAmount: room?.rent || 0,
        paymentStatus: "pending",
        isNew: true
      });
    }

    res.json(record);
  } catch (err) {
    console.error("getStudentMealRecord error:", err);
    res.status(500).json({ message: "Failed to fetch meal record" });
  }
};

/* GET /admin/meals/all/:month (all records for a month) */
export const getAllMealRecords = async (req, res) => {
  try {
    const { month } = req.params;
    const records = await MealRecord.find({ month })
      .populate("student", "name email roomNumber")
      .sort("student.name");
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch meal records" });
  }
};

/* POST /admin/meals/save (save/update daily records) */
export const saveMealRecord = async (req, res) => {
  try {
    const { studentId, month, roomRent, mealPrices, dailyRecords } = req.body;
    if (!studentId || !month) return res.status(400).json({ message: "studentId and month are required" });

    const mp = mealPrices || { breakfast: 20, lunch: 40, dinner: 40 };
    const { records, foodCharges } = computeTotals(dailyRecords || [], mp);
    const totalAmount = (roomRent || 0) + foodCharges;

    const record = await MealRecord.findOneAndUpdate(
      { student: studentId, month },
      {
        student: studentId,
        month,
        roomRent: roomRent || 0,
        mealPrices: mp,
        dailyRecords: records,
        foodCharges,
        totalAmount
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate("student", "name email roomNumber");

    res.json({ success: true, record });
  } catch (err) {
    console.error("saveMealRecord error:", err);
    res.status(500).json({ message: "Failed to save meal record" });
  }
};

/* POST /admin/meals/generate-bill */
export const generateMealBill = async (req, res) => {
  try {
    const { studentId, month } = req.body;
    const record = await MealRecord.findOne({ student: studentId, month }).populate("student", "name email");

    if (!record) return res.status(404).json({ message: "No meal record found for this student/month. Save the record first." });

    // Mark as pending if not already paid
    if (record.paymentStatus !== "paid") {
      record.paymentStatus = "pending";
      record.generatedAt = new Date();
      await record.save();
    }


    const existingBill = await Billing.findOne({ 
      user: studentId, 
      month: month, 
      type: "tiffin" 
    });


    
    // Calculate meal counts for the breakdown
    const mealCounts = {
      breakfast: record.dailyRecords.filter(r => r.breakfast).length,
      lunch: record.dailyRecords.filter(r => r.lunch).length,
      dinner: record.dailyRecords.filter(r => r.dinner).length
    };

    const billingData = {
      user: studentId,
      month: month,
      amount: record.totalAmount,
      type: "tiffin",
      status: record.paymentStatus,
      details: `Consolidated bill for ${month}`,
      breakdown: {
        roomRent: record.roomRent,
        foodCharges: record.foodCharges,
        mealCounts: mealCounts,
        dailyRecords: record.dailyRecords // Full breakdown for PDF
      },
      generatedAt: record.generatedAt
    };

    if (existingBill) {
      await Billing.findByIdAndUpdate(existingBill._id, billingData);
    } else {
      await Billing.create(billingData);
    }

    // Send email to student
    if (record.student?.email) {
      try {
        const mealRows = record.dailyRecords.map(r =>
          `<tr>
            <td style="padding:6px 12px;border:1px solid #e5e7eb">${r.day}</td>
            <td style="padding:6px 12px;border:1px solid #e5e7eb;text-align:center">${r.breakfast ? 'Yes' : '—'}</td>
            <td style="padding:6px 12px;border:1px solid #e5e7eb;text-align:center">${r.lunch ? 'Yes' : '—'}</td>
            <td style="padding:6px 12px;border:1px solid #e5e7eb;text-align:center">${r.dinner ? 'Yes' : '—'}</td>
            <td style="padding:6px 12px;border:1px solid #e5e7eb;text-align:right">₹${r.dailyTotal}</td>
          </tr>`
        ).join('');

        await sendEmail({
          to: record.student.email,
          subject: `Monthly Bill Generated – ${month} | Siya PG`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:650px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
              <div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:24px;color:white;text-align:center">
                <h1 style="margin:0;font-size:22px"> Siya PG – Monthly Bill</h1>
                <p style="margin:6px 0 0;color:#fed7aa">${month}</p>
              </div>
              <div style="padding:24px">
                <p>Hello <strong>${record.student.name}</strong>,</p>
                <p>Your monthly bill for <strong>${month}</strong> has been generated.</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                  <tr style="background:#f9fafb"><td style="padding:10px 12px;border:1px solid #e5e7eb;font-weight:600">Room Rent</td><td style="padding:10px 12px;border:1px solid #e5e7eb;text-align:right">₹${record.roomRent}</td></tr>
                  <tr><td style="padding:10px 12px;border:1px solid #e5e7eb;font-weight:600">Food Charges</td><td style="padding:10px 12px;border:1px solid #e5e7eb;text-align:right">₹${record.foodCharges}</td></tr>
                  <tr style="background:#fff7ed"><td style="padding:10px 12px;border:1px solid #e5e7eb;font-weight:700;color:#f97316">Total Amount</td><td style="padding:10px 12px;border:1px solid #e5e7eb;text-align:right;font-weight:700;color:#f97316;font-size:18px">₹${record.totalAmount}</td></tr>
                </table>
                ${record.dailyRecords.length > 0 ? `
                <h4 style="color:#374151;margin:20px 0 10px">Daily Meal Breakdown</h4>
                <table style="width:100%;border-collapse:collapse;font-size:13px">
                  <tr style="background:#f3f4f6;font-weight:600">
                    <th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left">Day</th>
                    <th style="padding:8px 12px;border:1px solid #e5e7eb">Breakfast</th>
                    <th style="padding:8px 12px;border:1px solid #e5e7eb">Lunch</th>
                    <th style="padding:8px 12px;border:1px solid #e5e7eb">Dinner</th>
                    <th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:right">Total</th>
                  </tr>
                  ${mealRows}
                </table>` : ''}
                <p style="margin-top:20px;color:#374151;font-weight:600">Please pay by the due date to ensure smooth processing.</p>
              </div>
            </div>`
        });
      } catch (emailErr) {
        console.log(" Bill email failed:", emailErr.message);
      }
    }

    res.json({ success: true, record });
  } catch (err) {
    console.error("generateMealBill error:", err);
    res.status(500).json({ message: "Failed to generate bill" });
  }
};

/* PUT /admin/meals/:id/status (mark paid/overdue) */
export const updateMealBillStatus = async (req, res) => {
  try {
    const { status, paymentMethod, transactionId } = req.body;
    const record = await MealRecord.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus: status,
        paymentMethod,
        transactionId,
        paidAt: status === "paid" ? new Date() : null
      },
      { new: true }
    ).populate("student", "name email");

    if (!record) return res.status(404).json({ message: "Record not found" });
    

    await Billing.findOneAndUpdate(
      { user: record.student, month: record.month, type: "tiffin" },
      { 
        status: status,
        paymentMethod,
        transactionId,
        paidAt: status === "paid" ? new Date() : null
      }
    );

    // Email on paid
    if (status === "paid" && record.student?.email) {
      try {
        await sendEmail({
          to: record.student.email,
          subject: ` Payment Confirmed – ${record.month} | Siya PG`,
          html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;border:2px solid #16a34a;border-radius:12px"><h2 style="color:#16a34a"> Payment Received!</h2><p>Hello <strong>${record.student.name}</strong>,</p><p>Your payment of <strong>₹${record.totalAmount}</strong> for <strong>${record.month}</strong> has been confirmed.</p><p style="color:#6b7280;font-size:13px">Siya PG Management</p></div>`
        });
      } catch {}
    }

    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
};

/* GET /student/meal-records (student's own records) */
export const getMyMealRecords = async (req, res) => {
  try {
    const records = await MealRecord.find({ student: req.user.id })
      .sort("-month");
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your meal records" });
  }
};

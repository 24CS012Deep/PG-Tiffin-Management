import Billing from "../models/Billing.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

/* ================= GET USER BILLINGS (for students/customers) ================= */
export const getUserBillings = async (req, res) => {
  try {
    const billings = await Billing.find({ user: req.user.id })
      .sort("-generatedAt");
    res.json(billings);
  } catch (error) {
    console.error("Get user billings error:", error);
    res.status(500).json({ message: "Failed to fetch billings" });
  }
};

/* ================= GET ALL BILLINGS (ADMIN) ================= */
export const getAllBillings = async (req, res) => {
  try {
    const billings = await Billing.find()
      .populate("user", "name email role")
      .sort("-generatedAt");
    res.json(billings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch billings" });
  }
};

/* ================= GENERATE BILLS ================= */
export const generateBills = async (req, res) => {
  try {
    const { periodType, singleMonth, fromMonth, toMonth, type, studentSelection, specificStudents } = req.body;

    // Determine the list of months
    let months = [];
    if (periodType === "last") {
      const now = new Date();
      now.setMonth(now.getMonth() - 1);
      months.push(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    } else if (periodType === "range") {
      const start = new Date(fromMonth + "-01");
      const end = new Date(toMonth + "-01");
      let current = new Date(start);
      while (current <= end) {
        months.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
        current.setMonth(current.getMonth() + 1);
      }
    } else {
      months.push(singleMonth);
    }

    if (months.length === 0) {
      return res.status(400).json({ message: "Invalid month selection" });
    }

    let createdCount = 0;
    const Room = (await import("../models/Room.js")).default;

    for (const month of months) {
      const [yearStr, monthStr] = month.split("-");
      const startOfMonth = new Date(yearStr, parseInt(monthStr) - 1, 1);
      const endOfMonth = new Date(yearStr, parseInt(monthStr), 0);

      // --- TIFFIN LOGIC ---
      if (type === "tiffin" || type === "monthly") {
        const orderQuery = {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: "completed"
        };
        if (studentSelection === "specific" && specificStudents?.length > 0) {
          orderQuery.customer = { $in: specificStudents };
        }

        const orders = await Order.find(orderQuery).populate("customer");
        const userTotals = {};
        for (const order of orders) {
          const customerId = order.customer?._id?.toString();
          if (customerId) {
            if (!userTotals[customerId]) userTotals[customerId] = 0;
            userTotals[customerId] += order.totalAmount || 0;
          }
        }

        if (type === "tiffin") {
          for (const [userId, amt] of Object.entries(userTotals)) {
            const existingBill = await Billing.findOne({ user: userId, month, type: "tiffin" });
            if (!existingBill) {
              await Billing.create({
                user: userId, month, amount: amt, type: "tiffin",
                status: "pending", details: `Tiffin bills for ${month}`
              });
              createdCount++;
            }
          }
        } else if (type === "monthly") {
          // Monthly handles tiffin later, merged with room
          req.tempTiffinTotals = req.tempTiffinTotals || {};
          req.tempTiffinTotals[month] = userTotals;
        }
      }

      // --- ROOM LOGIC ---
      if (type === "room" || type === "monthly") {
        const rooms = await Room.find({ students: { $exists: true, $not: { $size: 0 } } });
        const userRooms = {};
        for (const room of rooms) {
          for (const studentId of room.students) {
            const sId = studentId.toString();
            if (studentSelection === "specific" && specificStudents && !specificStudents.includes(sId)) {
              continue; // Skip if not in specific list
            }
            userRooms[sId] = { rent: room.rent || 5000, roomNumber: room.roomNumber };
          }
        }

        if (type === "room") {
          for (const [userId, roomData] of Object.entries(userRooms)) {
            const existingBill = await Billing.findOne({ user: userId, month, type: "room" });
            if (!existingBill) {
              await Billing.create({
                user: userId, month, amount: roomData.rent, type: "room",
                status: "pending", details: `Room Rent for ${month} (Room: ${roomData.roomNumber})`
              });
              createdCount++;
            }
          }
        } else if (type === "monthly") {
          // Merge Tiffin + Room
          const tiffinData = (req.tempTiffinTotals && req.tempTiffinTotals[month]) || {};
          // Users who have room rent OR tiffin
          const allUserIds = new Set([...Object.keys(userRooms), ...Object.keys(tiffinData)]);

          for (const userId of allUserIds) {
            if (studentSelection === "specific" && specificStudents && !specificStudents.includes(userId)) {
              continue;
            }
            const existingBill = await Billing.findOne({ user: userId, month, type: "monthly" });
            if (!existingBill) {
              const rAmt = userRooms[userId]?.rent || 0;
              const tAmt = tiffinData[userId] || 0;
              const rNum = userRooms[userId]?.roomNumber;

              if (rAmt > 0 || tAmt > 0) {
                let detailsArr = [];
                if (rAmt > 0) detailsArr.push(`Room Rent (Room: ${rNum || 'N/A'}): ₹${rAmt}`);
                if (tAmt > 0) detailsArr.push(`Daily Food: ₹${tAmt}`);

                await Billing.create({
                  user: userId, month, amount: rAmt + tAmt, type: "monthly",
                  status: "pending", details: detailsArr.join(" | ") || `Monthly Bill for ${month}`
                });
                createdCount++;
              }
            }
          }
        }
      }
    }

    res.json({ success: true, count: createdCount, message: `Bills generated for ${months.join(', ')}` });
  } catch (error) {
    console.error("Generate bills error:", error);
    res.status(500).json({ message: "Failed to generate bills" });
  }
};

/* ================= UPDATE BILLING STATUS ================= */
export const updateBillingStatus = async (req, res) => {
  try {
    const { status, paymentMethod, transactionId } = req.body;

    const billing = await Billing.findByIdAndUpdate(
      req.params.id,
      {
        status,
        paymentMethod,
        transactionId,
        paidAt: status === "paid" ? new Date() : null
      },
      { new: true }
    ).populate("user");

    if (!billing) return res.status(404).json({ message: "Billing not found" });

    // Send email notification if status changed to paid
    if (status === "paid" && billing.user?.email) {
      try {
        await sendEmail({
          to: billing.user.email,
          subject: "Payment Received - Siya PG",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f97316; border-radius: 10px;">
              <h2 style="color: #16a34a;">✅ Payment Received!</h2>
              <p>Hello <strong>${billing.user.name}</strong>,</p>
              <p>Your payment has been received and confirmed. Thank you!</p>
              <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #16a34a; margin-top: 0;">Payment Details</h3>
                <p><strong>Month:</strong> ${billing.month}</p>
                <p><strong>Type:</strong> ${billing.type}</p>
                <p><strong>Amount:</strong> ₹${billing.amount?.toLocaleString("en-IN")}</p>
                <p><strong>Status:</strong> Paid ✅</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
              </div>
              <p>Thank you for your timely payment!</p>
              <hr>
              <p style="color: #666; font-size: 12px;">Siya PG Management</p>
            </div>
          `
        });
      } catch (emailError) {
        console.log("⚠️ Payment confirmation email failed:", emailError.message);
      }
    }

    // Send email notification if status changed to overdue
    if (status === "overdue" && billing.user?.email) {
      try {
        await sendEmail({
          to: billing.user.email,
          subject: "⚠️ Payment Overdue - Siya PG",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #dc2626; border-radius: 10px;">
              <h2 style="color: #dc2626;">⚠️ Payment Overdue</h2>
              <p>Hello <strong>${billing.user.name}</strong>,</p>
              <p>This is a reminder that your payment is <strong>overdue</strong>. Please make the payment as soon as possible to avoid any inconvenience.</p>
              <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #dc2626; margin-top: 0;">Overdue Bill Details</h3>
                <p><strong>Month:</strong> ${billing.month}</p>
                <p><strong>Type:</strong> ${billing.type}</p>
                <p><strong>Amount Due:</strong> ₹${billing.amount?.toLocaleString("en-IN")}</p>
                <p><strong>Status:</strong> ⚠️ Overdue</p>
              </div>
              <p>Please contact the administration if you have any questions regarding this bill.</p>
              <hr>
              <p style="color: #666; font-size: 12px;">Siya PG Management</p>
            </div>
          `
        });
      } catch (emailError) {
        console.log("⚠️ Overdue notification email failed:", emailError.message);
      }
    }

    res.json(billing);
  } catch (error) {
    res.status(500).json({ message: "Failed to update billing" });
  }
};

/* ================= SEND BILL EMAIL ================= */
export const sendBillEmail = async (req, res) => {
  try {
    const billing = await Billing.findById(req.params.id).populate("user", "name email role");
    if (!billing) return res.status(404).json({ message: "Billing not found" });
    if (!billing.user?.email) return res.status(400).json({ message: "User email not found" });

    const statusColor = billing.status === "paid" ? "#16a34a" : billing.status === "overdue" ? "#dc2626" : "#ca8a04";
    const statusLabel = billing.status === "paid" ? "✅ Paid" : billing.status === "overdue" ? "⚠️ Overdue" : "⏳ Pending";

    await sendEmail({
      to: billing.user.email,
      subject: `Bill Statement - ${billing.month} | Siya PG`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 25px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏠 Siya PG</h1>
            <p style="color: #fed7aa; margin: 5px 0 0 0; font-size: 14px;">Monthly Bill Statement</p>
          </div>
          <div style="padding: 25px;">
            <p style="font-size: 16px;">Hello <strong>${billing.user.name}</strong>,</p>
            <p style="color: #6b7280;">Here is your bill statement for <strong>${billing.month}</strong>:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background-color: #f9fafb;">
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Month</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${billing.month}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Type</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; text-transform: capitalize;">${billing.type}</td>
              </tr>
              <tr style="background-color: #f9fafb;">
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Amount</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-size: 18px; font-weight: 700; color: #f97316;">₹${billing.amount?.toLocaleString("en-IN")}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Status</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;"><span style="color: ${statusColor}; font-weight: 700;">${statusLabel}</span></td>
              </tr>
              ${billing.paidAt ? `<tr style="background-color: #f9fafb;"><td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Paid On</td><td style="padding: 12px; border: 1px solid #e5e7eb;">${new Date(billing.paidAt).toLocaleDateString("en-IN", { dateStyle: "long" })}</td></tr>` : ""}
            </table>
            
            ${billing.status !== "paid" ? '<p style="color: #dc2626; font-weight: 600;">Please make the payment at the earliest to avoid late fees.</p>' : '<p style="color: #16a34a;">Thank you for your timely payment! 🎉</p>'}
            
            <p style="color: #6b7280; font-size: 13px; margin-top: 20px;">For any queries, please contact the PG administration.</p>
          </div>
          <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Siya PG Management System</p>
          </div>
        </div>
      `
    });

    res.json({ success: true, message: `Bill email sent to ${billing.user.email}` });
  } catch (error) {
    console.error("Send bill email error:", error);
    res.status(500).json({ message: "Failed to send bill email" });
  }
};

/* ================= DELETE BILLING ================= */
export const deleteBilling = async (req, res) => {
  try {
    const billing = await Billing.findByIdAndDelete(req.params.id);
    if (!billing) return res.status(404).json({ message: "Billing not found" });
    res.json({ success: true, message: "Billing deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete billing" });
  }
};
import Query from "../models/Query.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

/* ================= CREATE QUERY ================= */
export const createQuery = async (req, res) => {
  try {
    const query = await Query.create({
      user: req.user.id,
      question: req.body.question,
      category: req.body.category,
      priority: req.body.priority || "medium"
    });

    // Notify admins about new query
    try {
      const admins = await User.find({ role: "admin" });
      const queryUser = await User.findById(req.user.id);
      for (const admin of admins) {
        await sendEmail({
          to: admin.email,
          subject: `New Support Query - ${req.body.category || "General"} | Siya PG`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f97316; border-radius: 10px;">
              <h2 style="color: #f97316;">📩 New Support Query</h2>
              <p>A new query has been submitted and needs your attention.</p>
              <div style="background-color: #fdf8f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>From:</strong> ${queryUser?.name || "Unknown"} (${queryUser?.email || "N/A"})</p>
                <p><strong>Category:</strong> ${req.body.category || "General"}</p>
                <p><strong>Priority:</strong> ${req.body.priority || "Medium"}</p>
                <p><strong>Question:</strong> ${req.body.question}</p>
              </div>
              <p>Please log in to the admin panel to respond.</p>
              <hr>
              <p style="color: #666; font-size: 12px;">Siya PG Management System</p>
            </div>
          `
        });
      }
    } catch (emailError) {
      console.log("⚠️ Admin notification email failed:", emailError.message);
    }

    res.status(201).json(query);
  } catch (error) {
    console.error("Create query error:", error);
    res.status(500).json({ message: "Failed to create query" });
  }
};

/* ================= GET USER QUERIES ================= */
export const getUserQueries = async (req, res) => {
  try {
    const queries = await Query.find({ user: req.user.id })
      .sort("-createdAt");
    res.json(queries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch queries" });
  }
};

/* ================= GET ALL QUERIES (ADMIN) ================= */
export const getAllQueries = async (req, res) => {
  try {
    const queries = await Query.find()
      .populate("user", "name email")
      .populate("resolvedBy", "name")
      .sort("-createdAt");
    res.json(queries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch queries" });
  }
};

/* ================= ANSWER QUERY ================= */
export const answerQuery = async (req, res) => {
  try {
    const { answer } = req.body;
    
    const query = await Query.findByIdAndUpdate(
      req.params.id,
      {
        answer,
        status: "closed",
        resolvedAt: new Date(),
        resolvedBy: req.user.id
      },
      { new: true }
    ).populate("user");

    if (!query) return res.status(404).json({ message: "Query not found" });

    // Send answer to user via styled email
    try {
      await sendEmail({
        to: query.user.email,
        subject: "Your Query has been Answered - Siya PG",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 25px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 22px;">🏠 Siya PG Support</h1>
              <p style="color: #fed7aa; margin: 5px 0 0 0; font-size: 13px;">Your query has been resolved</p>
            </div>
            <div style="padding: 25px;">
              <p style="font-size: 15px;">Hello <strong>${query.user.name}</strong>,</p>
              <p style="color: #6b7280;">Your query has been reviewed and answered by our team. Here are the details:</p>
              
              <div style="background-color: #fdf8f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
                <p style="color: #92400e; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">Your Question</p>
                <p style="color: #374151; margin: 0;">${query.question}</p>
              </div>
              
              <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
                <p style="color: #166534; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">✅ Response</p>
                <p style="color: #374151; margin: 0;">${answer}</p>
              </div>
              
              <p style="color: #6b7280; font-size: 13px;">If you have further questions, feel free to submit another query.</p>
            </div>
            <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">Siya PG Management System</p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.log("⚠️ Query answer email failed:", emailError.message);
    }

    res.json(query);
  } catch (error) {
    res.status(500).json({ message: "Failed to answer query" });
  }
};

/* ================= DELETE QUERY ================= */
export const deleteQuery = async (req, res) => {
  try {
    const query = await Query.findByIdAndDelete(req.params.id);
    if (!query) return res.status(404).json({ message: "Query not found" });
    res.json({ success: true, message: "Query deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete query" });
  }
};
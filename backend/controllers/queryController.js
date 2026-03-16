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

    // Notify admins
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: "New Query Received",
        html: `<p>A new query has been submitted. Check admin panel for details.</p>`
      });
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

    // Send answer to user
    await sendEmail({
      to: query.user.email,
      subject: "Your Query has been Answered",
      html: `
        <h2>Query Response</h2>
        <p><strong>Your Question:</strong> ${query.question}</p>
        <p><strong>Answer:</strong> ${answer}</p>
      `
    });

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
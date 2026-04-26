import Inquiry from "../models/Inquiry.js";
import sendEmail from "../utils/sendEmail.js";

// @desc    Submit contact inquiry
// @route   POST /api/inquiry/contact
// @access  Public
export const submitContact = async (req, res) => {
  try {
    console.log(" Contact form submission:", req.body);

    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and phone are required",
      });
    }

    // Create inquiry record
    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      type: "contact",
      message: message || "",
    });

    console.log(" Contact inquiry saved:", inquiry._id);

    // Send email notification to admin
    try {
      await sendEmail({
        to: process.env.EMAIL_USER,
        subject: "New Contact Inquiry - SwadBox",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f97316; border-radius: 10px;">
            <h2 style="color: #f97316;">New Contact Inquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Message:</strong> ${message || "No message provided"}</p>
            <hr>
            <p><strong>Inquiry ID:</strong> ${inquiry._id}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.log(" Admin notification email failed:", emailError.message);
    }

   
    try {
      await sendEmail({
        to: email,
        subject: "Thank you for contacting SwadBox",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f97316; border-radius: 10px;">
            <h2 style="color: #f97316;">Thank you for contacting us!</h2>
            <p>Dear <strong>${name}</strong>,</p>
            <p>We have received your inquiry and will get back to you within 24 hours.</p>
            <div style="background-color: #fdf8f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #f97316; margin-top: 0;">Your Inquiry Details:</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Message:</strong> ${message || "No message provided"}</p>
            </div>
            <p>If you have any urgent questions, please call us at +91 99043 72800.</p>
            <p>Thank you for choosing SwadBox!</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.log(" User confirmation email failed:", emailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
      data: inquiry,
    });
  } catch (error) {
    console.error(" Contact submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit inquiry",
    });
  }
};

// @desc    Submit schedule visit request
// @route   POST /api/inquiry/schedule
// @access  Public
export const submitSchedule = async (req, res) => {
  try {
    console.log(" Schedule visit submission:", req.body);

    const { name, email, phone, date, time, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone, date, and time are required",
      });
    }

    // Create schedule inquiry record
    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      type: "schedule",
      preferredDate: new Date(date),
      preferredTime: time,
      message: message || "",
    });

    console.log(" Schedule inquiry saved:", inquiry._id);

    // Send email notification to admin
    try {
      await sendEmail({
        to: process.env.EMAIL_USER,
        subject: "New Schedule Visit Request - SwadBox",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f97316; border-radius: 10px;">
            <h2 style="color: #f97316;">New Schedule Visit Request</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Preferred Date:</strong> ${new Date(date).toLocaleDateString()}</p>
            <p><strong>Preferred Time:</strong> ${time}</p>
            <p><strong>Message:</strong> ${message || "No message provided"}</p>
            <hr>
            <p><strong>Inquiry ID:</strong> ${inquiry._id}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.log(" Admin notification email failed:", emailError.message);
    }

    // Send confirmation email to user
    try {
      await sendEmail({
        to: email,
        subject: "Schedule Visit Confirmation - SwadBox",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f97316; border-radius: 10px;">
            <h2 style="color: #f97316;">Schedule Visit Request Received!</h2>
            <p>Dear <strong>${name}</strong>,</p>
            <p>Thank you for scheduling a visit to our PG. We have received your request and will confirm your appointment within 24 hours.</p>
            <div style="background-color: #fdf8f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #f97316; margin-top: 0;">Your Visit Details:</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Preferred Date:</strong> ${new Date(date).toLocaleDateString()}</p>
              <p><strong>Preferred Time:</strong> ${time}</p>
              <p><strong>Message:</strong> ${message || "No message provided"}</p>
            </div>
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>We will contact you within 24 hours to confirm your visit</li>
              <li>You can also call us at +91 99043 72800 for immediate assistance</li>
            </ul>
            <p>We look forward to welcoming you to SwadBox!</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.log(" User confirmation email failed:", emailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Schedule visit request submitted successfully",
      data: inquiry,
    });
  } catch (error) {
    console.error(" Schedule submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit schedule request",
    });
  }
};

// @desc    Get all inquiries (Admin only)
// @route   GET /api/inquiry/all
// @access  Private/Admin
export const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort("-createdAt");
    res.json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    console.error(" Get inquiries error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inquiries",
    });
  }
};

// @desc    Get inquiry by ID (Admin only)
// @route   GET /api/inquiry/:id
// @access  Private/Admin
export const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }
    res.json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    console.error(" Get inquiry error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inquiry",
    });
  }
};

// @desc    Update inquiry status (Admin only)
// @route   PUT /api/inquiry/:id/status
// @access  Private/Admin
export const updateInquiryStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      {
        status,
        notes: notes || "",
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    res.json({
      success: true,
      message: "Inquiry status updated",
      data: inquiry,
    });
  } catch (error) {
    console.error(" Update inquiry error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update inquiry",
    });
  }
};

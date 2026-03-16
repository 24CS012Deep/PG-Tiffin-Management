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
    const { month, type } = req.body;
    
    if (type === "tiffin") {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

      const orders = await Order.find({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        status: "completed"
      }).populate("customer");

      const customerBills = {};
      
      for (const order of orders) {
        const customerId = order.customer?._id?.toString();
        if (customerId) {
          if (!customerBills[customerId]) {
            customerBills[customerId] = {
              user: customerId,
              month,
              amount: 0,
              type: "tiffin",
              status: "pending",
              details: `Tiffin bills for ${month}`
            };
          }
          customerBills[customerId].amount += order.totalAmount || 0;
        }
      }

      const createdBills = [];
      for (const billData of Object.values(customerBills)) {
        const existingBill = await Billing.findOne({ 
          user: billData.user, 
          month: billData.month,
          type: "tiffin"
        });
        
        if (!existingBill) {
          const bill = await Billing.create(billData);
          createdBills.push(bill);
        }
      }

      res.json({ success: true, count: createdBills.length });
    } else {
      res.json({ success: true, count: 0 });
    }
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
      await sendEmail({
        to: billing.user.email,
        subject: "Payment Received",
        html: `<p>Your payment of ₹${billing.amount} has been received. Thank you!</p>`
      });
    }

    res.json(billing);
  } catch (error) {
    res.status(500).json({ message: "Failed to update billing" });
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
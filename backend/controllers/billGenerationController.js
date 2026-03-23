import Billing from "../models/Billing.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

/* ================= GENERATE BILL REPORT FOR CUSTOM DATE RANGE ================= */
export const generateBillReport = async (req, res) => {
  try {
    const { startDate, endDate, preset } = req.body;

    let start, end;

    // Handle preset periods
    if (preset) {
      end = new Date();
      end.setHours(23, 59, 59, 999);
      start = new Date();

      switch (preset) {
        case "30":
          start.setDate(start.getDate() - 30);
          break;
        case "60":
          start.setDate(start.getDate() - 60);
          break;
        case "90":
          start.setDate(start.getDate() - 90);
          break;
        default:
          return res.status(400).json({ message: "Invalid preset period" });
      }
      start.setHours(0, 0, 0, 0);
    } else if (startDate && endDate) {
      // Custom date range
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      return res.status(400).json({ message: "Please provide a preset period or custom date range" });
    }

    // Validate date range
    if (start > end) {
      return res.status(400).json({ message: "Start date cannot be after end date" });
    }

    // Fetch all orders within the date range
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end }
    })
      .populate("customer", "name email phone role address roomNumber")
      .populate("tiffinPlan", "name price type")
      .sort("-createdAt");

    // Fetch all billings within the date range
    const billings = await Billing.find({
      generatedAt: { $gte: start, $lte: end }
    })
      .populate("user", "name email phone role address roomNumber")
      .sort("-generatedAt");

    // Build per-customer summary
    const customerMap = {};

    for (const order of orders) {
      const custId = order.customer?._id?.toString();
      if (!custId) continue;

      if (!customerMap[custId]) {
        customerMap[custId] = {
          customer: {
            _id: custId,
            name: order.customer?.name || "N/A",
            email: order.customer?.email || "N/A",
            phone: order.customer?.phone || "N/A",
            role: order.customer?.role || "N/A",
            address: order.customer?.address || "N/A",
            roomNumber: order.customer?.roomNumber || "N/A"
          },
          orders: [],
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          orderCount: 0
        };
      }

      customerMap[custId].orders.push({
        _id: order._id,
        date: order.createdAt,
        planName: order.tiffinPlan?.name || "N/A",
        planType: order.tiffinPlan?.type || "N/A",
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        deliveryTime: order.deliveryTime
      });

      customerMap[custId].totalAmount += order.totalAmount || 0;
      customerMap[custId].orderCount += 1;

      if (order.paymentStatus === "paid") {
        customerMap[custId].paidAmount += order.totalAmount || 0;
      } else {
        customerMap[custId].pendingAmount += order.totalAmount || 0;
      }
    }

    // Overall summary stats
    const totalBillAmount = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalPaidAmount = orders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalPendingAmount = orders
      .filter((o) => o.paymentStatus === "pending")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalFailedAmount = orders
      .filter((o) => o.paymentStatus === "failed")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const totalOrdersCount = orders.length;
    const liveOrders = orders.filter((o) => o.status === "live").length;
    const completedOrders = orders.filter((o) => o.status === "completed").length;
    const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;

    const uniqueCustomers = Object.keys(customerMap).length;

    const response = {
      success: true,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
        label: preset ? `Last ${preset} Days` : "Custom Range"
      },
      summary: {
        totalBillAmount,
        totalPaidAmount,
        totalPendingAmount,
        totalFailedAmount,
        totalOrdersCount,
        liveOrders,
        completedOrders,
        cancelledOrders,
        uniqueCustomers
      },
      customerBreakdown: Object.values(customerMap),
      transactions: orders.map((order) => ({
        _id: order._id,
        customerName: order.customer?.name || "N/A",
        customerEmail: order.customer?.email || "N/A",
        customerRole: order.customer?.role || "N/A",
        planName: order.tiffinPlan?.name || "N/A",
        date: order.createdAt,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        deliveryTime: order.deliveryTime
      })),
      billingRecords: billings.map((b) => ({
        _id: b._id,
        userName: b.user?.name || "N/A",
        userEmail: b.user?.email || "N/A",
        userRole: b.user?.role || "N/A",
        month: b.month,
        type: b.type,
        amount: b.amount,
        status: b.status,
        paidAt: b.paidAt,
        generatedAt: b.generatedAt
      }))
    };

    res.json(response);
  } catch (error) {
    console.error("Generate bill report error:", error);
    res.status(500).json({ message: "Failed to generate bill report" });
  }
};

/* ================= EXPORT BILL REPORT AS CSV ================= */
export const exportBillCSV = async (req, res) => {
  try {
    const { startDate, endDate, preset } = req.query;

    let start, end;

    if (preset) {
      end = new Date();
      end.setHours(23, 59, 59, 999);
      start = new Date();

      switch (preset) {
        case "30":
          start.setDate(start.getDate() - 30);
          break;
        case "60":
          start.setDate(start.getDate() - 60);
          break;
        case "90":
          start.setDate(start.getDate() - 90);
          break;
        default:
          return res.status(400).json({ message: "Invalid preset period" });
      }
      start.setHours(0, 0, 0, 0);
    } else if (startDate && endDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      return res.status(400).json({ message: "Please provide a preset period or custom date range" });
    }

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end }
    })
      .populate("customer", "name email phone role")
      .populate("tiffinPlan", "name price")
      .sort("-createdAt");

    // Build CSV
    const headers = [
      "Order ID",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Customer Role",
      "Plan Name",
      "Date",
      "Quantity",
      "Total Amount (₹)",
      "Order Status",
      "Payment Status",
      "Delivery Time"
    ];

    const rows = orders.map((o) => [
      o._id.toString(),
      `"${o.customer?.name || "N/A"}"`,
      `"${o.customer?.email || "N/A"}"`,
      `"${o.customer?.phone || "N/A"}"`,
      `"${o.customer?.role || "N/A"}"`,
      `"${o.tiffinPlan?.name || "N/A"}"`,
      `"${new Date(o.createdAt).toLocaleDateString("en-IN")}"`,
      o.quantity || 1,
      o.totalAmount || 0,
      o.status || "N/A",
      o.paymentStatus || "N/A",
      o.deliveryTime || "N/A"
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=SwadBox_Bill_Report_${start.toISOString().slice(0, 10)}_to_${end.toISOString().slice(0, 10)}.csv`
    );
    res.send(csvContent);
  } catch (error) {
    console.error("Export CSV error:", error);
    res.status(500).json({ message: "Failed to export CSV" });
  }
};

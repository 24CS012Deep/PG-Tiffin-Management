import User from "../models/User.js";
import Order from "../models/Order.js";
import Room from "../models/Room.js";
import TiffinPlan from "../models/TiffinPlan.js";
import Billing from "../models/Billing.js";
import Query from "../models/Query.js";

/* ================= COMPREHENSIVE REPORTS DATA ================= */
export const getReportsData = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // User Stats
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
    const newUsersLastMonth = await User.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });

    // Order Stats
    const allOrders = await Order.find();
    const totalOrdersCount = allOrders.length;
    const liveOrders = allOrders.filter((o) => o.status === "live").length;
    const completedOrders = allOrders.filter((o) => o.status === "completed").length;
    const cancelledOrders = allOrders.filter((o) => o.status === "cancelled").length;

    // This month's orders
    const thisMonthOrders = await Order.find({ createdAt: { $gte: startOfMonth } });
    const thisMonthOrderCount = thisMonthOrders.length;
    const thisMonthRevenue = thisMonthOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Last month's orders
    const lastMonthOrders = await Order.find({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });
    const lastMonthOrderCount = lastMonthOrders.length;
    const lastMonthRevenue = lastMonthOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // All-time revenue (non-cancelled)
    const totalRevenue = allOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const avgOrderValue = completedOrders > 0
      ? Math.round(
          allOrders
            .filter((o) => o.status === "completed")
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0) / completedOrders
        )
      : 0;

    // Payment status breakdown
    const paidOrders = allOrders.filter((o) => o.paymentStatus === "paid").length;
    const pendingPayments = allOrders.filter((o) => o.paymentStatus === "pending").length;
    const failedPayments = allOrders.filter((o) => o.paymentStatus === "failed").length;

    // Delivery time breakdown
    const breakfastOrders = allOrders.filter((o) => o.deliveryTime === "breakfast").length;
    const lunchOrders = allOrders.filter((o) => o.deliveryTime === "lunch").length;
    const dinnerOrders = allOrders.filter((o) => o.deliveryTime === "dinner").length;
    const bothOrders = allOrders.filter((o) => o.deliveryTime === "both").length;

    // Room Stats
    const totalRooms = await Room.countDocuments();
    const rooms = await Room.find().populate("students");
    const occupiedBeds = rooms.reduce((sum, r) => sum + (r.students?.length || 0), 0);
    const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((occupiedBeds / totalCapacity) * 100) : 0;
    const availableRooms = rooms.filter(
      (r) => (r.students?.length || 0) < (r.capacity || 0)
    ).length;
    const fullRooms = rooms.filter(
      (r) => (r.students?.length || 0) >= (r.capacity || 0)
    ).length;
    const totalRoomRevenue = rooms.reduce((sum, r) => sum + ((r.students?.length || 0) * (r.rent || 0)), 0);

    // Tiffin Plan Stats
    const totalTiffinPlans = await TiffinPlan.countDocuments();
    const activePlansCount = await TiffinPlan.countDocuments({ isActive: true });
    
    // Fetch active plans and calculate current orders for each to find top plans
    const activePlans = await TiffinPlan.find({ isActive: true });
    const plansWithOrders = await Promise.all(activePlans.map(async (plan) => {
      const orderCount = await Order.countDocuments({ 
        tiffinPlan: plan._id, 
        status: { $ne: "cancelled" } 
      });
      return {
        name: plan.planNumber,
        price: plan.tiffinPrice,
        customers: orderCount,
        maxCustomers: plan.maxCapacity,
        type: plan.mealShifts?.join(", ") || "Lunch"
      };
    }));

    const topPlans = plansWithOrders
      .sort((a, b) => b.customers - a.customers)
      .slice(0, 5);

    // Billing Stats
    const allBillings = await Billing.find();
    const totalBilled = allBillings.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalPaid = allBillings
      .filter((b) => b.status === "paid")
      .reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalPending = allBillings
      .filter((b) => b.status === "pending")
      .reduce((sum, b) => sum + (b.amount || 0), 0);


    const paidBillsCount = allBillings.filter((b) => b.status === "paid").length;
    const pendingBillsCount = allBillings.filter((b) => b.status === "pending").length;

    const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;

    // Query Stats
    const totalQueries = await Query.countDocuments();
    const openQueries = await Query.countDocuments({ status: "open" });
    const closedQueries = await Query.countDocuments({ status: "closed" });
    const highPriorityQueries = await Query.countDocuments({ priority: "high", status: "open" });
    const queryCategories = {
      room: await Query.countDocuments({ category: "room" }),
      food: await Query.countDocuments({ category: "food" }),
      billing: await Query.countDocuments({ category: "billing" }),
      general: await Query.countDocuments({ category: "general" }),
    };
    const resolutionRate = totalQueries > 0 ? Math.round((closedQueries / totalQueries) * 100) : 0;

    // Daily Orders (last 7 days)
    const dailyOrders = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayOrderCount = await Order.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });
      const dayRevenue = (
        await Order.find({
          createdAt: { $gte: dayStart, $lte: dayEnd },
          status: { $ne: "cancelled" },
        })
      ).reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      dailyOrders.push({
        date: dayStart.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
        orders: dayOrderCount,
        revenue: dayRevenue,
      });
    }

    // Recent Orders
    const recentOrders = await Order.find()
      .populate("customer", "name email")
      .populate("tiffinPlan", "name price")
      .sort("-createdAt")
      .limit(8);

    // Top Customers by spending
    const customerSpending = {};
    for (const order of allOrders.filter((o) => o.status !== "cancelled")) {
      const cId = order.customer?.toString();
      if (cId) {
        customerSpending[cId] = (customerSpending[cId] || 0) + (order.totalAmount || 0);
      }
    }
    const topCustomerIds = Object.entries(customerSpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id]) => id);
    const topCustomersData = await User.find({ _id: { $in: topCustomerIds } }).select("name email");
    const topCustomers = topCustomerIds.map((id) => {
      const u = topCustomersData.find((u) => u._id.toString() === id);
      return {
        name: u?.name || "Unknown",
        email: u?.email || "",
        totalSpent: customerSpending[id],
      };
    });

    // Growth percentages
    const revenueGrowth =
      lastMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : thisMonthRevenue > 0
        ? 100
        : 0;
    const orderGrowth =
      lastMonthOrderCount > 0
        ? Math.round(((thisMonthOrderCount - lastMonthOrderCount) / lastMonthOrderCount) * 100)
        : thisMonthOrderCount > 0
        ? 100
        : 0;
    const userGrowth =
      newUsersLastMonth > 0
        ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100)
        : newUsersThisMonth > 0
        ? 100
        : 0;

    res.json({
      success: true,
      users: {
        total: totalUsers,
        students: totalStudents,
        customers: totalCustomers,
        admins: totalAdmins,
        blocked: blockedUsers,
        newThisMonth: newUsersThisMonth,
        growth: userGrowth,
      },
      orders: {
        total: totalOrdersCount,
        live: liveOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        thisMonth: thisMonthOrderCount,
        growth: orderGrowth,
        avgValue: avgOrderValue,
        payment: { paid: paidOrders, pending: pendingPayments, failed: failedPayments },
        delivery: {
          breakfast: breakfastOrders,
          lunch: lunchOrders,
          dinner: dinnerOrders,
          both: bothOrders,
        },
      },
      revenue: {
        total: totalRevenue,
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        growth: revenueGrowth,
        target: 150000,
      },
      rooms: {
        total: totalRooms,
        available: availableRooms,
        full: fullRooms,
        occupiedBeds,
        totalCapacity,
        occupancyRate,
        monthlyRoomRevenue: totalRoomRevenue,
      },
      tiffin: {
        totalPlans: totalTiffinPlans,
        activePlans: activePlansCount,
        topPlans,
      },
      billing: {
        totalBilled,
        totalPaid,
        totalPending,
        paidCount: paidBillsCount,
        pendingCount: pendingBillsCount,
        collectionRate,
      },
      queries: {
        total: totalQueries,
        open: openQueries,
        closed: closedQueries,
        highPriority: highPriorityQueries,
        categories: queryCategories,
        resolutionRate,
      },
      charts: {
        dailyOrders,
      },
      recentOrders: recentOrders.map((o) => ({
        _id: o._id,
        customerName: o.customer?.name || "N/A",
        planName: o.tiffinPlan?.name || "N/A",
        amount: o.totalAmount,
        status: o.status,
        paymentStatus: o.paymentStatus,
        date: o.createdAt,
      })),
      topCustomers,
    });
  } catch (error) {
    console.error("Reports data error:", error);
    res.status(500).json({ message: "Failed to fetch reports data" });
  }
};

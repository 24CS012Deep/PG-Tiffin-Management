import { useEffect, useState } from "react";
import API from "../../utils/api";
import {
  FiShoppingBag,
  FiUser,
  FiArrowRight,
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiAlertCircle,
} from "react-icons/fi";
import { 
  MdWavingHand, 
  MdOutlineRestaurantMenu, 
  MdReceiptLong, 
  MdOutlineSupportAgent 
} from "react-icons/md";
import { Link } from "react-router-dom";

const CustomerDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    totalBills: 0,
    pendingBills: 0,
    totalQueries: 0,
    openQueries: 0,
    availablePlans: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      let ordersRes, billsRes, queriesRes, plansRes;

      try {
        ordersRes = await API.get("/customer/orders");
      } catch (err) {
        console.error("Orders API failed:", err);
      }

      try {
        billsRes = await API.get("/customer/billings");
      } catch (err) {
        console.error("Billings API failed:", err);
      }

      try {
        queriesRes = await API.get("/customer/queries");
      } catch (err) {
        console.error("Queries API failed:", err);
      }

      try {
        plansRes = await API.get("/customer/tiffin-plans");
      } catch (err) {
        console.error("Tiffin plans API failed:", err);
      }

      const orders = ordersRes?.data || [];
      const bills = billsRes?.data || [];
      const queries = queriesRes?.data || [];

      setRecentOrders(orders.slice(0, 4));

      setStats({
        totalOrders: orders.length,
        activeOrders: orders.filter((o) => o.status === "live").length,
        totalBills: bills.length,
        pendingBills: bills.filter((b) => b.status === "pending").length,
        totalQueries: queries.length,
        openQueries: queries.filter((q) => q.status === "open").length,
        availablePlans: plansRes?.data?.length || 0,
        totalSpent: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      });
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const user = JSON.parse(localStorage.getItem("user"));

  const getStatusConfig = (status) => {
    switch (status) {
      case "live":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
          label: "Live",
        };
      case "completed":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          dot: "bg-blue-500",
          label: "Completed",
        };
      case "cancelled":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          dot: "bg-red-500",
          label: "Cancelled",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          dot: "bg-gray-500",
          label: status,
        };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-500">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-gray-800">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-2.5 rounded-xl shadow-lg flex items-center justify-center">
              <MdWavingHand className="text-xl" />
            </span>
            Welcome, {user?.name?.split(" ")[0] || "Customer"}!
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your tiffin orders, bills, and support tickets.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-3 rounded-r-xl mb-6 flex items-center gap-3">
          <FiAlertCircle className="text-lg flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Hero Stats Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 rounded-2xl shadow-xl shadow-orange-200 p-6 md:p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 rounded-full bg-white opacity-5 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium mb-4 backdrop-blur-sm border border-white/30">
            <FiTrendingUp /> Your Activity Summary
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div>
              <p className="text-orange-100 text-xs uppercase tracking-wider font-semibold mb-1">
                Total Orders
              </p>
              <p className="text-4xl font-black">{stats.totalOrders}</p>
            </div>
            <div>
              <p className="text-orange-100 text-xs uppercase tracking-wider font-semibold mb-1">
                Active Now
              </p>
              <p className="text-4xl font-black">{stats.activeOrders}</p>
            </div>
            <div>
              <p className="text-orange-100 text-xs uppercase tracking-wider font-semibold mb-1">
                Total Spent
              </p>
              <p className="text-4xl font-black">
                ₹{stats.totalSpent.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-orange-100 text-xs uppercase tracking-wider font-semibold mb-1">
                Plans Available
              </p>
              <p className="text-4xl font-black">{stats.availablePlans}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          {
            label: "Pending Bills",
            value: stats.pendingBills,
            icon: <MdReceiptLong />,
            color: "from-amber-400 to-amber-500",
            bg: "bg-amber-50",
            textColor: "text-amber-600",
            border: "border-amber-100",
          },
          {
            label: "Active Orders",
            value: stats.activeOrders,
            icon: <FiShoppingBag />,
            color: "from-emerald-400 to-emerald-500",
            bg: "bg-emerald-50",
            textColor: "text-emerald-600",
            border: "border-emerald-100",
          },
          {
            label: "Open Tickets",
            value: stats.openQueries,
            icon: <MdOutlineSupportAgent />,
            color: "from-blue-400 to-blue-500",
            bg: "bg-blue-50",
            textColor: "text-blue-600",
            border: "border-blue-100",
          },
          {
            label: "Total Bills",
            value: stats.totalBills,
            icon: <MdReceiptLong />,
            color: "from-violet-400 to-violet-500",
            bg: "bg-violet-50",
            textColor: "text-violet-600",
            border: "border-violet-100",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`${stat.bg} border ${stat.border} p-5 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all group`}
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}
            >
              {stat.icon}
            </div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              {stat.label}
            </p>
            <p className={`text-3xl font-bold mt-1 ${stat.textColor}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FiClock className="text-orange-500" /> Recent Orders
            </h2>
            <Link
              to="/customer/my-orders"
              className="text-orange-500 hover:text-orange-600 text-sm font-semibold flex items-center gap-1 group"
            >
              View All{" "}
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              return (
                <div
                  key={order._id}
                  className="px-6 py-4 flex justify-between items-center hover:bg-orange-50/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xl shadow-sm">
                      <MdOutlineRestaurantMenu />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {order.tiffinPlan?.name || "Tiffin Order"}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {new Date(order.date).toLocaleDateString("en-IN")} • Qty:{" "}
                        {order.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-800 text-sm">
                      ₹{order.totalAmount}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
                      ></span>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Browse Plans",
            icon: <MdOutlineRestaurantMenu />,
            link: "/customer/tiffin-plans",
            color: "from-orange-400 to-orange-500",
          },
          {
            label: "My Orders",
            icon: <FiShoppingBag />,
            link: "/customer/my-orders",
            color: "from-emerald-400 to-emerald-500",
          },
          {
            label: "Raise Query",
            icon: <MdOutlineSupportAgent />,
            link: "/customer/raise-query",
            color: "from-blue-400 to-blue-500",
          },
          {
            label: "My Profile",
            icon: <FiUser />,
            link: "/customer/profile",
            color: "from-violet-400 to-violet-500",
          },
        ].map((action, idx) => (
          <Link
            key={idx}
            to={action.link}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group h-32"
          >
            <div
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${action.color} text-white flex items-center justify-center text-xl group-hover:-translate-y-1 transition-transform shadow-lg`}
            >
              {action.icon}
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CustomerDashboard;
import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiShoppingBag, FiXCircle, FiClock, FiCheckCircle, FiAlertCircle, FiCalendar, FiPackage } from "react-icons/fi";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { Link } from "react-router-dom";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/customer/orders");
      setOrders(res.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await API.put(`/customer/orders/${orderId}/cancel`);
        fetchOrders();
        setSuccess("Order cancelled successfully!");
      } catch (err) {
        alert(err.response?.data?.message || "Failed to cancel order");
      }
    }
  };

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const canCancelOrder = (order) => {
    if (order.status !== "live") return false;
    const createdAt = new Date(order.createdAt || order.date).getTime();
    if (Number.isNaN(createdAt)) return false;
    return Date.now() - createdAt <= 5 * 60 * 1000;
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "live":
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", icon: <FiCheckCircle className="text-xs" />, label: "Live" };
      case "completed":
        return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500", icon: <FiCheckCircle className="text-xs" />, label: "Completed" };
      case "cancelled":
        return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", icon: <FiXCircle className="text-xs" />, label: "Cancelled" };
      default:
        return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", dot: "bg-gray-500", icon: null, label: status };
    }
  };

  const getPaymentConfig = (status) => {
    switch (status) {
      case "paid":
        return { bg: "bg-emerald-50", text: "text-emerald-700" };
      case "pending":
        return { bg: "bg-amber-50", text: "text-amber-700" };
      default:
        return { bg: "bg-gray-50", text: "text-gray-700" };
    }
  };

  const filters = [
    { label: "All", value: "all", count: orders.length },
    { label: "Live", value: "live", count: orders.filter((o) => o.status === "live").length },
    { label: "Completed", value: "completed", count: orders.filter((o) => o.status === "completed").length },
    { label: "Cancelled", value: "cancelled", count: orders.filter((o) => o.status === "cancelled").length },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-500">Loading your orders...</p>
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
              <MdOutlineRestaurantMenu className="text-xl" />
            </span>
            My Orders
          </h1>
          <p className="text-gray-500 text-sm mt-1">Track your tiffin orders and manage deliveries.</p>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 px-5 py-3 rounded-r-xl mb-6 flex items-center gap-3">
          <FiCheckCircle className="text-lg flex-shrink-0" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-3 rounded-r-xl mb-6 flex items-center gap-3">
          <FiAlertCircle className="text-lg flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-1 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              filter === f.value
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {f.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === f.value ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 p-16 text-center">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdOutlineRestaurantMenu className="text-3xl text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Orders Found</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            {filter === "all" ? "You haven't placed any orders yet. Browse our tiffin plans to get started!" : `No ${filter} orders found.`}
          </p>
          {filter === "all" && (
            <Link
              to="/customer/tiffin-plans"
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition shadow-lg shadow-orange-200"
            >
              Browse Tiffin Plans
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const paymentConfig = getPaymentConfig(order.paymentStatus);
            const cancelable = canCancelOrder(order);

            return (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                {/* Top bar */}
                <div className="flex justify-between items-center px-6 py-3 border-b border-gray-50 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-mono">#{order._id?.slice(-8).toUpperCase()}</span>
                    <span className="text-xs text-gray-300">|</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <FiCalendar className="text-[10px]" />
                      {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                    {statusConfig.label}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-2xl shadow-sm flex-shrink-0">
                        <MdOutlineRestaurantMenu />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{order.tiffinPlan?.name || "Tiffin Order"}</h3>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg font-medium">Qty: {order.quantity}</span>
                          <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg font-medium capitalize flex items-center gap-1">
                            <FiClock className="text-[10px]" /> {order.deliveryTime}
                          </span>
                          <span className={`text-xs px-2.5 py-1 rounded-lg font-bold capitalize ${paymentConfig.bg} ${paymentConfig.text}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:flex-col md:items-end">
                      <span className="text-xl font-black text-orange-600">₹{order.totalAmount}</span>
                      <div className="flex gap-2 md:w-full md:justify-end">
                        {order.status === "live" && cancelable && (
                          <button
                            onClick={() => cancelOrder(order._id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors"
                          >
                            <FiXCircle /> Cancel
                          </button>
                        )}
                      </div>
                      {order.status === "live" && !cancelable && (
                        <p className="text-[10px] text-gray-400 max-w-[150px] text-right">
                          Cancel window closed (5 min limit)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  {order.items?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                          <MdOutlineRestaurantMenu className="text-[10px]" /> {item}
                        </span>
                      ))}
                    </div>
                  )}

                  {order.specialInstructions && (
                    <p className="mt-3 text-xs text-gray-400 italic bg-gray-50 px-3 py-2 rounded-lg">
                      Note: {order.specialInstructions}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiXCircle, FiClock, FiCheckCircle, FiAlertCircle, FiCamera, FiBox } from "react-icons/fi";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { Link } from "react-router-dom";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");
  const [showQR, setShowQR] = useState(null); // stores order ID to show QR

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
      setOrders(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders. Please try again.");
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
        <p className="mt-4 text-gray-500 font-medium">Loading your orders...</p>
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
          <p className="text-gray-500 text-sm mt-1">Track your tiffin orders and manage payments.</p>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 px-5 py-3 rounded-r-xl mb-6 flex items-center gap-3 font-medium text-sm">
          <FiCheckCircle className="text-lg flex-shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-3 rounded-r-xl mb-6 flex items-center gap-3 font-medium text-sm">
          <FiAlertCircle className="text-lg flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-1 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              filter === f.value
                ? "bg-gray-900 text-white shadow-md shadow-gray-200"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {f.label}
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                filter === f.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-dashed border-gray-200 p-16 text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-5 border border-gray-100">
            <FiBox className="text-4xl text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Orders Found</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            {filter === "all" ? "You haven't placed any orders yet. Browse our tiffin plans to get started!" : `No ${filter} orders found.`}
          </p>
          {filter === "all" && (
            <Link
              to="/customer/tiffin-plans"
              className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200"
            >
              Browse Tiffin Plans
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const cancelable = canCancelOrder(order);

            return (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden relative">
                
                {/* Header Strip */}
                <div className={`h-2 w-full ${
                  order.status === 'live' ? 'bg-amber-400' :
                  order.status === 'completed' ? 'bg-emerald-500' : 'bg-red-500'
                }`} />

                <div className="p-6 flex-1 flex flex-col">
                  {/* Title & Meal */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-black text-gray-900 leading-tight mb-1 uppercase tracking-tight">
                        {order.tiffinPlan?.name || "Tiffin Order"}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5 capitalize">
                        {order.deliveryTime === 'breakfast' ? '🍳' : order.deliveryTime === 'lunch' ? '🍛' : '🍽'} {order.deliveryTime === 'both' ? 'Lunch & Dinner' : order.deliveryTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-mono">#{order._id?.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-gray-500 font-medium mt-1">
                        {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>

                  {/* Order & Payment Status */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-3 flex-1 border border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-600">Order Status:</span>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
                        order.status === 'live' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        order.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {order.status === 'live' ? <><FiClock /> LIVE</> : order.status === 'completed' ? <><FiCheckCircle /> COMPLETED</> : <><FiXCircle /> CANCELLED</>}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-600">Payment:</span>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                        order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {order.paymentStatus === 'paid' ? '💰 PAID' : '💰 UNPAID'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-sm font-semibold text-gray-600">Total Amount:</span>
                      <span className="text-base font-black text-orange-600">₹{order.totalAmount}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-auto">
                    {order.paymentStatus !== 'paid' && order.status !== 'cancelled' ? (
                      <button 
                        onClick={() => setShowQR(showQR === order._id ? null : order._id)}
                        className="flex-[2] bg-gray-900 text-white font-bold py-2.5 rounded-xl hover:bg-gray-800 transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        <FiCamera /> Scan to Pay
                      </button>
                    ) : (
                       <div className="flex-[2]" /> // empty spacer
                    )}

                    {order.status === "live" && cancelable && (
                      <button
                        onClick={() => cancelOrder(order._id)}
                        className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center border border-red-100"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  
                  {/* Payment QR Code Expandable Area */}
                  {showQR === order._id && order.paymentStatus !== 'paid' && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col items-center animate-fadeIn">
                      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 mb-3">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=pgtiffin@upi&pn=SwadBox&am=${order.totalAmount}&cu=INR`} 
                          alt="UPI QR Code" 
                          className="w-32 h-32 opacity-90"
                        />
                      </div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Scan with GPay / PhonePe / Paytm</p>
                      <p className="text-[10px] text-gray-400 mt-1 text-center font-medium max-w-[200px]">Once paid, please wait for the Admin to mark your order as PAID.</p>
                    </div>
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
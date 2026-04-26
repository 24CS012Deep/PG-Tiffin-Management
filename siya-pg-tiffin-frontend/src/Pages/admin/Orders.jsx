import { useEffect, useState } from "react";
import API from "../../utils/api";
import { 
  FiCheckCircle, FiXCircle, FiTrash2, FiShoppingBag, 
  FiSearch, FiKey, FiMail, FiClock, FiCreditCard, FiUser, FiMapPin, FiCalendar
} from "react-icons/fi";
import { MdDeliveryDining, MdOutlineRestaurantMenu } from "react-icons/md";
import OTPVerificationModal from "../../components/OTPVerificationModal";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("live");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedOrderForOTP, setSelectedOrderForOTP] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // If statusFilter is 'history', we'll fetch all and filter in frontend or handle via specialized query
      // For simplicity, let's just fetch all and filter if it's history
      const url = (statusFilter && statusFilter !== "history") ? `/admin/orders?status=${statusFilter}` : "/admin/orders";
      const res = await API.get(url);
      let data = Array.isArray(res.data) ? res.data : [];
      
      if (statusFilter === "history") {
        data = data.filter(o => o.status !== "live");
      }
      
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (orderId) => {
    if (!window.confirm("Confirm payment receipt? This will send a confirmation email to the customer.")) return;
    try {
      setPaymentLoading(true);
      await API.post("/admin/orders/verify-payment", { orderId });
      fetchOrders();
      alert("Payment verified successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to verify payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  const deleteOrder = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await API.delete(`/admin/orders/${id}`);
        fetchOrders();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete order");
      }
    }
  };

  const handleSendOTP = async (order) => {
    try {
      setOtpLoading(true);
      await API.post(`/admin/orders/${order._id}/send-otp`);
      fetchOrders();
      alert("OTP sent to customer successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      live: { bg: "bg-orange-50", text: "text-orange-600", icon: <FiClock />, label: "LIVE" },
      completed: { bg: "bg-emerald-50", text: "text-emerald-600", icon: <FiCheckCircle />, label: "COMPLETED" },
      cancelled: { bg: "bg-red-50", text: "text-red-600", icon: <FiXCircle />, label: "CANCELLED" },
    };
    const config = configs[status] || { bg: "bg-gray-50", text: "text-gray-600", icon: null, label: status };
    return (
      <span className={`${config.bg} ${config.text} px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border border-current/10`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const filteredOrders = orders.filter(
    (order) =>
      searchTerm === "" ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tiffinPlan?.planNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 font-sans text-slate-900 bg-gray-50/20">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-orange-500 text-white p-3 rounded-xl shadow-lg shadow-orange-100">
            <FiShoppingBag size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Tiffin Orders</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Manage live orders, verify deliveries via OTP, and track payments.</p>
          </div>
        </div>
      </div>

      {/* Control Bar & Filters */}
      <div className="flex flex-col lg:flex-row items-center gap-6 mb-10">
        {/* Search */}
        <div className="flex-1 relative w-full group">
          <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6B00] transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by customer, plan or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-500/5 focus:border-[#FF6B00] outline-none font-bold text-slate-800 text-sm transition-all shadow-sm"
          />
        </div>
        
        {/* View Toggle (Active vs History) */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-100 flex shadow-sm">
          <button 
            onClick={() => setStatusFilter("live")}
            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              statusFilter === "live" ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <FiClock size={14} /> Active
          </button>
          <button 
            onClick={() => setStatusFilter("history")}
            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              statusFilter === "history" ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <FiCheckCircle size={14} /> History
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">User</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Plan Details</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-all group">
                    {/* User Info */}
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-black text-xs uppercase shadow-lg shadow-orange-100 flex-shrink-0">
                          {order.customer?.name?.charAt(0) || "G"}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 text-[13px] uppercase tracking-tight leading-none mb-1">{order.customer?.name || "Guest"}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-2">
                             {new Date(order.date || order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                          </span>
                          
                          {/* Delivery Address with Map Link */}
                          {order.deliveryAddress && (
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[10px] font-black text-orange-500 hover:text-orange-600 uppercase transition-colors group/link"
                            >
                              <FiMapPin size={10} className="group-hover/link:scale-110 transition-transform" />
                              <span className="truncate max-w-[150px]">{order.deliveryAddress}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Plan Details */}
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-black text-slate-800 text-[13px] uppercase tracking-tight">{order.tiffinPlan?.planNumber || "N/A"}</span>
                          <span className="text-[#FF6B00] font-black text-xs">×{order.quantity}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="bg-orange-50 text-[#FF6B00] px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border border-orange-100 flex items-center gap-1.5">
                            <FiClock size={10} /> {order.deliveryTime || "LUNCH"}
                          </div>
                          <span className="text-[13px] font-black text-[#FF6B00]">₹{order.totalAmount}</span>
                        </div>
                      </div>
                    </td>

                    {/* Order Status */}
                    <td className="px-10 py-8 text-center">
                      <div className="flex justify-center">
                        {getStatusBadge(order.status)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'live' && (
                          <div className="flex gap-2">
                            {order.otp ? (
                              <button
                                onClick={() => setSelectedOrderForOTP(order)}
                                className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-50 flex items-center gap-2 active:scale-95"
                              >
                                <FiKey size={12} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Verify Delivery</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSendOTP(order)}
                                disabled={otpLoading}
                                className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-[#FF6B00] transition-all flex items-center gap-2 shadow-lg shadow-gray-100 active:scale-95 disabled:opacity-50"
                              >
                                <FiMail size={12} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Send OTP</span>
                              </button>
                            )}
                          </div>
                        )}
                        
                        <button
                          onClick={() => deleteOrder(order._id)}
                          className="p-2.5 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-slate-100 active:scale-95"
                          title="Delete Order"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-24 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <FiShoppingBag size={32} className="text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No active orders</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrderForOTP && (
        <OTPVerificationModal
          order={selectedOrderForOTP}
          onClose={() => setSelectedOrderForOTP(null)}
          onSuccess={() => {
            fetchOrders();
            setSelectedOrderForOTP(null);
          }}
        />
      )}
    </div>
  );
};

export default Orders;
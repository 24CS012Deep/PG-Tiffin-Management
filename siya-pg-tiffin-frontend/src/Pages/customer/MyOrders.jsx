import { useEffect, useState } from "react";
import API from "../../utils/api";
import { 
  FiXCircle, FiClock, FiCheckCircle, FiAlertCircle, 
  FiBox, FiCalendar, FiMapPin, FiCreditCard, FiHash, FiArrowRight, FiShoppingBag, FiSmartphone
} from "react-icons/fi";
import { MdOutlineRestaurantMenu, MdDeliveryDining } from "react-icons/md";
import { Link } from "react-router-dom";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("live");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = (filter && filter !== "history") ? `/customer/orders?status=${filter}` : "/customer/orders";
      const res = await API.get(url);
      let data = Array.isArray(res.data) ? res.data : [];
      
      if (filter === "history") {
        data = data.filter(o => o.status !== "live");
      }
      
      setOrders(data);
      setError("");
    } catch (err) {
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await API.put(`/customer/orders/${orderId}/cancel`);
        alert("Order cancelled successfully");
        fetchOrders();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to cancel order");
      }
    }
  };

  const filteredOrders = orders; // No more client-side filtering needed

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
        <p className="mt-4 text-slate-500 font-bold tracking-widest uppercase text-xs">Loading Your Orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 font-sans text-slate-900">
      {/* Header Section */}
      <div className="mb-12 flex flex-col md:flex-row md:items-center gap-6">
        <div className="w-16 h-16 bg-[#FF6B00] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100 flex-shrink-0">
          <FiShoppingBag size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">My Tiffin Orders</h1>
          <p className="text-slate-500 font-medium mt-1">Check your live orders and delivery history.</p>
        </div>
      </div>

      {/* Filters Toggle */}
      <div className="flex bg-white p-1 rounded-2xl border border-gray-100 w-fit mb-10 shadow-sm">
        <button 
          onClick={() => setFilter("live")}
          className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
            filter === "live" ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <FiClock size={14} /> Active
        </button>
        <button 
          onClick={() => setFilter("history")}
          className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
            filter === "history" ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <FiCheckCircle size={14} /> History
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="py-24 bg-white rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <FiBox className="text-4xl text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-400">No orders found</h3>
          <p className="text-slate-400 mt-2 font-medium">You haven't placed any orders in this category yet.</p>
          <Link to="/customer/tiffin-plans" className="mt-8 bg-orange-50 text-[#FF6B00] px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#FF6B00] hover:text-white transition-all shadow-sm">
            Browse Plans <FiArrowRight />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-[2rem] border border-gray-100 p-8 hover:shadow-[0_15px_40px_rgba(0,0,0,0.04)] transition-all group overflow-hidden relative">
              {/* Subtle background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/30 rounded-full -translate-y-16 translate-x-16 group-hover:bg-orange-100/40 transition-colors"></div>
              
              <div className="flex flex-col lg:flex-row justify-between gap-10 relative z-10">
                {/* Left Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      order.status === "live" ? "bg-orange-50 text-[#FF6B00] border-orange-100" : 
                      order.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-50 text-gray-400 border-gray-100"
                    }`}>
                      {order.status}
                    </span>
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.15em]">
                      ID: #{order._id.slice(-6)}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-800 mb-6 tracking-tight uppercase">{order.tiffinPlan?.planNumber}</h3>
                  
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-xs font-bold text-slate-400 mb-8">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="text-[#FF6B00]" size={16} />
                      <span className="uppercase">{new Date(order.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiClock className="text-[#FF6B00]" size={16} />
                      <span className="uppercase">{order.deliveryTime || "Lunch"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50/50 border border-gray-100 p-5 rounded-2xl">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FiMapPin className="text-[#FF6B00]" /> Delivery Address
                      </p>
                      <p className="text-xs font-semibold text-slate-600 leading-relaxed uppercase">{order.deliveryAddress || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50/50 border border-gray-100 p-5 rounded-2xl">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FiCreditCard className="text-[#FF6B00]" /> Billing Information
                      </p>
                      <Link 
                        to="/customer/my-bills"
                        className="text-[10px] font-black uppercase text-[#FF6B00] hover:text-slate-800 transition-colors flex items-center gap-2 tracking-widest"
                      >
                        Go to My Bills <FiArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Right Actions / Summary */}
                <div className="lg:w-72 flex flex-col justify-between items-end border-t lg:border-t-0 lg:border-l border-gray-100 pt-8 lg:pt-0 lg:pl-10">
                  <div className="text-right w-full">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estimated Cost</p>
                    <div className="flex flex-col items-end">
                      <span className="text-4xl font-bold text-slate-800 tracking-tighter">₹{order.totalAmount}</span>
                      <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Qty: {order.quantity}</span>
                    </div>
                  </div>

                  <div className="w-full mt-10 space-y-3">
                    {order.status === "live" && (
                      <>
                        <div className="bg-orange-50 text-[#FF6B00] p-4 rounded-2xl text-center border border-orange-100 transition-all">
                           <p className="text-[9px] font-bold uppercase tracking-widest mb-1">Delivery OTP</p>
                           <p className="text-2xl font-black tracking-[0.3em] ml-2">{order.otp || "WAITING"}</p>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">
                          <MdDeliveryDining size={16} className="text-orange-400" />
                          Out for Delivery
                        </div>
                        <button 
                          onClick={() => handleCancelOrder(order._id)}
                          className="w-full mt-4 py-3 bg-red-50 text-red-500 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          <FiXCircle size={14} /> Cancel Order
                        </button>
                      </>
                    )}

                    {order.status === "completed" && (
                      <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-center border border-emerald-100 flex items-center justify-center gap-2">
                         <FiCheckCircle size={14} />
                         <span className="text-[11px] font-bold uppercase tracking-widest">Delivered</span>
                      </div>
                    )}

                    {order.status === "cancelled" && (
                      <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-center border border-red-100">
                         <span className="text-[11px] font-bold uppercase tracking-widest">Cancelled</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;

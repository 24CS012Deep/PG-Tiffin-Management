import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiCheckCircle, FiXCircle, FiTrash2, FiShoppingBag, FiSearch, FiKey, FiMail, FiClock } from "react-icons/fi";
import OTPVerificationModal from "../../components/OTPVerificationModal";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedOrderForOTP, setSelectedOrderForOTP] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter ? `/admin/orders?status=${statusFilter}` : "/admin/orders";
      const res = await API.get(url);
      setOrders(res.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await API.put(`/admin/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update order");
    }
  };

  const togglePaymentStatus = async (order) => {
    try {
      const newStatus = order.paymentStatus === 'paid' ? 'pending' : 'paid';
      await API.put(`/admin/orders/${order._id}/status`, { paymentStatus: newStatus });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update payment");
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
      // Update local order so modal knows OTP is sent
      fetchOrders();
      alert("OTP sent to customer's email successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live': 
        return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-max"><FiClock /> LIVE</span>;
      case 'completed': 
        return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-max"><FiCheckCircle /> COMPLETED</span>;
      case 'cancelled': 
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-max"><FiXCircle /> CANCELLED</span>;
      default: 
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      searchTerm === "" ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tiffinPlan?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 text-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-gray-800">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-2 rounded-xl shadow-lg">
              <FiShoppingBag />
            </span>
            Tiffin Orders
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage live orders, verify deliveries via OTP, and track payments.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-sm mb-6">
          {error}
        </div>
      )}

      {/* Control Bar: Search & Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-orange-500 transition-all text-sm outline-none font-medium text-gray-700"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-50 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 text-sm outline-none font-bold text-gray-600 uppercase tracking-wider cursor-pointer"
        >
          <option value="">All Orders</option>
          <option value="live">Live / Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Customer Info</th>
                <th className="px-6 py-4 whitespace-nowrap">Plan Details</th>
                <th className="px-6 py-4 whitespace-nowrap">Order Status</th>
                <th className="px-6 py-4 whitespace-nowrap">Payment</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-orange-50/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-gray-800 text-base">
                        {order.customer?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-400 font-medium mt-1">
                        {new Date(order.date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    
                    <td className="px-6 py-5">
                      <div className="font-bold text-gray-800">
                        {order.tiffinPlan?.name || "N/A"} <span className="text-orange-500">×{order.quantity}</span>
                      </div>
                      <div className="text-[11px] font-bold text-gray-500 flex gap-2 mt-1.5 uppercase tracking-wide">
                         {order.deliveryTime === 'both' ? 'Lunch & Dinner' : order.deliveryTime}
                         <span className="text-orange-600 border-l border-gray-300 pl-2 ml-1">₹{order.totalAmount}</span>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      {getStatusBadge(order.status)}
                    </td>

                    <td className="px-6 py-5">
                      <button 
                        onClick={() => togglePaymentStatus(order)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                        title="Click to toggle payment status"
                      >
                        <div className={`w-2 h-2 rounded-full ${order.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        {order.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}
                      </button>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        {order.status === 'live' && (
                          <div className="flex gap-2">
                            {order.otp ? (
                              <button
                                onClick={() => setSelectedOrderForOTP(order)}
                                className="px-3 py-1.5 bg-orange-500 text-white hover:bg-orange-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-orange-200"
                              >
                                <FiKey size={14} /> Verify OTP
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSendOTP(order)}
                                disabled={otpLoading}
                                className="px-3 py-1.5 bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                              >
                                <FiMail size={14} /> {otpLoading ? 'Sending...' : 'Send OTP'}
                              </button>
                            )}
                            
                            <button
                              onClick={() => updateOrderStatus(order._id, 'cancelled')}
                              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        
                        <button
                          onClick={() => deleteOrder(order._id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
                  <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                     <div className="flex flex-col items-center justify-center">
                       <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                         <FiShoppingBag className="text-2xl text-gray-300" />
                       </div>
                       <p className="text-lg font-bold text-gray-800">No orders found</p>
                       <p className="text-sm mt-1 text-gray-400">Wait for customers to place orders.</p>
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
            alert("Order verified and completed successfully!");
          }}
        />
      )}
    </div>
  );
};

export default Orders;
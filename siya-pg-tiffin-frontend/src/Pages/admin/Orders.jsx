import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiCheckCircle, FiXCircle, FiClock, FiTrash2, FiShoppingBag, FiSearch, FiDollarSign } from "react-icons/fi";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

  const updatePaymentStatus = async (id, paymentStatus) => {
    try {
      await API.put(`/admin/orders/${id}/status`, { paymentStatus });
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'live': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPaymentClass = (status) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
            Monitor, update, and track all live and completed delivery orders.
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
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-orange-500 transition-all text-sm outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-50 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 text-sm outline-none font-medium text-gray-600"
        >
          <option value="">All Orders</option>
          <option value="live">Live / Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Customer Info</th>
                <th className="px-6 py-4 whitespace-nowrap">Plan Details</th>
                <th className="px-6 py-4 whitespace-nowrap">Total</th>
                <th className="px-6 py-4 whitespace-nowrap">Date</th>
                <th className="px-6 py-4 whitespace-nowrap">Order Status</th>
                <th className="px-6 py-4 whitespace-nowrap">Payment</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-orange-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">
                        {order.customer?.name || "Unknown"}
                      </div>
                      {order.deliveryAddress && (
                         <div className="text-xs text-gray-400 mt-1 max-w-[150px] truncate" title={order.deliveryAddress}>
                           {order.deliveryAddress}
                         </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{order.tiffinPlan?.name || "N/A"}</div>
                      <div className="text-xs mt-1 text-gray-500 flex gap-2">
                         <span>Qty: <strong className="text-gray-700">{order.quantity}</strong></span>
                         {order.deliveryTime && (
                           <span className="capitalize border-l border-gray-300 pl-2">
                             {order.deliveryTime}
                           </span>
                         )}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-bold text-orange-600">
                      ₹{order.totalAmount}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-gray-600 font-medium">
                        {new Date(order.date).toLocaleDateString("en-IN", {
                           day: "numeric", month: "short", year: "numeric"
                        })}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2 py-0.5 rounded border focus-within:ring-2 focus-within:ring-orange-500 ${getStatusClass(order.status)}`}>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className={`bg-transparent border-none text-xs font-bold uppercase tracking-wider pl-1 pr-6 py-1 appearance-none focus:outline-none cursor-pointer`}
                          style={{
                             backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                             backgroundRepeat: 'no-repeat',
                             backgroundPosition: 'right 6px center',
                             backgroundSize: '8px auto',
                          }}
                        >
                          <option value="live">Live</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2 py-0.5 rounded border focus-within:ring-2 focus-within:ring-orange-500 ${getPaymentClass(order.paymentStatus)}`}>
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                          className={`bg-transparent border-none text-xs font-bold uppercase tracking-wider pl-1 pr-6 py-1 appearance-none focus:outline-none cursor-pointer`}
                          style={{
                             backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                             backgroundRepeat: 'no-repeat',
                             backgroundPosition: 'right 6px center',
                             backgroundSize: '8px auto',
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => deleteOrder(order._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Order"
                      >
                        <FiTrash2 className="text-[16px]" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                     <div className="flex flex-col items-center justify-center">
                       <FiShoppingBag className="text-4xl mb-3 text-gray-300" />
                       <p className="text-base font-medium text-gray-800">No orders found</p>
                       <p className="text-sm mt-1">Try adjusting your search criteria or filter.</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
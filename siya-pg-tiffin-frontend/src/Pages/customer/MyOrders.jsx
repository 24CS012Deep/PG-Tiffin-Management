import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiShoppingBag, FiXCircle } from "react-icons/fi";
import { Link } from "react-router-dom";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

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
        fetchOrders(); // Refresh the list
      } catch (err) {
        alert(err.response?.data?.message || "Failed to cancel order");
      }
    }
  };

  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter(o => o.status === filter);

  const getStatusColor = (status) => {
    switch(status) {
      case 'live': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg transition ${
            filter === "all" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("live")}
          className={`px-4 py-2 rounded-lg transition ${
            filter === "live" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Live
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-2 rounded-lg transition ${
            filter === "completed" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter("cancelled")}
          className={`px-4 py-2 rounded-lg transition ${
            filter === "cancelled" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Cancelled
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FiShoppingBag className="text-5xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Orders Found</h2>
          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
          <Link to="/customer/tiffin-plans" className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600">
            Browse Tiffin Plans
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{order.tiffinPlan?.name}</h3>
                  <p className="text-sm text-gray-500">
                    Order ID: {order._id.slice(-8)} • {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-gray-500 text-sm">Quantity</p>
                  <p className="font-medium">{order.quantity}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Amount</p>
                  <p className="font-medium">₹{order.totalAmount}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Delivery Time</p>
                  <p className="font-medium capitalize">{order.deliveryTime}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Payment Status</p>
                  <p className={`font-medium ${
                    order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {order.paymentStatus}
                  </p>
                </div>
              </div>

              {order.items?.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-500 text-sm mb-1">Items</p>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {order.status === 'live' && (
                <button
                  onClick={() => cancelOrder(order._id)}
                  className="text-red-500 hover:text-red-600 flex items-center gap-1 text-sm"
                >
                  <FiXCircle /> Cancel Order
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
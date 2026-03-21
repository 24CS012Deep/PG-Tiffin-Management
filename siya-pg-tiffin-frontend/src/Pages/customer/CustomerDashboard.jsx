import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiShoppingBag, FiDollarSign, FiMessageSquare, FiBox, FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";

const CustomerDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    totalBills: 0,
    pendingBills: 0,
    totalQueries: 0,
    openQueries: 0,
    availablePlans: 0
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

      // Fetch orders
      let ordersRes;
      try {
        ordersRes = await API.get("/customer/orders");
        const activeOrders = ordersRes?.data?.filter(o => o.status === "live").length || 0;
        setStats(prev => ({
          ...prev,
          totalOrders: ordersRes?.data?.length || 0,
          activeOrders
        }));
        setRecentOrders(ordersRes?.data?.slice(0, 3) || []);
      } catch (err) {
        console.error("Orders API failed:", err);
      }

      // Fetch bills
      try {
        const billsRes = await API.get("/customer/billings");
        const pendingBills = billsRes?.data?.filter(b => b.status === "pending").length || 0;
        setStats(prev => ({
          ...prev,
          totalBills: billsRes?.data?.length || 0,
          pendingBills
        }));
      } catch (err) {
        console.error("Billings API failed:", err);
      }

      // Fetch queries
      try {
        const queriesRes = await API.get("/customer/queries");
        const openQueries = queriesRes?.data?.filter(q => q.status === "open").length || 0;
        setStats(prev => ({
          ...prev,
          totalQueries: queriesRes?.data?.length || 0,
          openQueries
        }));
      } catch (err) {
        console.error("Queries API failed:", err);
      }

      // Fetch tiffin plans
      try {
        const plansRes = await API.get("/customer/tiffin-plans");
        setStats(prev => ({
          ...prev,
          availablePlans: plansRes?.data?.length || 0
        }));
      } catch (err) {
        console.error("Tiffin plans API failed:", err);
      }

    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Customer Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2">
            <FiShoppingBag className="text-2xl text-orange-500" />
            <span className="text-sm text-gray-500">Total Orders</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2">
            <FiShoppingBag className="text-2xl text-green-500" />
            <span className="text-sm text-gray-500">Active Orders</span>
          </div>
          <p className="text-3xl font-bold">{stats.activeOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2">
            <FiBox className="text-2xl text-blue-500" />
            <span className="text-sm text-gray-500">Available Plans</span>
          </div>
          <p className="text-3xl font-bold">{stats.availablePlans}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2">
            <FiDollarSign className="text-2xl text-yellow-500" />
            <span className="text-sm text-gray-500">Pending Bills</span>
          </div>
          <p className="text-3xl font-bold">{stats.pendingBills}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2">
            <FiMessageSquare className="text-2xl text-purple-500" />
            <span className="text-sm text-gray-500">Open Queries</span>
          </div>
          <p className="text-3xl font-bold">{stats.openQueries}</p>
        </div>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{order.tiffinPlan?.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString()} • Qty: {order.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">₹{order.totalAmount}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    order.status === 'live' ? 'bg-green-100 text-green-700' :
                    order.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/customer/my-orders" className="block text-center mt-4 text-orange-500 hover:text-orange-600">
            View All Orders →
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/customer/tiffin-plans" className="bg-orange-50 p-4 rounded-lg text-center hover:bg-orange-100 transition">
            <FiBox className="text-2xl text-orange-500 mx-auto mb-2" />
            <span className="text-sm font-medium">Browse Plans</span>
          </Link>
          <Link to="/customer/my-orders" className="bg-orange-50 p-4 rounded-lg text-center hover:bg-orange-100 transition">
            <FiShoppingBag className="text-2xl text-orange-500 mx-auto mb-2" />
            <span className="text-sm font-medium">My Orders</span>
          </Link>
          <Link to="/customer/raise-query" className="bg-orange-50 p-4 rounded-lg text-center hover:bg-orange-100 transition">
            <FiMessageSquare className="text-2xl text-orange-500 mx-auto mb-2" />
            <span className="text-sm font-medium">Raise Query</span>
          </Link>
          <Link to="/customer/profile" className="bg-orange-50 p-4 rounded-lg text-center hover:bg-orange-100 transition">
            <FiUser className="text-2xl text-orange-500 mx-auto mb-2" />
            <span className="text-sm font-medium">My Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
import { useEffect, useState } from "react";
import API from "../utils/api";
import { FiUsers, FiHome, FiBox, FiShoppingBag, FiDollarSign, FiMessageSquare } from "react-icons/fi";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalCustomers: 0,
    totalRooms: 0,
    totalTiffinPlans: 0,
    totalOrders: 0,
    totalQueries: 0,
    monthlyRevenue: 0,
    revenueTarget: 150000,
    recentOrders: [],
    recentQueries: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/stats");
      setStats(res.data);
      setError("");
    } catch (err) {
      console.error("Failed to load stats:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h2 className="text-3xl font-bold mt-2">{value}</h2>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="text-2xl text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={FiUsers}
          color="bg-blue-500"
        />
        <StatCard 
          title="PG Students" 
          value={stats.totalStudents} 
          icon={FiHome}
          color="bg-green-500"
        />
        <StatCard 
          title="Tiffin Customers" 
          value={stats.totalCustomers} 
          icon={FiUsers}
          color="bg-purple-500"
        />
        <StatCard 
          title="PG Rooms" 
          value={stats.totalRooms} 
          icon={FiHome}
          color="bg-orange-500"
        />
        <StatCard 
          title="Tiffin Plans" 
          value={stats.totalTiffinPlans} 
          icon={FiBox}
          color="bg-indigo-500"
        />
        <StatCard 
          title="Live Orders" 
          value={stats.totalOrders} 
          icon={FiShoppingBag}
          color="bg-pink-500"
        />
        <StatCard 
          title="Open Queries" 
          value={stats.totalQueries} 
          icon={FiMessageSquare}
          color="bg-yellow-500"
        />
        <StatCard 
          title="Monthly Revenue" 
          value={`₹${stats.monthlyRevenue.toLocaleString()}`} 
          icon={FiDollarSign}
          color="bg-red-500"
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h3 className="font-semibold mb-4">Monthly Revenue Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-orange-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${(stats.monthlyRevenue / stats.revenueTarget) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {Math.round((stats.monthlyRevenue / stats.revenueTarget) * 100)}% of target achieved
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order._id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{order.customer?.name}</p>
                    <p className="text-sm text-gray-500">{order.tiffinPlan?.name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    order.status === 'live' ? 'bg-green-100 text-green-700' :
                    order.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
          </div>
          <Link to="/admin/orders" className="block text-center mt-4 text-orange-500 hover:text-orange-600">
            View All Orders →
          </Link>
        </div>

        {/* Recent Queries */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Open Queries</h3>
          <div className="space-y-3">
            {stats.recentQueries.length > 0 ? (
              stats.recentQueries.map((query) => (
                <div key={query._id} className="border-b pb-2">
                  <p className="font-medium">{query.user?.name}</p>
                  <p className="text-sm text-gray-600 truncate">{query.question}</p>
                  <span className={`text-xs ${
                    query.priority === 'high' ? 'text-red-500' :
                    query.priority === 'medium' ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {query.priority} priority
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No open queries</p>
            )}
          </div>
          <Link to="/admin/queries" className="block text-center mt-4 text-orange-500 hover:text-orange-600">
            View All Queries →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

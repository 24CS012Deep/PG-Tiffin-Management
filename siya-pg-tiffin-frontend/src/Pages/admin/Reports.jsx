import { useEffect, useState } from "react";
import API from "../../utils/api";

const Reports = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    occupancyRate: 0,
    totalUsers: 0,
    totalStudents: 0,
    totalCustomers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/stats");
      
      const avgOrderValue = res.data.totalOrders > 0 
        ? Math.round(res.data.monthlyRevenue / res.data.totalOrders) 
        : 0;
      
      const occupancyRate = res.data.totalRooms > 0
        ? Math.round((res.data.totalStudents / (res.data.totalRooms * 2)) * 100)
        : 0;

      setStats({
        totalRevenue: res.data.monthlyRevenue,
        totalOrders: res.data.totalOrders,
        avgOrderValue,
        occupancyRate,
        totalUsers: res.data.totalUsers,
        totalStudents: res.data.totalStudents,
        totalCustomers: res.data.totalCustomers
      });
    } catch (err) {
      console.error("Failed to fetch report data:", err);
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Reports & Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Total Revenue (March)</p>
          <h3 className="text-3xl font-bold text-orange-500 mt-2">₹{stats.totalRevenue}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Total Orders</p>
          <h3 className="text-3xl font-bold text-orange-500 mt-2">{stats.totalOrders}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Avg Order Value</p>
          <h3 className="text-3xl font-bold text-orange-500 mt-2">₹{stats.avgOrderValue}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Room Occupancy</p>
          <h3 className="text-3xl font-bold text-orange-500 mt-2">{stats.occupancyRate}%</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">User Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Students</span>
                <span className="font-medium">{stats.totalStudents}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(stats.totalStudents / stats.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Customers</span>
                <span className="font-medium">{stats.totalCustomers}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(stats.totalCustomers / stats.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Users:</span>
              <span className="font-bold">{stats.totalUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">PG Students:</span>
              <span className="font-bold">{stats.totalStudents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tiffin Customers:</span>
              <span className="font-bold">{stats.totalCustomers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Order Value:</span>
              <span className="font-bold">₹{stats.avgOrderValue}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
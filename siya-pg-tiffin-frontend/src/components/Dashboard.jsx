import { useEffect, useState } from "react";
import API from "../utils/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalCustomers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/auth/admin/stats");
        setStats(res.data);
      } catch (error) {
        console.error("Failed to load stats");
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <div className="grid grid-cols-4 gap-6">
        {/* TOTAL USERS */}
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Total Users</p>
          <h2 className="text-3xl font-bold mt-2">
            {stats.totalUsers}
          </h2>
          <p className="text-sm text-gray-400">All registered users</p>
        </div>

        {/* STUDENTS */}
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">PG Students</p>
          <h2 className="text-3xl font-bold mt-2">
            {stats.totalStudents}
          </h2>
          <p className="text-sm text-gray-400">Currently registered</p>
        </div>

        {/* CUSTOMERS */}
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Tiffin Customers</p>
          <h2 className="text-3xl font-bold mt-2">
            {stats.totalCustomers}
          </h2>
          <p className="text-sm text-gray-400">Active customers</p>
        </div>

        {/* STATIC CARD */}
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Monthly Revenue</p>
          <h2 className="text-3xl font-bold mt-2 text-primary">
            ₹1,42,000
          </h2>
          <p className="text-sm text-gray-400">Target: 1.5L</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow mt-8 p-6">
        <h3 className="font-semibold mb-4">Quick Insights</h3>

        <div className="h-48 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
          Occupancy Trend Chart Placeholder
        </div>
      </div>
    </>
  );
};

export default Dashboard;
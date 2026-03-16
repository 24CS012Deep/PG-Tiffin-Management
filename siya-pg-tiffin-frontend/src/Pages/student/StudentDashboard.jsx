import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiHome, FiDollarSign, FiMessageSquare, FiCalendar } from "react-icons/fi";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    totalBills: 0,
    pendingBills: 0,
    totalQueries: 0,
    openQueries: 0,
    roomDetails: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch room details
      let roomsRes;
      try {
        roomsRes = await API.get("/student/rooms");
      } catch (err) {
        console.error("Rooms API failed:", err);
        // Continue with other requests
      }

      const user = JSON.parse(localStorage.getItem("user"));
      const userRoom = roomsRes?.data?.find(room => 
        room.students?.some(s => s._id === user?._id)
      );

      // Fetch bills
      let billsRes;
      try {
        billsRes = await API.get("/student/billings");
      } catch (err) {
        console.error("Billings API failed:", err);
      }
      const pendingBills = billsRes?.data?.filter(b => b.status === "pending").length || 0;

      // Fetch queries
      let queriesRes;
      try {
        queriesRes = await API.get("/student/queries");
      } catch (err) {
        console.error("Queries API failed:", err);
      }
      const openQueries = queriesRes?.data?.filter(q => q.status === "open").length || 0;

      setStats({
        totalBills: billsRes?.data?.length || 0,
        pendingBills,
        totalQueries: queriesRes?.data?.length || 0,
        openQueries,
        roomDetails: userRoom || null
      });

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
      <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>

      {/* Room Info Card */}
      {stats.roomDetails ? (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiHome className="text-orange-500" /> Your Room
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Room Number</p>
              <p className="text-2xl font-bold">{stats.roomDetails.roomNumber}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Floor</p>
              <p className="text-2xl font-bold">{stats.roomDetails.floor}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Rent</p>
              <p className="text-2xl font-bold">₹{stats.roomDetails.rent}</p>
            </div>
          </div>
          <Link to="/student/my-room" className="mt-4 inline-block text-orange-500 hover:text-orange-600">
            View Room Details →
          </Link>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <p className="text-yellow-700">You are not assigned to any room yet.</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2">
            <FiDollarSign className="text-2xl text-orange-500" />
            <span className="text-sm text-gray-500">Total Bills</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalBills}</p>
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
            <FiMessageSquare className="text-2xl text-blue-500" />
            <span className="text-sm text-gray-500">Total Queries</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalQueries}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2">
            <FiMessageSquare className="text-2xl text-green-500" />
            <span className="text-sm text-gray-500">Open Queries</span>
          </div>
          <p className="text-3xl font-bold">{stats.openQueries}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/student/bills" className="bg-orange-50 p-4 rounded-lg text-center hover:bg-orange-100 transition">
            <FiDollarSign className="text-2xl text-orange-500 mx-auto mb-2" />
            <span className="text-sm font-medium">View Bills</span>
          </Link>
          <Link to="/student/mess-menu" className="bg-orange-50 p-4 rounded-lg text-center hover:bg-orange-100 transition">
            <FiCalendar className="text-2xl text-orange-500 mx-auto mb-2" />
            <span className="text-sm font-medium">Mess Menu</span>
          </Link>
          <Link to="/student/raise-query" className="bg-orange-50 p-4 rounded-lg text-center hover:bg-orange-100 transition">
            <FiMessageSquare className="text-2xl text-orange-500 mx-auto mb-2" />
            <span className="text-sm font-medium">Raise Query</span>
          </Link>
          <Link to="/student/profile" className="bg-orange-50 p-4 rounded-lg text-center hover:bg-orange-100 transition">
            <FiHome className="text-2xl text-orange-500 mx-auto mb-2" />
            <span className="text-sm font-medium">My Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
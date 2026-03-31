import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiHome, FiDollarSign, FiMessageSquare, FiCalendar, FiArrowRight, FiClock } from "react-icons/fi";
import { MdWavingHand, MdReceiptLong, MdOutlineSupportAgent } from "react-icons/md";
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

  const user = JSON.parse(localStorage.getItem("user"));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-gray-800">
             <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-2.5 rounded-xl shadow-lg flex items-center justify-center">
               <MdWavingHand className="text-xl" />
             </span>
             Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here is your PG and Tiffin activity overview.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-sm mb-6">
          {error}
        </div>
      )}

      {/* Room Hero Card */}
      {stats.roomDetails ? (
        <div className="bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 rounded-2xl shadow-xl shadow-orange-200 p-6 md:p-8 mb-8 text-white relative overflow-hidden">
          {/* Decorative Circle */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium mb-4 backdrop-blur-sm border border-white/30">
                <FiHome /> Assigned PG Room
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-2">
                Room {stats.roomDetails.roomNumber}
              </h2>
              <p className="text-orange-100 font-medium text-lg">Floor {stats.roomDetails.floor} • ₹{stats.roomDetails.rent}/mo</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Link to="/student/my-room" className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg flex items-center justify-center gap-2 group">
                 View Room Details <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-200 rounded-2xl p-8 mb-8 text-center border-dashed">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
             <FiHome className="text-2xl text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">No Room Assigned</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">You have not been assigned to a PG room yet. Contact the admin to get your room allocation.</p>
          <Link to="/student/raise-query" className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition shadow">
            Request Room
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <h3 className="text-lg font-bold text-gray-800 mb-4">Your Overview</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
            <MdReceiptLong />
          </div>
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Total Bills</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalBills}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 hover:shadow-md transition-all group relative overflow-hidden">
          {stats.pendingBills > 0 && <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>}
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
            <MdReceiptLong />
          </div>
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Pending Due</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{stats.pendingBills}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
            <MdOutlineSupportAgent />
          </div>
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Support Tickets</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalQueries}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
            <FiClock />
          </div>
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Open Tickets</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{stats.openQueries}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Links</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pay Bills", icon: <MdReceiptLong />, link: "/student/bills", color: "from-emerald-400 to-emerald-500" },
          { label: "Mess Menu", icon: <FiCalendar />, link: "/student/mess-menu", color: "from-orange-400 to-orange-500" },
          { label: "Help Center", icon: <MdOutlineSupportAgent />, link: "/student/raise-query", color: "from-blue-400 to-blue-500" },
          { label: "My Profile", icon: <FiHome />, link: "/student/profile", color: "from-violet-400 to-violet-500" },
        ].map((action, idx) => (
          <Link key={idx} to={action.link} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group h-32">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${action.color} text-white flex items-center justify-center text-xl group-hover:-translate-y-1 transition-transform shadow-lg`}>
              {action.icon}
            </div>
            <span className="text-sm font-semibold text-gray-700">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
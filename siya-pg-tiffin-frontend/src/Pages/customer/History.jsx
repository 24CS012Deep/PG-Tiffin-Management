import { useEffect, useState } from "react";
import API from "../../utils/api";
import { 
  FiClock, FiCheckCircle, FiXCircle, FiCalendar, FiBox, FiArrowRight, FiFilter, FiDownload
} from "react-icons/fi";
import { Link } from "react-router-dom";

const History = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await API.get("/customer/orders");
      // Only show non-live orders in history
      const history = res.data.filter(o => o.status !== "live");
      setOrders(history);
    } catch (err) {
      console.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = orders.filter(o => {
    if (filter === "all") return true;
    return o.status === filter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
        <p className="mt-4 text-slate-500 font-bold tracking-widest uppercase text-[10px]">Retrieving History...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 font-sans text-slate-900">
      {/* Header Section */}
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#FF6B00] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100 flex-shrink-0">
            <FiClock size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Order History</h1>
            <p className="text-slate-500 font-medium mt-1">Review your past meals and delivery records.</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
            <FiBox size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Meals</p>
            <p className="text-2xl font-black text-slate-800">{orders.length}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
            <FiCheckCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Completed</p>
            <p className="text-2xl font-black text-slate-800">{orders.filter(o => o.status === "completed").length}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
            <FiXCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cancelled</p>
            <p className="text-2xl font-black text-slate-800">{orders.filter(o => o.status === "cancelled").length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
          {["all", "completed", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                filter === f ? "bg-slate-900 text-white shadow-md" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="py-24 bg-white rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <FiClock className="text-4xl text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-400">No records found</h3>
          <p className="text-slate-400 mt-2 font-medium">Your past order history will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredHistory.map((order) => (
            <div key={order._id} className="bg-white rounded-[2rem] border border-gray-100 p-8 hover:shadow-[0_15px_40px_rgba(0,0,0,0.04)] transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    order.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-500 border-red-100"
                  }`}>
                    {order.status}
                  </span>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    #{order._id.slice(-6)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight mb-4">{order.tiffinPlan?.planNumber || "Tiffin Plan"}</h3>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <FiCalendar className="text-[#FF6B00]" />
                    <span className="uppercase">{new Date(order.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <FiBox className="text-[#FF6B00]" />
                    <span className="uppercase">Qty: {order.quantity}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount Paid</p>
                <span className="text-3xl font-black text-slate-800 tracking-tighter">₹{order.totalAmount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;

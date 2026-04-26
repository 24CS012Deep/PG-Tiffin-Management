import { useEffect, useState } from "react";
import API from "../../utils/api";
import { 
  FiClock, FiCheckCircle, FiXCircle, FiCalendar, FiBox, FiUser, FiSearch, FiArrowRight
} from "react-icons/fi";

const History = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/orders");
      // Filter for non-live orders for history
      const history = res.data.filter(o => o.status !== "live");
      setOrders(history);
    } catch (err) {
      console.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = orders.filter(o => {
    const matchesSearch = 
      o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.tiffinPlan?.planNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    return matchesSearch && o.status === filter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
        <p className="mt-4 text-slate-500 font-bold tracking-widest uppercase text-[10px]">Processing History...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 font-sans text-slate-900">
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#FF6B00] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100 flex-shrink-0">
            <FiClock size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">System History</h1>
            <p className="text-slate-500 font-medium mt-1">Audit past orders and completed tiffin services.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
              <FiBox size={20} />
            </div>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Total Record</span>
          </div>
          <p className="text-3xl font-black text-slate-800 tracking-tighter">{orders.length}</p>
          <p className="text-xs font-bold text-gray-400 mt-2 uppercase">Past Orders Processed</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
              <FiCheckCircle size={20} />
            </div>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Efficiency</span>
          </div>
          <p className="text-3xl font-black text-slate-800 tracking-tighter">
            {orders.length > 0 ? Math.round((orders.filter(o => o.status === "completed").length / orders.length) * 100) : 0}%
          </p>
          <p className="text-xs font-bold text-gray-400 mt-2 uppercase">Completion Rate</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
              <FiXCircle size={20} />
            </div>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Loss Control</span>
          </div>
          <p className="text-3xl font-black text-slate-800 tracking-tighter">{orders.filter(o => o.status === "cancelled").length}</p>
          <p className="text-xs font-bold text-gray-400 mt-2 uppercase">Cancelled Orders</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by Customer, ID or Plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:border-[#FF6B00] outline-none font-bold text-slate-700 transition-all shadow-sm"
          />
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
          {["all", "completed", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                filter === f ? "bg-slate-900 text-white shadow-md" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Date & Plan</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Customer</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Amount</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredHistory.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-800 uppercase mb-1">{order.tiffinPlan?.planNumber || "N/A"}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <FiCalendar className="text-orange-400" />
                      {new Date(order.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-700">{order.customer?.name || "Guest"}</p>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-0.5">#{order._id.slice(-6)}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-lg font-black text-slate-800 tracking-tighter">₹{order.totalAmount}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      order.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-500 border-red-100"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No history records found matching your criteria</p>
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

export default History;

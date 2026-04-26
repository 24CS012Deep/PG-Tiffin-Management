import { useEffect, useState } from "react";
import API from "../../utils/api";
import {
  FiEdit2, FiTrash2, FiPlus, FiCheck, FiX,
  FiCalendar, FiCheckCircle, FiShoppingCart,
  FiBox, FiClock, FiDollarSign, FiInfo, FiTag, FiFileText, FiStar, FiZap, FiUser, FiHash, FiTrendingUp, FiArrowRight
} from "react-icons/fi";
import { MdOutlineRestaurantMenu, MdFastfood } from "react-icons/md";

const TiffinPlans = () => {
  const [plans, setPlans] = useState([]);
  const [historyPlans, setHistoryPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("active"); // 'active' or 'history'
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  
  const [formData, setFormData] = useState({
    planNumber: "",
    tiffinPrice: "",
    maxCapacity: "50",
    date: new Date().toISOString().split('T')[0],
    description: "",
    mealShifts: ["lunch"],
    items: "",
    isActive: true,
  });

  useEffect(() => {
    if (view === "active") fetchPlans();
    else fetchHistory();
  }, [view]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/tiffin-plans");
      setPlans(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/tiffin-plans/history");
      setHistoryPlans(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShift = (shift) => {
    const updatedShifts = formData.mealShifts.includes(shift)
      ? formData.mealShifts.filter((s) => s !== shift)
      : [...formData.mealShifts, shift];
    setFormData({ ...formData, mealShifts: updatedShifts });
  };

  const resetForm = () => {
    setFormData({
      planNumber: `Plan Number - ${plans.length + 1}`,
      tiffinPrice: "",
      maxCapacity: "50",
      date: new Date().toISOString().split('T')[0],
      description: "",
      mealShifts: ["lunch"],
      items: "",
      isActive: true,
    });
    setEditingPlan(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.mealShifts.length === 0) {
      alert("Please select at least one meal shift");
      return;
    }
    try {
      if (editingPlan) {
        await API.put(`/admin/tiffin-plans/${editingPlan._id}`, formData);
      } else {
        await API.post("/admin/tiffin-plans", formData);
      }
      setShowModal(false);
      resetForm();
      fetchPlans();
    } catch (err) {
      alert("Failed to save plan");
    }
  };

  const deletePlan = async (id) => {
    if (window.confirm("Delete this tiffin plan?")) {
      try {
        await API.delete(`/admin/tiffin-plans/${id}`);
        if (view === "active") fetchPlans();
        else fetchHistory();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete plan");
      }
    }
  };

  const toggleActiveStatus = async (plan) => {
    try {
      await API.put(`/admin/tiffin-plans/${plan._id}`, {
        ...plan,
        isActive: !plan.isActive,
      });
      fetchPlans();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
        <p className="mt-4 text-slate-500 font-bold tracking-widest uppercase text-[10px]">Synchronizing Plans...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 pb-12 font-sans text-slate-900">
      {/* Header Section */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-16 h-16 bg-[#FF6B00] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100 flex-shrink-0">
              <FiBox size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Tiffin Plans</h2>
              <p className="text-slate-500 font-medium mt-1">Manage and track your daily meal services</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="bg-white p-1 rounded-2xl border border-gray-100 flex shadow-sm">
              <button 
                onClick={() => setView("active")}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  view === "active" ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Active
              </button>
              <button 
                onClick={() => setView("history")}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  view === "history" ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                History
              </button>
            </div>

            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8C42] text-white px-8 py-3.5 rounded-full hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 transition-all font-bold text-xs uppercase tracking-widest active:scale-95 shadow-md"
            >
              <FiPlus size={18} /> New Plan
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {(view === "active" ? plans : historyPlans).length > 0 ? (
          (view === "active" ? plans : historyPlans).map((plan) => {
            const menuItems = (plan.items || "").split(/[,\n]/).filter(item => item.trim() !== "");
            const capacityLeft = plan.maxCapacity - (plan.ordersCount || 0);
            const percentage = (capacityLeft / plan.maxCapacity) * 100;

            return (
              <div 
                key={plan._id} 
                className={`bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] transition-all duration-300 group relative flex flex-col hover:-translate-y-1.5 ${
                  !plan.isActive && "opacity-75"
                }`}
              >
                {/* Header Section */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase">
                    {plan.planNumber}
                  </h3>
                  {view === "active" ? (
                    <label className="relative inline-flex items-center cursor-pointer scale-90">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={plan.isActive} 
                        onChange={() => toggleActiveStatus(plan)} 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B00]"></div>
                    </label>
                  ) : (
                    <div className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-gray-200">
                      PAST
                    </div>
                  )}
                </div>

                {/* Date + Capacity Row */}
                <div className="flex items-center gap-4 mb-5 text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <FiCalendar size={14} />
                    <span className="text-[11px] font-semibold tracking-wide uppercase">
                      {new Date(plan.date || plan.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiUser size={14} />
                    <span className="text-[11px] font-semibold tracking-wide uppercase">Capacity: {plan.maxCapacity}</span>
                  </div>
                </div>

                {/* Price Section */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-[#FF6B00]">₹{plan.tiffinPrice}</span>
                    <span className="text-gray-400 text-xs font-medium tracking-wide">/ meal</span>
                  </div>
                </div>

                {/* Plan Type Pill */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {plan.mealShifts?.map(shift => (
                    <span key={shift} className="bg-orange-50 text-[#FF6B00] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-100">
                      {shift}
                    </span>
                  ))}
                </div>

                {/* Availability Bar (Only for Active View) */}
                {view === "active" && (
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Availability</span>
                      <span className="text-[10px] font-bold text-[#FF6B00]">{capacityLeft} Left</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#FF6B00] h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,107,0,0.3)]"
                        style={{ width: `${Math.max(5, percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Stats Section (Only for History View) */}
                {view === "history" && (
                  <div className="mb-8 grid grid-cols-2 gap-3">
                    <div className="bg-orange-50/50 p-3 rounded-2xl border border-orange-100/50">
                      <p className="text-[9px] font-bold text-orange-400 uppercase tracking-widest mb-1">Total Orders</p>
                      <p className="text-xl font-black text-[#FF6B00]">{plan.ordersCount || 0}</p>
                    </div>
                    <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50">
                      <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Revenue</p>
                      <p className="text-xl font-black text-emerald-600 font-sans">₹{plan.totalRevenue || 0}</p>
                    </div>
                  </div>
                )}

                {/* Today's Menu Section */}
                <div className="flex-1 mb-8">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">PLAN MENU</h4>
                  <div className="space-y-2">
                    {menuItems.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-100/50 p-3 rounded-xl flex items-center gap-3 hover:bg-white hover:border-orange-100 transition-all group/item cursor-default">
                        <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-[#FF6B00] bg-white rounded-lg border border-orange-50 shadow-sm">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 tracking-wide uppercase">{item.trim()}</span>
                      </div>
                    ))}
                    {menuItems.length === 0 && (
                      <p className="text-[10px] text-gray-400 italic">No menu items added.</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {view === "active" ? (
                    <>
                      <button 
                        onClick={() => {
                          if (!plan.isActive) return;
                          setEditingPlan(plan);
                          setFormData({
                            ...plan,
                            date: plan.date || new Date().toISOString().split('T')[0]
                          });
                          setShowModal(true);
                        }}
                        disabled={!plan.isActive}
                        className={`flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm ${
                          plan.isActive 
                            ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-95" 
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <FiEdit2 size={16} /> Edit
                      </button>
                      <button 
                        onClick={() => deletePlan(plan._id)}
                        className="w-14 h-14 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-sm active:scale-95"
                        title="Delete Plan"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => deletePlan(plan._id)}
                      className="w-full bg-red-50 text-red-500 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-sm active:scale-95 flex items-center justify-center gap-2"
                    >
                      <FiTrash2 size={16} /> Delete from History
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-24 bg-white rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              {view === "active" ? <MdFastfood className="text-4xl text-gray-300" /> : <FiTrendingUp className="text-4xl text-gray-300" />}
            </div>
            <h3 className="text-2xl font-bold text-slate-400">{view === "active" ? "No tiffin plans yet" : "No history recorded"}</h3>
            <p className="text-slate-400 mt-2 font-medium">{view === "active" ? "Create your first plan to start serving customers!" : "Your past performance will appear here."}</p>
            {view === "active" && (
              <button onClick={() => { resetForm(); setShowModal(true); }} className="mt-8 bg-[#FF6B00] text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-orange-200 transition-all active:scale-95 shadow-md">
                Get Started
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowModal(false)}
          ></div>
          
          {/* Modal Container */}
          <div className="bg-white rounded-[24px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-300 flex flex-col relative z-10">
            {/* Close Button */}
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 z-20 p-2 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
            >
              <FiX size={20} />
            </button>

            {/* Header */}
            <div className="px-10 pt-10 pb-6 text-left">
              <h3 className="text-3xl font-bold text-slate-800 relative inline-block">
                {editingPlan ? "Edit Tiffin Plan" : "Create New Tiffin Plan"}
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C42] rounded-full"></div>
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="px-10 pb-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-6">
                {/* Plan Number */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Plan Number</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-50 outline-none font-medium text-slate-800 transition-all"
                    placeholder="Plan Number - 1"
                    value={formData.planNumber}
                    onChange={(e) => setFormData({ ...formData, planNumber: e.target.value })}
                  />
                </div>

                {/* Manage Items */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-slate-700">Manage Items</label>
                    <span className="bg-orange-50 text-[#FF6B00] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-orange-100">One item per line</span>
                  </div>
                  <textarea
                    required
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-50 outline-none font-medium text-slate-800 transition-all min-h-[120px] placeholder:text-gray-400"
                    placeholder="Add items (one item per line)"
                    value={formData.items}
                    onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                  />
                </div>

                {/* Price & Capacity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tiffin Price</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6B00] transition-colors">₹</div>
                      <input
                        type="number"
                        required
                        className="w-full pl-10 pr-5 py-4 bg-white border border-gray-200 rounded-2xl focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-50 outline-none font-medium text-slate-800 transition-all"
                        placeholder="0.00"
                        value={formData.tiffinPrice}
                        onChange={(e) => setFormData({ ...formData, tiffinPrice: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Max Capacity</label>
                    <div className="relative group">
                      <FiBox className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6B00] transition-colors" />
                      <input
                        type="number"
                        required
                        className="w-full pl-12 pr-5 py-4 bg-white border border-gray-200 rounded-2xl focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-50 outline-none font-medium text-slate-800 transition-all"
                        placeholder="50"
                        value={formData.maxCapacity}
                        onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date Field</label>
                  <div className="relative group">
                    <FiCalendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6B00] transition-colors" />
                    <input
                      type="date"
                      required
                      className="w-full pl-12 pr-5 py-4 bg-white border border-gray-200 rounded-2xl focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-50 outline-none font-medium text-slate-800 transition-all"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <textarea
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-50 outline-none font-medium text-slate-800 transition-all min-h-[80px] placeholder:text-gray-400"
                    placeholder="Highlight the benefits of this plan..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Plan Availability Selector */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Plan Availability</label>
                  <div className="flex gap-3">
                    {['breakfast', 'lunch', 'dinner'].map((shift) => (
                      <button
                        key={shift}
                        type="button"
                        onClick={() => handleToggleShift(shift)}
                        className={`flex-1 py-4 rounded-xl border-2 transition-all font-bold text-sm ${
                          formData.mealShifts.includes(shift)
                            ? "bg-orange-50 border-[#FF6B00] text-[#FF6B00] shadow-sm"
                            : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                        }`}
                      >
                        Set Plan for {shift.charAt(0).toUpperCase() + shift.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-10 pb-2 mt-4 bg-white">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-full font-bold text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[1.5] py-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C42] text-white rounded-full hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 transition-all font-bold text-sm shadow-md"
                >
                  {editingPlan ? "Update Tiffin Plan" : "Create Tiffin Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TiffinPlans;

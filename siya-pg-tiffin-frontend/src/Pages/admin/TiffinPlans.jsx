import { useEffect, useState } from "react";
import API from "../../utils/api";
import { 
  FiEdit2, FiTrash2, FiPlus, FiUsers, FiCheck, 
  FiX, FiBox, FiCalendar, FiClock, FiCoffee, FiAlertCircle, FiList, FiCheckCircle, FiStar,
  FiPower
} from "react-icons/fi";
import { MdOutlineRestaurantMenu } from "react-icons/md";

const TiffinPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedPlanForMenu, setSelectedPlanForMenu] = useState(null);
  const [menuDate, setMenuDate] = useState(new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
  const [menuItems, setMenuItems] = useState("");
  const [now, setNow] = useState(new Date());

  const [cutOffType, setCutOffType] = useState('time');
  const [cutOffMinutes, setCutOffMinutes] = useState('60');

  const todayString = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    maxCustomers: 50,
    type: "veg",
    mealTypes: ["lunch", "dinner"],
    targetDate: "",
    cutOffTime: "10:00",
    isActive: true
  });

  useEffect(() => {
    fetchPlans();
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/tiffin-plans");
      setPlans(Array.isArray(res.data) ? res.data : (res.data.plans || []));
      setError("");
    } catch (err) {
      console.error("Failed to fetch plans:", err);
      setError("Failed to load tiffin plans");
    } finally {
      setLoading(false);
    }
  };

  const toggleActiveStatus = async (plan) => {
    try {
      await API.put(`/admin/tiffin-plans/${plan._id}`, { ...plan, isActive: !plan.isActive });
      fetchPlans();
    } catch (err) {
      alert("Failed to update plan status");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMealTypeChange = (type) => {
    if (formData.mealTypes.includes(type)) {
      setFormData({
        ...formData,
        mealTypes: formData.mealTypes.filter(t => t !== type)
      });
    } else {
      setFormData({
        ...formData,
        mealTypes: [...formData.mealTypes, type]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (cutOffType === 'minutes') {
        payload.cutOffTime = `${cutOffMinutes}m`;
      }

      if (editingPlan) {
        await API.put(`/admin/tiffin-plans/${editingPlan._id}`, payload);
      } else {
        await API.post("/admin/tiffin-plans", payload);
      }
      setShowModal(false);
      resetForm();
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save plan");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        await API.delete(`/admin/tiffin-plans/${id}`);
        fetchPlans();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete plan");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      maxCustomers: 50,
      type: "veg",
      mealTypes: ["lunch", "dinner"],
      targetDate: "",
      cutOffTime: "10:00",
      isActive: true
    });
    setCutOffType('time');
    setCutOffMinutes('60');
    setEditingPlan(null);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    
    const isMins = plan.cutOffTime?.endsWith('m');
    setCutOffType(isMins ? 'minutes' : 'time');
    if (isMins) {
      setCutOffMinutes(plan.cutOffTime.replace('m', ''));
    }

    setFormData({
      name: plan.name,
      price: plan.price,
      description: plan.description || "",
      maxCustomers: plan.maxCustomers,
      type: plan.type || "veg",
      mealTypes: plan.mealTypes || ["lunch", "dinner"],
      targetDate: plan.targetDate || "",
      cutOffTime: !isMins ? (plan.cutOffTime || "10:00") : "10:00",
      isActive: plan.isActive !== false
    });
    setShowModal(true);
  };

  const openMenuModal = (plan) => {
    setSelectedPlanForMenu(plan);
    const targetDate = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    setMenuDate(targetDate);
    
    const existingMenu = plan.menu?.find(m => m.date === targetDate);
    setMenuItems(existingMenu ? existingMenu.items.join("\n") : "");
    setShowMenuModal(true);
  };

  const handleDateChangeForMenu = (e) => {
    const newDate = e.target.value;
    setMenuDate(newDate);
    if (selectedPlanForMenu) {
      const existingMenu = selectedPlanForMenu.menu?.find(m => m.date === newDate);
      setMenuItems(existingMenu ? existingMenu.items.join("\n") : "");
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      const itemsArray = menuItems.split("\n").filter(item => item.trim() !== "");
      await API.post("/admin/tiffin-plans/set-menu", {
        planId: selectedPlanForMenu._id,
        date: menuDate,
        items: itemsArray
      });
      setShowMenuModal(false);
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to set menu");
    }
  };

  const getCountdown = (cutOffTime) => {
    if(!cutOffTime || cutOffTime.endsWith('m')) return null;
    const [h, m] = cutOffTime.split(':').map(Number);
    const cutoffDate = new Date();
    cutoffDate.setHours(h, m, 0, 0);
    const diffMs = cutoffDate - now;
    if (diffMs < 0) return { text: "Closed for today", closingSoon: false };
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return { 
      text: `⏳ Closes in ${hours > 0 ? hours + 'h ' : ''}${mins}m`,
      closingSoon: diffMins <= 30
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 font-sans">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black flex items-center gap-3 text-gray-800 tracking-tight">
              Tiffin Plans
            </h2>
            <p className="text-gray-500 mt-1 font-medium text-sm">Manage meal plans</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-200 transition-all font-semibold text-sm"
          >
            <FiPlus size={18} /> Create New Plan
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.length > 0 ? (
          plans.map((plan) => {
            const fillPct = plan.maxCustomers > 0 ? ((plan.currentCustomers || 0) / plan.maxCustomers) * 100 : 0;
            const isFull = plan.currentCustomers >= plan.maxCustomers;
            const isExpired = plan.targetDate && plan.targetDate < todayString;
            const isActive = plan.isActive !== false && !isExpired;
            const countdown = isActive ? getCountdown(plan.cutOffTime) : null;
            const isMinsCutoff = plan.cutOffTime?.endsWith('m');
            
            const summary = `Includes ${plan.mealTypes?.map(m=>m.charAt(0).toUpperCase()+m.slice(1)).join(" & ")} • ${plan.type === 'veg' ? 'Veg Only' : plan.type === 'non-veg' ? 'Non-Veg Only' : 'Mixed Diet'}`;

            return (
              <div key={plan._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 p-6 flex flex-col h-full relative group">
                
                {/* Top Section */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-2">
                    <h3 className="text-lg font-bold text-gray-800 leading-tight mb-2">{plan.name}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${plan.type === 'veg' ? 'bg-green-50 text-green-700' : plan.type === 'non-veg' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
                        {plan.type === 'veg' ? '🟢 Veg' : plan.type === 'non-veg' ? '🔴 Non-Veg' : '🟡 Both'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Status Toggle Switch */}
                  <label className="flex items-center cursor-pointer ml-3 mt-1" title={plan.isActive ? "Deactivate Plan" : "Activate Plan"}>
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={plan.isActive !== false} onChange={() => toggleActiveStatus(plan)} />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${plan.isActive !== false ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${plan.isActive !== false ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                  </label>
                </div>

                {/* Middle Section */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-black text-orange-500">₹{plan.price}</span>
                    <span className="text-gray-400 text-xs font-semibold">/ month</span>
                  </div>
                  
                  {/* Capacity Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                      <span>Capacity</span>
                      <span className={isFull ? "text-red-500" : "text-gray-700"}>{plan.currentCustomers || 0} / {plan.maxCustomers}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(fillPct, 100)}%` }} />
                    </div>
                  </div>

                  {/* Meals */}
                  <div className="flex flex-wrap gap-2">
                    {['breakfast', 'lunch', 'dinner'].map(m => {
                       const has = plan.mealTypes?.includes(m);
                       const icon = m === 'breakfast' ? '🍳' : m === 'lunch' ? '🍛' : '🍽';
                       return (
                         <span key={m} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${has ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-400 opacity-50 grayscale'}`}>
                           <span>{icon}</span> <span className="capitalize">{m}</span>
                         </span>
                       )
                    })}
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-5 line-clamp-2">{plan.description || summary}</p>

                {/* Timing Section */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    {isMinsCutoff ? (
                      <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                        <FiClock className="text-orange-500" /> Closes before: {plan.cutOffTime.replace('m', '')} mins
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                        <FiClock className="text-orange-500" /> Cut-off: {plan.cutOffTime || 'None'}
                      </span>
                    )}
                    
                    {countdown && !isMinsCutoff && (
                      <span className={`font-bold text-[10px] px-2 py-1 rounded-md ${countdown.closingSoon ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-amber-50 text-amber-600'}`}>
                        {countdown.text}
                      </span>
                    )}
                  </div>
                  
                  {/* Actions Container */}
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => openEditModal(plan)} className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-all text-xs flex items-center justify-center gap-2">
                      <FiEdit2 size={14} /> Edit
                    </button>
                    <button onClick={() => handleDelete(plan._id)} className="flex-1 bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 font-bold py-2 rounded-xl border border-gray-200 hover:border-red-200 transition-all text-xs flex items-center justify-center gap-2">
                      <FiTrash2 size={14} /> Delete
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => openMenuModal(plan)} 
                    className="w-full bg-gray-900 hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl transition-colors text-xs flex items-center justify-center gap-2"
                  >
                    <FiList size={16} /> Manage Menu
                  </button>
                </div>

              </div>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
              <FiBox className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Plans Created Yet</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm text-center">Start offering meals by creating your first tiffin plan.</p>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-xl hover:bg-orange-500 transition-colors font-semibold text-sm shadow-sm"
            >
              Create First Plan
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h3 className="text-xl font-black text-gray-800 tracking-tight">
                {editingPlan ? "Edit Tiffin Plan" : "Create New Tiffin Plan"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:bg-red-50 hover:text-red-600 p-2 rounded-xl transition-colors bg-gray-50">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-8">
                {/* 1. Plan Details */}
                <section>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-6 h-px bg-gray-200"></span> Plan Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Plan Name</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="e.g., Premium Student Combo"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-50 transition-all font-medium text-gray-800 placeholder-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Monthly Price (₹)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                        <input
                          type="number"
                          name="price"
                          placeholder="2500"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-50 transition-all font-medium text-gray-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Max Capacity</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><FiUsers size={14} /></span>
                        <input
                          type="number"
                          name="maxCustomers"
                          placeholder="50"
                          value={formData.maxCustomers}
                          onChange={handleInputChange}
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-50 transition-all font-medium text-gray-800"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Description</label>
                      <textarea
                        name="description"
                        placeholder="Highlight the benefits of this plan..."
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-50 transition-all font-medium text-gray-800 resize-none placeholder-gray-300"
                      />
                    </div>
                  </div>
                </section>

                {/* 2. Menu Configuration */}
                <section>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-6 h-px bg-gray-200"></span> Meal Configuration
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-5">
                      <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Dietary Type</label>
                      <div className="flex bg-gray-50 p-1 rounded-xl">
                        {[
                          {v: 'veg', l: 'Veg'}, 
                          {v: 'non-veg', l: 'Non-Veg'}, 
                          {v: 'both', l: 'Both'}
                        ].map(type => (
                          <button
                            type="button"
                            key={type.v}
                            onClick={() => handleInputChange({ target: { name: 'type', value: type.v }})}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.type === type.v ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            {type.l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-7">
                      <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Included Meals</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'breakfast', label: 'Breakfast', icon: '🍳' },
                          { id: 'lunch', label: 'Lunch', icon: '🍛' },
                          { id: 'dinner', label: 'Dinner', icon: '🍽' }
                        ].map((meal) => {
                          const isSelected = formData.mealTypes?.includes(meal.id);
                          return (
                            <label
                              key={meal.id}
                              className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 border rounded-xl cursor-pointer transition-all text-center ${
                                isSelected
                                  ? 'border-orange-500 bg-orange-50 shadow-sm'
                                  : 'border-gray-200 bg-white hover:border-gray-300 opacity-80 hover:opacity-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleMealTypeChange(meal.id)}
                                className="hidden"
                              />
                              <span className="text-xl leading-none">{meal.icon}</span>
                              <span className={`text-[11px] font-bold ${isSelected ? 'text-orange-900' : 'text-gray-600'}`}>
                                {meal.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>

                {/* 3. Timing & Constraints */}
                <section>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-6 h-px bg-gray-200"></span> Order Cut-off Setup
                  </h4>
                  
                  <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5">
                    <div className="flex gap-4 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          checked={cutOffType === 'time'} 
                          onChange={() => setCutOffType('time')} 
                          className="accent-orange-500 w-4 h-4"
                        />
                        <span className="text-sm font-bold text-gray-700">Exact Time Picker</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          checked={cutOffType === 'minutes'} 
                          onChange={() => setCutOffType('minutes')} 
                          className="accent-orange-500 w-4 h-4"
                        />
                        <span className="text-sm font-bold text-gray-700">Minutes Dropdown</span>
                      </label>
                    </div>

                    <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                      {cutOffType === 'time' ? (
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Set exact cut-off time</label>
                          <input
                            type="time"
                            name="cutOffTime"
                            value={formData.cutOffTime}
                            onChange={handleInputChange}
                            className="w-full max-w-xs px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-50 transition-all font-medium text-gray-800"
                          />
                          <p className="text-[10px] text-gray-400 mt-2">Example: 10:00 AM. Orders close exactly at this time.</p>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Close orders before meal by</label>
                          <select
                            value={cutOffMinutes}
                            onChange={(e) => setCutOffMinutes(e.target.value)}
                            className="w-full max-w-xs px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-50 transition-all font-medium text-gray-800"
                          >
                            <option value="30">30 mins</option>
                            <option value="60">60 mins</option>
                            <option value="90">90 mins</option>
                          </select>
                          <p className="text-[10px] text-gray-400 mt-2">Example: "Order closes before 60 minutes".</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              <div className="flex gap-4 pt-6 mt-8 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-bold transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-200 font-bold transition-all text-sm flex justify-center items-center gap-2"
                >
                  <FiCheckCircle size={16} /> {editingPlan ? "Save Changes" : "Create Tiffin Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Modal */}
      {showMenuModal && selectedPlanForMenu && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden my-8">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                  <FiList className="text-orange-500" /> Manage Daily Menu
                </h3>
                <p className="text-xs text-gray-500 mt-1 font-medium">{selectedPlanForMenu.name}</p>
              </div>
              <button onClick={() => setShowMenuModal(false)} className="text-gray-400 hover:bg-red-50 hover:text-red-600 p-2 rounded-xl transition-colors bg-gray-50">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleMenuSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                  <FiCalendar className="text-gray-400" /> Target Date
                </label>
                <input
                  type="date"
                  value={menuDate}
                  onChange={handleDateChangeForMenu}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-50 font-medium text-gray-800 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Menu Items</label>
                  <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold border border-orange-100">One item per line</span>
                </div>
                <textarea
                  placeholder="Roti&#10;Dal&#10;Rice&#10;Mix Veg"
                  value={menuItems}
                  onChange={(e) => setMenuItems(e.target.value)}
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-50 font-medium text-gray-800 resize-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowMenuModal(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-bold transition-all text-sm">
                  Cancel
                </button>
                <button type="submit" className="flex-[2] px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-200 font-bold transition-all text-sm">
                  Save Menu
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

import { useEffect, useState } from "react";
import API from "../../utils/api";
import { 
  FiEdit2, FiTrash2, FiPlus, FiUsers, FiCheck, 
  FiX, FiBox, FiCalendar, FiClock, FiCoffee, FiAlertCircle, FiList, FiCheckCircle, FiStar
} from "react-icons/fi";

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
  
  const todayString = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    maxCustomers: 50,
    type: "veg",
    mealTypes: ["lunch", "dinner"],
    targetDate: todayString,
    cutOffTime: "10:00"
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/tiffin-plans");
      if (Array.isArray(res.data)) {
        setPlans(res.data);
      } else {
        setPlans(res.data.plans || []);
      }
      setError("");
    } catch (err) {
      console.error("Failed to fetch plans:", err);
      setError("Failed to load tiffin plans");
    } finally {
      setLoading(false);
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
      if (editingPlan) {
        await API.put(`/admin/tiffin-plans/${editingPlan._id}`, formData);
      } else {
        await API.post("/admin/tiffin-plans", formData);
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
      targetDate: new Date().toISOString().split('T')[0],
      cutOffTime: "10:00"
    });
    setEditingPlan(null);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      description: plan.description || "",
      maxCustomers: plan.maxCustomers,
      type: plan.type || "veg",
      mealTypes: plan.mealTypes || ["lunch", "dinner"],
      targetDate: plan.targetDate || new Date().toISOString().split('T')[0],
      cutOffTime: plan.cutOffTime || "10:00"
    });
    setShowModal(true);
  };

  const openMenuModal = (plan) => {
    setSelectedPlanForMenu(plan);
    const targetDate = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    setMenuDate(targetDate);
    
    // Find if menu exists for this date
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
      alert(`Menu for ${menuDate} updated successfully!`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to set menu");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-3 rounded-lg shadow-lg">
                <FiBox size={24} />
              </span>
              Tiffin Plans
            </h2>
            <p className="text-gray-600 mt-1">Manage your meal plans • Total: {plans.length}</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 shadow-lg transition-all"
          >
            <FiPlus /> Create New Plan
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length > 0 ? (
          plans.map((plan) => {
            const fillPct = plan.maxCustomers > 0 ? ((plan.currentCustomers || 0) / plan.maxCustomers) * 100 : 0;
            const isFull = plan.currentCustomers >= plan.maxCustomers;
            const todayStr = new Date().toISOString().split('T')[0];
            const isExpired = plan.targetDate && plan.targetDate < todayStr;
            const cardOpacity = isExpired ? 'opacity-70 grayscale-[20%]' : '';
            const borderColor = isExpired ? 'border-gray-400' : 'border-orange-500';

            return (
              <div key={plan._id} className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border-t-4 ${borderColor} p-6 flex flex-col h-full ${cardOpacity}`}>
                {/* Actions Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1"></div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                      title="Edit Plan"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete Plan"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Plan Info */}
                <h3 className="text-xl font-bold text-gray-800 mb-2 truncate" title={plan.name}>{plan.name}</h3>
                
                {/* Date & Time Constraints */}
                {(plan.targetDate || plan.cutOffTime) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {plan.targetDate && (
                      <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 border border-orange-100">
                        <FiCalendar className="text-orange-500 mr-1" /> {new Date(plan.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                    {plan.cutOffTime && (
                      <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 border border-red-100">
                        <FiClock className="text-red-500 mr-1" /> Ends at {plan.cutOffTime}
                      </span>
                    )}
                  </div>
                )}
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">{plan.description || "No description provided."}</p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-orange-600">₹{plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>

                {/* Capacity Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-600 flex items-center gap-1">
                      <FiUsers size={16} /> Capacity
                    </span>
                    <span className={`font-semibold ${isFull ? 'text-red-600' : 'text-gray-700'}`}>
                      {plan.currentCustomers || 0} / {plan.maxCustomers}
                      {isFull && <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">FULL</span>}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isFull ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-orange-400 to-orange-500'
                      }`}
                      style={{ width: `${Math.min(fillPct, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Meal Types */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {['breakfast', 'lunch', 'dinner'].map((meal) => (
                    <span
                      key={meal}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        plan.mealTypes?.includes(meal)
                          ? 'bg-orange-100 text-orange-700 border border-orange-300'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {plan.mealTypes?.includes(meal) && <FiCheck className="inline mr-1" size={12} />}
                      {meal.charAt(0).toUpperCase() + meal.slice(1)}
                    </span>
                  ))}
                </div>

                {/* Status Badge & Actions */}
                <div className="flex flex-col gap-3 mt-auto">
                  <button
                    onClick={() => openMenuModal(plan)}
                    className="w-full bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100 hover:border-orange-300 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <span className="text-sm flex items-center gap-2"><FiCoffee /> Add / Manage Daily Menu</span>
                  </button>
                  {isExpired ? (
                    <div className="text-center py-2 bg-gray-100 rounded-lg">
                      <span className="text-xs font-bold text-gray-500 flex items-center justify-center gap-1"><FiAlertCircle /> Plan Expired</span>
                    </div>
                  ) : plan.isActive ? (
                    <div className="text-center py-2 bg-blue-50 rounded-lg">
                      <span className="text-xs font-bold text-blue-700 flex items-center justify-center gap-1">✓ Active for Ordering</span>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full">
            <div className="bg-white rounded-xl border-2 border-dashed border-orange-300 p-12 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBox className="text-4xl text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Plans Yet</h3>
              <p className="text-gray-500 mb-6">Create your first tiffin plan to start offering meals</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
              >
                <FiPlus size={20} /> Create First Plan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h3 className="text-xl font-bold text-white">
                {editingPlan ? "Edit Plan" : "Create New Plan"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-orange-700 p-1 rounded"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Plan Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Premium Veg Plan"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="3500"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Max Capacity *</label>
                  <input
                    type="number"
                    name="maxCustomers"
                    placeholder="50"
                    value={formData.maxCustomers}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    name="targetDate"
                    value={formData.targetDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">If set, plan expires after this date.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Order Cut-off Time</label>
                  <input
                    type="time"
                    name="cutOffTime"
                    value={formData.cutOffTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Ordering halts after this time.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  placeholder="Describe your meal plan..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Meal Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Meal Type</label>
                <select
                  name="type"
                  value={formData.type || "veg"}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                  <option value="both">Both (Veg & Non-Veg)</option>
                </select>
              </div>

              {/* Meal Times */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Meal Times</label>
                <div className="space-y-2">
                  {['breakfast', 'lunch', 'dinner'].map((meal) => (
                    <label
                      key={meal}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-orange-50 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={formData.mealTypes?.includes(meal)}
                        onChange={() => handleMealTypeChange(meal)}
                        className="w-4 h-4 accent-orange-500"
                      />
                      <span className="text-gray-700 font-medium">
                        {meal.charAt(0).toUpperCase() + meal.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700"
                >
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Modal */}
      {showMenuModal && selectedPlanForMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border-t-4 border-orange-500 my-8">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-orange-50 to-transparent border-b-2 border-orange-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white text-lg"><FiCoffee /></span> 
                  Add Daily Menu
                </h3>
                <p className="text-sm text-gray-500 mt-1">{selectedPlanForMenu.name}</p>
              </div>
              <button
                onClick={() => setShowMenuModal(false)}
                className="text-gray-400 hover:bg-red-50 hover:text-red-600 p-2 rounded-lg transition-colors"
                type="button"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleMenuSubmit} className="p-6 space-y-5">
              {/* Date Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">📅 Select Date</label>
                <input
                  type="date"
                  value={menuDate}
                  onChange={handleDateChangeForMenu}
                  required
                  className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-bold text-gray-800 bg-gray-50 hover:border-orange-300"
                />
              </div>

              {/* Menu Items Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-gray-700 mb-0 uppercase tracking-wide"><FiCoffee className="inline mr-1.5" /> Menu Items</label>
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold">One item per line</span>
                </div>
                <textarea
                  placeholder="🍞 Roti&#10;🍲 Dal&#10;🍚 Rice&#10;🥗 Mix Veg&#10;🥗 Salad&#10;&#10;Example for Breakfast:&#10;☕ Tea/Coffee&#10;🥐 Toast&#10;🥛 Milk&#10;🍌 Banana"
                  value={menuItems}
                  onChange={(e) => setMenuItems(e.target.value)}
                  rows="8"
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 placeholder-gray-400 text-gray-800 font-medium leading-relaxed resize-none hover:border-orange-300"
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  💡 Tip: Add emoji or icons for visual appeal (e.g., 🍗 Chicken, 🥬 Broccoli, 🍰 Dessert)
                </p>
              </div>

              {/* Preview of Items */}
              {menuItems.trim() && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                  <p className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
                    <FiCheckCircle className="text-green-600" /> Preview ({menuItems.split('\n').filter(i => i.trim()).length} items)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {menuItems.split('\n').filter(item => item.trim()).map((item, idx) => (
                      <span key={idx} className="bg-white border-2 border-green-200 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                        {item.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Add Buttons */}
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><FiStar className="text-orange-500" /> Quick Suggestions</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { icon: <FiBox className="inline mr-1" />, text: 'Roti' },
                    { icon: <FiCoffee className="inline mr-1" />, text: 'Dal' },
                    { icon: <FiBox className="inline mr-1" />, text: 'Rice' },
                    { icon: <FiCoffee className="inline mr-1" />, text: 'Curry' },
                    { icon: <FiCheckCircle className="inline mr-1" />, text: 'Salad' },
                    { icon: <FiStar className="inline mr-1" />, text: 'Dessert' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMenuItems(menuItems + (menuItems ? '\n' : '') + item.text)}
                      className="text-xs font-bold bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-2 rounded-lg border border-orange-200 transition-colors flex items-center justify-center gap-1"
                    >
                      {item.icon} {item.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowMenuModal(false)}
                  className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-bold uppercase tracking-wide"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white rounded-xl hover:from-orange-600 hover:via-orange-700 hover:to-red-600 transition-all shadow-lg shadow-orange-300 font-bold uppercase tracking-wide flex items-center justify-center gap-2"
                >
                  <FiCheckCircle className="text-lg" /> Save Menu
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

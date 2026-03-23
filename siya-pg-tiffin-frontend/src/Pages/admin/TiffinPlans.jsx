import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiEdit2, FiTrash2, FiPlus, FiCalendar, FiUsers, FiTag, FiClock, FiCheck } from "react-icons/fi";

const TiffinPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [menuItems, setMenuItems] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    maxCustomers: 50,
    type: "veg",
    mealTypes: ["lunch", "dinner"]
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/tiffin-plans");
      setPlans(res.data);
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

  const handleSetMenu = async (e) => {
    e.preventDefault();
    if (!menuItems.trim()) return;
    try {
      const items = menuItems.split(",").map(item => item.trim());
      await API.post("/admin/tiffin-plans/set-menu", {
        planId: selectedPlan._id,
        items
      });
      setShowMenuModal(false);
      setMenuItems("");
      
      // Optional toast/alert
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to set menu");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      maxCustomers: 50,
      type: "veg",
      mealTypes: ["lunch", "dinner"]
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
      type: plan.type,
      mealTypes: plan.mealTypes || ["lunch", "dinner"]
    });
    setShowModal(true);
  };

  const openMenuModal = (plan) => {
    setSelectedPlan(plan);
    setShowMenuModal(true);
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'veg': return "bg-emerald-100 text-emerald-700 border-emerald-200 border";
      case 'non-veg': return "bg-red-100 text-red-700 border-red-200 border";
      case 'both': return "bg-indigo-100 text-indigo-700 border-indigo-200 border";
      default: return "bg-gray-100 text-gray-700 border-gray-200 border";
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
    <div className="min-h-screen pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
           <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-gray-800">
             <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-2 rounded-xl shadow-lg">
               <FiTag />
             </span>
             Tiffin Plans
           </h2>
           <p className="text-gray-500 text-sm mt-1">Manage food subscription plans and daily menus.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-orange-500 text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-all flex items-center gap-2 font-medium shadow-lg shadow-orange-200"
        >
          <FiPlus className="text-lg" /> Add New Plan
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-sm mb-6">
          {error}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 line-clamp-2">
        {plans.length > 0 ? (
          plans.map((plan) => {
            const fillPct = plan.maxCustomers > 0 ? ((plan.currentCustomers || 0) / plan.maxCustomers) * 100 : 0;
            return (
              <div key={plan._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col group relative overflow-hidden">
                
                {/* Header Graphic */}
                <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-amber-500"></div>
                
                <div className="p-6 flex-1 flex flex-col">
                  {/* Top Row: Type and Actions */}
                  <div className="flex justify-between items-start mb-4">
                     <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 ${getTypeStyle(plan.type)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${plan.type === 'veg' ? 'bg-emerald-500' : plan.type === 'non-veg' ? 'bg-red-500' : 'bg-indigo-500'}`}></span>
                        {plan.type}
                     </span>
                     
                     <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(plan)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit Plan"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(plan._id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Plan"
                        >
                          <FiTrash2 />
                        </button>
                     </div>
                  </div>

                  {/* Plan Name & Price */}
                  <div className="mb-4">
                     <h3 className="text-xl font-bold text-gray-800 tracking-tight leading-tight">{plan.name}</h3>
                     <div className="flex items-end gap-1 mt-1">
                       <span className="text-3xl font-black text-orange-600">₹{plan.price}</span>
                       <span className="text-gray-500 text-sm font-medium pb-1">/ mo</span>
                     </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                     {plan.description || "No description provided."}
                  </p>

                  <div className="space-y-4 mb-6">
                     {/* Capacity Tracker */}
                     <div>
                        <div className="flex justify-between items-center text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                          <span className="flex items-center gap-1.5"><FiUsers className="text-gray-400"/> Capacity</span>
                          <span>{plan.currentCustomers || 0} / {plan.maxCustomers}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                           <div 
                             className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full transition-all duration-1000"
                             style={{ width: `${Math.min(fillPct, 100)}%` }}
                           ></div>
                        </div>
                     </div>

                     {/* Included Meals */}
                     <div className="flex flex-wrap gap-2 pt-2">
                        {['breakfast', 'lunch', 'dinner'].map(meal => (
                          <span 
                            key={meal} 
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md border flex items-center gap-1 ${
                              plan.mealTypes?.includes(meal) 
                              ? 'border-gray-200 text-gray-700 bg-gray-50' 
                              : 'border-transparent text-gray-300 line-through'
                            }`}
                          >
                             {plan.mealTypes?.includes(meal) && <FiCheck className="text-orange-500" />}
                             {meal.charAt(0).toUpperCase() + meal.slice(1)}
                          </span>
                        ))}
                     </div>
                  </div>

                  {/* Set Menu Action */}
                  <button
                    onClick={() => openMenuModal(plan)}
                    className="w-full bg-orange-50 text-orange-600 px-4 py-3 rounded-xl hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center gap-2 font-medium border border-orange-100 hover:border-orange-500"
                  >
                    <FiCalendar /> Update Today's Menu
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 px-4 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-200">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FiTag className="text-2xl text-gray-300" />
             </div>
             <p className="text-lg font-medium text-gray-800">No tiffin plans created yet</p>
             <p className="text-sm text-gray-500 mt-1 mb-6 text-center max-w-sm">Create specific meal plans with defined capacity, pricing, and meal timings to get started.</p>
             <button
                onClick={() => setShowModal(true)}
                className="text-white bg-orange-500 px-6 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition shadow-lg shadow-orange-200"
              >
                Create First Plan
              </button>
          </div>
        )}
      </div>

      {/* Add/Edit Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-5 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FiTag /> {editingPlan ? "Edit Tiffin Plan" : "Create New Plan"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Bronze Student Plan"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      placeholder="3500"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                      required
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity *</label>
                    <input
                      type="number"
                      name="maxCustomers"
                      placeholder="50"
                      value={formData.maxCustomers}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 mb-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Type *</label>
                 <select
                   name="type"
                   value={formData.type}
                   onChange={handleInputChange}
                   className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                 >
                   <option value="veg">Vegetarian</option>
                   <option value="non-veg">Non-Vegetarian</option>
                   <option value="both">Both</option>
                 </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Included Meal Times</label>
                <div className="flex gap-3">
                  {["breakfast", "lunch", "dinner"].map(meal => (
                    <label 
                       key={meal} 
                       className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.mealTypes.includes(meal) 
                          ? 'border-orange-500 bg-orange-50 text-orange-700' 
                          : 'border-gray-100 bg-white text-gray-500 hover:bg-gray-50'
                       }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={formData.mealTypes.includes(meal)}
                        onChange={() => handleMealTypeChange(meal)}
                      />
                      <span className="font-semibold text-sm capitalize">{meal}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marketing Description</label>
                <textarea
                  name="description"
                  placeholder="What makes this plan special? Displayed to users."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none resize-none"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="w-1/3 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-orange-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
                >
                  {editingPlan ? "Save Changes" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Menu Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-5 text-white">
               <h3 className="text-xl font-bold flex items-center gap-2">
                 <FiCalendar /> Set Today's Menu
               </h3>
               <p className="text-emerald-100 text-sm opacity-90">{selectedPlan?.name}</p>
            </div>
            
            <form onSubmit={handleSetMenu} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">What's cooking today?</label>
                <textarea
                  placeholder="e.g. Paneer Butter Masala, Dal Makhani, 4 Roti, Jeera Rice, Gulab Jamun"
                  value={menuItems}
                  onChange={(e) => setMenuItems(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-sm leading-relaxed"
                  rows="4"
                  required
                />
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                   <FiClock /> Separate items with commas. This will push to all active users on this plan.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenuModal(false);
                    setMenuItems("");
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200"
                >
                  Publish Menu
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
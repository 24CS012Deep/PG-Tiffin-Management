import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiEdit2, FiTrash2, FiPlus, FiCalendar } from "react-icons/fi";

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

  const handleSetMenu = async () => {
    if (!menuItems.trim()) {
      alert("Please enter menu items");
      return;
    }
    try {
      const items = menuItems.split(",").map(item => item.trim());
      await API.post("/admin/tiffin-plans/set-menu", {
        planId: selectedPlan._id,
        items
      });
      setShowMenuModal(false);
      setMenuItems("");
      alert("Menu set successfully!");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tiffin Plans</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
        >
          <FiPlus /> Add New Plan
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length > 0 ? (
          plans.map((plan) => (
            <div key={plan._id} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
              
              <div className="flex justify-between items-center mb-3">
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
                  ₹{plan.price}
                </span>
                <span className="text-sm text-gray-500">
                  Type: {plan.type}
                </span>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-500">
                  Capacity: {plan.currentCustomers || 0}/{plan.maxCustomers}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${((plan.currentCustomers || 0) / plan.maxCustomers) * 100}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => openMenuModal(plan)}
                className="w-full bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 text-sm"
              >
                <FiCalendar /> Set Today's Menu
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No tiffin plans found</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-orange-500 hover:text-orange-600"
            >
              Create your first plan
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {editingPlan ? "Edit Plan" : "Add New Plan"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Plan Name *"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2"
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="price"
                  placeholder="Price (₹) *"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2"
                  required
                />
                <input
                  type="number"
                  name="maxCustomers"
                  placeholder="Max Capacity"
                  value={formData.maxCustomers}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2"
                rows="3"
              />

              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
                <option value="both">Both</option>
              </select>

              <div>
                <label className="block font-medium mb-2">Meal Types:</label>
                <div className="flex gap-4">
                  {["breakfast", "lunch", "dinner"].map(meal => (
                    <label key={meal} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.mealTypes.includes(meal)}
                        onChange={() => handleMealTypeChange(meal)}
                      />
                      {meal}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex-1"
                >
                  {editingPlan ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Menu Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              Set Today's Menu for {selectedPlan?.name}
            </h3>
            <div className="space-y-4">
              <textarea
                placeholder="Enter menu items (comma separated)"
                value={menuItems}
                onChange={(e) => setMenuItems(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
                rows="4"
              />
              <p className="text-sm text-gray-500">
                Example: Dal, Rice, Roti, Paneer, Salad
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleSetMenu}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex-1"
                >
                  Set Menu
                </button>
                <button
                  onClick={() => {
                    setShowMenuModal(false);
                    setMenuItems("");
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TiffinPlans;
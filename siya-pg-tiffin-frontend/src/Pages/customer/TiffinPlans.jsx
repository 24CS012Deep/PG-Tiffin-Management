import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiShoppingBag, FiClock } from "react-icons/fi";
import { Link } from "react-router-dom";

const TiffinPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderData, setOrderData] = useState({
    quantity: 1,
    deliveryTime: "both",
    specialInstructions: "",
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await API.get("/customer/tiffin-plans");
      setPlans(res.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch plans:", err);
      setError("Failed to load tiffin plans");
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async () => {
    try {
      await API.post("/customer/orders", {
        tiffinPlan: selectedPlan._id,
        quantity: orderData.quantity,
        deliveryTime: orderData.deliveryTime,
        specialInstructions: orderData.specialInstructions,
        date: orderData.date,
        items: selectedPlan.menu?.find(m => m.date === orderData.date)?.items || []
      });
      setShowOrderModal(false);
      alert("Order placed successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to place order");
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
    <div>
      <h1 className="text-3xl font-bold mb-8">Tiffin Plans</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className="h-48 bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
              <span className="text-4xl text-white">🍱</span>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
                  ₹{plan.price}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
              
              <div className="flex items-center gap-2 mb-4">
                <FiClock className="text-orange-500" />
                <span className="text-sm text-gray-600">
                  {plan.mealTypes?.join(", ")}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Type</p>
                <span className={`text-sm px-2 py-1 rounded ${
                  plan.type === 'veg' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {plan.type}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Capacity</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${(plan.currentCustomers / plan.maxCustomers) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {plan.currentCustomers}/{plan.maxCustomers} subscribed
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedPlan(plan);
                  setShowOrderModal(true);
                }}
                className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2"
                disabled={plan.currentCustomers >= plan.maxCustomers}
              >
                <FiShoppingBag /> {plan.currentCustomers >= plan.maxCustomers ? 'Full' : 'Order Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Modal */}
      {showOrderModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Place Order</h3>
            <p className="text-gray-600 mb-4">
              Ordering: <span className="font-bold text-orange-500">{selectedPlan.name}</span>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Delivery Date</label>
                <input
                  type="date"
                  value={orderData.date}
                  onChange={(e) => setOrderData({...orderData, date: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  value={orderData.quantity}
                  onChange={(e) => setOrderData({...orderData, quantity: parseInt(e.target.value)})}
                  min="1"
                  max="10"
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Delivery Time</label>
                <select
                  value={orderData.deliveryTime}
                  onChange={(e) => setOrderData({...orderData, deliveryTime: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="both">Both (Lunch & Dinner)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Special Instructions</label>
                <textarea
                  value={orderData.specialInstructions}
                  onChange={(e) => setOrderData({...orderData, specialInstructions: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  rows="3"
                  placeholder="Any special requests..."
                />
              </div>

              <div className="pt-4">
                <p className="text-lg font-bold mb-4">
                  Total: ₹{selectedPlan.price * orderData.quantity}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={placeOrder}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex-1"
                >
                  Confirm Order
                </button>
                <button
                  onClick={() => setShowOrderModal(false)}
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
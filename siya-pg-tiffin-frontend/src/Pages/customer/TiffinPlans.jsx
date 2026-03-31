import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiShoppingBag, FiClock, FiUsers, FiX, FiCheckCircle, FiCalendar, FiStar, FiAlertCircle } from "react-icons/fi";
import { MdOutlineRestaurantMenu } from "react-icons/md";

const TiffinPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [orderData, setOrderData] = useState({
    quantity: 1,
    deliveryTime: "both",
    specialInstructions: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await API.get("/customer/tiffin-plans");
      console.log("📦 Tiffin Plans Response:", res.data);
      
      if (!res.data || !Array.isArray(res.data)) {
        console.warn("⚠️ Response is not an array:", res.data);
        setPlans([]);
        setError("");
        return;
      }

      const todayStr = new Date().toISOString().split('T')[0];
      
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      
      console.log(`📅 Today: ${todayStr}, Current Time: ${currentTimeStr}`);
      
      // Filter plans: Keep plans unless they're explicitly expired
      const validPlans = res.data.filter(plan => {
        // Skip if explicitly marked inactive
        if (plan.isActive === false) {
          console.log(`⏸️ Skipping inactive plan: ${plan.name}`);
          return false;
        }
        
        // Skip if targetDate is in the past
        if (plan.targetDate && plan.targetDate < todayStr) {
          console.log(`📭 Skipping expired plan: ${plan.name} (target: ${plan.targetDate})`);
          return false;
        }
        
        // Skip if it's today and cutOffTime has passed
        if (plan.targetDate === todayStr && plan.cutOffTime && currentTimeStr > plan.cutOffTime) {
          console.log(`⏰ Skipping plan with passed cutoff: ${plan.name} (cutoff: ${plan.cutOffTime})`);
          return false;
        }
        
        console.log(`✅ Including plan: ${plan.name}`);
        return true;
      });

      console.log(`📊 Total fetched: ${res.data.length}, After filtering: ${validPlans.length}`);
      setPlans(validPlans);
      setError("");
    } catch (err) {
      console.error("❌ Failed to fetch plans:", err);
      setError("Failed to load tiffin plans");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async () => {
    try {
      setOrdering(true);
      await API.post("/customer/orders", {
        tiffinPlan: selectedPlan._id,
        quantity: orderData.quantity,
        deliveryTime: orderData.deliveryTime,
        specialInstructions: orderData.specialInstructions,
        date: orderData.date,
        items: selectedPlan.menu?.find((m) => m.date === orderData.date)?.items || [],
      });
      setShowOrderModal(false);
      setSuccess("🎉 Order placed successfully! Check your email for confirmation.");
      setOrderData({ quantity: 1, deliveryTime: "both", specialInstructions: "", date: new Date().toISOString().split("T")[0] });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to place order");
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-500">Loading tiffin plans...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-gray-800">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-2.5 rounded-xl shadow-lg flex items-center justify-center">
              <MdOutlineRestaurantMenu className="text-xl" />
            </span>
            Tiffin Plans
          </h1>
          <p className="text-gray-500 text-sm mt-1">Browse and subscribe to delicious meal plans.</p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 px-5 py-3 rounded-r-xl mb-6 flex items-center gap-3">
          <FiCheckCircle className="text-lg flex-shrink-0" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-3 rounded-r-xl mb-6 flex items-center gap-3">
          {error}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <MdOutlineRestaurantMenu className="text-6xl text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No Plans Available</h3>
            <p className="text-gray-500 text-center max-w-md">
              No tiffin plans are currently available. Please check back later!
            </p>
          </div>
        ) : (
          plans.map((plan) => {
          const isFull = plan.currentCustomers >= plan.maxCustomers;
          const isVeg = plan.type === "veg";
          const capacityPercent = Math.min(100, (plan.currentCustomers / plan.maxCustomers) * 100);

          return (
            <div
              key={plan._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative"
            >
              {/* Decorative Pattern */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-50 to-orange-100/30 rounded-bl-3xl -z-0 group-hover:scale-125 transition-transform duration-500"></div>

              {/* Top Gradient Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500"></div>

              {/* Top Gradient */}
              <div className="h-32 bg-gradient-to-r from-orange-400 to-amber-500 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <span className="text-4xl z-10 drop-shadow-lg group-hover:scale-110 transition-transform text-white/40">
                  <MdOutlineRestaurantMenu />
                </span>
                
                {/* Type Badge */}
                <span
                  className={`absolute top-4 left-4 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 border shadow-sm ${
                    isVeg ? "bg-emerald-50 text-emerald-700 border-emerald-200" : plan.type === "non-veg" ? "bg-red-50 text-red-700 border-red-200" : "bg-indigo-50 text-indigo-700 border-indigo-200"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full font-bold ${isVeg ? "bg-emerald-500" : plan.type === "non-veg" ? "bg-red-500" : "bg-indigo-500"}`}></span>
                  {plan.type}
                </span>

                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/50">
                  <span className="text-2xl font-black text-orange-600">₹{plan.price}</span>
                  <span className="text-xs text-gray-400 block font-medium">/month</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col relative z-10">
                <h2 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-orange-600 transition-colors">{plan.name}</h2>
                <p className="text-gray-500 text-[12px] mb-4 line-clamp-1">{plan.description || "Premium meal plan"}</p>

                {/* Capacity Bar */}
                <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Capacity</span>
                    <span className={`text-[10px] font-bold ${
                      capacityPercent < 50 ? 'text-emerald-600' : 
                      capacityPercent < 75 ? 'text-amber-600' : 
                      'text-red-600'
                    }`}>
                      {plan.currentCustomers}/{plan.maxCustomers} Available
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        capacityPercent < 50 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 
                        capacityPercent < 75 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 
                        'bg-gradient-to-r from-red-400 to-red-500'
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Date & Time Info */}
                <div className="space-y-2 mb-4 flex-1">
                  {plan.targetDate && (
                    <div className="flex items-start gap-2">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider min-w-12">📅 Date</span>
                      <span className="text-[12px] font-semibold text-gray-700">{new Date(plan.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}
                  {plan.cutOffTime && (
                    <div className="flex items-start gap-2">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider min-w-12">⏰ Order By</span>
                      <span className="text-[12px] font-semibold text-gray-700">{plan.cutOffTime}</span>
                    </div>
                  )}
                </div>

                {/* Price Section */}
                <div className="pt-3 border-t border-gray-100 text-center mb-4">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">Monthly Price</p>
                  <p className="text-2xl font-black text-orange-600">₹{plan.price}</p>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setShowOrderModal(true);
                    setOrderData((prev) => ({
                       ...prev,
                       date: plan.targetDate ? plan.targetDate : new Date().toISOString().split("T")[0]
                    }));
                  }}
                  disabled={isFull}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-[12px] uppercase tracking-wide transition-all duration-300 border-2 ${
                    isFull
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white border-transparent hover:shadow-lg hover:from-orange-600 hover:to-amber-700 active:scale-95'
                  }`}
                >
                  {isFull ? <><FiX className="text-lg" /> Sold Out</> : <><FiStar className="text-lg" /> Order Now</>}
                </button>
              </div>
            </div>
          );
        })
        )}
      </div>

      {/* Order Modal */}
      {showOrderModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Place Order</h3>
                <p className="text-orange-100 text-sm">{selectedPlan.name}</p>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="text-white/70 hover:text-white p-1">
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 items-center gap-2">
                  <FiCalendar className="text-orange-500" /> Delivery Date
                </label>
                {selectedPlan.targetDate ? (
                   <div className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700">
                     {new Date(selectedPlan.targetDate).toLocaleDateString()} (Fixed)
                   </div>
                ) : (
                   <input
                     type="date"
                     value={orderData.date}
                     onChange={(e) => setOrderData({ ...orderData, date: e.target.value })}
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-medium"
                     min={new Date().toISOString().split("T")[0]}
                   />
                )}
              </div>

              {/* Show Menu For Selected Date */}
              {(() => {
                const dateMenu = selectedPlan.menu?.find(m => m.date === orderData.date);
                if (dateMenu && dateMenu.items?.length > 0) {
                  return (
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4 shadow-md">
                      <h4 className="text-sm font-bold text-orange-800 mb-3 flex items-center gap-2 uppercase tracking-wide">
                        <FiShoppingBag className="text-lg text-orange-600" /> Menu for {new Date(orderData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {dateMenu.items.map((item, idx) => (
                          <div key={idx} className="bg-white text-gray-800 text-xs font-bold px-3 py-2 rounded-lg shadow-sm border-l-4 border-orange-400 hover:bg-orange-50 transition-colors">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-dashed border-amber-300 rounded-xl p-4 text-center">
                      <p className="text-sm text-amber-900 font-semibold flex items-center justify-center gap-1.5"><FiAlertCircle className="text-amber-700" /> Menu Coming Soon</p>
                      <p className="text-xs text-amber-700 mt-1">The kitchen team will publish the menu shortly</p>
                    </div>
                  );
                }
              })()}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={orderData.quantity}
                    onChange={(e) => setOrderData({ ...orderData, quantity: parseInt(e.target.value) || 1 })}
                    min="1"
                    max="10"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Time</label>
                  <select
                    value={orderData.deliveryTime}
                    onChange={(e) => setOrderData({ ...orderData, deliveryTime: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Special Instructions</label>
                <textarea
                  value={orderData.specialInstructions}
                  onChange={(e) => setOrderData({ ...orderData, specialInstructions: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none resize-none font-medium"
                  rows="3"
                  placeholder="Any special requests..."
                />
              </div>

              {/* Total */}
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex justify-between items-center">
                <span className="text-gray-700 font-semibold">Total Amount</span>
                <span className="text-2xl font-black text-orange-600">₹{selectedPlan.price * (orderData.quantity || 1)}</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={placeOrder}
                  disabled={ordering}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {ordering ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <FiCheckCircle /> Confirm Order
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
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
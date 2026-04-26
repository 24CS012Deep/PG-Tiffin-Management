import { useEffect, useState } from "react";
import API from "../../utils/api";
import { 
  FiCheckCircle, FiCalendar, FiMapPin, FiInfo, FiUser, FiBox, FiZap, FiPlus, FiMinus, FiX, FiSmartphone, FiCreditCard, FiShare2, FiClock, FiTrendingUp, FiArrowRight
} from "react-icons/fi";
import { MdOutlineRestaurantMenu, MdFastfood } from "react-icons/md";
import { Link } from "react-router-dom";

const TiffinPlans = () => {
  const [plans, setPlans] = useState([]);
  const [historyPlans, setHistoryPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("active"); // 'active' or 'history'
  const [userOrders, setUserOrders] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // Order Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  
  // Order Success State
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    if (view === "active") {
      fetchPlans();
      fetchUserOrders();
    }
    else fetchHistory();
  }, [view]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await API.get("/customer/tiffin-plans");
      setPlans(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      setError("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const res = await API.get("/customer/orders");
      setUserOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch orders");
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await API.get("/customer/tiffin-plans/history"); // Use customer-specific history endpoint
      setHistoryPlans(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await API.get("/customer/profile");
      if (res.data?.success) {
        const profile = res.data.user;
        setUserProfile(profile);
        setDeliveryAddress(profile.address || "");
      }
    } catch (err) {
      console.error("Failed to fetch profile");
    }
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    setOrderLoading(true);
    try {
      const res = await API.post("/customer/orders", {
        tiffinPlan: selectedPlan._id,
        quantity,
        deliveryAddress,
      });
      setCreatedOrder(res.data);
      setOrderSuccess(true);
      setShowOrderModal(false);
      // Redirect or show success
      alert("Order placed successfully! Check 'My Orders' for tracking.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to place order");
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#FF6B00]"></div>
        <p className="mt-4 text-slate-500 font-bold tracking-widest uppercase text-[10px]">Preparing Menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 font-sans text-slate-900 bg-gray-50/30">
      {/* Header Section */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#FF6B00] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100 flex-shrink-0">
              <FiBox size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Tiffin Plans</h2>
              <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest">Premium Daily Meal Subscription</p>
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
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3 font-semibold text-sm">
          <FiInfo /> {error}
        </div>
      )}

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
                  view === "history" && "opacity-85"
                }`}
              >
                {/* Header Section */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase group-hover:text-[#FF6B00] transition-colors">
                    {plan.planNumber}
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    view === "active" ? "bg-orange-50 text-[#FF6B00] border-orange-100" : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}>
                    {view === "active" ? plan.mealShifts?.[0] || "LUNCH" : "PAST"}
                  </div>
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

                {/* Plan Availability (Only for Active) */}
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

                {/* History Stats (Only for History) */}
                {view === "history" && (
                  <div className="mb-8 grid grid-cols-2 gap-3">
                    <div className="bg-orange-50/50 p-3 rounded-2xl border border-orange-100/50">
                      <p className="text-[9px] font-bold text-orange-400 uppercase tracking-widest mb-1 text-center">Total Orders</p>
                      <p className="text-xl font-black text-[#FF6B00] text-center">{plan.ordersCount || 0}</p>
                    </div>
                    <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50">
                      <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-1 text-center">Price</p>
                      <p className="text-xl font-black text-emerald-600 font-sans text-center">₹{plan.tiffinPrice}</p>
                    </div>
                  </div>
                )}

                {/* Menu Section */}
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
                  </div>
                </div>

                {/* Action Button */}
                {view === "active" ? (
                  (() => {
                    const hasOrdered = userOrders.some(o => 
                      o.tiffinPlan?._id === plan._id || o.tiffinPlan === plan._id
                    );
                    
                    return (
                      <button 
                        disabled={hasOrdered}
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowOrderModal(true);
                          setOrderSuccess(false);
                        }}
                        className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm ${
                          hasOrdered 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-not-allowed" 
                          : "bg-slate-900 text-white hover:bg-[#FF6B00] hover:shadow-lg active:scale-95"
                        }`}
                      >
                        {hasOrdered ? (
                          <><FiCheckCircle size={16} /> Already Ordered</>
                        ) : (
                          "Order Now"
                        )}
                      </button>
                    );
                  })()
                ) : (
                  <div className="w-full bg-gray-50 text-gray-400 py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-center border border-gray-100">
                    Expired Service
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-24 bg-white rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              {view === "active" ? <MdFastfood className="text-4xl text-gray-300" /> : <FiTrendingUp className="text-4xl text-gray-300" />}
            </div>
            <h3 className="text-2xl font-bold text-slate-400">{view === "active" ? "No tiffin plans available" : "No history recorded"}</h3>
            <p className="text-slate-400 mt-2 font-medium">{view === "active" ? "Check back later for fresh meals!" : "Your past services will appear here."}</p>
          </div>
        )}
      </div>

      {/* Order Modal */}
      {showOrderModal && selectedPlan && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowOrderModal(false)}></div>
          
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-300 relative z-10 border border-white/20">
            <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C42] p-10 text-white relative">
              <button 
                onClick={() => setShowOrderModal(false)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <FiX size={20} />
              </button>
              <h3 className="text-3xl font-black tracking-tight mb-1 uppercase">Place Order</h3>
              <div className="flex items-center gap-2">
                <span className="text-orange-100 font-bold uppercase text-[10px] tracking-[0.2em]">{selectedPlan.planNumber}</span>
                <span className="w-1 h-1 bg-orange-200 rounded-full"></span>
                <span className="text-orange-100 font-bold uppercase text-[10px] tracking-[0.2em]">Premium Tiffin</span>
              </div>
            </div>
            
            <form onSubmit={handleOrder} className="p-10 space-y-8">
              {/* Address Section */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Address</label>
                  {userProfile?.address === deliveryAddress && (
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-tighter">
                      <FiCheckCircle size={10} /> Saved
                    </span>
                  )}
                </div>
                <div className="relative group">
                  <FiMapPin className="absolute left-5 top-5 text-[#FF6B00] transition-transform group-focus-within:scale-110" />
                  <textarea
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-[#FF6B00] focus:bg-white outline-none font-bold text-slate-700 transition-all min-h-[110px] text-sm resize-none"
                    placeholder="Enter your full address..."
                  />
                </div>
              </div>

              {/* Quantity & Total */}
              <div className="flex items-center justify-between gap-6 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quantity</label>
                  <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl border border-gray-100 w-max shadow-sm">
                    <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl hover:bg-[#FF6B00] hover:text-white transition-all"><FiMinus /></button>
                    <span className="w-8 text-center font-black text-lg text-slate-800">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl hover:bg-[#FF6B00] hover:text-white transition-all"><FiPlus /></button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payable</p>
                  <span className="text-4xl font-black text-slate-800 tracking-tighter">₹{selectedPlan.tiffinPrice * quantity}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={orderLoading}
                className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C42] text-white py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:shadow-xl hover:shadow-orange-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-orange-50"
              >
                {orderLoading ? "Processing..." : <><FiCheckCircle /> Confirm Order</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TiffinPlans;
import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiCalendar, FiClock, FiCoffee, FiSun, FiMoon, FiActivity, FiTag, FiBox, FiStar, FiDroplet, FiHeart, FiMenu } from "react-icons/fi";

const MessMenu = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await API.get("/student/tiffin-plans");
        console.log("📦 Mess Menu Response:", res.data);
        
        if (!Array.isArray(res.data)) {
          console.warn("⚠️ Response is not an array");
          setMenus([]);
          return;
        }
        
        // Show ALL plans, regardless of whether they have menus
        console.log(`📊 Total plans fetched: ${res.data.length}`);
        console.log("Plans:", res.data.map(p => ({ name: p.name, hasMenu: p.menu?.length > 0 })));
        
        setMenus(res.data);
        setError("");
      } catch (err) {
        console.error("❌ Failed to fetch menu:", err);
        setError("Failed to load mess menu");
        setMenus([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [selectedDate]);

  const getMealIcon = (type) => {
    if (type.includes('lunch') || type.includes('morning')) return <FiSun className="text-amber-500 text-xl" />;
    if (type.includes('dinner') || type.includes('night')) return <FiMoon className="text-indigo-500 text-xl" />;
    return <FiCoffee className="text-orange-500 text-xl" />;
  };

  const getDayGreeting = () => {
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate === today) return "Today's Special Menu";
    if (selectedDate > today) return "Upcoming Menu";
    return "Past Menu";
  };

  const getItemIcon = (item) => {
    const itemLower = item.toLowerCase();
    if (itemLower.includes('soup') || itemLower.includes('dal')) return <FiDroplet className="text-orange-500" />;
    if (itemLower.includes('rice') || itemLower.includes('biryani')) return <FiBox className="text-amber-600" />;
    if (itemLower.includes('bread') || itemLower.includes('roti') || itemLower.includes('naan')) return <FiBox className="text-yellow-700" />;
    if (itemLower.includes('chicken') || itemLower.includes('meat')) return <FiHeart className="text-red-600" />;
    if (itemLower.includes('fish') || itemLower.includes('prawn')) return <FiDroplet className="text-blue-500" />;
    if (itemLower.includes('salad') || itemLower.includes('vegetable')) return <FiActivity className="text-green-600" />;
    if (itemLower.includes('dessert') || itemLower.includes('sweet')) return <FiBox className="text-pink-500" />;
    return <FiMenu className="text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 mt-4 md:mt-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
             <span className="w-14 h-14 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-300 group-hover:scale-110 transition-transform">
               <FiBox className="text-2xl" />
             </span>
             Today's Menu
          </h1>
          <p className="text-gray-500 text-base mt-3 ml-1 font-medium flex items-center gap-2">
            <FiStar className="text-amber-500" /> {getDayGreeting()}
          </p>
        </div>

        {/* Date Selector */}
        <div className="w-full md:w-auto">
           <div className="relative group">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <FiCalendar className="text-white text-lg bg-orange-500 rounded-full p-1 w-6 h-6 flex items-center justify-center" />
             </div>
             <input
               type="date"
               value={selectedDate}
               onChange={(e) => setSelectedDate(e.target.value)}
               className="w-full md:w-auto bg-white border-2 border-orange-200 rounded-2xl pl-12 pr-6 py-3.5 focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all shadow-md font-bold text-gray-700 hover:border-orange-400 cursor-pointer text-base"
             />
           </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-xl shadow-sm mb-8 flex items-center gap-3">
          <FiTag className="text-red-500 text-xl" /> {error}
        </div>
      )}

      {menus.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border-2 border-dashed border-gray-300 p-16 text-center mt-10">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiBox className="text-5xl text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">No Menu Scheduled</h2>
          <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed">The kitchen staff has not published a menu for this date yet. Try selecting the current day or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menus.map((plan) => {
            const todaysMenu = plan.menu?.find(m => m.date === selectedDate);
            const isVeg = plan.type === 'veg';
            const hasMenu = todaysMenu && todaysMenu.items?.length > 0;
            
            return (
              <div 
                key={plan._id} 
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative flex flex-col`}
              >
                {/* Top Accent Line */}
                <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500"></div>

                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-transparent rounded-bl-2xl -z-10 group-hover:scale-110 transition-transform"></div>

                <div className="p-5 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3 gap-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-orange-600 transition-colors">{plan.name}</h3>
                      <p className="text-gray-500 text-[12px] line-clamp-1">{plan.description || "Nutritious meal option"}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg border whitespace-nowrap shadow-sm ${
                      isVeg ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      plan.type === 'non-veg' ? 'bg-red-50 text-red-700 border-red-100' : 
                      'bg-indigo-50 text-indigo-700 border-indigo-100'
                    }`}>
                      {plan.type}
                    </span>
                  </div>

                  {/* Menu Items */}
                  {hasMenu ? (
                    <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/30 rounded-lg p-3 border border-orange-100/50 flex-1 mb-3">
                      <p className="text-[10px] font-bold text-orange-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <FiMenu className="text-base" /> Today's Items
                      </p>
                      <div className="space-y-1.5">
                        {todaysMenu.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-gray-700 text-[12px] font-medium">
                            <span className="text-base flex-shrink-0">{getItemIcon(item)}</span>
                            <span className="line-clamp-1">{item}</span>
                          </div>
                        ))}
                        {todaysMenu.items.length > 3 && (
                          <p className="text-[10px] text-gray-500 font-semibold pt-1">+{todaysMenu.items.length - 3} more items</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-200/50 mb-3 text-center">
                      <p className="text-[11px] text-amber-900 font-semibold flex items-center justify-center gap-1.5"><FiMenu className="text-amber-700" /> Menu Coming Soon</p>
                    </div>
                  )}

                  {/* Price */}
                  <div className="pt-3 border-t border-gray-100 text-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">Monthly Price</p>
                    <p className="text-2xl font-black text-orange-600">₹{plan.price}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MessMenu;
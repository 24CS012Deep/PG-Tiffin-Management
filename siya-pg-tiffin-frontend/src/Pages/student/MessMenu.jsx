import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiCalendar, FiClock, FiCoffee, FiSun, FiMoon, FiActivity, FiTag } from "react-icons/fi";

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
        const plansWithMenu = res.data.filter(plan => 
          plan.menu?.some(m => m.date === selectedDate)
        );
        setMenus(plansWithMenu);
        setError("");
      } catch (err) {
        console.error("Failed to fetch menu:", err);
        setError("Failed to load mess menu");
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
    if (selectedDate === today) return "Today's Specials";
    if (selectedDate > today) return "Upcoming Menu";
    return "Past Menu";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 mt-4 md:mt-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
             <span className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
               <FiActivity />
             </span>
             Mess Menu
          </h1>
          <p className="text-gray-500 text-base mt-2 ml-1 font-medium">{getDayGreeting()}</p>
        </div>

        {/* Date Selector Pill */}
        <div className="relative group self-stretch md:self-auto">
           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
             <FiCalendar className="text-orange-500 text-lg group-hover:scale-110 transition-transform" />
           </div>
           <input
             type="date"
             value={selectedDate}
             onChange={(e) => setSelectedDate(e.target.value)}
             className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-6 py-4 focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all shadow-sm font-semibold text-gray-700 hover:border-gray-300 cursor-pointer text-base"
           />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-xl shadow-sm mb-8 flex items-center gap-3">
          <FiTag className="text-red-500 text-xl" /> {error}
        </div>
      )}

      {menus.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-dashed border-gray-300 p-16 text-center mt-10">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <FiCalendar className="text-5xl text-gray-300 absolute" />
            <div className="w-10 h-10 bg-white border border-gray-100 rounded-full absolute -bottom-2 -right-2 flex items-center justify-center shadow-sm">
               <FiClock className="text-gray-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">No Menu Scheduled</h2>
          <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed">The kitchen staff has not published a menu for this date yet. Try selecting the current day or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {menus.map((plan) => {
            const todaysMenu = plan.menu.find(m => m.date === selectedDate);
            const isVeg = plan.type === 'veg';
            
            return (
              <div 
                key={plan._id} 
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative"
              >
                {/* Decorative Pattern Top */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                
                <div className="p-6 md:p-8 flex-1">
                  <div className="flex justify-between items-start mb-6">
                     <span className={`px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-sm border ${
                        isVeg ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                        plan.type === 'non-veg' ? 'bg-red-50 text-red-700 border-red-100' : 
                        'bg-indigo-50 text-indigo-700 border-indigo-100'
                     }`}>
                        <span className={`w-1.5 h-1.5 rounded-full shadow-sm ${
                           isVeg ? 'bg-emerald-500' : plan.type === 'non-veg' ? 'bg-red-500' : 'bg-indigo-500'
                        }`}></span>
                        {plan.type}
                     </span>
                     
                     <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-white group-hover:shadow-md transition-all">
                        {getMealIcon(plan.mealTypes?.join(',') || 'lunch')}
                     </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-800 mb-2 leading-tight group-hover:text-orange-600 transition-colors">{plan.name}</h2>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{plan.description}</p>
                  
                  <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FiTag /> Menu Items
                    </h3>
                    <ul className="space-y-3 relative">
                      {/* Timeline line */}
                      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200"></div>
                      
                      {todaysMenu.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-4 text-gray-700 font-medium pl-[6px]">
                          <div className={`w-2.5 h-2.5 rounded-full mt-1.5 z-10 border-2 border-white shadow-sm flex-shrink-0 ${idx % 2 === 0 ? 'bg-orange-500' : 'bg-amber-400'}`}></div>
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 md:px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center group-hover:bg-orange-50/50 transition-colors">
                   <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Plan Price</div>
                   <div className="text-xl font-black text-gray-800 tracking-tight">₹{plan.price}<span className="text-sm font-medium text-gray-400">/mo</span></div>
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
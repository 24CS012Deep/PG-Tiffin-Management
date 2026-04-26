import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faUtensils,
  faCalendarDay,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import API from "../utils/api";

export default function TodayMenu() {
  const [todaysMenuPlans, setTodaysMenuPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await API.get("/public/todays-menu");
        if (res.data.success) {
          setTodaysMenuPlans(res.data.menus);
          setDateStr(res.data.date);
        }
      } catch (err) {
        console.error("Failed to load today's menu:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenu();
  }, []);

  // Format date nicely
  const formattedDate = dateStr 
    ? new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : "Today";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16 md:pt-20 font-sans">
        
        {/* Dynamic Header */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white py-12 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
            <Link to="/" className="inline-flex items-center text-orange-100 hover:text-white mb-6 font-bold tracking-wide transition group">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-3 group-hover:-translate-x-1 transition-transform" />
              Return to Homepage
            </Link>
            <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase mb-4 inline-flex items-center gap-2 drop-shadow-sm border border-white/30 backdrop-blur-sm">
              <FontAwesomeIcon icon={faCalendarDay} />
              {formattedDate}
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-md tracking-tight">Today's Special Menu</h1>
            <p className="text-xl text-orange-100 font-medium max-w-2xl">Discover what our chefs have prepared fresh for you today.</p>
          </div>
        </div>

        {/* Menu Section */}
        <section className="py-16 md:py-24 px-6 relative z-20 -mt-10">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center h-40 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
              </div>
            ) : todaysMenuPlans.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                  {todaysMenuPlans.map((plan) => (
                    <div key={plan._id} className="bg-white rounded-3xl p-8 shadow-[0_10px_30px_rgba(249,115,22,0.1)] border-t-8 border-orange-500 hover:-translate-y-2 transition-all duration-300 flex flex-col relative overflow-hidden group">
                      <div className="absolute top-4 right-4 flex gap-2">
                         {plan.isToday && (
                           <span className="bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-orange-200 animate-pulse">Today's Special</span>
                         )}
                         <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-200">Active Plan</span>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-wide">{plan.name}</h3>
                      <p className="text-orange-600 font-black text-xl mb-6 tracking-wider">₹{plan.price}<span className="text-gray-400 text-sm font-normal tracking-normal"> / meal</span></p>
                      
                      <div className="bg-orange-50/50 rounded-2xl p-6 mb-6 border border-orange-100 flex-1">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg border-b border-orange-200 pb-2 tracking-wide">
                          <span className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm"><FontAwesomeIcon icon={faUtensils} /></span> 
                          Menu Items
                        </h4>
                        
                        {plan.isMenuSet ? (
                          <ul className="space-y-4">
                            {plan.items.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-gray-700 font-semibold tracking-wide">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-orange-500 mt-1" /> 
                                <span className="text-lg leading-snug">{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="py-4 text-center">
                            <p className="text-gray-500 italic font-medium tracking-wide">No menu items set for this plan yet.</p>
                          </div>
                        )}
                      </div>
                      
                      <Link to="/signin" className="block w-full text-center py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 group-hover:scale-[1.02]">
                        Login to Subscribe
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Login Portal Section */}
                <div className="bg-gray-900 rounded-[3rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')] opacity-10"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto text-left">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Tiffin Portal is Active</h2>
                      <p className="text-gray-400 text-lg font-medium max-w-xl">Already have a plan or want to start a new subscription? Access your personalized dashboard now.</p>
                    </div>
                    <Link to="/signin" className="bg-orange-500 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-orange-400 hover:-translate-y-1 transition-all whitespace-nowrap">
                       Go to Login Portal <FontAwesomeIcon icon={faCheckCircle} className="ml-2" />
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-lg max-w-3xl mx-auto">
                <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FontAwesomeIcon icon={faUtensils} className="text-5xl text-orange-400" />
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900 mb-4">No Active Plans</h3>
                <p className="text-gray-500 font-medium text-lg max-w-md mx-auto mb-8 leading-relaxed">
                  We currently don't have any active tiffin plans available for public view. Please contact management for more details.
                </p>
                <Link to="/signin" className="inline-block bg-orange-500 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all text-lg">
                  Login to Portal
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

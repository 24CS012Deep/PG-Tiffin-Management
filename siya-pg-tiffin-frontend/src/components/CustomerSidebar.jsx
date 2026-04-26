import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  FiHome, 
  FiShoppingBag, 
  FiBox, 
  FiUser, 
  FiLogOut,
  FiMenu,
  FiX,
  FiClock
} from "react-icons/fi";
import { MdReceiptLong, MdOutlineSupportAgent } from "react-icons/md";

const CustomerSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menu = [
    { name: "Dashboard", path: "/customer", icon: FiHome },
    { name: "My Orders", path: "/customer/my-orders", icon: FiShoppingBag },
    { name: "Tiffin Plans", path: "/customer/tiffin-plans", icon: FiBox },
    { name: "My Bills", path: "/customer/my-bills", icon: MdReceiptLong },
    { name: "Raise Query", path: "/customer/raise-query", icon: MdOutlineSupportAgent },
    { name: "Profile", path: "/customer/profile", icon: FiUser },
  ];

  const logout = () => {
    localStorage.clear();
    navigate("/signin");
  };

  const handleLinkClick = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button - shown only on small screens */}
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)} 
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-orange-500 text-white rounded-lg"
      >
        {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop always visible, Mobile conditionally visible */}
      <div className={`
        fixed md:relative w-64 h-screen bg-white border-r p-4 md:p-6 flex flex-col 
        z-40 transform transition-transform duration-300 md:translate-x-0 md:z-auto
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#FF6B00]">SwadBox</h2>
          <p className="text-xs text-gray-400 mb-6 md:mb-8">CUSTOMER PANEL</p>
          <div className="space-y-1 md:space-y-2">
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg font-medium transition text-sm md:text-base whitespace-nowrap md:whitespace-normal ${
                    location.pathname === item.path
                      ? "bg-[#FF6B00] text-white"
                      : "text-gray-600 hover:bg-orange-50"
                  }`}
                >
                  <Icon className="text-lg flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        <button
          onClick={() => {
            setIsMobileOpen(false);
            logout();
          }}
          className="mt-auto flex items-center gap-3 text-gray-500 hover:text-orange-500 px-3 md:px-4 py-3 text-sm md:text-base"
        >
          <FiLogOut className="flex-shrink-0" /> Logout
        </button>
      </div>
    </>
  );
};

export default CustomerSidebar;
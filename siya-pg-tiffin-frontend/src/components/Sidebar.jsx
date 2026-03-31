import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  FiHome, FiUsers, FiBox, FiShoppingBag, 
  FiLogOut, FiMenu, FiX
} from "react-icons/fi";
import { MdReceiptLong, MdOutlineRequestQuote, MdOutlineSupportAgent } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";
import { RiSettings4Line } from "react-icons/ri";

const Sidebar = ({ isOpen = true, onClose = () => {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menu = [
    { name: "Dashboard", path: "/admin", icon: FiHome },
    { name: "Rooms", path: "/admin/rooms", icon: FiHome },
    { name: "Users", path: "/admin/users", icon: FiUsers },
    { name: "Tiffin Plans", path: "/admin/tiffin", icon: FiBox },
    { name: "Orders", path: "/admin/orders", icon: FiShoppingBag },
    { name: "Billing", path: "/admin/billing", icon: MdReceiptLong },
    { name: "Generate Bills", path: "/admin/generate-bills", icon: MdOutlineRequestQuote },
    { name: "Reports", path: "/admin/reports", icon: TbReportAnalytics },
    { name: "Queries", path: "/admin/queries", icon: MdOutlineSupportAgent },
    { name: "Settings", path: "/admin/settings", icon: RiSettings4Line },
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
          <h2 className="text-xl md:text-2xl font-bold text-orange-500">SwadBox</h2>
          <p className="text-xs text-gray-400 mb-6 md:mb-8">ADMIN PANEL</p>

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
                      ? "bg-orange-500 text-white"
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
          <FiLogOut className="flex-shrink-0" />
          Logout
        </button>
      </div>
    </>
  );
};

export default Sidebar;
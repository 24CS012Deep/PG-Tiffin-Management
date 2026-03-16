import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  FiHome, 
  FiShoppingBag, 
  FiDollarSign, 
  FiBox, 
  FiMessageSquare, 
  FiUser, 
  FiLogOut 
} from "react-icons/fi";

const CustomerSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", path: "/customer", icon: FiHome },
    { name: "My Orders", path: "/customer/my-orders", icon: FiShoppingBag },
    { name: "Tiffin Plans", path: "/customer/tiffin-plans", icon: FiBox },
    { name: "My Bills", path: "/customer/my-bills", icon: FiDollarSign },
    { name: "Raise Query", path: "/customer/raise-query", icon: FiMessageSquare },
    { name: "Profile", path: "/customer/profile", icon: FiUser },
  ];

  const logout = () => {
    localStorage.clear();
    navigate("/signin");
  };

  return (
    <div className="w-64 bg-white border-r p-6 flex flex-col">
      <div>
        <h2 className="text-2xl font-bold text-orange-500">SwadBox</h2>
        <p className="text-xs text-gray-400 mb-8">CUSTOMER PANEL</p>
        <div className="space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                  location.pathname === item.path
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:bg-orange-50"
                }`}
              >
                <Icon className="text-lg" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
      <button
        onClick={logout}
        className="mt-auto flex items-center gap-3 text-gray-500 hover:text-orange-500 px-4 py-3"
      >
        <FiLogOut /> Logout
      </button>
    </div>
  );
};

export default CustomerSidebar;
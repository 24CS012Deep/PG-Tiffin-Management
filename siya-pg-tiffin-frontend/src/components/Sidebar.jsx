import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", path: "/admin" },
    { name: "PG Rooms", path: "/admin/rooms" },
    { name: "User Management", path: "/admin/users" },
    { name: "Tiffin Plans", path: "/admin/tiffin" },
    { name: "Billing & Payments", path: "/admin/billing" },
    { name: "Reports & Analytics", path: "/admin/reports" },
    { name: "Settings", path: "/admin/settings" },
  ];

  const logout = () => {
    localStorage.clear();
    navigate("/signin");
  };

  return (
    <div className="w-64 bg-white border-r p-6 flex flex-col">
      <div>
        <h2 className="text-2xl font-bold text-primary">SwadBox</h2>
        <p className="text-xs text-gray-400 mb-8">MANAGEMENT SUITE</p>

        <div className="space-y-3">
          {menu.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`block px-4 py-3 rounded-lg font-medium ${
                location.pathname === item.path
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-orange-50"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {/* ⭐ LOGOUT BUTTON */}
      <button
        onClick={logout}
        className="mt-auto text-gray-500 hover:text-primary"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
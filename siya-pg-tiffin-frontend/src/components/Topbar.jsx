import { useNavigate } from "react-router-dom";

const Topbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const getInitials = () => {
    if (!user?.name) return "AD";
    const names = user.name.split(" ");
    return names.length > 1 ? names[0][0] + names[1][0] : names[0][0];
  };

  const handleProfileRedirect = () => {
    if (user?.role === "customer") {
      navigate("/customer/profile");
      return;
    }
    if (user?.role === "student") {
      navigate("/student/profile");
      return;
    }
    if (user?.role === "admin") {
      navigate("/admin/settings");
      return;
    }
    navigate("/");
  };

  return (
    <div className="bg-white border-b px-4 md:px-8 py-3 md:py-4 flex justify-between items-center gap-4">
      <h2 className="text-base md:text-xl font-semibold truncate">Welcome back, {user?.name?.split(' ')[0]}</h2>

      <div className="flex items-center gap-2 md:gap-4">
        <input
          className="hidden md:block border border-gray-100 bg-gray-50 rounded-full px-5 py-2 w-52 md:w-64 text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-4 focus:ring-orange-50 transition-all placeholder:text-gray-400"
          placeholder="Search anything..."
        />

        <button
          type="button"
          onClick={handleProfileRedirect}
          title="Go to profile"
          className="bg-[#FF6B00] text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base hover:bg-orange-600 transition-all cursor-pointer shadow-sm"
        >
          {getInitials()}
        </button>
      </div>
    </div>
  );
};

export default Topbar;

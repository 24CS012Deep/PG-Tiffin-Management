const Topbar = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const getInitials = () => {
    if (!user?.name) return "AD";
    const names = user.name.split(" ");
    return names.length > 1 ? names[0][0] + names[1][0] : names[0][0];
  };

  return (
    <div className="bg-white border-b px-4 md:px-8 py-3 md:py-4 flex justify-between items-center gap-4">
      <h2 className="text-base md:text-xl font-semibold truncate">Welcome back, {user?.name?.split(' ')[0]}</h2>

      <div className="flex items-center gap-2 md:gap-4">
        <input
          className="hidden md:block border rounded-full px-3 md:px-4 py-2 w-52 md:w-64 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Search anything..."
        />

        <div className="bg-orange-100 text-orange-500 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base">
          {getInitials()}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
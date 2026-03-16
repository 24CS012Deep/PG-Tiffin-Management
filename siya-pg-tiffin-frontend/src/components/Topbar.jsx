const Topbar = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const getInitials = () => {
    if (!user?.name) return "AD";
    const names = user.name.split(" ");
    return names.length > 1 ? names[0][0] + names[1][0] : names[0][0];
  };

  return (
    <div className="bg-white border-b px-8 py-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold">Welcome back, {user?.name?.split(' ')[0]}</h2>

      <div className="flex items-center gap-4">
        <input
          className="border rounded-full px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Search anything..."
        />

        <div className="bg-orange-100 text-orange-500 w-10 h-10 rounded-full flex items-center justify-center font-bold">
          {getInitials()}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
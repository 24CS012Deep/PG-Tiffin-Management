import { useEffect, useState } from "react";
import API from "../../utils/api";
import { FiCalendar } from "react-icons/fi";

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
  }, [selectedDate]); // Now fetchMenu is defined inside useEffect, no missing dependency

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Mess Menu</h1>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {menus.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FiCalendar className="text-5xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Menu Available</h2>
          <p className="text-gray-500">No menu has been set for this date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menus.map((plan) => {
            const todaysMenu = plan.menu.find(m => m.date === selectedDate);
            return (
              <div key={plan._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-orange-500 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <p className="text-sm text-gray-500 mb-2">Price: ₹{plan.price}</p>
                  <h3 className="font-medium mb-2">Today's Menu:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {todaysMenu.items.map((item, idx) => (
                      <li key={idx} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
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
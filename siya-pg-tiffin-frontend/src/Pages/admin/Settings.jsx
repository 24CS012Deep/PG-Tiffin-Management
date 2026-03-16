import { useState } from "react";

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: "SwadBox",
    theme: "light",
    notifications: true,
    emailAlerts: true,
    maintenanceMode: false,
    currency: "INR",
    timezone: "Asia/Kolkata"
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setSaved(false);
  };

  const handleSave = () => {
    // In a real app, you would save to backend here
    localStorage.setItem("appSettings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setSettings({
      siteName: "SwadBox",
      theme: "light",
      notifications: true,
      emailAlerts: true,
      maintenanceMode: false,
      currency: "INR",
      timezone: "Asia/Kolkata"
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      {saved && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          Settings saved successfully!
        </div>
      )}

      <div className="bg-white p-8 rounded-xl shadow max-w-2xl">
        <form className="space-y-6">
          <div>
            <label className="block font-medium mb-2 text-gray-700">Site Name</label>
            <input
              name="siteName"
              value={settings.siteName}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block font-medium mb-2 text-gray-700">Theme</label>
            <select
              name="theme"
              value={settings.theme}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2 text-gray-700">Currency</label>
            <select
              name="currency"
              value={settings.currency}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2 text-gray-700">Timezone</label>
            <select
              name="timezone"
              value={settings.timezone}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Asia/Kolkata">India (IST)</option>
              <option value="America/New_York">US Eastern (EST)</option>
              <option value="Europe/London">UK (GMT)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="font-medium text-gray-700">Enable Notifications</label>
            <input
              type="checkbox"
              name="notifications"
              checked={settings.notifications}
              onChange={handleChange}
              className="h-5 w-5 text-orange-500 rounded focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="font-medium text-gray-700">Email Alerts</label>
            <input
              type="checkbox"
              name="emailAlerts"
              checked={settings.emailAlerts}
              onChange={handleChange}
              className="h-5 w-5 text-orange-500 rounded focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="font-medium text-gray-700">Maintenance Mode</label>
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleChange}
              className="h-5 w-5 text-orange-500 rounded focus:ring-orange-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSave}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-medium flex-1"
            >
              Save Settings
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition font-medium"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
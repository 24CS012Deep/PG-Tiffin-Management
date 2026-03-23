import { useState, useEffect } from "react";
import API from "../../utils/api";
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    deliveryPreference: "both",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/customer/profile");
      setUser(res.data.user);
      setFormData({
        name: res.data.user.name || "",
        email: res.data.user.email || "",
        phone: res.data.user.phone || "",
        address: res.data.user.address || "",
        deliveryPreference: res.data.user.deliveryPreference || "both",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setError("");
    } catch (err) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "currentPassword") {
      setIsPasswordVerified(false);
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword) {
      if (!isPasswordVerified) {
        setError("Please verify your current password first");
        return;
      }
      if (formData.newPassword.length < 6) {
        setError("New password must be at least 6 characters");
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError("New passwords do not match");
        return;
      }
    }

    try {
      const res = await API.put("/customer/profile", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        deliveryPreference: formData.deliveryPreference,
        currentPassword: formData.currentPassword || undefined,
        newPassword: formData.newPassword || undefined
      });
      setUser(res.data.user);
      setSuccess("Profile updated successfully");
      setEditMode(false);
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleVerifyCurrentPassword = async () => {
    setError("");
    setSuccess("");

    if (!formData.currentPassword) {
      setError("Please enter your current password first");
      return;
    }

    try {
      setIsVerifyingPassword(true);
      await API.post("/customer/profile/verify-password", {
        currentPassword: formData.currentPassword,
      });
      setIsPasswordVerified(true);
      setSuccess("Current password verified. You can set a new password now.");
    } catch (err) {
      setIsPasswordVerified(false);
      setError(err.response?.data?.message || "Failed to verify current password");
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      deliveryPreference: user.deliveryPreference || "both",
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setEditMode(false);
    setError("");
    setSuccess("");
    setIsPasswordVerified(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-orange-500 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Personal Information</h2>
        </div>

        <div className="p-6">
          {!editMode ? (
            <div className="space-y-4">
              <div className="flex items-center border-b pb-3">
                <FiUser className="text-orange-500 w-6 h-6 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-lg font-medium">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center border-b pb-3">
                <FiMail className="text-orange-500 w-6 h-6 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="text-lg font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center border-b pb-3">
                <FiPhone className="text-orange-500 w-6 h-6 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-lg font-medium">{user.phone || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center border-b pb-3">
                <FiMapPin className="text-orange-500 w-6 h-6 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-lg font-medium">{user.address || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center border-b pb-3">
                <span className="text-orange-500 w-6 h-6 mr-3">🍽️</span>
                <div>
                  <p className="text-sm text-gray-500">Delivery Preference</p>
                  <p className="text-lg font-medium capitalize">{user.deliveryPreference || "both"}</p>
                </div>
              </div>
              <div className="flex items-center pb-3">
                <FiLock className="text-orange-500 w-6 h-6 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Password</p>
                  <p className="text-lg font-medium">••••••••</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  }));
                  setIsPasswordVerified(false);
                  setEditMode(true);
                }}
                className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Preference</label>
                <select
                  name="deliveryPreference"
                  value={formData.deliveryPreference}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="breakfast">Breakfast Only</option>
                  <option value="lunch">Lunch Only</option>
                  <option value="dinner">Dinner Only</option>
                  <option value="both">Both (Lunch & Dinner)</option>
                </select>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Change Password (Optional)</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        autoComplete="new-password"
                        className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-500"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleVerifyCurrentPassword}
                        disabled={isVerifyingPassword}
                        className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-900 disabled:opacity-60"
                      >
                        {isVerifyingPassword ? "Verifying..." : "Verify Current Password"}
                      </button>
                      {isPasswordVerified && (
                        <span className="text-sm text-green-600 font-medium">Verified</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        disabled={!isPasswordVerified}
                        autoComplete="new-password"
                        className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      disabled={!isPasswordVerified}
                      autoComplete="new-password"
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition flex-1"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="mt-6 bg-orange-50 rounded-xl p-6 border border-orange-200">
        <h3 className="font-semibold text-lg mb-2">Account Information</h3>
        <p className="text-gray-600">
          <span className="font-medium">Role:</span> Customer
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Member since:</span> {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default Profile;
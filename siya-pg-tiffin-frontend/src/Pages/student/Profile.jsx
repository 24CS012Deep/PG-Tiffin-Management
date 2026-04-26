import { useState, useEffect } from "react";
import API from "../../utils/api";
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiEye, FiEyeOff, FiEdit3, FiCheckCircle, FiAlertCircle, FiShield, FiHome } from "react-icons/fi";

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
    name: "", email: "", phone: "", address: "", deliveryPreference: "both",
    currentPassword: "", newPassword: "", confirmPassword: "",
  });

  useEffect(() => { fetchProfile(); }, []);

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(""), 5000); return () => clearTimeout(t); }
  }, [success]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/student/profile");
      setUser(res.data.user);
      setFormData({
        name: res.data.user.name || "", email: res.data.user.email || "",
        phone: res.data.user.phone || "", address: res.data.user.address || "",
        deliveryPreference: res.data.user.deliveryPreference || "both",
        currentPassword: "", newPassword: "", confirmPassword: "",
      });
      setError("");
    } catch (err) { setError("Failed to load profile"); } finally { setLoading(false); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "currentPassword") setIsPasswordVerified(false);
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (formData.newPassword) {
      if (!isPasswordVerified) { setError("Please verify your current password first"); return; }
      if (formData.newPassword.length < 6) { setError("New password must be at least 6 characters"); return; }
      if (formData.newPassword !== formData.confirmPassword) { setError("New passwords do not match"); return; }
    }
    try {
      const res = await API.put("/student/profile", {
        name: formData.name, email: formData.email, phone: formData.phone,
        address: formData.address, deliveryPreference: formData.deliveryPreference,
        currentPassword: formData.currentPassword || undefined,
        newPassword: formData.newPassword || undefined,
      });
      setUser(res.data.user);
      setSuccess("Profile updated successfully!");
      setEditMode(false);
      setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) { setError(err.response?.data?.message || "Failed to update profile"); }
  };

  const handleVerifyCurrentPassword = async () => {
    setError(""); setSuccess("");
    if (!formData.currentPassword) { setError("Please enter your current password first"); return; }
    try {
      setIsVerifyingPassword(true);
      await API.post("/student/profile/verify-password", { currentPassword: formData.currentPassword });
      setIsPasswordVerified(true);
      setSuccess("Password verified! You can now set a new password.");
    } catch (err) {
      setIsPasswordVerified(false);
      setError(err.response?.data?.message || "Failed to verify password");
    } finally { setIsVerifyingPassword(false); }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "", email: user.email || "", phone: user.phone || "",
      address: user.address || "", deliveryPreference: user.deliveryPreference || "both",
      currentPassword: "", newPassword: "", confirmPassword: "",
    });
    setEditMode(false); setError(""); setSuccess(""); setIsPasswordVerified(false);
  };

  const getInitials = () => {
    if (!user?.name) return "?";
    return user.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  const profileFields = [
    { icon: <FiUser className="text-orange-500" />, label: "Full Name", value: user?.name },
    { icon: <FiMail className="text-orange-500" />, label: "Email Address", value: user?.email },
    { icon: <FiPhone className="text-orange-500" />, label: "Phone Number", value: user?.phone || "Not provided" },
    { icon: <FiMapPin className="text-orange-500" />, label: "Address", value: user?.address || "Not provided" },
    { icon: <FiHome className="text-orange-500" />, label: "Room Number", value: user?.roomNumber || "Not assigned" },
    { icon: <FiLock className="text-orange-500" />, label: "Password", value: "••••••••" },
  ];

  return (
    <div className="min-h-screen pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-gray-800">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-2 rounded-xl shadow-lg">
              <FiUser />
            </span>
            My Profile
          </h1>
          <p className="text-gray-500 text-sm mt-1">View and manage your personal information.</p>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 px-5 py-3 rounded-r-xl mb-6 flex items-center gap-3">
          <FiCheckCircle className="text-lg flex-shrink-0" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-3 rounded-r-xl mb-6 flex items-center gap-3">
          <FiAlertCircle className="text-lg flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Hero Header */}
        <div className="h-32 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        </div>

        <div className="px-6 md:px-8 pb-8 relative">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl bg-white shadow-xl border-4 border-white flex items-center justify-center text-2xl font-black text-orange-500 -mt-12 mb-4 relative z-10">
            {getInitials()}
          </div>

          {!editMode ? (
            <>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                </div>
                <button
                  onClick={() => { setFormData((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" })); setIsPasswordVerified(false); setEditMode(true); }}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-200 flex items-center gap-2"
                >
                  <FiEdit3 /> Edit Profile
                </button>
              </div>

              <div className="space-y-0 divide-y divide-gray-50">
                {profileFields.map((field, idx) => (
                  <div key={idx} className="flex items-center gap-4 py-4">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      {field.icon}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{field.label}</p>
                      <p className="text-gray-800 font-medium">{field.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none font-medium" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none font-medium" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none font-medium" placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Delivery Preference</label>
                  <select name="deliveryPreference" value={formData.deliveryPreference} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none font-medium">
                    <option value="breakfast">Breakfast Only</option>
                    <option value="lunch">Lunch Only</option>
                    <option value="dinner">Dinner Only</option>
                    <option value="both">Both (Lunch & Dinner)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none font-medium" placeholder="Optional" />
              </div>

              {/* Password Section */}
              <div className="border-t border-gray-100 pt-5">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiShield className="text-orange-500" /> Change Password <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Current Password</label>
                    <div className="relative">
                      <input type={showCurrentPassword ? "text" : "password"} name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} autoComplete="new-password" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-orange-500 outline-none font-medium" />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                        {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <button type="button" onClick={handleVerifyCurrentPassword} disabled={isVerifyingPassword} className="bg-gray-800 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-900 disabled:opacity-60 transition-colors">
                        {isVerifyingPassword ? "Verifying..." : "Verify Password"}
                      </button>
                      {isPasswordVerified && <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><FiCheckCircle /> Verified</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">New Password</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} name="newPassword" value={formData.newPassword} onChange={handleInputChange} disabled={!isPasswordVerified} autoComplete="new-password" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-orange-500 outline-none font-medium disabled:bg-gray-100 disabled:cursor-not-allowed" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                          {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Confirm New Password</label>
                      <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} disabled={!isPasswordVerified} autoComplete="new-password" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none font-medium disabled:bg-gray-100 disabled:cursor-not-allowed" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-200">
                  Save Changes
                </button>
                <button type="button" onClick={handleCancel} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="mt-6 bg-orange-50 border border-orange-100 rounded-2xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <FiShield className="text-orange-600 text-xl" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">Account Information</h3>
          <p className="text-gray-600 text-sm">
            <span className="font-medium">Role:</span> Student •{" "}
            <span className="font-medium">Member since:</span> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "N/A"}
            {user?.roomNumber && <> • <span className="font-medium">Room:</span> {user.roomNumber}</>}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
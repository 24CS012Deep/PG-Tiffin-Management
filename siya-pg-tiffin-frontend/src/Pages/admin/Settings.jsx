import { useState, useEffect } from "react";
import API from "../../utils/api";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLock,
  FiEye,
  FiEyeOff,
  FiSave,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiShield,
  FiEdit3,
  FiX,
  FiGlobe,
  FiBell,
  FiLoader,
} from "react-icons/fi";
import { RiSettings4Line } from "react-icons/ri";

const Settings = () => {
  // ─── Admin Profile State ─────────────────────────────────
  const [user, setUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // ─── Password Change State ───────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // ─── App Preferences State ────────────────────────────────
  const [appPrefs, setAppPrefs] = useState({
    notifications: true,
    emailAlerts: true,
    currency: "INR",
    timezone: "Asia/Kolkata",
  });

  // ─── Messages ────────────────────────────────────────────
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ─── Active Section Tab ──────────────────────────────────
  const [activeSection, setActiveSection] = useState("profile");

  // ─── Fetch admin profile on mount ────────────────────────
  useEffect(() => {
    fetchProfile();
    loadAppPrefs();
  }, []);

  // Auto-dismiss success/error messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await API.get("/admin/profile");
      const u = res.data.user;
      setUser(u);
      setProfileForm({
        name: u.name || "",
        email: u.email || "",
        phone: u.phone || "",
        address: u.address || "",
      });
    } catch (err) {
      setError("Failed to load admin profile");
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadAppPrefs = () => {
    const stored = localStorage.getItem("swadbox_app_prefs");
    if (stored) {
      try {
        setAppPrefs(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse app preferences");
      }
    }
  };

  // ─── Profile Handlers ────────────────────────────────────
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!profileForm.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!profileForm.email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      setProfileSaving(true);
      const res = await API.put("/admin/profile", {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        address: profileForm.address.trim(),
      });

      setUser(res.data.user);
      setSuccess("Profile updated successfully!");
      setEditMode(false);

      // Update localStorage user object so Topbar reflects changes
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      storedUser.name = res.data.user.name;
      storedUser.email = res.data.user.email;
      localStorage.setItem("user", JSON.stringify(storedUser));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleProfileCancel = () => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setEditMode(false);
    setError("");
  };

  // ─── Password Handlers ───────────────────────────────────
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!passwordForm.currentPassword) {
      setError("Current password is required");
      return;
    }
    if (!passwordForm.newPassword) {
      setError("New password is required");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      setPasswordSaving(true);
      await API.put("/admin/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccess("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  // ─── App Preferences Handlers ────────────────────────────
  const handlePrefChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppPrefs((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePrefSave = () => {
    localStorage.setItem("swadbox_app_prefs", JSON.stringify(appPrefs));
    setSuccess("Preferences saved successfully!");
  };

  const handlePrefReset = () => {
    const defaults = {
      notifications: true,
      emailAlerts: true,
      currency: "INR",
      timezone: "Asia/Kolkata",
    };
    setAppPrefs(defaults);
    localStorage.setItem("swadbox_app_prefs", JSON.stringify(defaults));
    setSuccess("Preferences reset to defaults!");
  };

  // ─── Password Strength Indicator ─────────────────────────
  const getPasswordStrength = (pw) => {
    if (!pw) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { level: 1, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { level: 2, label: "Fair", color: "bg-amber-500" };
    if (score <= 3) return { level: 3, label: "Good", color: "bg-blue-500" };
    return { level: 4, label: "Strong", color: "bg-emerald-500" };
  };

  const pwStrength = getPasswordStrength(passwordForm.newPassword);

  // ─── Section tabs ────────────────────────────────────────
  const sections = [
    { id: "profile", label: "Admin Profile", icon: <FiUser /> },
    { id: "password", label: "Change Password", icon: <FiLock /> },
    { id: "preferences", label: "App Preferences", icon: <RiSettings4Line /> },
  ];

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2.5 rounded-xl shadow-lg shadow-orange-200">
            <RiSettings4Line className="text-xl" />
          </span>
          Settings
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage your profile, security, and application preferences
        </p>
      </div>

      {/* Success / Error Alerts */}
      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 px-5 py-3 rounded-r-xl mb-5 flex items-center gap-3 animate-fadeIn">
          <FiCheckCircle className="text-lg flex-shrink-0" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-3 rounded-r-xl mb-5 flex items-center gap-3 animate-fadeIn">
          <FiAlertCircle className="text-lg flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Section Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex-1 px-4 py-3.5 text-sm font-medium flex items-center justify-center gap-2 transition-all relative ${
                activeSection === sec.id
                  ? "text-orange-600 bg-orange-50/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {sec.icon} {sec.label}
              {activeSection === sec.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          {/* ═══════════ ADMIN PROFILE SECTION ═══════════ */}
          {activeSection === "profile" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FiUser className="text-orange-500" /> Personal Information
                  </h2>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Update your admin account details
                  </p>
                </div>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all"
                  >
                    <FiEdit3 /> Edit
                  </button>
                )}
              </div>

              {!editMode ? (
                /* ─── View Mode ──────────────────────────── */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    {
                      icon: <FiUser />,
                      label: "Full Name",
                      value: user?.name || "—",
                    },
                    {
                      icon: <FiMail />,
                      label: "Email Address",
                      value: user?.email || "—",
                    },
                    {
                      icon: <FiPhone />,
                      label: "Phone Number",
                      value: user?.phone || "Not provided",
                    },
                    {
                      icon: <FiMapPin />,
                      label: "Address",
                      value: user?.address || "Not provided",
                    },
                  ].map((field, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="bg-orange-100 text-orange-500 p-2.5 rounded-lg mt-0.5">
                        {field.icon}
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                          {field.label}
                        </p>
                        <p className="text-gray-800 font-medium mt-0.5">
                          {field.value}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Account Info */}
                  <div className="md:col-span-2 flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="bg-orange-100 text-orange-500 p-2.5 rounded-lg mt-0.5">
                      <FiShield />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                        Account Details
                      </p>
                      <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-700">
                        <span>
                          <strong>Role:</strong>{" "}
                          <span className="px-2 py-0.5 bg-orange-200 text-orange-700 rounded-full text-xs font-semibold capitalize">
                            {user?.role}
                          </span>
                        </span>
                        <span>
                          <strong>Member since:</strong>{" "}
                          {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(
                                "en-IN",
                                { dateStyle: "long" }
                              )
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ─── Edit Mode ──────────────────────────── */
                <form onSubmit={handleProfileSave} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">
                        <FiUser className="inline mr-1 text-orange-500" /> Full
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        required
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">
                        <FiMail className="inline mr-1 text-orange-500" /> Email
                        Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        required
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">
                        <FiPhone className="inline mr-1 text-orange-500" />{" "}
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        placeholder="Optional"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">
                        <FiMapPin className="inline mr-1 text-orange-500" />{" "}
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={profileForm.address}
                        onChange={handleProfileChange}
                        placeholder="Optional"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50 flex items-center gap-2 shadow-md shadow-orange-200"
                    >
                      {profileSaving ? (
                        <>
                          <FiLoader className="animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <FiSave /> Save Changes
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleProfileCancel}
                      className="px-6 py-2.5 rounded-xl font-medium text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all flex items-center gap-2"
                    >
                      <FiX /> Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ═══════════ CHANGE PASSWORD SECTION ═══════════ */}
          {activeSection === "password" && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FiShield className="text-orange-500" /> Change Password
                </h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  Ensure your account stays secure by using a strong password
                </p>
              </div>

              <form
                onSubmit={handlePasswordSave}
                className="max-w-lg space-y-5"
              >
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showCurrentPw ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                      placeholder="Min 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showNewPw ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>

                  {/* Strength Indicator */}
                  {passwordForm.newPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1.5 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              i <= pwStrength.level
                                ? pwStrength.color
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p
                        className={`text-xs font-medium ${
                          pwStrength.level <= 1
                            ? "text-red-500"
                            : pwStrength.level <= 2
                            ? "text-amber-500"
                            : pwStrength.level <= 3
                            ? "text-blue-500"
                            : "text-emerald-500"
                        }`}
                      >
                        {pwStrength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 transition-all ${
                      passwordForm.confirmPassword &&
                      passwordForm.confirmPassword !== passwordForm.newPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                        : passwordForm.confirmPassword &&
                          passwordForm.confirmPassword ===
                            passwordForm.newPassword
                        ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100"
                        : "border-gray-200 focus:border-orange-500 focus:ring-orange-100"
                    }`}
                    placeholder="Re-enter new password"
                  />
                  {passwordForm.confirmPassword &&
                    passwordForm.confirmPassword !==
                      passwordForm.newPassword && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <FiAlertCircle /> Passwords do not match
                      </p>
                    )}
                  {passwordForm.confirmPassword &&
                    passwordForm.confirmPassword ===
                      passwordForm.newPassword && (
                      <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                        <FiCheckCircle /> Passwords match
                      </p>
                    )}
                </div>

                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50 flex items-center gap-2 shadow-md shadow-orange-200"
                >
                  {passwordSaving ? (
                    <>
                      <FiLoader className="animate-spin" /> Updating...
                    </>
                  ) : (
                    <>
                      <FiLock /> Update Password
                    </>
                  )}
                </button>
              </form>

              {/* Security Tips */}
              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <h3 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                  <FiShield /> Security Tips
                </h3>
                <ul className="text-xs text-amber-600 space-y-1.5">
                  <li>• Use at least 6 characters with a mix of letters, numbers, and symbols</li>
                  <li>• Don't reuse passwords from other accounts</li>
                  <li>• Change your password regularly for better security</li>
                  <li>• Never share your password with anyone</li>
                </ul>
              </div>
            </div>
          )}

          {/* ═══════════ APP PREFERENCES SECTION ═══════════ */}
          {activeSection === "preferences" && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <RiSettings4Line className="text-orange-500" /> Application
                  Preferences
                </h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  Customize your application experience
                </p>
              </div>

              <div className="space-y-6 max-w-lg">
                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    <FiGlobe className="inline mr-1 text-orange-500" /> Currency
                  </label>
                  <select
                    name="currency"
                    value={appPrefs.currency}
                    onChange={handlePrefChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all bg-white"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    <FiGlobe className="inline mr-1 text-orange-500" /> Timezone
                  </label>
                  <select
                    name="timezone"
                    value={appPrefs.timezone}
                    onChange={handlePrefChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all bg-white"
                  >
                    <option value="Asia/Kolkata">India (IST) — UTC+5:30</option>
                    <option value="America/New_York">
                      US Eastern (EST) — UTC-5
                    </option>
                    <option value="America/Chicago">
                      US Central (CST) — UTC-6
                    </option>
                    <option value="America/Los_Angeles">
                      US Pacific (PST) — UTC-8
                    </option>
                    <option value="Europe/London">UK (GMT) — UTC+0</option>
                    <option value="Asia/Dubai">Dubai (GST) — UTC+4</option>
                  </select>
                </div>

                {/* Toggle: Notifications */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-500 p-2 rounded-lg">
                      <FiBell />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Push Notifications
                      </p>
                      <p className="text-xs text-gray-400">
                        Receive in-app notifications for new orders and queries
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="notifications"
                      checked={appPrefs.notifications}
                      onChange={handlePrefChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-orange-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                {/* Toggle: Email Alerts */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-violet-100 text-violet-500 p-2 rounded-lg">
                      <FiMail />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Email Alerts
                      </p>
                      <p className="text-xs text-gray-400">
                        Receive email notifications for important updates
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="emailAlerts"
                      checked={appPrefs.emailAlerts}
                      onChange={handlePrefChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-orange-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handlePrefSave}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 shadow-md shadow-orange-200"
                  >
                    <FiSave /> Save Preferences
                  </button>
                  <button
                    onClick={handlePrefReset}
                    className="px-6 py-2.5 rounded-xl font-medium text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all flex items-center gap-2"
                  >
                    <FiRefreshCw /> Reset to Defaults
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api";

export default function SignUp() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [adminExists, setAdminExists] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await API.get("/auth/check-admin");
        setAdminExists(res?.data?.adminExists || false);
      } catch (err) {
        console.error("Admin check failed:", err);
        setAdminExists(false);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  const validate = () => {
    let newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email format";
    if (!form.role) newErrors.role = "Please select role";
    if (!form.password) newErrors.password = "Password required";
    else if (form.password.length < 6) newErrors.password = "Password must be 6+ characters";
    if (!form.confirmPassword) newErrors.confirmPassword = "Confirm password required";
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await API.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        password: form.password,
      });

      alert("Account Created Successfully!");
      navigate("/signin");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf4e8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf4e8] px-4 py-8">
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-orange-600 mb-6 sm:mb-8">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full p-2 sm:p-3 border rounded-lg text-sm ${errors.name ? "border-red-500" : ""}`}
            />
            {errors.name && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full p-2 sm:p-3 border rounded-lg text-sm ${errors.email ? "border-red-500" : ""}`}
            />
            {errors.email && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <select
              name="role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className={`w-full p-2 sm:p-3 border rounded-lg text-sm ${errors.role ? "border-red-500" : ""}`}
            >
              <option value="">Select Role</option>
              {!adminExists && <option value="admin">Admin</option>}
              <option value="customer">Customer (Tiffin)</option>
              <option value="student">Student (PG Room)</option>
            </select>
            {errors.role && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.role}</p>}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`w-full p-2 sm:p-3 border rounded-lg text-sm ${errors.password ? "border-red-500" : ""}`}
            />
            {errors.password && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className={`w-full p-2 sm:p-3 border rounded-lg text-sm ${errors.confirmPassword ? "border-red-500" : ""}`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <button className="w-full bg-orange-600 text-white py-2 sm:py-3 rounded-lg hover:bg-orange-700 transition font-medium text-sm sm:text-base">
            Sign Up
          </button>
        </form>

        <p className="text-center mt-4 sm:mt-5 text-xs sm:text-sm">
          Already have account?{" "}
          <Link to="/signin" className="text-orange-600 font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
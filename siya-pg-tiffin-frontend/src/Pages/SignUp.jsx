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

  /* ================= CHECK ADMIN EXISTS ================= */
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await API.get("/auth/check-admin");
        setAdminExists(res.data.adminExists);
      } catch (err) {
        console.error("Admin check failed");
      }
    };
    checkAdmin();
  }, []);

  /* ================= INPUT CHANGE ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= VALIDATION ================= */
  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";

    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email format";

    if (!form.role) newErrors.role = "Please select role";

    if (!form.password) newErrors.password = "Password required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be 6+ characters";

    if (!form.confirmPassword)
      newErrors.confirmPassword = "Confirm password required";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await API.post("/auth/register", form);
      alert("Account Created!");
      navigate("/signin");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf4e8]">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-[420px]">
        <h2 className="text-3xl font-bold text-center text-orange-600 mb-8">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NAME */}
          <div>
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <input
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* ROLE SELECT */}
          <div>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${
                errors.role ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Role</option>

              {/* SHOW ADMIN ONLY IF NOT EXISTS */}
              {!adminExists && <option value="admin">Admin</option>}

              <option value="customer">Customer (Tiffin)</option>
              <option value="student">Student (PG Room)</option>
            </select>

            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${
                errors.password ? "border-red-500" : ""
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition">
            Sign Up
          </button>
        </form>

        <p className="text-center mt-5">
          Already have account?{" "}
          <Link to="/signin" className="text-orange-600 font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
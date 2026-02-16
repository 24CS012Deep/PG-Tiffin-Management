import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../utils/api";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || !confirmPassword)
      return setError("All fields are required");

    if (password.length < 6)
      return setError("Password must be at least 6 characters");

    if (password !== confirmPassword)
      return setError("Passwords do not match");

    try {
      setLoading(true);

      const res = await API.put(`/auth/reset-password/${token}`, {
        password,
      });

      setSuccess(res.data.message);

      setTimeout(() => navigate("/signin"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#efe3d1]">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-[400px]">

        {/* TITLE */}
        <h2 className="text-3xl font-bold text-center text-orange-500 mb-6">
          Reset Password
        </h2>

        {/* ALERTS */}
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-600 p-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* PASSWORD */}
          <div className="relative">
            <FiLock className="absolute top-3 left-3 text-gray-400" />

            <input
              type={showPass ? "text" : "password"}
              placeholder="New Password"
              className="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <span
              className="absolute right-3 top-3 cursor-pointer text-gray-400"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="relative">
            <FiLock className="absolute top-3 left-3 text-gray-400" />

            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <span
              className="absolute right-3 top-3 cursor-pointer text-gray-400"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          {/* BUTTON */}
          <button
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {/* BACK LINK */}
        <p className="text-center mt-6 text-sm">
          <Link to="/signin" className="text-orange-500 font-semibold">
            ← Back to Sign In
          </Link>
        </p>

      </div>
    </div>
  );
};

export default ResetPassword;

import React, { useState } from 'react';
import API from '../utils/api';
import { FiX, FiAlertTriangle, FiKey, FiCheckCircle } from 'react-icons/fi';

const OTPVerificationModal = ({ order, onClose, onSuccess }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const role = user.role || 'customer';
      const endpoint = `/${role}/orders/verify-otp`;

      const response = await API.post(endpoint, {
        orderId: order._id,
        otp
      });

      onSuccess(response.data.order);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const isOtpExpired = order.otpExpiresAt && new Date() > new Date(order.otpExpiresAt);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-300 relative z-10 border border-white/20">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C42] p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all backdrop-blur-sm"
          >
            <FiX size={20} />
          </button>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
            <FiKey size={24} />
          </div>
          <h3 className="text-2xl font-black tracking-tight uppercase">Verify Delivery</h3>
          <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">Order #{order._id.slice(-6)}</p>
        </div>

        <div className="p-8">
          {/* Status Message */}
          {error ? (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-500">
              <FiAlertTriangle className="flex-shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-wider leading-tight">{error}</p>
            </div>
          ) : isOtpExpired ? (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3 text-orange-500">
              <FiAlertTriangle className="flex-shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-wider leading-tight">OTP Expired. Verification may fail.</p>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer</p>
              <p className="text-sm font-black text-slate-800 uppercase">{order.customer?.name || "Guest"}</p>
            </div>
          )}

          {/* OTP Input Form */}
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="text-center">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                maxLength="6"
                placeholder="••••••"
                value={otp}
                onChange={handleOtpChange}
                disabled={loading}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 text-center text-3xl font-black tracking-[0.4em] text-slate-800 focus:border-[#FF6B00] focus:bg-white outline-none transition-all placeholder:text-slate-200"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#FF6B00] hover:shadow-xl hover:shadow-orange-100 transition-all disabled:opacity-50 disabled:hover:bg-slate-900 active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? "Verifying..." : <><FiCheckCircle /> Verify & Complete</>}
            </button>
          </form>

          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-6 text-center">
            Valid share with delivery staff only
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationModal;

import React, { useState } from 'react';
import API from '../utils/api';
import { FiX, FiAlertTriangle } from 'react-icons/fi';

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
      // ✅ FIX: Was hardcoded to /customer/orders/verify-otp — students could never verify OTP.
      // Now detects the logged-in user's role and calls the correct endpoint.
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


  // Check if OTP has expired (warning only, backend allows it now)
  const isOtpExpired = order.otpExpiresAt && new Date() > new Date(order.otpExpiresAt);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        {/* Header */}
        <div className="bg-orange-500 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h3 className="text-lg font-bold">Verify Delivery OTP</h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-orange-600 rounded-lg p-1 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Plan:</strong> {order.tiffinPlan?.name}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Delivery Status:</strong>{' '}
              <span className="text-green-600 font-semibold">Delivered</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Expired OTP Message */}
          {isOtpExpired && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <FiAlertTriangle className="text-yellow-600 mt-0.5" />
              <p className="text-yellow-700 text-sm">
                <strong>OTP Expired:</strong> You can still try to verify it, but it's recommended to contact support if it fails.
              </p>
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                value={otp}
                onChange={handleOtpChange}
                disabled={loading}
                className="w-full px-4 py-2 text-center text-2xl font-bold tracking-widest border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500"
                autoFocus
              />
              <p className="text-gray-500 text-xs mt-1">
                Entered: {otp.length}/6 digits
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
          >
            Cancel
          </button>

          {/* Info */}
          <p className="text-gray-500 text-xs mt-3 text-center">
            OTP is valid for 15 minutes from delivery
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationModal;

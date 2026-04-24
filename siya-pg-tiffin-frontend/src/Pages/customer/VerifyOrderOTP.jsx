import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const VerifyOrderOTP = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [order, setOrder] = useState(null);

  // Handle OTP input (only numbers, max 6 digits)
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/customer/orders/verify-otp', {
        orderId,
        otp
      });

      setSuccess(response.data.message);
      setOrder(response.data.order);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/customer/orders');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-orange-500 text-white p-6 rounded-t-lg text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold">Order Delivered!</h2>
          <p className="text-orange-100 mt-2">Verify delivery by entering OTP</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm font-semibold">✅ {success}</p>
              <p className="text-green-600 text-xs mt-1">Redirecting to orders...</p>
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-3">
                Enter 6-Digit OTP
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength="6"
                  placeholder="000000"
                  value={otp}
                  onChange={handleOtpChange}
                  className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 transition"
                  disabled={loading || success}
                  autoFocus
                />
                <span className="absolute right-4 top-3 text-gray-400">
                  {otp.length}/6
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                OTP was sent to your registered email address
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success || otp.length !== 6}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>ℹ️ Info:</strong> OTP is valid for 15 minutes. If you don't have the OTP, please contact the delivery personnel.
            </p>
          </div>

          {/* Back to Orders Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/customer/orders')}
              className="text-orange-500 hover:text-orange-600 text-sm font-semibold underline"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOrderOTP;

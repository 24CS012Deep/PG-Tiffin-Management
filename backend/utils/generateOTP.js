/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP code
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Get OTP expiration time (15 minutes from now)
 * @returns {Date} Expiration date and time
 */
export const getOTPExpirationTime = () => {
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 15); // OTP expires in 15 minutes
  return expirationTime;
};

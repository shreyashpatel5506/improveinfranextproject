const otpStore = new Map();
/*
  key   → email
  value → { otp, expiresAt }
*/

export const saveOtp = (email, otp) => {
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
};

export const verifyOtp = (email, otp) => {
  const data = otpStore.get(email);

  if (!data) return false;

  if (Date.now() > data.expiresAt) {
    otpStore.delete(email);
    return false;
  }

  if (data.otp !== otp) return false;

  otpStore.delete(email); // OTP used once
  return true;
};

globalThis.otpStore = globalThis.otpStore || new Map();

const otpStore = globalThis.otpStore;

export function saveOtp(email, otp) {
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
}

export function verifyOtp(email, userOtp) {
  const record = otpStore.get(email);
  if (!record) return false;

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return false;
  }

  if (record.otp !== String(userOtp)) return false;

  otpStore.delete(email);
  return true;
}


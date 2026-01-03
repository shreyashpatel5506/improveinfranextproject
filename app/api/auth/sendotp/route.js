import { saveOtp } from "@/app/lib/otpstore";

export  async function POST(params) {
    try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required", success: false });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(422).json({ message: "Invalid email format", success: false });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.BREVO_SENDER,
          name: "Improve Infra For Civilians",
        },
        to: [{ email }],
        subject: "🔐 Your OTP Code",
        htmlContent: `
          <h2>Your OTP is ${otp}</h2>
          <p>This OTP is valid for 10 minutes.</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    saveOtp(email,otp);
    return res.status(200).json({ message: "OTP sent", success: true });

  } catch (error) {
    console.error("Brevo API OTP error:", error?.response?.data || error.message);
    return res.status(500).json({ message: "Failed to send OTP", success: false });
  }
}
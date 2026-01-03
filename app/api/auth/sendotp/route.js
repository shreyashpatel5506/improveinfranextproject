import { NextResponse } from "next/server";
import axios from "axios";
import { saveOtp } from "@/app/lib/otpstore";
export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { email } = await req.json();

    /* ---------------- VALIDATION ---------------- */
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 422 }
      );
    }

    /* ---------------- OTP GENERATION ---------------- */
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    /* ---------------- SEND OTP (BREVO) ---------------- */
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

    /* ---------------- SAVE OTP (TEMP) ---------------- */
    saveOtp(email, otp);

    return NextResponse.json(
      { success: true, message: "OTP sent successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error(
      "Brevo API OTP error:",
      error?.response?.data || error.message
    );

    return NextResponse.json(
      { success: false, message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}

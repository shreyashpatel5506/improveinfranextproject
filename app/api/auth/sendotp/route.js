import { NextResponse } from "next/server";
import connectMongo from "@/app/db";
import Otp from "@/models/Otp.model";
import axios from "axios";

export async function POST(req) {
  try {
    await connectMongo();

    const { email } = await req.json();

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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // remove old OTP if exists
    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    });

    // SEND EMAIL (BREVO)
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.BREVO_SENDER,
          name: "Improve Infra For Civilians",
        },
        to: [{ email }],
        subject: "🔐 Your OTP Code",
        htmlContent: `<h2>Your OTP is ${otp}</h2><p>Valid for 10 minutes</p>`,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(
      { success: true, message: "OTP sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}

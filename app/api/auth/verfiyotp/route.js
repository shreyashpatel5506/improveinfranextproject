import { NextResponse } from "next/server";
import { verifyOtp } from "@/app/lib/otpstore";
export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required", success: false },
        { status: 400 }
      );
    }

    const isValid = verifyOtp(email, otp);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid or expired OTP", success: false },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Email verified successfully",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "OTP verification failed", success: false },
      { status: 500 }
    );
  }
}

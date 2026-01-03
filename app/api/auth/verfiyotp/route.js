import { NextResponse } from "next/server";
import connectMongo from "@/app/db";
import Otp from "@/models/Otp.model";

export async function POST(req) {
  try {
    await connectMongo();

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP required" },
        { status: 400 }
      );
    }

    const record = await Otp.findOne({ email, otp });

    if (!record) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // OTP valid → delete
    await Otp.deleteOne({ _id: record._id });

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "OTP verification failed" },
      { status: 500 }
    );
  }
}

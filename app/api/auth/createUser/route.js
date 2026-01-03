import connectMongo from "@/app/db";
import User from "@/models/User";
import Otp from "@/models/Otp.model";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectMongo();

    const { email, password, userName } = await req.json();

    /* ---------------- VALIDATION ---------------- */
    if (!email || !password || !userName) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    /* ---------------- CHECK EMAIL VERIFIED ---------------- */
    const otpExists = await Otp.findOne({ email });

    if (otpExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Email not verified. Please verify OTP first",
        },
        { status: 403 }
      );
    }

    /* ---------------- CHECK USER EXISTS ---------------- */
    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 }
      );
    }

    /* ---------------- HASH PASSWORD ---------------- */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* ---------------- CREATE USER ---------------- */
    const user = await User.create({
      email,
      userName,
      password: hashedPassword,
      emailVerified: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        userId: user._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "User creation failed" },
      { status: 500 }
    );
  }
}

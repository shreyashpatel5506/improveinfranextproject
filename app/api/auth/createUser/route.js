import connectMongo from "@/app/db";
import User from "@/app/model/user.model";
import Otp from "@/app/model/otp.model";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

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
    const token = jwt.sign(
      {
        id: user._id,
        role: "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    /* ===============================
           Set Cookie (Secure)
        ================================ */

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user,
        token,
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

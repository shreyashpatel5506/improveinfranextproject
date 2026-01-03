import connectMongo from "@/app/db";
import User from "@/app/model/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();

    const { email, password } = await req.json();

    /* ===============================
       Validation
    ================================ */
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required", success: false },
        { status: 400 }
      );
    }

    /* ===============================
       Find User
    ================================ */
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials", success: false },
        { status: 401 }
      );
    }

    /* ===============================
       Compare Password
    ================================ */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials", success: false },
        { status: 401 }
      );
    }

    /* ===============================
       Generate JWT
       role = user (IMPORTANT for middleware)
    ================================ */
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
    const response = NextResponse.json(
      {
        message: "Login successful",
        success: true,
        token, // optional (frontend needs it)
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Login failed", success: false },
      { status: 500 }
    );
  }
}

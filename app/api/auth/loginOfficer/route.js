 import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Officer from "@/app/model/Officer.model";
import connectMongo from "@/app/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();

    const { email, password} = await req.json();

    /* ===============================
       Validation
    ================================ */
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    /* ===============================
       Find Officer
    ================================ */
    const officer = await Officer.findOne({ email });
    if (!officer) {
      return NextResponse.json(
        {
          success: false,
          message: "No officer found with this email",
        },
        { status: 404 }
      );
    }

    /* ===============================
       Verify Password
    ================================ */
    const isValidPassword = await bcrypt.compare(
      password,
      officer.password
    );

    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid password",
        },
        { status: 401 }
      );
    }

    /* ===============================
       Generate JWT (role = officer)
    ================================ */
    const token = jwt.sign(
      {
        id: officer._id,
        role: "officer",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    /* ===============================
       Set Cookie
    ================================ */
    const response = NextResponse.json(
      {
        success: true,
        message: "Officer login successful",
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
    console.error("Officer login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Officer login failed",
      },
      { status: 500 }
    );
  }
}

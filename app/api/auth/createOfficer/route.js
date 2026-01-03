import Officer from "@/app/model/Officer.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectMongo from "@/app/db";
import { NextResponse } from "next/server";

const jwtSecret = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    await connectMongo();

    const { email, userName, password } = await req.json();

    /* -------- validation -------- */
    if (!email || !userName || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const existingOfficer = await Officer.findOne({ email });
    if (existingOfficer) {
      return NextResponse.json(
        {
          success: false,
          message: "Officer already exists with this email",
        },
        { status: 409 }
      );
    }

    /* -------- hash password -------- */
    const hashedPassword = await bcrypt.hash(String(password), 10);

    const newOfficer = await Officer.create({
      email,
      userName,
      password: hashedPassword,
    });

    /* -------- generate JWT -------- */
    const token = jwt.sign({ id: newOfficer._id, role: "officer" }, jwtSecret, {
      expiresIn: "7d",
    });

    /* -------- set cookie -------- */
    const response = NextResponse.json(
      {
        success: true,
        message: "Officer created successfully",
        officer: {
          id: newOfficer._id,
          email: newOfficer.email,
          userName: newOfficer.userName,
          role: "officer",
        },
        token, // optional: frontend ke liye
      },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days (seconds)
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Officer creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create officer" },
      { status: 500 }
    );
  }
}

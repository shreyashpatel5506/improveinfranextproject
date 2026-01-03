import connectMongo from "@/app/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectMongo();

    const { email, password,userName } = await req.json();

    if (!email || !password || !userName) {
      return NextResponse.json(
        { message: "Email and password required", success: false },
        { status: 400 }
      );
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json(
        { message: "User already exists", success: false },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      userName,
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        success: true,
        userId: user._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "User creation failed", success: false },
      { status: 500 }
    );
  }
}

import Officer from "@/app/model/Officer.model";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import connectMongo from "@/app/db";
import { NextResponse } from "next/server";

const env = process.env.env
const jwtSecret = process.env.JWTSECRET

export const generateToken = (officerId, res) => {
    const token = jwt.sign({ officerId, role: "officer" }, jwtSecret, {
        expiresIn: "7d",
    });

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: env !== "development",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return token;
};

export async function POST(req, NextResponse) {
    try {
        await connectMongo();
        const { email, userName, password } =await req.body;

        const exitinguser = await Officer.findOne({ email })
        if (exitinguser) {
            return NextResponse.json({ success: false, message: "user is already exiting by this email id" }, { status: 203 })
        }

        const hashedpassword = await bcrypt.hash(password, 10)
        const newOfficer = new Officer({ email, password: hashedpassword, userName })

        await newOfficer.save()
        const token = generateToken(newOfficer._id, NextResponse)
        return NextResponse.json(
            {
                message: "Officer created ",
                success: true,
                Officer: newOfficer,
                token
            }, { status: 200 }
        )
    } catch (error) {
        console.log("error fetchng in creation")
        return NextResponse.json(
            {
                success: false,
                message: "error to create a officer "
            }, { status: 500 }
        )
    }
}
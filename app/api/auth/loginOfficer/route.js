import bcrypt from "bcryptjs"
import Officer from "@/app/model/Officer.model"
import connectMongo from "@/app/db"
import { NextResponse } from "next/server";

export async function GET(req, res) {
    try {
        await connectMongo();

        const { email, password } = req.body;
        const officer = await Officer.findOne({ email });
        if (!officer) {
            return NextResponse.json({
                success: true,
                message: "Error no officer found by this email id "
            }, { status: 404 })
        }
    } catch (error) {

    }
} 
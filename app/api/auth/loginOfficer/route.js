import bcrypt from "bcryptjs"
import Officer from "@/app/model/Officer.model"
import connectMongo from "@/app/db"
import { NextResponse } from "next/server";
import { generateToken } from "../createOfficer/route";

export async function GET(req, res) {
    try {
        await connectMongo();

        const { email, password } = req.body;
        const officer = await Officer.findOne({ email });
        if (!officer) {
            return NextResponse.json({
                success: false,
                message: "Error no officer found by this email id "
            }, { status: 404 })
        }

        const validPassword = await bcrypt.compare(password, officer.password)
        if (!validPassword) {
            return NextResponse.json({
                success: false,
                message: "Password is not valid"
            }, { status: 403 })
        }

        const token = generateToken(officer._id, res);

        return
    } catch (error) {

    }
} 
import connectMongo from "@/app/db";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        await connectMongo();

        const formData = await req.formData;
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            message: "Error when try to create a post",
            success: false
        }, {
            status: 500
        })
    }
}
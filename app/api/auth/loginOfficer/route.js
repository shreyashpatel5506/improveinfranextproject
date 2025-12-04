import bcrypt from "bcryptjs"
import Officer from "@/app/model/Officer.model"
import connectMongo from "@/app/db"

export async function GET(req, res) {
    try {
        await connectMongo();
    } catch (error) {

    }
} 
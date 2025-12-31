import connectMongo from "@/app/db";
import Post from "@/models/Post";
import { NextResponse } from "next/server";

/* ===============================
   GET → Fetch All Posts
================================ */
export async function GET() {
    try {
        await connectMongo();

        const posts = await Post.find()
            .sort({ createdAt: -1 }); // latest first

        return NextResponse.json(
            {
                success: true,
                count: posts.length,
                posts,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: "Error fetching posts",
            },
            { status: 500 }
        );
    }
}

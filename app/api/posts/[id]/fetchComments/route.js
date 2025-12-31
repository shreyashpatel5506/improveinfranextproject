import connectMongo from "@/app/db";
import Post from "@/models/Post";
import { NextResponse } from "next/server";

/* ===============================
   GET → Fetch Comments
================================ */
export async function GET(req, { params }) {
    try {
        await connectMongo();

        const { id } = params;

        const post = await Post.findById(id).select("comments commentsCount");

        if (!post) {
            return NextResponse.json(
                { success: false, message: "Post not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                commentsCount: post.commentsCount,
                comments: post.comments,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, message: "Error fetching comments" },
            { status: 500 }
        );
    }
}

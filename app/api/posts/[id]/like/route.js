import connectMongo from "@/app/db";
import Post from "@/models/Post";
import { NextResponse } from "next/server";

/* ===============================
   POST → Like / Unlike Post
================================ */
export async function POST(req, { params }) {
    try {
        await connectMongo();

        const { id } = params;
        const { action } = await req.json(); // "like" or "unlike"

        const post = await Post.findById(id);

        if (!post) {
            return NextResponse.json(
                { success: false, message: "Post not found" },
                { status: 404 }
            );
        }

        if (action === "like") {
            post.likesCount += 1;
        } else if (action === "unlike" && post.likesCount > 0) {
            post.likesCount -= 1;
        }

        await post.save();

        return NextResponse.json(
            {
                success: true,
                likesCount: post.likesCount,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, message: "Error liking post" },
            { status: 500 }
        );
    }
}

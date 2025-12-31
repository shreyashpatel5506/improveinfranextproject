import connectMongo from "@/app/db";
import Post from "@/models/Post";
import { NextResponse } from "next/server";

/* ===============================
   GET → Fetch Single Post
================================ */
export async function GET(req, { params }) {
    try {
        await connectMongo();

        const { id } = params;

        const post = await Post.findById(id);

        if (!post) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Post not found",
                },
                { status: 404 }
            );
        }

        /* ===============================
           Increase View Count
        ================================ */
        post.views += 1;
        await post.save();

        return NextResponse.json(
            {
                success: true,
                post,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: "Error fetching post",
            },
            { status: 500 }
        );
    }
}

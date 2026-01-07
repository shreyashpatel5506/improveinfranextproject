import connectMongo from "@/app/db";
import Post from "@/app/model/post.model";
import { NextResponse } from "next/server";

/* ===============================
   GET → Fetch Single Post
================================ */
export async function GET(req) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

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

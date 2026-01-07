import connectMongo from "@/app/db";
import Post from "@/app/model/post.model";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();

    // Get ID from ?id=... and text from JSON body
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const { text } = await req.json();

    if (!id || !text) {
      return NextResponse.json(
        { success: false, message: "Missing ID or text" },
        { status: 400 }
      );
    }

    // Atomic update: Push comment and increment count
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        $push: { comments: { text } },
        $inc: { commentsCount: 1 },
      },
      { new: true }
    );

    return NextResponse.json(
      { success: true, post: updatedPost },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error adding comment" },
      { status: 500 }
    );
  }
}

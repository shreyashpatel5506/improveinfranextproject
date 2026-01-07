import connectMongo from "@/app/db";
import Post from "@/app/model/post.model"; // Ensure path is correct
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();

    // 1. Extract ID from URL (?id=...)
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // 2. Extract Action from Body
    const { action } = await req.json(); // "like" or "unlike"

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    // 3. Determine increment value
    // If like: +1, if unlike: -1
    const incValue = action === "like" ? 1 : -1;

    // 4. Update the document atomically
    // We add a check for 'unlike' so it doesn't go below 0
    const query = { _id: id };
    if (action === "unlike") {
      query.likesCount = { $gt: 0 }; // Only unlike if count is > 0
    }

    const updatedPost = await Post.findOneAndUpdate(
      query,
      { $inc: { likesCount: incValue } },
      { new: true }
    );

    if (!updatedPost) {
      return NextResponse.json(
        { success: false, message: "Post not found or count already at 0" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        likesCount: updatedPost.likesCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Like Error:", error);
    return NextResponse.json(
      { success: false, message: "Error updating likes" },
      { status: 500 }
    );
  }
}

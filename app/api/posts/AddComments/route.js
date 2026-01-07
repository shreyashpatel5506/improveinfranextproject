import connectMongo from "@/app/db";
import Post from "@/app/model/post.model";
import User from "@/app/model/user.model";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("id");

    // Testing ke liye body mein sirf 'text' aur 'userId' bhej rahe hain
    const { text, userId } = await req.json();

    if (!postId || !text || !userId) {
      return NextResponse.json(
        { success: false, message: "Post ID, text, and userId are required" },
        { status: 400 }
      );
    }

    // 1. Database se actual User details fetch karein (Security Step)
    const userFromDB = await User.findById(userId).select("userName email");

    if (!userFromDB) {
      return NextResponse.json(
        { success: false, message: "Invalid User ID. User not found." },
        { status: 404 }
      );
    }

    /* ============================================================
       2. Post update karein:
       User object ke andar database se aayi hui real details save hogi
    ============================================================ */
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            text: text,
            user: {
              _id: userFromDB._id,
              userName: userFromDB.userName,
              email: userFromDB.email,
            },
          },
        },
        $inc: { commentsCount: 1 },
      },
      { new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Comment added successfully",
        post: updatedPost,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add Comment Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

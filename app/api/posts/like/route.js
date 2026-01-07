import connectMongo from "@/app/db";
import Post from "@/app/model/post.model";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id"); // Post ID
    const { userId } = await req.json(); // User ID (LocalStorage/Session se)

    if (!id || !userId) {
      return NextResponse.json(
        { success: false, message: "ID or UserID missing" },
        { status: 400 }
      );
    }

    // 1. Post fetch karein check karne ke liye ki user ne pehle like kiya hai ya nahi
    const post = await Post.findById(id);

    // 🛡️ Yeh line ensure karegi ki agar likes undefined hai toh wo crash na ho
    const currentLikes = post.likes || [];
    const isLiked = currentLikes.some(
      (uid) => uid.toString() === userId.toString()
    );

    let update;
    if (isLiked) {
      update = {
        $pull: { likes: userId },
        $inc: { likesCount: -1 },
      };
    } else {
      update = {
        $addToSet: { likes: userId },
        $inc: { likesCount: 1 },
      };
    }

    const updatedPost = await Post.findByIdAndUpdate(id, update, { new: true });

    return NextResponse.json(
      {
        success: true,
        message: isLiked ? "Unliked successfully" : "Liked successfully",
        likesCount: updatedPost.likesCount,
        isLiked: !isLiked, // Frontend icons change karne ke liye
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Toggle Like Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

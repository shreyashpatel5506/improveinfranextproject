import connectMongo from "@/app/db";
import Post from "@/app/model/Post.model";
import { NextResponse } from "next/server";

export async function PATCH(req) {
  try {
    await connectMongo();

    const role = req.headers.get("role");
    if (role !== "officer") {
      return NextResponse.json(
        { success: false, message: "Officers only" },
        { status: 403 }
      );
    }

    const { postId, priority } = await req.json();

    if (!postId || !priority) {
      return NextResponse.json(
        { success: false, message: "postId and priority required" },
        { status: 400 }
      );
    }

    const allowedPriority = ["Low", "Medium", "High", "Critical"];
    if (!allowedPriority.includes(priority)) {
      return NextResponse.json(
        { success: false, message: "Invalid priority value" },
        { status: 422 }
      );
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      { priority },
      { new: true }
    );

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Priority updated successfully",
      data: post,
    });

  } catch (error) {
    console.error("Update priority error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

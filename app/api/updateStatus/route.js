import connectMongo from "@/app/db";
import postModel from "@/app/model/post.model";
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

    const { postId, status } = await req.json();

    if (!postId || !status) {
      return NextResponse.json(
        { success: false, message: "postId and status required" },
        { status: 400 }
      );
    }

    const allowedStatus = ["Pending", "In Progress", "Resolved"];
    if (!allowedStatus.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status value" },
        { status: 422 }
      );
    }

    const post = await postModel.findByIdAndUpdate(
      postId,
      { status },
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
      message: "Status updated successfully",
      data: post,
    });

  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

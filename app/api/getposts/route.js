import connectMongo from "@/app/db";
import Post from "@/models/Post";
import { NextResponse } from "next/server";

/* ===============================
   GET → Fetch Posts (Simple Pagination)
================================ */
export async function GET(req) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    const skip = (page - 1) * limit;

    const totalPosts = await Post.countDocuments();

    const posts = await Post.find()
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        success: true,
        totalPosts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        count: posts.length,
        posts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch posts error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching posts" },
      { status: 500 }
    );
  }
}

import connectMongo from "@/app/db";
import Post from "@/app/model/post.model";
import { uploadToCloudinary } from "@/app/lib/cloudinary";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();
    const formData = await req.formData();

    const title = formData.get("title");
    const description = formData.get("description");
    const department = formData.get("department");
    const category = formData.get("category");
    const location = formData.get("location");
    const imageFile = formData.get("image");
    const videoFile = formData.get("video");

    // Basic Validation
    if (!title || !description || !department || !location) {
      return NextResponse.json(
        { message: "Required fields missing", success: false },
        { status: 400 }
      );
    }

    // Ensure at least one media type is present
    if (!imageFile && !videoFile) {
      return NextResponse.json(
        { message: "Image or video is required", success: false },
        { status: 400 }
      );
    }

    /* ===============================
        Handle Independent Uploads
    ================================ */
    let imageUrl = "";
    let videoUrl = "";

    // 1. Process Image if it exists
    if (imageFile && imageFile.size > 0) {
      const imgBuffer = Buffer.from(await imageFile.arrayBuffer());
      const imgResult = await uploadToCloudinary(imgBuffer);
      imageUrl = imgResult.url;
    }

    // 2. Process Video if it exists
    if (videoFile && videoFile.size > 0) {
      const vidBuffer = Buffer.from(await videoFile.arrayBuffer());
      const vidResult = await uploadToCloudinary(vidBuffer);
      videoUrl = vidResult.url;
    }

    /* ===============================
        Create Post Document
    ================================ */
    const post = await Post.create({
      title,
      description,
      department,
      category,
      location,
      imageUrl, // Saved from the independent check above
      videoUrl, // Saved from the independent check above
    });

    return NextResponse.json(
      {
        message: "Post created successfully",
        success: true,
        post,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      {
        message: error.message || "Error when trying to create a post",
        success: false,
      },
      { status: 500 }
    );
  }
}

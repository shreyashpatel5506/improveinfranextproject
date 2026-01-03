import connectMongo from "@/app/db";
import Post from "@/app/model/post.model";
import { uploadToCloudinary } from "@/config/cloudinary";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/* ===============================
   POST → Create New Post
================================ */
export async function POST(req) {
  try {
    await connectMongo();

    const formData = await req.formData();

    /* ===============================
           Extract Fields
        ================================ */
    const title = formData.get("title");
    const description = formData.get("description");
    const department = formData.get("department");
    const category = formData.get("category");
    const location = formData.get("location");
    const imageFile = formData.get("image");
    const videoFile = formData.get("video");

    /* ===============================
           Validation
        ================================ */
    if (!title || !description || !department || !location) {
      return NextResponse.json(
        { message: "Required fields missing", success: false },
        { status: 400 }
      );
    }

    if (!imageFile && !videoFile) {
      return NextResponse.json(
        { message: "Image or video is required", success: false },
        { status: 400 }
      );
    }

    /* ===============================
           Save File Temporarily
        ================================ */
    let mediaResult = null;

    if (imageFile || videoFile) {
      const file = imageFile || videoFile;
      const buffer = Buffer.from(await file.arrayBuffer());

      const tempDir = path.join(process.cwd(), "public/temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      const filePath = path.join(tempDir, file.name);
      fs.writeFileSync(filePath, buffer);

      /* ===============================
               Upload to Cloudinary
            ================================ */
      mediaResult = await uploadToCloudinary(filePath);
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
      imageUrl: mediaResult?.resource_type === "image" ? mediaResult.url : "",
      videoUrl: mediaResult?.resource_type === "video" ? mediaResult.url : "",
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
    console.error(error);
    return NextResponse.json(
      {
        message: "Error when trying to create a post",
        success: false,
      },
      { status: 500 }
    );
  }
}

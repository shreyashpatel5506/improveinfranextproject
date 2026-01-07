import connectMongo from "@/app/db";
import Post from "@/app/model/post.model";
import User from "@/app/model/user.model"; // 👈 User model import zaroori hai
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

    // 1. Frontend (LocalStorage) se bheji gayi userId nikalna
    const userId = formData.get("userId");

    // Validation
    if (!title || !description || !department || !location || !userId) {
      return NextResponse.json(
        {
          message: "Required fields (including userId) missing",
          success: false,
        },
        { status: 400 }
      );
    }

    // 2. Database se User fetch karna taaki uska actual data save ho sake
    const userFromDB = await User.findById(userId).select("userName email");
    if (!userFromDB) {
      return NextResponse.json(
        { message: "Invalid User ID. Post cannot be created.", success: false },
        { status: 404 }
      );
    }

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

    if (imageFile && imageFile.size > 0) {
      const imgBuffer = Buffer.from(await imageFile.arrayBuffer());
      const imgResult = await uploadToCloudinary(imgBuffer);
      imageUrl = imgResult.url;
    }

    if (videoFile && videoFile.size > 0) {
      const vidBuffer = Buffer.from(await videoFile.arrayBuffer());
      const vidResult = await uploadToCloudinary(vidBuffer);
      videoUrl = vidResult.url;
    }

    /* ===============================
        Create Post Document with createdUser
    ================================ */
    const post = await Post.create({
      title,
      description,
      department,
      category,
      location,
      imageUrl,
      videoUrl,
      // 3. Post create karte waqt user details embed karna
      createdUser: {
        _id: userFromDB._id,
        userName: userFromDB.userName,
        email: userFromDB.email,
      },
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

export async function GET(req) {
  try {
    await connectMongo();

    // Use searchParams because your URL has ?id=
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Post ID is required" },
        { status: 400 }
      );
    }

    // Only select the comments and the count to keep the response light
    const post = await Post.findById(id).select("comments commentsCount");

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        commentsCount: post.commentsCount,
        comments: post.comments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Error fetching comments" },
      { status: 500 }
    );
  }
}

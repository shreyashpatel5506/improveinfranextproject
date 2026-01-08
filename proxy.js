import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(request) {
  console.log("🔥 Auth middleware running...");

  const url = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;

  /* -------------------- TOKEN CHECK -------------------- */
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Token missing" },
      { status: 401 }
    );
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }

  /*
    decoded payload example:
    {
      id: "mongoId",
      role: "officer" | "user"
    }
  */

  /* -------------------- ROUTE RULES -------------------- */

  /** 🔒 Officer only routes */
  const officerOnlyRoutes = [
    "/api/post/update",
    "/api/updatePriority",
    "/api/updateStatus",
  ];

  /** 👤 User only routes */
  const userOnlyRoutes = [
    "/api/createPost",
    "/api/posts/AddComments",
    "/api/posts/fetchComments",
    "/api/posts/like",
    "/api/getsinglepost",
  ];

  /* -------------------- ROLE CHECK -------------------- */

  if (officerOnlyRoutes.some((route) => url.startsWith(route))) {
    if (decoded.role !== "officer") {
      return NextResponse.json(
        { success: false, message: "Officers only" },
        { status: 403 }
      );
    }
  }

  if (userOnlyRoutes.some((route) => url.startsWith(route))) {
    if (decoded.role !== "user") {
      return NextResponse.json(
        { success: false, message: "Users only" },
        { status: 403 }
      );
    }
  }

  /* -------------------- PASS DATA TO API -------------------- */

  const newHeaders = new Headers(request.headers);
  newHeaders.set("userId", decoded.id);
  newHeaders.set("role", decoded.role);

  return NextResponse.next({
    request: {
      headers: newHeaders,
    },
  });
}

/* -------------------- MATCHER -------------------- */

export const config = {
  matcher: [
    "/api/post/:path*",
    "/api/comment/:path*",
    "/api/like/:path*",
    "/api/user/:path*",
    "/api/:path*",
  ],
};

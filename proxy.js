import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request) {
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
    "/api/post/create",
    "/api/post/update",
    "/api/post/delete",
    "/api/post/changeStatus",
    "/api/post/setPriority"
  ];

  /** 👤 User only routes */
  const userOnlyRoutes = [
    "/api/post/create",
    "/api/comment/add",
    "/api/comment/delete",
    "/api/like/toggle",
    "/api/user/profile"
  ];

  /* -------------------- ROLE CHECK -------------------- */

  if (officerOnlyRoutes.some(route => url.startsWith(route))) {
    if (decoded.role !== "officer") {
      return NextResponse.json(
        { success: false, message: "Officers only" },
        { status: 403 }
      );
    }
  }

  if (userOnlyRoutes.some(route => url.startsWith(route))) {
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
    "/api/user/:path*"
  ],
};

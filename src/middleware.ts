import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("admin_session");

  if (request.nextUrl.pathname === "/admin" && !session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  
  if (request.nextUrl.pathname === "/admin/login" && session) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};

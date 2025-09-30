import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // kalau akses dashboard tapi belum login → redirect ke /login
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // kalau sudah login & akses /login → redirect ke dashboard
  if (token && request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// aktifkan middleware hanya untuk route tertentu
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};

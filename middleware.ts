// middleware.tsx
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Ambil token dari cookie (Wajib untuk Middleware)
    const token = request.cookies.get("sanctum-token")?.value;
    const loginPath = "/login";
    const dashboardPath = "/dashboard";

    // 1. Logika Jika Sudah Login (Token Ada)
    // Jika token ada DAN user mencoba mengakses halaman login/register:
    if (token && request.nextUrl.pathname === loginPath) {
        // Redirect ke dashboard
        return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // 2. Logika Jika Belum Login (Token Tidak Ada)
    // Jika user mencoba mengakses halaman dashboard/rute terproteksi, tapi token tidak ada:
    if (!token && request.nextUrl.pathname.startsWith(dashboardPath)) {
        // Redirect kembali ke login
        return NextResponse.redirect(new URL(loginPath, request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Terapkan middleware ke semua rute login dan dashboard
    matcher: ["/login", "/dashboard/:path*"], 
};
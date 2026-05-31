import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

// Initialize NextAuth with ONLY the Edge-compatible config
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // 1. Dashboard & Settings Protection
  if ((pathname.startsWith("/dashboard") || pathname.startsWith("/settings")) && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Admin Protection
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.ADMIN_EMAIL;
    
    if (!isAdmin) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL(session ? "/dashboard" : "/login", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/admin/:path*", "/api/admin/:path*"]
};

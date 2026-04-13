import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = ["/country", "/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  if (!needsAuth) return NextResponse.next();

  const sessionToken = request.cookies.get("better-auth.session_token")?.value;
  if (!sessionToken) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/country/:path*", "/admin/:path*"],
};

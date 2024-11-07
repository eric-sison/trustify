import { cookies } from "next/headers";
import { lucia } from "./config/lucia";
import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const cookie = await cookies();

  const sid = cookie.get(lucia.sessionCookieName);

  if (sid && request.nextUrl.pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!sid && request.nextUrl.pathname !== "/admin/login") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */

    "/((?!api|_next/static|_next/image|login|favicon.ico|sitemap.xml|robots.txt|images|$).*)",
  ],
};

import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  // Pathname is relative to basePath ("/message"), so request.nextUrl.pathname
  // will be "/dashboard", "/login", etc. — without the /message prefix.
  const pathname = request.nextUrl.pathname;

  // Protect /dashboard routes — redirect to login if no session
  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // NextResponse.redirect uses the full URL, and nextUrl already includes basePath
    return NextResponse.redirect(url);
  }

  // Redirect /login to /dashboard if already authenticated
  if (pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public assets (images, fonts, etc.)
     * - api/webhooks (webhook endpoints that shouldn't require auth)
     *
     * These patterns are relative to the basePath ("/message"),
     * so they do NOT include the /message prefix.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|assets/|fonts/|api/webhooks).*)",
  ],
};

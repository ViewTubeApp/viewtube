import { clerkMiddleware } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/server/auth";

import { env } from "./env";
import { routing } from "./i18n/routing";
import { checkAnonymousSession } from "./utils/server/session";

const handleI18nRouting = createMiddleware(routing);

// Define middleware chain
export default clerkMiddleware((_, request) => {
  // Run the Next.js middleware function
  return middleware(request);
});

// Keep the existing middleware as a standalone function
async function middleware(request: NextRequest) {
  // Run the auth check
  const session = await auth();
  // Check if the user is anonymous
  await checkAnonymousSession();

  // If no session and trying to access admin routes, redirect to sign in
  if (!session && request.nextUrl.pathname.startsWith("/admin") && env.NODE_ENV !== "development") {
    const signInUrl = new URL("/api/auth/signin", request.url);
    // Add the current URL as callback URL (including search params)
    signInUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // If the request is for the API or the Next.js internals, skip the i18n middleware
  if (["/api", "/_next", "/uploads"].some((route) => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Otherwise, run the i18n middleware
  return handleI18nRouting(request);
}

// Add config to match all relevant routes
export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

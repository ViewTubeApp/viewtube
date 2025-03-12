import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/server/auth";

import { env } from "./env";
import { routing } from "./i18n/routing";
import { checkAnonymousSession } from "./utils/server/session";

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Run the auth check first
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

  const nonI18nRoutes = [
    "/api",
    "/_next",
    "/uploads",
    "/apple-icon.png",
    "/favicon.ico",
    "/icon.png",
    "/icon.svg",
    "/logo.svg",
    "/manifest.json",
  ];

  // If the request is for the API or the Next.js internals, skip the i18n middleware
  if (nonI18nRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Otherwise, run the i18n middleware
  return handleI18nRouting(request);
}

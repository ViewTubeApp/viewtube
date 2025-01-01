import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/server/auth";

import { middleware as intlMiddleware } from "@/lib/i18n";

import { env } from "./env";

export async function middleware(request: NextRequest) {
  // Run the auth check first
  const session = await auth();

  // If no session and trying to access admin routes, redirect to sign in
  if (!session && request.nextUrl.pathname.startsWith("/admin") && env.NODE_ENV !== "development") {
    const signInUrl = new URL("/api/auth/signin", request.url);
    // Add the current URL as callback URL (including search params)
    signInUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Otherwise, run the i18n middleware
  return intlMiddleware(request);
}

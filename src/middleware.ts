import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";

import authConfig from "@/server/auth/config";

import { routing as routingConfig } from "./i18n/routing";

// Create the i18n middleware
const intlMiddleware = createMiddleware(routingConfig);

// Create the auth config
const { auth } = NextAuth(authConfig);

// Middleware handler
export default auth((request: NextRequest) => {
  // Skip auth check for non-admin pages
  if (!request.nextUrl.pathname.includes("/admin")) {
    return intlMiddleware(request);
  }

  // For admin pages, auth middleware will handle the request
  // and then pass it to i18n middleware
  return intlMiddleware(request);
});

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

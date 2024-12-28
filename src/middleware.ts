import { env } from "@/env";
import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";

import authConfig from "@/server/auth/config";

import { routing as routingConfig } from "./i18n/routing";

// Create the i18n middleware
const intlMiddleware = createMiddleware(routingConfig);

// Create the auth config
const { auth } = NextAuth({
  ...authConfig,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user || env.NODE_ENV === "development";

      const isAdminPage =
        nextUrl.pathname.startsWith("/admin") ||
        routingConfig.locales.some((locale) => nextUrl.pathname.startsWith(`/${locale}/admin`));

      // Only require auth for admin pages
      return !isAdminPage || isLoggedIn;
    },
  },
});

// Middleware handler
export default auth((req) => intlMiddleware(req));

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

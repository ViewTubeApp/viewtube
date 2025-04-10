import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";
import { checkAnonymousSession } from "./utils/server/session";

const handleI18nRouting = createMiddleware(routing);
const isProtectedRoute = createRouteMatcher(["/:locale/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  await checkAnonymousSession();
  return handleI18nRouting(req);
});

export const config = {
  runtime: "nodejs",
  matcher: [
    // Always run for root
    "/",
    // Always run for locale routes
    "/(ru|en)/:path*",
  ],
};

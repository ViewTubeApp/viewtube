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

  const response = handleI18nRouting(req);
  await checkAnonymousSession(req, response);
  return response;
});

export const config = {
  matcher: [
    // Always run for root
    "/",
    // Always run for locale routes
    "/(ru|en)/:path*",
  ],
};

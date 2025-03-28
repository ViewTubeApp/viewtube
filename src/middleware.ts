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
  matcher: [
    // Always run for root
    "/",
    // Always run for locale routes
    "/(ru|en)/:path*",
    // // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};

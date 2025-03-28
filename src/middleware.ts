import { clerkMiddleware } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import { checkAnonymousSession } from "./utils/server/session";

const handleI18nRouting = createMiddleware(routing);

export default clerkMiddleware((_, request) => {
  return middleware(request);
});

async function middleware(request: NextRequest) {
  await checkAnonymousSession();
  return handleI18nRouting(request);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

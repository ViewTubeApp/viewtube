import createMiddleware from "next-intl/middleware";

import { authMiddleware } from "@/server/auth";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
export default authMiddleware(intlMiddleware);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|uploads|lottie|apple-icon.png|icon.png|icon.svg|logo.svg|favicon.ico|manifest.json).*)",
  ],
};

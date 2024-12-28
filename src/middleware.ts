import createMiddleware from "next-intl/middleware";

import { authMiddleware } from "@/server/auth";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
export default authMiddleware(intlMiddleware);

export const config = {
  matcher: ["/", "/(ru|en)/:path*"],
};

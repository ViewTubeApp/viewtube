import createMiddleware from "next-intl/middleware";

// import { auth } from "@/server/auth";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);
// export default auth(intlMiddleware);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|uploads|lottie|apple-icon.png|icon.png|icon.svg|logo.svg|favicon.ico|manifest.json).*)",
  ],
};

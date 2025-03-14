import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  defaultLocale: "ru",
  locales: ["en", "ru"],
  localeCookie: {
    // Expire in one year
    maxAge: 60 * 60 * 24 * 365,
  },
});

import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  defaultLocale: "ru",
  locales: ["en", "ru"],
});

export type Locale = (typeof routing.locales)[number];

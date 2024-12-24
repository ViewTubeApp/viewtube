import { env } from "@/env";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/admin/",
          "/api/",
          "/private/",
          "/*.json$",
          "/*?*", // Prevent crawling of query parameters
        ],
      },
      {
        userAgent: ["Googlebot", "Bingbot", "Applebot", "DuckDuckBot", "Yandex"],
        allow: ["/"],
        disallow: ["/admin/"],
      },
    ],
    sitemap: `${env.NEXT_PUBLIC_URL}/sitemap.xml`,
    host: env.NEXT_PUBLIC_URL,
  };
}

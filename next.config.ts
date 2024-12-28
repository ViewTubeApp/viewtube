/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import BundleAnalyzer from "@next/bundle-analyzer";
import { type NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import "./src/env.js";

const withNextIntl = createNextIntlPlugin();

const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const config: NextConfig = {
  reactStrictMode: true,

  redirects: async () => {
    return [
      {
        source: "/admin",
        destination: "/admin/dashboard",
        permanent: false,
      },
    ];
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
    ],
  },
};

export default withBundleAnalyzer(withNextIntl(config));

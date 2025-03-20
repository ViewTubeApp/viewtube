/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import BundleAnalyzer from "@next/bundle-analyzer";
import { type NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withBundleAnalyzer = BundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

const config: NextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  skipTrailingSlashRedirect: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Add custom headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Connection",
            value: "keep-alive",
          },
          {
            key: "Keep-Alive",
            value: "timeout=60",
          },
        ],
      },
    ];
  },

  redirects: async () => {
    return [
      {
        source: "/admin",
        destination: "/admin/videos",
        permanent: false,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/ingest/static/:path*",
        destination: `${process.env.NEXT_PUBLIC_POSTHOG_HOST}/static/:path*`,
      },
      {
        source: "/api/ingest/:path*",
        destination: `${process.env.NEXT_PUBLIC_POSTHOG_HOST}/:path*`,
      },
      {
        source: "/api/ingest/decide",
        destination: `${process.env.NEXT_PUBLIC_POSTHOG_HOST}/decide`,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withBundleAnalyzer(withNextIntl(config));

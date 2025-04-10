import { env } from "@/env";
import BundleAnalyzer from "@next/bundle-analyzer";
import debug from "debug";
import { type NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

debug("next:config")(env);

const withBundleAnalyzer = BundleAnalyzer({ enabled: !!env.ANALYZE });

const config: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  logging: { incomingRequests: false },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${env.NEXT_PUBLIC_UPLOADTHING_APP_ID}.ufs.sh`,
        pathname: "/f/*",
      },
    ],
  },

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
        destination: `${env.NEXT_PUBLIC_POSTHOG_HOST}/static/:path*`,
      },
      {
        source: "/api/ingest/:path*",
        destination: `${env.NEXT_PUBLIC_POSTHOG_HOST}/:path*`,
      },
      {
        source: "/api/ingest/decide",
        destination: `${env.NEXT_PUBLIC_POSTHOG_HOST}/decide`,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withBundleAnalyzer(withNextIntl(config));

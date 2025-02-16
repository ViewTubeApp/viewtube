/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import { env } from "@/env";
import { paraglide } from "@inlang/paraglide-next/plugin";
import BundleAnalyzer from "@next/bundle-analyzer";
import { type NextConfig } from "next";

const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const config: NextConfig = {
  reactStrictMode: true,
  experimental: { reactCompiler: env.NODE_ENV === "production" },

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

export default withBundleAnalyzer(
  paraglide({
    ...config,
    paraglide: {
      project: "./project.inlang",
      outdir: "./src/paraglide",
    },
  }),
);

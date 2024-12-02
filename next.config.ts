/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import { type NextConfig } from "next";

export default {
  reactStrictMode: true,
  serverExternalPackages: ["pino", "pino-pretty"],

  experimental: {
    serverActions: {
      bodySizeLimit: "1GB",
    },
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
} satisfies NextConfig;

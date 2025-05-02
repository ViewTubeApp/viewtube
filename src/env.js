import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const zNodeEnv = z.enum(["development", "test", "production"]);

export const env = createEnv({
  server: {
    // General
    ANALYZE: z.boolean().optional(),
    NODE_ENV: zNodeEnv.default("development"),
    GIT_COMMIT_HASH: z.string().optional(),

    // UploadThing
    UPLOADTHING_TOKEN: z.string(),

    // Trigger.dev
    TRIGGER_SECRET_KEY: z.string(),

    // Database (PostgreSQL)
    DATABASE_HOST: z.string(),
    DATABASE_URL: z.string(),
    DATABASE_USERNAME: z.string(),
    DATABASE_PASSWORD: z.string(),

    // Auth (Clerk)
    CLERK_SECRET_KEY: z.string(),
  },

  client: {
    // General
    NEXT_PUBLIC_URL: z.string().url(),
    NEXT_PUBLIC_BRAND: z.string(),
    NEXT_PUBLIC_NODE_ENV: zNodeEnv.default("development"),
    NEXT_PUBLIC_GIT_COMMIT_HASH: z.string().optional(),

    // Analytics (PostHog)
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url(),

    // UploadThing
    NEXT_PUBLIC_UPLOADTHING_APP_ID: z.string(),

    // Auth (Clerk)
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  },

  runtimeEnv: {
    // Server
    ANALYZE: process.env.ANALYZE,
    NODE_ENV: process.env.NODE_ENV,
    GIT_COMMIT_HASH: process.env.GIT_COMMIT_HASH,

    // Client
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_BRAND: process.env.NEXT_PUBLIC_BRAND,
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_GIT_COMMIT_HASH: process.env.GIT_COMMIT_HASH,

    // Analytics (PostHog)
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,

    // UploadThing
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    NEXT_PUBLIC_UPLOADTHING_APP_ID: process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID,

    // Trigger.dev
    TRIGGER_SECRET_KEY: process.env.TRIGGER_SECRET_KEY,

    // Auth (Clerk)
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,

    // Database (PostgreSQL)
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_USERNAME: process.env.DATABASE_USERNAME,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

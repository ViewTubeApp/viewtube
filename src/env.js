import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    // General
    ANALYZE: z.boolean().optional(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    GIT_COMMIT_HASH: z.string().optional(),

    // UploadThing
    UPLOADTHING_TOKEN: z.string(),

    // Authentication (Authentik)
    AUTHENTIK_SECRET_KEY: z.string(),
    AUTHENTIK_AUTH_CLIENT_ID: z.string(),
    AUTHENTIK_AUTH_CLIENT_SECRET: z.string(),
    AUTHENTIK_AUTH_ISSUER: z.string(),

    // Database (PlanetScale)
    DATABASE_HOST: z.string(),
    DATABASE_URL: z.string(),
    DATABASE_USERNAME: z.string(),
    DATABASE_PASSWORD: z.string(),

    // Message Queue (RabbitMQ)
    RABBITMQ_HOST: z.string(),
    RABBITMQ_PORT: z.string(),
    RABBITMQ_USER: z.string(),
    RABBITMQ_PASSWORD: z.string().optional(),
    RABBITMQ_PASSWORD_FILE: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // General
    NEXT_PUBLIC_URL: z.string().url(),
    NEXT_PUBLIC_BRAND: z.string(),
    NEXT_PUBLIC_NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXT_PUBLIC_GIT_COMMIT_HASH: z.string().optional(),

    // Analytics (PostHog)
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url(),

    // UploadThing
    NEXT_PUBLIC_UPLOADTHING_APP_ID: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    // General
    ANALYZE: process.env.ANALYZE,
    NODE_ENV: process.env.NODE_ENV,
    GIT_COMMIT_HASH: process.env.GIT_COMMIT_HASH,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_BRAND: process.env.NEXT_PUBLIC_BRAND,
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_GIT_COMMIT_HASH: process.env.NEXT_PUBLIC_GIT_COMMIT_HASH,

    // Analytics (PostHog)
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,

    // UploadThing
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    NEXT_PUBLIC_UPLOADTHING_APP_ID: process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID,

    // Authentication (Authentik)
    AUTHENTIK_SECRET_KEY: process.env.AUTHENTIK_SECRET_KEY,
    AUTHENTIK_AUTH_CLIENT_ID: process.env.AUTHENTIK_AUTH_CLIENT_ID,
    AUTHENTIK_AUTH_CLIENT_SECRET: process.env.AUTHENTIK_AUTH_CLIENT_SECRET,
    AUTHENTIK_AUTH_ISSUER: process.env.AUTHENTIK_AUTH_ISSUER,

    // Database (PlanetScale)
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_USERNAME: process.env.DATABASE_USERNAME,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,

    // Message Queue (RabbitMQ)
    RABBITMQ_HOST: process.env.RABBITMQ_HOST,
    RABBITMQ_PORT: process.env.RABBITMQ_PORT,
    RABBITMQ_USER: process.env.RABBITMQ_USER,
    RABBITMQ_PASSWORD: process.env.RABBITMQ_PASSWORD,
    RABBITMQ_PASSWORD_FILE: process.env.RABBITMQ_PASSWORD_FILE,
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

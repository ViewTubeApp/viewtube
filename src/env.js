import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    UPLOADS_VOLUME: z.string(),
    GIT_COMMIT_HASH: z.string().optional(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    AUTHENTIK_SECRET_KEY: z.string(),
    AUTHENTIK_AUTH_CLIENT_ID: z.string(),
    AUTHENTIK_AUTH_CLIENT_SECRET: z.string(),
    AUTHENTIK_AUTH_ISSUER: z.string(),

    POSTGRES_DB: z.string(),
    POSTGRES_HOST: z.string(),
    POSTGRES_PORT: z.string(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string().optional(),
    POSTGRES_PASSWORD_FILE: z.string().optional(),

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
    NEXT_PUBLIC_BRAND: z.string(),
    NEXT_PUBLIC_URL: z.string().url(),
    NEXT_PUBLIC_CDN_URL: z.string().url(),
    NEXT_PUBLIC_GIT_COMMIT_HASH: z.string().optional(),
    NEXT_PUBLIC_NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
    NEXT_PUBLIC_BRAND: process.env.NEXT_PUBLIC_BRAND,
    NEXT_PUBLIC_GIT_COMMIT_HASH: process.env.NEXT_PUBLIC_GIT_COMMIT_HASH,

    AUTHENTIK_SECRET_KEY: process.env.AUTHENTIK_SECRET_KEY,
    AUTHENTIK_AUTH_CLIENT_ID: process.env.AUTHENTIK_AUTH_CLIENT_ID,
    AUTHENTIK_AUTH_CLIENT_SECRET: process.env.AUTHENTIK_AUTH_CLIENT_SECRET,
    AUTHENTIK_AUTH_ISSUER: process.env.AUTHENTIK_AUTH_ISSUER,

    NODE_ENV: process.env.NODE_ENV,
    GIT_COMMIT_HASH: process.env.GIT_COMMIT_HASH,
    UPLOADS_VOLUME: process.env.UPLOADS_VOLUME,

    POSTGRES_DB: process.env.POSTGRES_DB,
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_PORT: process.env.POSTGRES_PORT,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_PASSWORD_FILE: process.env.POSTGRES_PASSWORD_FILE,

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

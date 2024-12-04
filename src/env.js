import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import process from "process";
import path from "path";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    UPLOADS_VOLUME: z.string().default(path.join(process.cwd(), "public", "uploads")),

    POSTGRES_HOST: z.string(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string().optional(),
    POSTGRES_PASSWORD_FILE: z.string().optional(),
    POSTGRES_DB: z.string(),
    POSTGRES_PORT: z.string(),

    REDIS_HOST: z.string(),
    REDIS_PORT: z.string(),

    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
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
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
    NEXT_PUBLIC_BRAND: process.env.NEXT_PUBLIC_BRAND,

    NODE_ENV: process.env.NODE_ENV,
    UPLOADS_VOLUME: process.env.UPLOADS_VOLUME,

    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_PASSWORD_FILE: process.env.POSTGRES_PASSWORD_FILE,
    POSTGRES_DB: process.env.POSTGRES_DB,
    POSTGRES_PORT: process.env.POSTGRES_PORT,

    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
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

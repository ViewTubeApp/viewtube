import { env } from "@/env";
import { getDatabaseUrl } from "@/utils/server/db";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "server-only";

import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const context = globalThis as unknown as {
  db: postgres.Sql | undefined;
};

const url = getDatabaseUrl({
  db: env.POSTGRES_DB,
  user: env.POSTGRES_USER,
  host: env.POSTGRES_HOST,
  port: env.POSTGRES_PORT,
  password: env.POSTGRES_PASSWORD,
  passwordFile: env.POSTGRES_PASSWORD_FILE,
});

const conn = context.db ?? postgres(url);
if (env.NODE_ENV !== "production") context.db = conn;

export const db = drizzle(conn, { schema });

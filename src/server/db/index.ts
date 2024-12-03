import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
import * as schema from "./schema";
import { getDatabaseUrl } from "@/lib/db";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const context = globalThis as unknown as {
  db: postgres.Sql | undefined;
};

export const db = createDbConnection();

function createDbConnection() {
  const conn = context.db ?? postgres(getDatabaseUrl());
  if (env.NODE_ENV !== "production") context.db = conn;
  return drizzle(conn, { schema });
}

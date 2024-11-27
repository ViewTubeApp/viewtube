import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
import * as schema from "./schema";
import { getDatabaseUrl } from "@/lib/db";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

export function createDbConnection() {
  const conn = globalForDb.conn ?? postgres(getDatabaseUrl());
  if (env.NODE_ENV !== "production") globalForDb.conn = conn;

  return drizzle(conn, { schema });
}

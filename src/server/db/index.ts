import { env } from "@/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "server-only";

import { getDatabaseUrl } from "@/lib/db";

import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const context = globalThis as unknown as {
  db: postgres.Sql | undefined;
};

const conn = context.db ?? postgres(getDatabaseUrl());
if (env.NODE_ENV !== "production") context.db = conn;

export const db = drizzle(conn, { schema });

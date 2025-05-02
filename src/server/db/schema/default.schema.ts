import { serial, timestamp } from "drizzle-orm/pg-core";

export const defaults = {
  id: serial().primaryKey(),
} as const;

export const timestamps = {
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull(),
} as const;

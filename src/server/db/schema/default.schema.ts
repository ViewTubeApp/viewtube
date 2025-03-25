import { int, timestamp } from "drizzle-orm/mysql-core";

export const defaults = {
  id: int().primaryKey().autoincrement(),
} as const;

export const timestamps = {
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().onUpdateNow().notNull(),
} as const;

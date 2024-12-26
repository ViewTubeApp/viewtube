import { timestamp, varchar } from "drizzle-orm/pg-core";

export const defaultFields = {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
} as const;

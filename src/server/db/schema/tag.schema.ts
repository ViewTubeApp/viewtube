import { createTable } from "@/utils/server/db";
import { varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaults, timestamps } from "./default.schema";

export const tags = createTable("tag", {
  ...defaults,
  ...timestamps,
  name: varchar({ length: 256 }).unique().notNull(),
});

export const tagInsertSchema = createInsertSchema(tags);
export const tagSelectSchema = createSelectSchema(tags);

export type TagSelectSchema = typeof tags.$inferSelect;

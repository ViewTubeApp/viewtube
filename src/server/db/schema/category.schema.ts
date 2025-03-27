import { createTable } from "@/utils/server/db";
import { varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaults, timestamps } from "./default.schema";

export const categories = createTable("category", {
  ...defaults,
  ...timestamps,
  slug: varchar({ length: 256 }).notNull().unique(),
  file_key: varchar({ length: 256 }).notNull(),
});

export const categoryInsertSchema = createInsertSchema(categories);
export const categorySelectSchema = createSelectSchema(categories);

export type CategorySelectSchema = typeof categories.$inferSelect;

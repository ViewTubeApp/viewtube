import { createTable } from "@/utils/server/db";
import { varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultFields } from "./default.schema";

export const categories = createTable("category", {
  name: varchar("name", { length: 256 }).notNull().unique(),
  ...defaultFields,
});

export const categoryInsertSchema = createInsertSchema(categories);
export const categorySelectSchema = createSelectSchema(categories);

export type Category = typeof categories.$inferSelect;
export type CreateCategory = typeof categories.$inferInsert;

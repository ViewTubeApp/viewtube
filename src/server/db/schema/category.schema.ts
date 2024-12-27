import { createTable } from "@/utils/server/db";
import { index, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultFields } from "./default.schema";

export const categories = createTable(
  "category",
  {
    name: varchar("name", { length: 256 }).notNull().unique(),
    ...defaultFields,
  },
  (example) => [index("category_name_idx").on(example.name)],
);

export const categoryInsertSchema = createInsertSchema(categories);
export const categorySelectSchema = createSelectSchema(categories);

export type Category = typeof categories.$inferSelect;
export type CreateCategory = typeof categories.$inferInsert;

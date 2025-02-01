import { createTable } from "@/utils/server/db";
import { index, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultFields } from "./default.schema";

export const categories = createTable(
  "category",
  {
    ...defaultFields,
    slug: varchar("slug", { length: 256 }).notNull().unique(),
    imageUrl: varchar("image_url", { length: 256 }).notNull(),
  },
  (example) => [index("category_slug_idx").on(example.slug)],
);

export const categoryInsertSchema = createInsertSchema(categories);
export const categorySelectSchema = createSelectSchema(categories);

export type Category = typeof categories.$inferSelect;
export type CreateCategory = typeof categories.$inferInsert;

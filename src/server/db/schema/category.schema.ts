import { createTable } from "@/utils/server/db";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaults, timestamps } from "./default.schema";

export const categories = createTable("category", (t) => ({
  ...defaults,
  ...timestamps,
  slug: t.varchar({ length: 256 }).notNull().unique(),
  file_key: t.varchar({ length: 256 }).notNull(),
}));

export const categoryInsertSchema = createInsertSchema(categories);
export const categorySelectSchema = createSelectSchema(categories);

export type CategorySelectSchema = typeof categories.$inferSelect;

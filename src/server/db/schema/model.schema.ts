import { createTable } from "@/utils/server/db";
import { index, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultFields } from "./default.schema";

export const models = createTable(
  "model",
  {
    ...defaultFields,
    name: varchar("name", { length: 256 }).notNull().unique(),
    imageUrl: varchar("image_url", { length: 256 }).notNull(),
  },
  (table) => [index("model_name_idx").on(table.name)],
);

export const modelInsertSchema = createInsertSchema(models);
export const modelSelectSchema = createSelectSchema(models);

export type ModelSelectSchema = typeof models.$inferSelect;

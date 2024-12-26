import { createTable } from "@/utils/server/db";
import { index, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultFields } from "./default.schema";

export const tags = createTable(
  "tag",
  {
    name: varchar("name", { length: 256 }).unique().notNull(),
    ...defaultFields,
  },
  (example) => [index("tag_name_idx").on(example.name)],
);

export const tagInsertSchema = createInsertSchema(tags);
export const tagSelectSchema = createSelectSchema(tags);

export type Tag = typeof tags.$inferSelect;
export type CreateTag = typeof tags.$inferInsert;

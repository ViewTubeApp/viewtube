import { createTable } from "@/utils/server/db";
import { index, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultFields } from "./default.schema";

export const tags = createTable(
  "tag",
  {
    ...defaultFields,
    name: varchar("name", { length: 256 }).unique().notNull(),
  },
  (table) => [index("tag_name_idx").on(table.name)],
);

export const tagInsertSchema = createInsertSchema(tags);
export const tagSelectSchema = createSelectSchema(tags);

export type DBTagSchema = typeof tags.$inferSelect;

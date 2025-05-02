import { createTable } from "@/utils/server/db";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaults, timestamps } from "./default.schema";

export const tags = createTable("tag", (t) => ({
  ...defaults,
  ...timestamps,
  name: t.varchar({ length: 256 }).unique().notNull(),
}));

export const tagInsertSchema = createInsertSchema(tags);
export const tagSelectSchema = createSelectSchema(tags);

export type TagSelectSchema = typeof tags.$inferSelect;

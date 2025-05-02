import { createTable } from "@/utils/server/db";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaults, timestamps } from "./default.schema";

export const models = createTable("model", (t) => ({
  ...defaults,
  ...timestamps,
  name: t.varchar({ length: 256 }).notNull().unique(),
  file_key: t.varchar({ length: 256 }).notNull(),
}));

export const modelInsertSchema = createInsertSchema(models);
export const modelSelectSchema = createSelectSchema(models);

export type ModelSelectSchema = typeof models.$inferSelect;

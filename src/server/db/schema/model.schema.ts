import { createTable } from "@/utils/server/db";
import { varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaults, timestamps } from "./default.schema";

export const models = createTable("model", {
  ...defaults,
  ...timestamps,
  name: varchar({ length: 256 }).notNull().unique(),
  file_key: varchar({ length: 256 }).notNull(),
});

export const modelInsertSchema = createInsertSchema(models);
export const modelSelectSchema = createSelectSchema(models);

export type ModelSelectSchema = typeof models.$inferSelect;

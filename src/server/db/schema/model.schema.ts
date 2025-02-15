import { createTable } from "@/utils/server/db";
import { index, varchar } from "drizzle-orm/pg-core";

import { defaultFields } from "./default.schema";

export const models = createTable(
  "model",
  {
    ...defaultFields,
    name: varchar("name", { length: 256 }).notNull().unique(),
    imageUrl: varchar("image_url", { length: 256 }).notNull(),
  },
  (example) => [index("model_name_idx").on(example.name)],
);

export type DBModelSchema = typeof models.$inferSelect;

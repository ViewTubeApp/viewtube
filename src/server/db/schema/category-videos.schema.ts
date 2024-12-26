import { createTable } from "@/utils/server/db";
import { index, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { categories } from "./category.schema";
import { videos } from "./video.schema";

export const categoryVideos = createTable(
  "category_x_video",
  {
    categoryId: varchar("category_id", { length: 256 })
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    videoId: varchar("video_id", { length: 256 })
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
  },
  (example) => [index("category_video_idx").on(example.categoryId, example.videoId)],
);

export const categoryVideoInsertSchema = createInsertSchema(categoryVideos);
export const categoryVideoSelectSchema = createSelectSchema(categoryVideos);

export type CategoryVideo = typeof categoryVideos.$inferSelect;
export type CreateCategoryVideo = typeof categoryVideos.$inferInsert;

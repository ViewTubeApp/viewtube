import { createTable } from "@/utils/server/db";
import { relations } from "drizzle-orm";
import { index, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { defaultFields } from "./default";
import { videoSelectSchema, videos } from "./video";

export const categories = createTable("category", {
  name: varchar("name", { length: 256 }).notNull(),
  ...defaultFields,
});

export const categoryInsertSchema = createInsertSchema(categories);
export const categorySelectSchema = createSelectSchema(categories);

export type Category = typeof categories.$inferSelect;
export type CreateCategory = typeof categories.$inferInsert;

export const categoryRelations = relations(categories, ({ many }) => ({
  videos: many(videos),
}));

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

export const categoryVideoRelations = relations(categoryVideos, ({ one }) => ({
  category: one(categories, {
    fields: [categoryVideos.categoryId],
    references: [categories.id],
  }),
  video: one(videos, {
    fields: [categoryVideos.videoId],
    references: [videos.id],
  }),
}));

export const categoryExtendedSelectSchema = categorySelectSchema.extend({
  videos: z.array(
    z.object({
      videoId: z.string(),
      categoryId: z.string(),
      video: videoSelectSchema,
    }),
  ),
});

export type CategoryExtended = z.infer<typeof categoryExtendedSelectSchema>;

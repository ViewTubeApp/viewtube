import { relations } from "drizzle-orm";

import { categoryVideos } from "./category-videos.schema";
import { categories } from "./category.schema";
import { videos } from "./video.schema";

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

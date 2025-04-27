import { relations } from "drizzle-orm";

import { category_videos } from "./category-videos.schema";
import { categories } from "./category.schema";
import { videos } from "./video.schema";

export const category_video_relations = relations(category_videos, ({ one }) => ({
  category: one(categories, { fields: [category_videos.category_id], references: [categories.id] }),
  video: one(videos, { fields: [category_videos.video_id], references: [videos.id] }),
}));

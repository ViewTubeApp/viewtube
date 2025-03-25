import { relations } from "drizzle-orm";

import { category_videos } from "./category-videos.schema";
import { categories } from "./category.schema";

export const category_relations = relations(categories, ({ many }) => ({
  videos: many(category_videos),
}));

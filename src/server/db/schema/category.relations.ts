import { relations } from "drizzle-orm";

import { categoryVideos } from "./category-videos.schema";
import { categories } from "./category.schema";

export const categoryRelations = relations(categories, ({ many }) => ({
  videos: many(categoryVideos),
}));

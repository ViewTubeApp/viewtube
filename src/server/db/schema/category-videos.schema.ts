import { createTable } from "@/utils/server/db";
import { index, integer } from "drizzle-orm/pg-core";

import { categories } from "./category.schema";
import { videos } from "./video.schema";

export const categoryVideos = createTable(
  "category_x_video",
  {
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    videoId: integer("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
  },
  (table) => [index("category_video_idx").on(table.categoryId, table.videoId)],
);

import { createTable } from "@/utils/server/db";
import { index, int } from "drizzle-orm/mysql-core";

import { categories } from "./category.schema";
import { defaults } from "./default.schema";
import { videos } from "./video.schema";

export const category_videos = createTable(
  "category_x_video",
  {
    ...defaults,
    category_id: int()
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    video_id: int()
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
  },
  (table) => [index("category_video_idx").on(table.category_id, table.video_id)],
);

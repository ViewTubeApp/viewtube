import { createTable } from "@/utils/server/db";
import { index, int } from "drizzle-orm/mysql-core";

import { defaults } from "./default.schema";
import { tags } from "./tag.schema";
import { videos } from "./video.schema";

export const video_tags = createTable(
  "video_x_tag",
  {
    ...defaults,
    video_id: int()
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    tag_id: int()
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [index("video_tag_idx").on(table.video_id, table.tag_id)],
);

import { createTable } from "@/utils/server/db";
import { index } from "drizzle-orm/pg-core";

import { defaults } from "./default.schema";
import { tags } from "./tag.schema";
import { videos } from "./video.schema";

export const video_tags = createTable(
  "video_x_tag",
  (t) => ({
    ...defaults,
    video_id: t
      .integer()
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    tag_id: t
      .integer()
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  }),
  (table) => [index("video_tag_idx").on(table.video_id, table.tag_id)],
);

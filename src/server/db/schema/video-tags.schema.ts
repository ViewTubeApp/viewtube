import { createTable } from "@/utils/server/db";
import { index, integer } from "drizzle-orm/pg-core";

import { tags } from "./tag.schema";
import { videos } from "./video.schema";

export const videoTags = createTable(
  "video_x_tag",
  {
    videoId: integer("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (example) => [index("video_tag_idx").on(example.videoId, example.tagId)],
);

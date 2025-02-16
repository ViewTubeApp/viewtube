import { createTable } from "@/utils/server/db";
import { index, integer } from "drizzle-orm/pg-core";

import { models } from "./model.schema";
import { videos } from "./video.schema";

export const modelVideos = createTable(
  "model_x_video",
  {
    modelId: integer("model_id")
      .notNull()
      .references(() => models.id, { onDelete: "cascade" }),
    videoId: integer("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
  },
  (table) => [index("model_video_idx").on(table.modelId, table.videoId)],
);

import { createTable } from "@/utils/server/db";
import { index } from "drizzle-orm/pg-core";

import { defaults } from "./default.schema";
import { models } from "./model.schema";
import { videos } from "./video.schema";

export const model_videos = createTable(
  "model_x_video",
  (t) => ({
    ...defaults,
    model_id: t
      .integer()
      .notNull()
      .references(() => models.id, { onDelete: "cascade" }),
    video_id: t
      .integer()
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
  }),
  (table) => [index("model_video_idx").on(table.model_id, table.video_id)],
);

import { createTable } from "@/utils/server/db";
import { index, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { models } from "./model.schema";
import { videos } from "./video.schema";

export const modelVideos = createTable(
  "model_x_video",
  {
    modelId: varchar("model_id", { length: 256 })
      .notNull()
      .references(() => models.id, { onDelete: "cascade" }),
    videoId: varchar("video_id", { length: 256 })
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
  },
  (example) => [index("model_video_idx").on(example.modelId, example.videoId)],
);

export const modelVideoInsertSchema = createInsertSchema(modelVideos);
export const modelVideoSelectSchema = createSelectSchema(modelVideos);

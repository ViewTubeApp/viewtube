import { relations } from "drizzle-orm";

import { model_videos } from "./model-videos.schema";
import { models } from "./model.schema";
import { videos } from "./video.schema";

export const model_video_relations = relations(model_videos, ({ one }) => ({
  model: one(models, {
    fields: [model_videos.model_id],
    references: [models.id],
  }),
  video: one(videos, {
    fields: [model_videos.video_id],
    references: [videos.id],
  }),
}));

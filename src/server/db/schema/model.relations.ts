import { relations } from "drizzle-orm";

import { modelVideos } from "./model-videos.schema";
import { models } from "./model.schema";
import { videos } from "./video.schema";

export const modelVideoRelations = relations(modelVideos, ({ one }) => ({
  model: one(models, {
    fields: [modelVideos.modelId],
    references: [models.id],
  }),
  video: one(videos, {
    fields: [modelVideos.videoId],
    references: [videos.id],
  }),
}));

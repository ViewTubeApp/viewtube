import { relations } from "drizzle-orm";

import { model_videos } from "./model-videos.schema";
import { models } from "./model.schema";

export const model_relations = relations(models, ({ many }) => ({
  videos: many(model_videos),
}));

import { relations } from "drizzle-orm";

import { categoryVideos } from "./category-videos.schema";
import { comments } from "./comment.schema";
import { modelVideos } from "./model-videos.schema";
import { videoTags } from "./video-tags.schema";
import { videos } from "./video.schema";

export const videoRelations = relations(videos, ({ many }) => ({
  videoTags: many(videoTags),
  modelVideos: many(modelVideos),
  categoryVideos: many(categoryVideos),
  comments: many(comments),
}));

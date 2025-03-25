import { relations } from "drizzle-orm";

import { category_videos } from "./category-videos.schema";
import { comments } from "./comment.schema";
import { model_videos } from "./model-videos.schema";
import { video_tags } from "./video-tags.schema";
import { video_votes } from "./video-votes.schema";
import { videos } from "./video.schema";

export const video_relations = relations(videos, ({ many }) => ({
  video_tags: many(video_tags),
  model_videos: many(model_videos),
  category_videos: many(category_videos),
  comments: many(comments),
  video_votes: many(video_votes),
}));

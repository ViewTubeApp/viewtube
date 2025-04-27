import { relations } from "drizzle-orm";

import { tags } from "./tag.schema";
import { video_tags } from "./video-tags.schema";
import { videos } from "./video.schema";

export const tag_video_relations = relations(video_tags, ({ one }) => ({
  tag: one(tags, { fields: [video_tags.tag_id], references: [tags.id] }),
  video: one(videos, { fields: [video_tags.video_id], references: [videos.id] }),
}));

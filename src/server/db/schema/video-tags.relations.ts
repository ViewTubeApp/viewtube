import { relations } from "drizzle-orm";

import { tags } from "./tag.schema";
import { video_tags } from "./video-tags.schema";
import { videos } from "./video.schema";

export const video_tags_relations = relations(video_tags, ({ one }) => ({
  video: one(videos, {
    fields: [video_tags.video_id],
    references: [videos.id],
  }),
  tag: one(tags, {
    fields: [video_tags.tag_id],
    references: [tags.id],
  }),
}));

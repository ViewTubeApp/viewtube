import { relations } from "drizzle-orm";

import { tags } from "./tag.schema";
import { videoTags } from "./video-tags.schema";
import { videos } from "./video.schema";

export const videoTagsRelations = relations(videoTags, ({ one }) => ({
  video: one(videos, {
    fields: [videoTags.videoId],
    references: [videos.id],
  }),
  tag: one(tags, {
    fields: [videoTags.tagId],
    references: [tags.id],
  }),
}));

import { relations } from "drizzle-orm";

import { video_votes } from "./video-votes.schema";
import { videos } from "./video.schema";

export const video_votes_relations = relations(video_votes, ({ one }) => ({
  video: one(videos, {
    fields: [video_votes.video_id],
    references: [videos.id],
  }),
}));

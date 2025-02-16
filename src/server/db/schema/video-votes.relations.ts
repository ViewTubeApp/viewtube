import { relations } from "drizzle-orm";

import { videoVotes } from "./video-votes.schema";
import { videos } from "./video.schema";

export const videoVotesRelations = relations(videoVotes, ({ one }) => ({
  video: one(videos, {
    fields: [videoVotes.videoId],
    references: [videos.id],
  }),
}));

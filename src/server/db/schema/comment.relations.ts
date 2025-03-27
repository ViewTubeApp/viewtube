import { relations } from "drizzle-orm";

import { comments } from "./comment.schema";
import { videos } from "./video.schema";

export const comment_relations = relations(comments, ({ one, many }) => ({
  video: one(videos, { fields: [comments.video_id], references: [videos.id] }),
  replies: many(comments, { relationName: "parentChild" }),
  parent: one(comments, { relationName: "parentChild", fields: [comments.parent_id], references: [comments.id] }),
}));

import { relations } from "drizzle-orm";

import { comments } from "./comment.schema";
import { videos } from "./video.schema";

export const comment_relations = relations(comments, ({ one, many }) => ({
  video: one(videos),
  parent: one(comments, {
    relationName: "parentChild",
    fields: [comments.parent_id],
    references: [comments.id],
  }),
  replies: many(comments, { relationName: "parentChild" }),
}));

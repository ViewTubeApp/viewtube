import { relations } from "drizzle-orm";

import { comments } from "./comment.schema";
import { videos } from "./video.schema";

export const commentRelations = relations(comments, ({ one, many }) => ({
  video: one(videos),
  parent: one(comments, {
    relationName: "parentChild",
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments, { relationName: "parentChild" }),
}));

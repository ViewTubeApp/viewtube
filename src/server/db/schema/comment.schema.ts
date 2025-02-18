import { createTable } from "@/utils/server/db";
import { index, integer, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultFields } from "./default.schema";
import { videos } from "./video.schema";

export const comments = createTable(
  "comments",
  {
    ...defaultFields,
    content: text("content").notNull(),
    username: varchar("username", { length: 256 }).notNull(),
    videoId: integer("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    likesCount: integer("likes_count").default(0),
    dislikesCount: integer("dislikes_count").default(0),
    parentId: integer("parent_id"),
  },
  (table) => [index("comment_video_idx").on(table.videoId), index("comment_parent_idx").on(table.parentId)],
);

export const commentInsertSchema = createInsertSchema(comments);
export const commentSelectSchema = createSelectSchema(comments);

export type CommentSelectSchema = typeof comments.$inferSelect;

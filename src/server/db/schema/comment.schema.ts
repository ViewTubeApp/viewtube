import { createTable } from "@/utils/server/db";
import { index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaults, timestamps } from "./default.schema";
import { videos } from "./video.schema";

export const comments = createTable(
  "comments",
  (t) => ({
    ...defaults,
    ...timestamps,
    content: t.text().notNull(),
    username: t.varchar({ length: 256 }).notNull(),
    video_id: t
      .integer()
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    likes_count: t.integer().default(0),
    dislikes_count: t.integer().default(0),
    parent_id: t.integer(),
  }),
  (table) => [index("comment_video_idx").on(table.video_id), index("comment_parent_idx").on(table.parent_id)],
);

export const commentInsertSchema = createInsertSchema(comments);
export const commentSelectSchema = createSelectSchema(comments);

export type CommentSelectSchema = typeof comments.$inferSelect;

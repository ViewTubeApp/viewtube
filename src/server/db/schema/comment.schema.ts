import { createTable } from "@/utils/server/db";
import { index, int, text, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaults, timestamps } from "./default.schema";
import { videos } from "./video.schema";

export const comments = createTable(
  "comments",
  {
    ...defaults,
    ...timestamps,
    content: text().notNull(),
    username: varchar({ length: 256 }).notNull(),
    video_id: int()
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    likes_count: int().default(0),
    dislikes_count: int().default(0),
    parent_id: int(),
  },
  (table) => [index("comment_video_idx").on(table.video_id), index("comment_parent_idx").on(table.parent_id)],
);

export const commentInsertSchema = createInsertSchema(comments);
export const commentSelectSchema = createSelectSchema(comments);

export type CommentSelectSchema = typeof comments.$inferSelect;

import { createTable } from "@/utils/server/db";
import { index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaults, timestamps } from "./default.schema";
import { vote_type_enum } from "./enum.schema";
import { videos } from "./video.schema";

export const video_votes = createTable(
  "video_votes",
  (t) => ({
    ...defaults,
    ...timestamps,
    video_id: t.integer().references(() => videos.id, { onDelete: "cascade" }),
    vote_type: vote_type_enum().notNull(),
    session_id: t.varchar({ length: 256 }).notNull(),
  }),
  (table) => [
    index("video_vote_idx").on(table.video_id, table.session_id),
    index("video_vote_type_idx").on(table.video_id, table.vote_type),
  ],
);

export const videoVoteInsertSchema = createInsertSchema(video_votes);
export const videoVoteSelectSchema = createSelectSchema(video_votes);

export type VideoVoteSelectSchema = typeof video_votes.$inferSelect;

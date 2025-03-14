import { createTable } from "@/utils/server/db";
import { index, integer, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultFields } from "./default.schema";
import { voteTypeEnum } from "./enum.schema";
import { videos } from "./video.schema";

export const videoVotes = createTable(
  "video_votes",
  {
    ...defaultFields,
    videoId: integer("video_id").references(() => videos.id, { onDelete: "cascade" }),
    voteType: voteTypeEnum("vote_type").notNull(),
    sessionId: varchar("session_id", { length: 256 }).notNull(),
  },
  (table) => [
    index("video_vote_idx").on(table.videoId, table.sessionId),
    index("video_vote_type_idx").on(table.videoId, table.voteType),
  ],
);

export const videoVoteInsertSchema = createInsertSchema(videoVotes);
export const videoVoteSelectSchema = createSelectSchema(videoVotes);

export type VideoVoteSelectSchema = typeof videoVotes.$inferSelect;

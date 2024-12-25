import { createTable } from "@/utils/server/db";
import { relations } from "drizzle-orm";
import { index, integer, real, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { defaultFields } from "./default";
import { videoStatusEnum } from "./enum";
import { modelSelectSchema, modelVideos } from "./model";
import { tagSelectSchema, videoTags } from "./tag";

export const videos = createTable(
  "video",
  {
    title: text("title").notNull(),
    description: text("description"),
    viewsCount: integer("views_count").notNull().default(0),
    likesCount: integer("likes_count").notNull().default(0),
    dislikesCount: integer("dislikes_count").notNull().default(0),
    videoDuration: real("video_duration").notNull().default(0),
    url: varchar("url", { length: 256 }).notNull(),
    status: videoStatusEnum("status").notNull().default("pending"),
    processingCompletedAt: timestamp("processing_completed_at", { withTimezone: true }),
    ...defaultFields,
  },
  (example) => [index("video_title_idx").on(example.title)],
);

export const videoInsertSchema = createInsertSchema(videos);
export const videoSelectSchema = createSelectSchema(videos);

export type Video = typeof videos.$inferSelect;
export type CreateVideo = typeof videos.$inferInsert;

export const videoRelations = relations(videos, ({ many }) => ({
  videoTags: many(videoTags),
  modelVideos: many(modelVideos),
}));

export const videoExtendedSelectSchema = videoSelectSchema.extend({
  videoTags: z.array(
    z.object({
      tagId: z.string(),
      videoId: z.string(),
      tag: tagSelectSchema,
    }),
  ),
  modelVideos: z.array(
    z.object({
      modelId: z.string(),
      videoId: z.string(),
      model: modelSelectSchema,
    }),
  ),
});

export type VideoExtended = z.infer<typeof videoExtendedSelectSchema>;

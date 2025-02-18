import { createTable } from "@/utils/server/db";
import { index, integer, real, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { createInsertSchema } from "drizzle-zod";

import { defaultFields } from "./default.schema";
import { videoStatusEnum } from "./enum.schema";

export const videos = createTable(
  "video",
  {
    ...defaultFields,
    title: text("title").notNull(),
    description: text("description"),
    viewsCount: integer("views_count").notNull().default(0),
    videoDuration: real("video_duration").notNull().default(0),
    url: varchar("url", { length: 256 }).notNull(),
    status: videoStatusEnum("status").notNull().default("pending"),
    processingCompletedAt: timestamp("processing_completed_at", { withTimezone: true }),
  },
  (table) => [index("video_title_idx").on(table.title)],
);

export const videoInsertSchema = createInsertSchema(videos);
export const videoSelectSchema = createSelectSchema(videos);

export type VideoSelectSchema = typeof videos.$inferSelect;

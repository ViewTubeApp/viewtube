import { createTable } from "@/utils/server/db";
import { double, index, int, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { createSelectSchema } from "drizzle-zod";
import { createInsertSchema } from "drizzle-zod";

import { defaults, timestamps } from "./default.schema";
import { video_status_enum } from "./enum.schema";

export const videos = createTable(
  "video",
  {
    ...defaults,
    ...timestamps,
    title: text().notNull(),
    description: text(),
    views_count: int().notNull().default(0),
    video_duration: double().notNull().default(0),
    file_key: varchar({ length: 256 }).notNull(),
    thumbnail_key: varchar({ length: 256 }),
    poster_key: varchar({ length: 256 }),
    storyboard_key: varchar({ length: 256 }),
    trailer_key: varchar({ length: 256 }),
    status: video_status_enum.notNull().default("pending"),
    processing_completed_at: timestamp(),
  },
  (table) => [index("video_status_idx").on(table.status)],
);

export const videoInsertSchema = createInsertSchema(videos);
export const videoSelectSchema = createSelectSchema(videos);

export type VideoSelectSchema = typeof videos.$inferSelect;

import { createTable } from "@/utils/server/db";
import { index } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { createInsertSchema } from "drizzle-zod";

import { defaults, timestamps } from "./default.schema";
import { video_status_enum } from "./enum.schema";

export const videos = createTable(
  "video",
  (t) => ({
    ...defaults,
    ...timestamps,
    title: t.text().notNull(),
    description: t.text(),
    views_count: t.integer().notNull().default(0),
    video_duration: t.integer().notNull().default(0),
    file_key: t.varchar({ length: 256 }).notNull(),
    thumbnail_key: t.varchar({ length: 256 }),
    poster_key: t.varchar({ length: 256 }),
    storyboard_key: t.varchar({ length: 256 }),
    trailer_key: t.varchar({ length: 256 }),
    status: video_status_enum().notNull().default("pending"),
    processing_completed_at: t.timestamp(),
  }),
  (table) => [index("video_status_idx").on(table.status)],
);

export const videoInsertSchema = createInsertSchema(videos);
export const videoSelectSchema = createSelectSchema(videos);

export type VideoSelectSchema = typeof videos.$inferSelect;

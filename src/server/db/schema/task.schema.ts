import { createTable } from "@/utils/server/db";
import { index, int, text, timestamp } from "drizzle-orm/mysql-core";

import { defaults, timestamps } from "./default.schema";
import { task_type_enum } from "./enum.schema";
import { video_status_enum } from "./enum.schema";
import { videos } from "./video.schema";

export const video_tasks = createTable(
  "video_task",
  {
    ...defaults,
    ...timestamps,
    video_id: int()
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    task_type: task_type_enum.notNull(),
    status: video_status_enum.notNull().default("pending"),
    started_at: timestamp(),
    completed_at: timestamp(),
    error: text(),
  },
  (example) => [
    index("video_task_idx").on(example.video_id, example.task_type),
    index("video_task_status_idx").on(example.status),
  ],
);

export type VideoTaskSelectSchema = typeof video_tasks.$inferInsert;

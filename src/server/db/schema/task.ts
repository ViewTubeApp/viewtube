import { createTable } from "@/utils/server/db";
import { index, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultFields } from "./default";
import { taskTypeEnum } from "./enum";
import { videoStatusEnum } from "./enum";
import { videos } from "./video";

export const videoTasks = createTable(
  "video_task",
  {
    videoId: varchar("video_id", { length: 256 })
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    taskType: taskTypeEnum("task_type").notNull(),
    status: videoStatusEnum("status").notNull().default("pending"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    error: text("error"),
    ...defaultFields,
  },
  (example) => [index("video_task_idx").on(example.videoId, example.taskType), index("video_task_status_idx").on(example.status)],
);

export const videoTaskInsertSchema = createInsertSchema(videoTasks);
export const videoTaskSelectSchema = createSelectSchema(videoTasks);

export type TaskType = (typeof taskTypeEnum.enumValues)[number];
export type VideoTaskStatus = (typeof videoStatusEnum.enumValues)[number];
export type VideoTask = typeof videoTasks.$inferSelect;
export type CreateVideoTask = typeof videoTasks.$inferInsert;

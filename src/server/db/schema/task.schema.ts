import { createTable } from "@/utils/server/db";
import { index, integer, text, timestamp } from "drizzle-orm/pg-core";

import { defaultFields } from "./default.schema";
import { taskTypeEnum } from "./enum.schema";
import { videoStatusEnum } from "./enum.schema";
import { videos } from "./video.schema";

export const videoTasks = createTable(
  "video_task",
  {
    ...defaultFields,
    videoId: integer("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    taskType: taskTypeEnum("task_type").notNull(),
    status: videoStatusEnum("status").notNull().default("pending"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    error: text("error"),
  },
  (example) => [
    index("video_task_idx").on(example.videoId, example.taskType),
    index("video_task_status_idx").on(example.status),
  ],
);

export type DBCreateVideoTaskSchema = typeof videoTasks.$inferInsert;

export type VideoTaskType = (typeof taskTypeEnum.enumValues)[number];
export type VideoTaskStatus = (typeof videoStatusEnum.enumValues)[number];

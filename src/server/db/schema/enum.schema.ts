import { pgEnum } from "drizzle-orm/pg-core";

export const taskTypeEnum = pgEnum("task_type", ["poster", "webvtt", "trailer", "duration"]);
export const videoStatusEnum = pgEnum("video_status", ["pending", "processing", "completed", "failed"]);

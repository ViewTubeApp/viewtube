import { pgEnum } from "drizzle-orm/pg-core";

const taskTypeEnumValues = ["poster", "webvtt", "trailer", "duration"] as const;
const videoStatusEnumValues = ["pending", "processing", "completed", "failed"] as const;
const voteTypeEnumValues = ["like", "dislike"] as const;

export const task_type_enum = pgEnum("task_type", taskTypeEnumValues);
export const video_status_enum = pgEnum("video_status", videoStatusEnumValues);
export const vote_type_enum = pgEnum("vote_type", voteTypeEnumValues);

export type VideoTaskType = (typeof taskTypeEnumValues)[number];
export type VideoTaskStatus = (typeof videoStatusEnumValues)[number];
export type VoteType = (typeof voteTypeEnumValues)[number];

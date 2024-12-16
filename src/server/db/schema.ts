// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration
import { relations } from "drizzle-orm";
import { index, integer, pgTableCreator, text, timestamp, varchar, pgEnum, real } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `viewtube_${name}`);

const defaultFields = {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
} as const;

export const taskTypeEnum = pgEnum("task_type", ["poster", "webvtt", "trailer", "duration"]);
export const videoStatusEnum = pgEnum("video_status", ["pending", "processing", "completed", "failed"]);

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

export const tags = createTable(
  "tag",
  {
    name: varchar("name", { length: 256 }).unique().notNull(),
    ...defaultFields,
  },
  (example) => [index("tag_name_idx").on(example.name)],
);

export const tagInsertSchema = createInsertSchema(tags);
export const tagSelectSchema = createSelectSchema(tags);

export type Tag = typeof tags.$inferSelect;
export type CreateTag = typeof tags.$inferInsert;

export const videoTags = createTable(
  "video_x_tag",
  {
    videoId: varchar("video_id", { length: 256 })
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    tagId: varchar("tag_id", { length: 256 })
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (example) => [index("video_tag_idx").on(example.videoId, example.tagId)],
);

export const models = createTable(
  "model",
  {
    name: varchar("name", { length: 256 }).notNull(),
    ...defaultFields,
  },
  (example) => [index("model_name_idx").on(example.name)],
);

export type Model = typeof models.$inferSelect;
export type CreateModel = typeof models.$inferInsert;

export const modelInsertSchema = createInsertSchema(models);
export const modelSelectSchema = createSelectSchema(models);

export const modelVideos = createTable(
  "model_x_video",
  {
    modelId: varchar("model_id", { length: 256 })
      .notNull()
      .references(() => models.id, { onDelete: "cascade" }),
    videoId: varchar("video_id", { length: 256 })
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
  },
  (example) => [index("model_video_idx").on(example.modelId, example.videoId)],
);

export const modelVideoInsertSchema = createInsertSchema(modelVideos);
export const modelVideoSelectSchema = createSelectSchema(modelVideos);

export const videoRelations = relations(videos, ({ many }) => ({
  videoTags: many(videoTags),
  modelVideos: many(modelVideos),
}));

export const videoTagsRelations = relations(videoTags, ({ one }) => ({
  video: one(videos, {
    fields: [videoTags.videoId],
    references: [videos.id],
  }),
  tag: one(tags, {
    fields: [videoTags.tagId],
    references: [tags.id],
  }),
}));

export const modelVideoRelations = relations(modelVideos, ({ one }) => ({
  model: one(models, {
    fields: [modelVideos.modelId],
    references: [models.id],
  }),
  video: one(videos, {
    fields: [modelVideos.videoId],
    references: [videos.id],
  }),
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

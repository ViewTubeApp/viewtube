// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration
import crypto from "crypto";
import { index, integer, pgTableCreator, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";

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

export const videos = createTable(
  "video",
  {
    title: text("title").notNull(),
    viewsCount: integer("views_count").notNull().default(0),
    processed: boolean("processed").notNull().default(false),
    url: varchar("url", { length: 256 }).notNull(),
    ...defaultFields,
  },
  (example) => [index("video_title_idx").on(example.title)],
);

export type Video = typeof videos.$inferSelect;
export type CreateVideo = typeof videos.$inferInsert;

export const tags = createTable(
  "tag",
  {
    name: varchar("name", { length: 256 }).notNull(),
    ...defaultFields,
  },
  (example) => [index("tag_name_idx").on(example.name)],
);

export type Tag = typeof tags.$inferSelect;

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

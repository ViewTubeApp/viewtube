import { createTable } from "@/utils/server/db";
import { relations } from "drizzle-orm";
import { index, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultFields } from "./default";
import { videos } from "./video";

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

import { createTable } from "@/utils/server/db";
import { relations } from "drizzle-orm";
import { index, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultFields } from "./default";
import { videos } from "./video";

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

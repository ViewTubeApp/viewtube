import { relations } from "drizzle-orm";

import { tags } from "./tag.schema";
import { video_tags } from "./video-tags.schema";

export const tag_relations = relations(tags, ({ many }) => ({
  videos: many(video_tags),
}));

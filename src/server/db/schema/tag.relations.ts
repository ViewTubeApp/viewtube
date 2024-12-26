import { relations } from "drizzle-orm";

import { tags } from "./tag.schema";
import { videoTags } from "./video-tags.schema";

export const tagRelations = relations(tags, ({ many }) => ({
  videos: many(videoTags),
}));

import { z } from "zod";

import { categorySelectSchema } from "./category.schema";
import { modelSelectSchema } from "./model.schema";
import { tagSelectSchema } from "./tag.schema";
import { videoSelectSchema } from "./video.schema";

export const videoExtendedSchema = videoSelectSchema.extend({
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
  categoryVideos: z.array(
    z.object({
      categoryId: z.string(),
      videoId: z.string(),
      category: categorySelectSchema,
    }),
  ),
});

export type VideoExtended = z.infer<typeof videoExtendedSchema>;

import { z } from "zod";

import { categorySelectSchema } from "./category.schema";
import { videoSelectSchema } from "./video.schema";

export const categoryExtendedSchema = categorySelectSchema.extend({
  videos: z.array(
    z.object({
      videoId: z.string(),
      categoryId: z.string(),
      video: videoSelectSchema,
    }),
  ),
});

export type CategoryExtended = z.infer<typeof categoryExtendedSchema>;

import { env } from "@/env";
import { writeFile } from "@/utils/server/file";
import { zfd } from "zod-form-data";

import { publicProcedure } from "@/server/api/trpc";
import { categories } from "@/server/db/schema";

export const createCreateCategoryProcedure = () => {
  return publicProcedure
    .input(
      zfd.formData({
        slug: zfd.text(),
        file: zfd.file(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const file = await writeFile(input.file)
        .saveTo(env.UPLOADS_VOLUME)
        .saveAs("category", [
          {
            format: "webp",
            options: {
              width: 640,
              quality: 80,
              fit: "cover",
            },
          },
        ]);

      return ctx.db.insert(categories).values({ slug: input.slug, imageUrl: file.url }).returning();
    });
};

import { env } from "@/env";
import { writeFile } from "@/utils/server/file";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
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

      const [inserted] = await ctx.db
        .insert(categories)
        .values({ slug: input.slug, image_url: file.url })
        .$returningId();

      if (!inserted?.id) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "error_failed_to_create_category",
        });
      }

      return ctx.db.query.categories.findFirst({ where: eq(categories.id, inserted.id) });
    });
};

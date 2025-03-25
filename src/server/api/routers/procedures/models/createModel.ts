import { env } from "@/env";
import { writeFile } from "@/utils/server/file";
import { zfd } from "zod-form-data";

import { publicProcedure } from "@/server/api/trpc";
import { models } from "@/server/db/schema";

export const createCreateModelProcedure = () =>
  publicProcedure
    .input(
      zfd.formData({
        name: zfd.text(),
        file: zfd.file(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const file = await writeFile(input.file)
        .saveTo(env.UPLOADS_VOLUME)
        .saveAs("model", [
          {
            format: "webp",
            options: {
              width: 640,
              quality: 80,
              fit: "cover",
            },
          },
        ]);

      await ctx.db.insert(models).values({ name: input.name, image_url: file.url });
    });

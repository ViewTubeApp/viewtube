import { getFileUrl, utapi } from "@/utils/server/uploadthing";
import { tasks } from "@trigger.dev/sdk/v3";
import { TRPCError } from "@trpc/server";
import debug from "debug";
import { eq } from "drizzle-orm";
import { ResultAsync } from "neverthrow";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { categories } from "@/server/db/schema";
import { type OptimizeImageTask } from "@/server/trigger/sharp";

const log = debug("api:categories:update");

export const createUpdateCategoryProcedure = () => {
  return publicProcedure
    .input(
      z.object({
        id: z.number(),
        slug: z.string(),
        file_key: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.query.categories.findFirst({ where: eq(categories.id, input.id) });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "error_category_not_found",
        });
      }

      await ctx.db
        .update(categories)
        .set({ slug: input.slug, file_key: input.file_key })
        .where(eq(categories.id, input.id));

      if (category.file_key !== input.file_key) {
        await utapi.deleteFiles([category.file_key]);

        const url = await ResultAsync.fromPromise(getFileUrl(input.file_key, 1 * 60 * 60), (error) => error);

        if (url.isErr()) {
          log("failed to get file URL", url.error);

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "error_failed_to_update_category",
          });
        }

        log("triggering optimize-image for file", category.file_key);

        const handle = await ResultAsync.fromPromise(
          tasks.trigger<OptimizeImageTask>("optimize-image", {
            url: url.value,
            entity: "category",
            id: category.id,
            file_key: input.file_key,
          }),
          (error) => error,
        );

        if (handle.isErr()) {
          log("failed to trigger optimize-image", handle.error);

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "error_failed_to_update_category",
          });
        }
      }

      return ctx.db.query.categories.findFirst({ where: eq(categories.id, input.id) });
    });
};

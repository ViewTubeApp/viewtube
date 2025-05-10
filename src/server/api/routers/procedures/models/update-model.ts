import { getFileUrl, utapi } from "@/utils/server/utapi";
import { tasks } from "@trigger.dev/sdk/v3";
import { TRPCError } from "@trpc/server";
import debug from "debug";
import { eq } from "drizzle-orm";
import { ResultAsync } from "neverthrow";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { models } from "@/server/db/schema";
import { type OptimizeImageTask } from "@/server/trigger/tasks/optimize-image";

const log = debug("api:models:update");

export const createUpdateModelProcedure = () =>
  publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        file_key: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const model = await ctx.db.query.models.findFirst({ where: eq(models.id, input.id) });

      if (!model) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "error_model_not_found",
        });
      }

      await ctx.db
        .update(models)
        .set({
          name: input.name,
          file_key: input.file_key,
        })
        .where(eq(models.id, input.id));

      if (model.file_key !== input.file_key) {
        await utapi.deleteFiles([model.file_key]);

        const url = await ResultAsync.fromPromise(getFileUrl(input.file_key, 1 * 60 * 60), (error) => error);

        if (url.isErr()) {
          log("failed to get file URL", url.error);

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "error_failed_to_update_model",
          });
        }

        log("triggering optimize-image for file", model.file_key);

        const handle = await ResultAsync.fromPromise(
          tasks.trigger<OptimizeImageTask>("optimize-image", {
            url: url.value,
            entity: "model",
            id: model.id,
            file_key: input.file_key,
          }),
          (error) => error,
        );

        if (handle.isErr()) {
          log("failed to trigger optimize-image", handle.error);

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "error_failed_to_update_model",
          });
        }
      }

      return ctx.db.query.models.findFirst({ where: eq(models.id, input.id) });
    });

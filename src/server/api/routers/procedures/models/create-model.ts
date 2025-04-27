import { getFileUrl } from "@/utils/server/uploadthing";
import { tasks } from "@trigger.dev/sdk/v3";
import { TRPCError } from "@trpc/server";
import debug from "debug";
import { eq } from "drizzle-orm";
import { ResultAsync } from "neverthrow";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { models } from "@/server/db/schema";
import { type OptimizeImageTask } from "@/server/trigger/sharp";

const log = debug("api:create_model");

export const createCreateModelProcedure = () =>
  publicProcedure
    .input(
      z.object({
        name: z.string(),
        file_key: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [inserted] = await ctx.db
        .insert(models)
        .values({ name: input.name, file_key: input.file_key })
        .$returningId();

      if (!inserted?.id) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "error_failed_to_create_model",
        });
      }

      const url = await ResultAsync.fromPromise(getFileUrl(input.file_key, 1 * 60 * 60), (error) => error);

      if (url.isErr()) {
        log("failed to get file URL", url.error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "error_failed_to_create_model",
        });
      }

      log("triggering optimize-image for file", input.file_key);

      const handle = await ResultAsync.fromPromise(
        tasks.trigger<OptimizeImageTask>("optimize-image", {
          url: url.value,
          id: inserted.id,
          file_key: input.file_key,
        }),
        (error) => error,
      );

      if (handle.isErr()) {
        log("failed to trigger optimize-image", handle.error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "error_failed_to_create_model",
        });
      }

      return ctx.db.query.models.findFirst({ where: eq(models.id, inserted.id) });
    });

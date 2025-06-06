import { getFileUrl } from "@/utils/server/utapi";
import { tasks } from "@trigger.dev/sdk/v3";
import { TRPCError } from "@trpc/server";
import debug from "debug";
import { ResultAsync } from "neverthrow";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { videos } from "@/server/db/schema";
import { type OptimizeVideoTask } from "@/server/trigger/tasks/optimize-video";

import { manageVideoCategories, manageVideoModels, manageVideoTags } from "../../utils/video";

const log = debug("api:create_video");

export const createCreateVideoProcedure = () => {
  return publicProcedure
    .input(
      z.object({
        title: z.string(),
        tags: z.array(z.string()),
        description: z.string().optional(),
        models: z.array(z.number()).optional(),
        file_key: z.string(),
        categories: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [inserted] = await ctx.db
        .insert(videos)
        .values({
          status: "pending",
          title: input.title,
          file_key: input.file_key,
          description: input.description,
        })
        .returning({ id: videos.id });

      if (!inserted?.id) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "error_failed_to_create_video",
        });
      }

      await Promise.all(
        [
          manageVideoTags(ctx.db, inserted.id, input.tags),
          input.models && manageVideoModels(ctx.db, inserted.id, input.models),
          input.categories && manageVideoCategories(ctx.db, inserted.id, input.categories),
        ].filter(Boolean),
      );

      const record = await ctx.db.query.videos.findFirst({
        where: (videos, { eq }) => eq(videos.id, inserted.id),
        with: {
          video_tags: { with: { tag: true } },
          model_videos: { with: { model: true } },
          category_videos: { with: { category: true } },
        },
      });

      if (!record) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "error_failed_to_create_video",
        });
      }

      const url = await ResultAsync.fromPromise(getFileUrl(input.file_key, 1 * 60 * 60), (error) => error);

      if (url.isErr()) {
        log("failed to get file URL", url.error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "error_failed_to_create_video",
        });
      }

      log("triggering optimize-video for file", input.file_key);

      const handle = await ResultAsync.fromPromise(
        tasks.trigger<OptimizeVideoTask>("optimize-video", {
          url: url.value,
          id: record.id,
          file_key: input.file_key,
        }),
        (error) => error,
      );

      if (handle.isErr()) {
        log("failed to trigger optimize-video", handle.error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "error_failed_to_create_video",
        });
      }

      return {
        record,
        task: handle.value,
      };
    });
};

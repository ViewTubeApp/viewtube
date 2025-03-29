import { getFileUrl } from "@/utils/server/uploadthing";
import { tasks } from "@trigger.dev/sdk/v3";
import { TRPCError } from "@trpc/server";
import debug from "debug";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { videos } from "@/server/db/schema";
import { type processVideo } from "@/server/trigger/ffmpeg";

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
      return ctx.db.transaction(async (tx) => {
        const [inserted] = await tx
          .insert(videos)
          .values({
            status: "pending",
            title: input.title,
            file_key: input.file_key,
            description: input.description,
          })
          .$returningId();

        if (!inserted?.id) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "error_failed_to_create_video",
          });
        }

        await Promise.all(
          [
            manageVideoTags(tx, inserted.id, input.tags),
            input.models && manageVideoModels(tx, inserted.id, input.models),
            input.categories && manageVideoCategories(tx, inserted.id, input.categories),
          ].filter(Boolean),
        );

        const record = await tx.query.videos.findFirst({
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
            message: "error_unknown",
          });
        }

        try {
          const videoUrl = await getFileUrl(input.file_key, 1 * 60 * 60); // signed to 1 hour
          log("triggering process-video for file", input.file_key);

          await tasks.trigger<typeof processVideo>("process-video", {
            videoUrl,
            videoId: record.id,
            fileKey: input.file_key,
          });
        } catch (error) {
          log("failed to trigger process-video", error);
          tx.rollback();
        }

        return record;
      });
    });
};

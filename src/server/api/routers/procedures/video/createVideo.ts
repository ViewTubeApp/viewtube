import { TRPCError } from "@trpc/server";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { videos } from "@/server/db/schema";

import { manageVideoCategories, manageVideoModels, manageVideoTags } from "../../utils/video";

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
        // Create video
        const [inserted] = await tx
          .insert(videos)
          .values({
            title: input.title,
            file_key: input.file_key,
            description: input.description,
            status: "pending",
          })
          .$returningId();

        if (!inserted?.id) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "error_failed_to_create_video",
          });
        }

        // Handle tags, models and categories in parallel
        await Promise.all(
          [
            manageVideoTags(tx, inserted.id, input.tags),
            input.models && manageVideoModels(tx, inserted.id, input.models),
            input.categories && manageVideoCategories(tx, inserted.id, input.categories),
          ].filter(Boolean),
        );

        // Return created video with all relations
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

        return record;
      });
    });
};

import { TRPCError } from "@trpc/server";
import { eq, inArray } from "drizzle-orm";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { category_videos, model_videos, tags, video_tags, videos } from "@/server/db/schema";

export const createUpdateVideoProcedure = () => {
  return publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1),
        tags: z.array(z.string()),
        description: z.string().optional(),
        models: z.array(z.number()).optional(),
        categories: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        // Get current video status
        const currentVideo = await tx.query.videos.findFirst({
          where: (videos, { eq }) => eq(videos.id, input.id),
          columns: { status: true },
        });

        if (!currentVideo) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "error_video_not_found",
          });
        }

        // Don't allow updates while video is processing
        if (currentVideo.status === "processing") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "error_failed_to_update_video",
          });
        }

        // Update video details
        const updateVideoPromise = tx
          .update(videos)
          .set({
            title: input.title,
            ...(input.description !== undefined && { description: input.description }),
          })
          .where(eq(videos.id, input.id));

        const updateTagsPromise = Promise.resolve().then(async () => {
          // Always delete existing tags
          await tx.delete(video_tags).where(eq(video_tags.video_id, input.id));

          // Only insert new tags if there are any
          if (input.tags?.length) {
            // Get existing tags by name
            const existingTags = await tx
              .select({ id: tags.id, name: tags.name })
              .from(tags)
              .where(inArray(tags.name, input.tags));

            const existingTagNames = existingTags.map((tag) => tag.name);
            const newTagNames = input.tags.filter((tag) => !existingTagNames.includes(tag));

            // Create new tags only if we have new ones
            const newTags =
              newTagNames.length ?
                await tx
                  .insert(tags)
                  .values(newTagNames.map((name) => ({ name })))
                  .$returningId()
              : [];

            // Insert video tags (both existing and new)
            if (existingTags.length || newTags.length) {
              await tx.insert(video_tags).values(
                [...existingTags, ...newTags].map((tag) => ({
                  tag_id: tag.id,
                  video_id: input.id,
                })),
              );
            }
          }
        });

        const updateCategoriesPromise = Promise.resolve().then(async () => {
          // Always delete existing categories
          await tx.delete(category_videos).where(eq(category_videos.video_id, input.id));

          // Only insert new categories if there are any
          if (input.categories?.length) {
            await tx
              .insert(category_videos)
              .values(input.categories.map((category) => ({ category_id: category, video_id: input.id })));
          }
        });

        const updateModelsPromise = Promise.resolve().then(async () => {
          // Always delete existing models
          await tx.delete(model_videos).where(eq(model_videos.video_id, input.id));

          // Only insert new models if there are any
          if (input.models?.length) {
            await tx
              .insert(model_videos)
              .values(input.models.map((model) => ({ model_id: model, video_id: input.id })));
          }
        });

        await Promise.all([updateVideoPromise, updateTagsPromise, updateCategoriesPromise, updateModelsPromise]);

        const video = await tx.query.videos.findFirst({
          where: (videos, { eq }) => eq(videos.id, input.id),
          with: {
            video_tags: { with: { tag: true } },
            model_videos: { with: { model: true } },
            category_videos: { with: { category: true } },
          },
        });

        if (!video) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "error_failed_to_update_video",
          });
        }

        return video;
      });
    });
};

import { eq, inArray } from "drizzle-orm";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { categoryVideos, modelVideos, tags, videoTags, videos } from "@/server/db/schema";

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
          throw new Error("Video not found");
        }

        // Don't allow updates while video is processing
        if (currentVideo.status === "processing") {
          throw new Error("Cannot update video while it's being processed");
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
          await tx.delete(videoTags).where(eq(videoTags.videoId, input.id));

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
                  .returning({ id: tags.id, name: tags.name })
              : [];

            // Insert video tags (both existing and new)
            if (existingTags.length || newTags.length) {
              await tx.insert(videoTags).values(
                [...existingTags, ...newTags].map((tag) => ({
                  tagId: tag.id,
                  videoId: input.id,
                })),
              );
            }
          }
        });

        const updateCategoriesPromise = Promise.resolve().then(async () => {
          // Always delete existing categories
          await tx.delete(categoryVideos).where(eq(categoryVideos.videoId, input.id));

          // Only insert new categories if there are any
          if (input.categories?.length) {
            await tx
              .insert(categoryVideos)
              .values(input.categories.map((category) => ({ categoryId: category, videoId: input.id })));
          }
        });

        const updateModelsPromise = Promise.resolve().then(async () => {
          // Always delete existing models
          await tx.delete(modelVideos).where(eq(modelVideos.videoId, input.id));

          // Only insert new models if there are any
          if (input.models?.length) {
            await tx.insert(modelVideos).values(input.models.map((model) => ({ modelId: model, videoId: input.id })));
          }
        });

        await Promise.all([updateVideoPromise, updateTagsPromise, updateCategoriesPromise, updateModelsPromise]);

        const video = await tx.query.videos.findFirst({
          where: (videos, { eq }) => eq(videos.id, input.id),
          with: {
            videoTags: { with: { tag: true } },
            modelVideos: { with: { model: true } },
            categoryVideos: { with: { category: true } },
          },
        });

        if (!video) {
          throw new Error("Failed to update video");
        }

        return video;
      });
    });
};

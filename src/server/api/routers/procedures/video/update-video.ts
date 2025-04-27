import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { videos } from "@/server/db/schema";

import { manageVideoCategories, manageVideoModels, manageVideoTags } from "../../utils/video";

export const createUpdateVideoProcedure = () => {
  return publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
        file_key: z.string(),
        thumbnail_key: z.string().optional(),
        poster_key: z.string().optional(),
        storyboard_key: z.string().optional(),
        trailer_key: z.string().optional(),
        tags: z.array(z.string()),
        description: z.string().optional(),
        models: z.array(z.number()).optional(),
        categories: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get current video status
      let record = await ctx.db.query.videos.findFirst({ where: (videos, { eq }) => eq(videos.id, input.id) });

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "error_video_not_found",
        });
      }

      // Don't allow updates while video is processing
      if (record.status === "processing") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "error_failed_to_update_video",
        });
      }

      // Update video details
      await ctx.db
        .update(videos)
        .set({
          title: input.title || record.title,
          file_key: input.file_key || record.file_key,
          thumbnail_key: input.thumbnail_key || record.thumbnail_key,
          poster_key: input.poster_key || record.poster_key,
          storyboard_key: input.storyboard_key || record.storyboard_key,
          trailer_key: input.trailer_key || record.trailer_key,
          description: input.description || record.description,
        })
        .where(eq(videos.id, input.id));

      // Handle tags, models and categories in parallel
      await Promise.all(
        [
          manageVideoTags(ctx.db, input.id, input.tags),
          input.models && manageVideoModels(ctx.db, input.id, input.models),
          input.categories && manageVideoCategories(ctx.db, input.id, input.categories),
        ].filter(Boolean),
      );

      // Return updated video with all relations
      record = await ctx.db.query.videos.findFirst({
        where: (videos, { eq }) => eq(videos.id, input.id),
        with: {
          video_tags: { with: { tag: true } },
          model_videos: { with: { model: true } },
          category_videos: { with: { category: true } },
        },
      });

      if (!record) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "error_failed_to_update_video",
        });
      }

      return record;
    });
};

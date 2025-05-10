import { generateSignedUrls } from "@/utils/server/video";
import { TRPCError, type inferProcedureOutput } from "@trpc/server";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";

export const createGetVideoByIdProcedure = () => {
  return publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const record = await ctx.db.query.videos.findFirst({
        with: {
          video_tags: { with: { tag: { columns: { id: true, name: true } } } },
          model_videos: { with: { model: { columns: { id: true, name: true } } } },
          category_videos: { with: { category: { columns: { id: true, slug: true } } } },
          video_votes: { columns: { session_id: true, vote_type: true } },
        },
        where: (videos, { eq }) => eq(videos.id, input.id),
      });

      if (!record) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "error_video_not_found",
        });
      }

      const likes_count = record.video_votes.filter((vote) => vote.vote_type === "like").length;
      const dislikes_count = record.video_votes.filter((vote) => vote.vote_type === "dislike").length;
      const my_vote = record.video_votes.find((vote) => vote.session_id === ctx.session?.id);

      const signedUrls = await generateSignedUrls(record);

      return {
        ...record,
        my_vote,
        likes_count,
        dislikes_count,
        signed_urls: signedUrls,
      };
    });
};

export type VideoByIdResponse = inferProcedureOutput<ReturnType<typeof createGetVideoByIdProcedure>>;

import { type inferProcedureOutput } from "@trpc/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { comments } from "@/server/db/schema";

export const createGetCommentsProcedure = () =>
  publicProcedure
    .input(
      z.object({
        videoId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.comments.findMany({
        with: { replies: true },
        where: and(eq(comments.videoId, input.videoId), isNull(comments.parentId)),
        orderBy: [desc(comments.createdAt)],
      });
    });

export type CommentListResponse = inferProcedureOutput<ReturnType<typeof createGetCommentsProcedure>>;
export type CommentListElement = CommentListResponse[number];

import { type inferProcedureOutput } from "@trpc/server";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { videos } from "@/server/db/schema";

import { formatListResponse } from "../../utils/common";
import { buildVideoListQuery } from "../../utils/video";

const getVideoListSchema = z.object({
  limit: z.number().min(1).max(128),
  offset: z.number().min(0).optional(),
  cursor: z.number().optional(),
  model: z.number().optional(),
  category: z.number().optional(),
  tag: z.number().optional(),
  query: z.string().optional().nullable(),
  status: z.array(z.enum(["completed", "processing", "failed", "pending"])).optional(),
  sortBy: z.enum(["created_at", "views_count"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type GetVideoListSchema = z.infer<typeof getVideoListSchema>;

export const createGetVideoListProcedure = () => {
  return publicProcedure.input(getVideoListSchema).query(async ({ ctx, input }) => {
    const lp = buildVideoListQuery(ctx.db, input);
    const tp = ctx.db.$count(videos);
    const [list, result] = await Promise.all([lp, tp]);
    return formatListResponse(list, result, input.limit);
  });
};

export type VideoListResponse = inferProcedureOutput<ReturnType<typeof createGetVideoListProcedure>>;
export type VideoListElement = VideoListResponse["data"][number];

import { type inferProcedureOutput } from "@trpc/server";
import { type SQL, inArray, sql } from "drizzle-orm";
import "server-only";
import { match } from "ts-pattern";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import {
  categories,
  categoryVideos,
  modelVideos,
  models,
  tags,
  videoTags,
  videoVotes,
  videos,
} from "@/server/db/schema";

const getVideoListSchema = z.object({
  limit: z.number().min(1).max(128),
  offset: z.number().min(0).optional(),
  cursor: z.number().optional(),
  model: z.number().optional(),
  category: z.number().optional(),
  tag: z.number().optional(),
  query: z.string().optional().nullable(),
  status: z.array(z.enum(["completed", "processing", "failed", "pending"])).optional(),
  sortBy: z.enum(["createdAt", "viewsCount"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type GetVideoListSchema = z.infer<typeof getVideoListSchema>;

export const createGetVideoListProcedure = () => {
  return publicProcedure.input(getVideoListSchema).query(async ({ ctx, input }) => {
    const listPromise = ctx.db.query.videos.findMany({
      limit: input.limit + 1,
      offset: input.offset,
      with: {
        videoVotes: true,
        videoTags: { with: { tag: true } },
        modelVideos: { with: { model: true } },
        categoryVideos: { with: { category: true } },
      },
      extras: {
        likesCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${videoVotes} vv
          WHERE vv.video_id = ${videos.id}
          AND vv.vote_type = 'like'
        )`.as("likes_count"),
        dislikesCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${videoVotes} vv
          WHERE vv.video_id = ${videos.id}
          AND vv.vote_type = 'dislike'
        )`.as("dislikes_count"),
      },
      where: (videos, { and, eq, ilike, or, exists, gt, lt }) => {
        const args: Array<SQL | undefined> = [];

        // Filter by query
        if (input.query) {
          const tagQuery = ctx.db
            .select()
            .from(tags)
            .where(and(eq(tags.id, videoTags.tagId), ilike(tags.name, "%" + input.query + "%")));

          const categoryQuery = ctx.db
            .select()
            .from(categories)
            .where(and(eq(categories.id, categoryVideos.categoryId), ilike(categories.slug, "%" + input.query + "%")));

          const modelQuery = ctx.db
            .select()
            .from(models)
            .where(and(eq(models.id, modelVideos.modelId), ilike(models.name, "%" + input.query + "%")));

          args.push(
            or(
              // Filter by title
              ilike(videos.title, "%" + input.query + "%"),
              // Filter by description
              ilike(videos.description, "%" + input.query + "%"),
              // Filter by tag name
              exists(
                ctx.db
                  .select()
                  .from(videoTags)
                  .where(and(eq(videoTags.videoId, videos.id), exists(tagQuery))),
              ),
              // Filter by category name
              exists(
                ctx.db
                  .select()
                  .from(categoryVideos)
                  .where(and(eq(categoryVideos.videoId, videos.id), exists(categoryQuery))),
              ),
              // Filter by model name
              exists(
                ctx.db
                  .select()
                  .from(modelVideos)
                  .where(and(eq(modelVideos.videoId, videos.id), exists(modelQuery))),
              ),
            ),
          );
        }

        // Filter by status
        if (input.status) {
          args.push(inArray(videos.status, input.status));
        } else {
          args.push(eq(videos.status, "completed"));
        }

        // Filter by category id
        if (input.category) {
          args.push(
            exists(
              ctx.db
                .select()
                .from(categoryVideos)
                .where(and(eq(categoryVideos.videoId, videos.id), eq(categoryVideos.categoryId, input.category))),
            ),
          );
        }

        // Filter by model id
        if (input.model) {
          args.push(
            exists(
              ctx.db
                .select()
                .from(modelVideos)
                .where(and(eq(modelVideos.videoId, videos.id), eq(modelVideos.modelId, input.model))),
            ),
          );
        }

        if (input.tag) {
          args.push(
            exists(
              ctx.db
                .select()
                .from(videoTags)
                .where(and(eq(videoTags.videoId, videos.id), eq(videoTags.tagId, input.tag))),
            ),
          );
        }

        // Filter by cursor
        if (input.cursor) {
          const operatorFn = match(input)
            .with({ sortOrder: "desc" }, () => lt)
            .with({ sortOrder: "asc" }, () => gt)
            .exhaustive();

          args.push(operatorFn(videos.id, input.cursor));
        }

        return and(...args);
      },
      orderBy: (videos, { desc, asc }) => {
        const sortFn = match(input)
          .with({ sortOrder: "desc" }, () => desc)
          .with({ sortOrder: "asc" }, () => asc)
          .exhaustive();

        const sortBy = input.sortBy ?? "createdAt";

        return [sortFn(videos[sortBy]), sortFn(videos.id)];
      },
    });

    const totalPromise = ctx.db.$count(videos);
    const [list, total] = await Promise.all([listPromise, totalPromise]);

    let nextCursor: typeof input.cursor | undefined;

    if (list.length > input.limit) {
      const nextItem = list.pop();
      nextCursor = nextItem?.id;
    }

    return {
      data: list,
      meta: { total, nextCursor },
    };
  });
};

export type VideoListResponse = inferProcedureOutput<ReturnType<typeof createGetVideoListProcedure>>;
export type VideoListElement = VideoListResponse["data"][number];

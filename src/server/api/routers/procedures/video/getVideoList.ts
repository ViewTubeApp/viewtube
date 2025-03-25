import { type inferProcedureOutput } from "@trpc/server";
import { type SQL, inArray, sql } from "drizzle-orm";
import "server-only";
import { match } from "ts-pattern";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import {
  categories,
  category_videos,
  model_videos,
  models,
  tags,
  video_tags,
  video_votes,
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
  sortBy: z.enum(["created_at", "views_count"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type GetVideoListSchema = z.infer<typeof getVideoListSchema>;

export const createGetVideoListProcedure = () => {
  return publicProcedure.input(getVideoListSchema).query(async ({ ctx, input }) => {
    const listPromise = ctx.db.query.videos.findMany({
      limit: input.limit + 1,
      offset: input.offset,
      with: {
        video_votes: true,
        video_tags: { with: { tag: true } },
        model_videos: { with: { model: true } },
        category_videos: { with: { category: true } },
      },
      extras: {
        likes_count: sql<number>`(
          SELECT COUNT(*)
          FROM ${video_votes} vv
          WHERE vv.video_id = ${videos.id}
          AND vv.vote_type = 'like'
        )`.as("likes_count"),
        dislikes_count: sql<number>`(
          SELECT COUNT(*)
          FROM ${video_votes} vv
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
            .where(and(eq(tags.id, video_tags.tag_id), ilike(tags.name, "%" + input.query + "%")));

          const categoryQuery = ctx.db
            .select()
            .from(categories)
            .where(
              and(eq(categories.id, category_videos.category_id), ilike(categories.slug, "%" + input.query + "%")),
            );

          const modelQuery = ctx.db
            .select()
            .from(models)
            .where(and(eq(models.id, model_videos.model_id), ilike(models.name, "%" + input.query + "%")));

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
                  .from(video_tags)
                  .where(and(eq(video_tags.video_id, videos.id), exists(tagQuery))),
              ),
              // Filter by category name
              exists(
                ctx.db
                  .select()
                  .from(category_videos)
                  .where(and(eq(category_videos.video_id, videos.id), exists(categoryQuery))),
              ),
              // Filter by model name
              exists(
                ctx.db
                  .select()
                  .from(model_videos)
                  .where(and(eq(model_videos.video_id, videos.id), exists(modelQuery))),
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
                .from(category_videos)
                .where(and(eq(category_videos.video_id, videos.id), eq(category_videos.category_id, input.category))),
            ),
          );
        }

        // Filter by model id
        if (input.model) {
          args.push(
            exists(
              ctx.db
                .select()
                .from(model_videos)
                .where(and(eq(model_videos.video_id, videos.id), eq(model_videos.model_id, input.model))),
            ),
          );
        }

        if (input.tag) {
          args.push(
            exists(
              ctx.db
                .select()
                .from(video_tags)
                .where(and(eq(video_tags.video_id, videos.id), eq(video_tags.tag_id, input.tag))),
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

        const sortBy = input.sortBy ?? "created_at";

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

import { type inferTransformedProcedureOutput } from "@trpc/server";
import { parseISO } from "date-fns/parseISO";
import { type SQL, count, eq, sql } from "drizzle-orm";
import { match } from "ts-pattern";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { tags, videoTags } from "@/server/db/schema";

export const getTagListSchema = z.object({
  limit: z.number().min(1).max(128),
  offset: z.number().min(0).optional(),
  cursor: z.object({ id: z.string(), createdAt: z.string() }).optional(),
  query: z.string().optional().nullable(),
  sortBy: z.enum(["name", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type GetTagListSchema = z.infer<typeof getTagListSchema>;

const deleteTagSchema = z.object({
  id: z.string(),
});

export type DeleteTagSchema = z.infer<typeof deleteTagSchema>;

export const tagsRouter = createTRPCRouter({
  getTagList: publicProcedure.input(getTagListSchema).query(async ({ ctx, input }) => {
    const list = await ctx.db.query.tags.findMany({
      limit: input.limit,
      offset: input.offset,

      extras: {
        assignedVideosCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${videoTags}
          WHERE ${videoTags.tagId} = ${tags.id}
        )`.as("assigned_videos_count"),
      },

      orderBy: (tags, { asc, desc }) => {
        return match(input)
          .with({ sortBy: "name", sortOrder: "asc" }, () => [asc(tags.name)])
          .with({ sortBy: "name", sortOrder: "desc" }, () => [desc(tags.name)])
          .with({ sortBy: "createdAt", sortOrder: "asc" }, () => [asc(tags.createdAt)])
          .with({ sortBy: "createdAt", sortOrder: "desc" }, () => [desc(tags.createdAt)])
          .otherwise(() => [asc(tags.createdAt), asc(tags.name)]);
      },

      where: (tags, { ilike, and, or, lt, gt }) => {
        const args: Array<SQL | undefined> = [];

        // Filter by query
        if (input.query) {
          args.push(ilike(tags.name, "%" + input.query + "%"));
        }

        // Filter by cursor
        if (input.cursor) {
          const operatorFn = match(input)
            .with({ sortOrder: "desc" }, () => lt)
            .with({ sortOrder: "asc" }, () => gt)
            .exhaustive();

          args.push(
            or(
              operatorFn(tags.createdAt, parseISO(input.cursor.createdAt)),
              and(eq(tags.createdAt, parseISO(input.cursor.createdAt)), operatorFn(tags.id, input.cursor.id)),
            ),
          );
        }

        return and(...args);
      },
    });

    const total = (await ctx.db.select({ count: count() }).from(tags)).at(0)?.count ?? 0;

    return {
      data: list,
      meta: { total },
    };
  }),

  deleteTag: publicProcedure.input(deleteTagSchema).mutation(async ({ ctx, input }) => {
    return ctx.db.delete(tags).where(eq(tags.id, input.id)).returning({ id: tags.id });
  }),
});

export type TagListResponse = inferTransformedProcedureOutput<typeof tagsRouter, typeof tagsRouter.getTagList>;

export type TagResponse = TagListResponse["data"][number];

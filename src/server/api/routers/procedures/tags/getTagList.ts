import { type inferProcedureOutput } from "@trpc/server";
import { type SQL, sql } from "drizzle-orm";
import { match } from "ts-pattern";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { tags, videoTags } from "@/server/db/schema";

const getTagListSchema = z.object({
  limit: z.number().min(1).max(128),
  offset: z.number().min(0).optional(),
  cursor: z.number().optional(),
  query: z.string().optional().nullable(),
  sortBy: z.enum(["name", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type GetTagListSchema = z.infer<typeof getTagListSchema>;

export const createGetTagListProcedure = () =>
  publicProcedure.input(getTagListSchema).query(async ({ ctx, input }) => {
    const listPromise = ctx.db.query.tags.findMany({
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

      where: (tags, { ilike, and, lt, gt }) => {
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

          args.push(operatorFn(tags.id, input.cursor));
        }

        return and(...args);
      },
    });

    const totalPromise = ctx.db.$count(tags);
    const [list, total] = await Promise.all([listPromise, totalPromise]);

    return {
      data: list,
      meta: { total },
    };
  });

export type TagListResponse = inferProcedureOutput<ReturnType<typeof createGetTagListProcedure>>;
export type TagListElement = TagListResponse["data"][number];

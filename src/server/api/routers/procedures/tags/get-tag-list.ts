import { type inferProcedureOutput } from "@trpc/server";
import { type SQL } from "drizzle-orm";
import { match } from "ts-pattern";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { tags } from "@/server/db/schema";

import { formatListResponse } from "../../utils/common";

const getTagListSchema = z.object({
  limit: z.number().min(1).max(128),
  offset: z.number().min(0).optional(),
  cursor: z.number().optional(),
  query: z.string().optional().nullable(),
  sortBy: z.enum(["name", "created_at"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type GetTagListSchema = z.infer<typeof getTagListSchema>;

export const createGetTagListProcedure = () =>
  publicProcedure.input(getTagListSchema).query(async ({ ctx, input }) => {
    const lp = ctx.db.query.tags.findMany({
      limit: input.limit,
      offset: input.offset,
      with: { videos: { columns: { id: true } } },

      orderBy: (tags, { asc, desc }) => {
        return match(input)
          .with({ sortBy: "name", sortOrder: "asc" }, () => [asc(tags.name)])
          .with({ sortBy: "name", sortOrder: "desc" }, () => [desc(tags.name)])
          .with({ sortBy: "created_at", sortOrder: "asc" }, () => [asc(tags.created_at)])
          .with({ sortBy: "created_at", sortOrder: "desc" }, () => [desc(tags.created_at)])
          .otherwise(() => [asc(tags.created_at), asc(tags.name)]);
      },

      where: (tags, { ilike, and, lt, gt }) => {
        const filters: Array<SQL | undefined> = [];

        // Filter by query
        if (input.query) {
          filters.push(ilike(tags.name, "%" + input.query + "%"));
        }

        // Filter by cursor
        if (input.cursor) {
          const fn = match(input)
            .with({ sortOrder: "desc" }, () => lt)
            .with({ sortOrder: "asc" }, () => gt)
            .exhaustive();

          filters.push(fn(tags.id, input.cursor));
        }

        return and(...filters);
      },
    });

    const tp = ctx.db.$count(tags);
    const [list, total] = await Promise.all([lp, tp]);
    return formatListResponse(list, total, input.limit);
  });

export type TagListResponse = inferProcedureOutput<ReturnType<typeof createGetTagListProcedure>>;
export type TagListElement = TagListResponse["data"][number];

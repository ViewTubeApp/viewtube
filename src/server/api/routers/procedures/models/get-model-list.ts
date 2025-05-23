import { type inferProcedureOutput } from "@trpc/server";
import { type SQL } from "drizzle-orm";
import { match } from "ts-pattern";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { models } from "@/server/db/schema";

import { formatListResponse } from "../../utils/common";

const getModelListSchema = z.object({
  limit: z.number().min(1).max(128),
  offset: z.number().min(0).optional(),
  cursor: z.number().optional(),
  query: z.string().optional(),
  sortBy: z.enum(["name", "created_at"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type GetModelListSchema = z.infer<typeof getModelListSchema>;

export const createGetModelListProcedure = () =>
  publicProcedure.input(getModelListSchema).query(async ({ ctx, input }) => {
    const lp = ctx.db.query.models.findMany({
      limit: input.limit + 1,
      offset: input.offset,
      with: { videos: { columns: { id: true } } },

      orderBy: (models, { asc, desc }) => {
        return match(input)
          .with({ sortBy: "name", sortOrder: "asc" }, () => [asc(models.name)])
          .with({ sortBy: "name", sortOrder: "desc" }, () => [desc(models.name)])
          .with({ sortBy: "created_at", sortOrder: "asc" }, () => [asc(models.created_at)])
          .with({ sortBy: "created_at", sortOrder: "desc" }, () => [desc(models.created_at)])
          .otherwise(() => [asc(models.created_at), asc(models.name)]);
      },

      where: (models, { ilike, lt, gt, and }) => {
        const filters: Array<SQL | undefined> = [];

        // Filter by query
        if (input.query) {
          filters.push(
            // Filter by name
            ilike(models.name, "%" + input.query + "%"),
          );
        }

        // Filter by cursor
        if (input.cursor) {
          const fn = match(input)
            .with({ sortOrder: "desc" }, () => lt)
            .with({ sortOrder: "asc" }, () => gt)
            .exhaustive();

          filters.push(fn(models.id, input.cursor));
        }

        return and(...filters);
      },
    });

    const tp = ctx.db.$count(models);
    const [list, total] = await Promise.all([lp, tp]);
    return formatListResponse(list, total, input.limit);
  });

export type ModelListResponse = inferProcedureOutput<ReturnType<typeof createGetModelListProcedure>>;
export type ModelListElement = ModelListResponse["data"][number];

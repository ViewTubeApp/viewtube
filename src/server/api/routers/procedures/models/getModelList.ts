import { type inferProcedureOutput } from "@trpc/server";
import { type SQL, sql } from "drizzle-orm";
import { match } from "ts-pattern";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { modelVideos, models } from "@/server/db/schema";

const getModelListSchema = z.object({
  limit: z.number().min(1).max(128),
  offset: z.number().min(0).optional(),
  cursor: z.number().optional(),
  query: z.string().optional(),
  sortBy: z.enum(["name", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type GetModelListSchema = z.infer<typeof getModelListSchema>;

export const createGetModelListProcedure = () =>
  publicProcedure.input(getModelListSchema).query(async ({ ctx, input }) => {
    const listPromise = ctx.db.query.models.findMany({
      limit: input.limit + 1,
      offset: input.offset,

      extras: {
        assignedVideosCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${modelVideos}
          WHERE ${modelVideos.modelId} = ${models.id}
        )`.as("assigned_videos_count"),
      },

      orderBy: (models, { asc, desc }) => {
        return match(input)
          .with({ sortBy: "name", sortOrder: "asc" }, () => [asc(models.name)])
          .with({ sortBy: "name", sortOrder: "desc" }, () => [desc(models.name)])
          .with({ sortBy: "createdAt", sortOrder: "asc" }, () => [asc(models.createdAt)])
          .with({ sortBy: "createdAt", sortOrder: "desc" }, () => [desc(models.createdAt)])
          .otherwise(() => [asc(models.createdAt), asc(models.name)]);
      },

      where: (models, { ilike, lt, gt, and }) => {
        const args: Array<SQL | undefined> = [];

        // Filter by query
        if (input.query) {
          args.push(
            // Filter by name
            ilike(models.name, "%" + input.query + "%"),
          );
        }

        // Filter by cursor
        if (input.cursor) {
          const operatorFn = match(input)
            .with({ sortOrder: "desc" }, () => lt)
            .with({ sortOrder: "asc" }, () => gt)
            .exhaustive();

          args.push(operatorFn(models.id, input.cursor));
        }

        return and(...args);
      },
    });

    const totalPromise = ctx.db.$count(models);
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

export type ModelListResponse = inferProcedureOutput<ReturnType<typeof createGetModelListProcedure>>;
export type ModelListElement = ModelListResponse["data"][number];

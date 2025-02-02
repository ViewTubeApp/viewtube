import { env } from "@/env";
import { deleteFile, writeFile } from "@/utils/server/file";
import { type inferTransformedProcedureOutput } from "@trpc/server";
import { type SQL, eq, sql } from "drizzle-orm";
import path from "path";
import { match } from "ts-pattern";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
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

const createModelSchema = zfd.formData({
  name: zfd.text(),
  file: zfd.file(),
});

export type CreateModelSchema = z.infer<typeof createModelSchema>;

const deleteModelSchema = z.object({
  id: z.number(),
});

export type DeleteModelSchema = z.infer<typeof deleteModelSchema>;

const getModelByIdSchema = z.object({
  id: z.number(),
});

export type GetModelByIdSchema = z.infer<typeof getModelByIdSchema>;

const updateModelSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
});

export type UpdateModelSchema = z.infer<typeof updateModelSchema>;

export const modelsRouter = createTRPCRouter({
  getModelList: publicProcedure.input(getModelListSchema).query(async ({ ctx, input }) => {
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
  }),

  getModelById: publicProcedure.input(getModelByIdSchema).query(async ({ ctx, input }) => {
    return ctx.db.query.models.findFirst({ where: eq(models.id, input.id) });
  }),

  createModel: publicProcedure.input(createModelSchema).mutation(async ({ ctx, input }) => {
    const file = await writeFile(input.file)
      .saveTo(env.UPLOADS_VOLUME)
      .saveAs("model", [
        {
          format: "webp",
          options: {
            width: 640,
            quality: 80,
            fit: "cover",
          },
        },
      ]);

    return ctx.db.insert(models).values({ name: input.name, imageUrl: file.url }).returning();
  }),

  updateModel: publicProcedure.input(updateModelSchema).mutation(async ({ ctx, input }) => {
    return ctx.db.update(models).set({ name: input.name }).where(eq(models.id, input.id)).returning();
  }),

  deleteModel: publicProcedure.input(deleteModelSchema).mutation(async ({ ctx, input }) => {
    const model = await ctx.db.query.models.findFirst({ where: eq(models.id, input.id) });

    if (!model) {
      throw new Error("Model not found");
    }

    await deleteFile(path.join(env.UPLOADS_VOLUME, path.basename(path.dirname(model.imageUrl))));
    return ctx.db.delete(models).where(eq(models.id, input.id)).returning({ id: models.id });
  }),
});

export type ModelListResponse = inferTransformedProcedureOutput<typeof modelsRouter, typeof modelsRouter.getModelList>;

export type ModelResponse = ModelListResponse["data"][number];

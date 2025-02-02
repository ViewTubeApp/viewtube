import { env } from "@/env";
import { deleteFile, writeFile } from "@/utils/server/file";
import { type inferTransformedProcedureOutput } from "@trpc/server";
import { type SQL, eq, inArray, sql } from "drizzle-orm";
import path from "path";
import "server-only";
import { match } from "ts-pattern";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  type CreateVideoTask,
  type TaskType,
  categories,
  categoryVideos,
  modelVideos,
  models,
  tags,
  videoTags,
  videoTasks,
  videos,
} from "@/server/db/schema";

import { AMQP } from "@/constants/amqp";
import { TRAILER_CONFIG, type TrailerConfig, WEBVTT_CONFIG, type WebVTTConfig } from "@/constants/video";

const getVideoListSchema = z.object({
  limit: z.number().min(1).max(128),
  offset: z.number().min(0).optional(),
  cursor: z.number().optional(),
  model: z.number().optional(),
  category: z.number().optional(),
  query: z.string().optional().nullable(),
  status: z.array(z.enum(["completed", "processing", "failed", "pending"])).optional(),
  sortBy: z.enum(["createdAt", "viewsCount"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type GetVideoListSchema = z.infer<typeof getVideoListSchema>;

const getVideoByIdSchema = z.object({
  id: z.number(),
  shallow: z.boolean().optional(),
  related: z.boolean().optional(),
});

export type GetVideoByIdSchema = z.infer<typeof getVideoByIdSchema>;

const uploadVideoSchema = zfd.formData({
  file: zfd.file(),
  title: zfd.text(),
  description: zfd.text(z.string().optional()),
  tags: zfd.repeatableOfType(z.string()).optional(),
  categories: zfd.repeatableOfType(z.string()).optional(),
  models: zfd.repeatableOfType(z.string()).optional(),
});

export type UploadVideoSchema = z.infer<typeof uploadVideoSchema>;

export const updateVideoSchema = z.object({
  id: z.number(),
  title: z.string().min(1),
  tags: z.array(z.string()),
  description: z.string().optional(),
  models: z.array(z.number()).optional(),
  categories: z.array(z.number()).optional(),
});

export type UpdateVideoSchema = z.infer<typeof updateVideoSchema>;

export const deleteVideoSchema = z.object({
  id: z.number(),
});

export type DeleteVideoSchema = z.infer<typeof deleteVideoSchema>;

export const videoRouter = createTRPCRouter({
  getVideoList: publicProcedure.input(getVideoListSchema).query(async ({ ctx, input }) => {
    const listPromise = ctx.db.query.videos.findMany({
      limit: input.limit,
      offset: input.offset,
      with: {
        videoTags: { with: { tag: true } },
        modelVideos: { with: { model: true } },
        categoryVideos: { with: { category: true } },
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

    return {
      data: list,
      meta: { total },
    };
  }),

  getVideoById: publicProcedure.input(getVideoByIdSchema).query(async ({ ctx, input }) => {
    return ctx.db.transaction(
      async (tx) => {
        const viewsCountPromise = Promise.resolve().then(async () => {
          // Increment views count
          if (input.shallow) {
            return;
          }

          await tx
            .update(videos)
            .set({ viewsCount: sql`${videos.viewsCount} + 1` })
            .where(eq(videos.id, input.id));
        });

        // Get video details
        const videoPromise = tx.query.videos.findFirst({
          with: {
            videoTags: { with: { tag: true } },
            modelVideos: { with: { model: true } },
            categoryVideos: { with: { category: true } },
          },
          where: (videos, { eq }) => eq(videos.id, input.id),
        });

        const relatedPromise = Promise.resolve().then(async () => {
          if (!input.related) {
            return [];
          }

          // Get related videos
          return tx.query.videos.findMany({
            limit: 32,
            with: {
              videoTags: { with: { tag: true } },
              modelVideos: { with: { model: true } },
              categoryVideos: { with: { category: true } },
            },
            orderBy: (videos, { desc }) => [desc(videos.createdAt)],
            where: (videos, { not, eq, and }) => and(not(eq(videos.id, input.id)), eq(videos.status, "completed")),
          });
        });

        const [video, related] = await Promise.all([videoPromise, relatedPromise, viewsCountPromise]);

        return { video, related };
      },
      {
        accessMode: "read write",
        isolationLevel: "read committed",
      },
    );
  }),

  uploadVideo: publicProcedure.input(uploadVideoSchema).mutation(async ({ ctx, input }) => {
    interface MqVideoTaskConfig {
      webvtt?: WebVTTConfig;
      trailer?: TrailerConfig;
    }

    interface MqVideoTask {
      videoId: number;
      taskType: TaskType;
      filePath: string;
      outputPath: string;
      config?: MqVideoTaskConfig;
    }

    const file = await writeFile(input.file).saveTo(env.UPLOADS_VOLUME).saveAs("video");

    const createdVideo = await ctx.db.transaction(
      async (tx) => {
        // Create video record
        const [createdVideo] = await tx
          .insert(videos)
          .values({
            url: file.url,
            status: "pending",
            title: input.title,
            description: input.description,
          })
          .returning({ id: videos.id });

        if (!createdVideo) {
          throw new Error("Failed to create video record");
        }

        // Create task records
        const dbTasks: CreateVideoTask[] = [
          {
            videoId: createdVideo.id,
            taskType: "poster",
            status: "pending",
          },
          {
            videoId: createdVideo.id,
            taskType: "webvtt",
            status: "pending",
          },
          {
            videoId: createdVideo.id,
            taskType: "trailer",
            status: "pending",
          },
          {
            videoId: createdVideo.id,
            taskType: "duration",
            status: "pending",
          },
        ];

        // Insert tasks into database
        const tasksPromise = tx.insert(videoTasks).values(dbTasks);

        const tagsPromise = Promise.resolve().then(async () => {
          if (!input.tags) {
            return;
          }

          // Get existing tags
          const existingTags = await tx.select({ id: tags.id }).from(tags).where(inArray(tags.name, input.tags));

          // Create new tags
          const newTags = await tx
            .insert(tags)
            .values(input.tags.map((tag) => ({ name: tag })))
            .returning({ id: tags.id })
            .onConflictDoNothing();

          // Combine existing and new tags
          const allTags = [...existingTags, ...(newTags ?? [])];

          // Create video-tag relations
          await tx.insert(videoTags).values(
            allTags.map((tag) => ({
              tagId: tag.id,
              videoId: createdVideo.id,
            })),
          );
        });

        const categoriesPromise = Promise.resolve().then(async () => {
          if (!input.categories) {
            return;
          }

          // Create video-category relations
          await tx
            .insert(categoryVideos)
            .values(input.categories.map((category) => ({ categoryId: Number(category), videoId: createdVideo.id })));
        });

        const modelsPromise = Promise.resolve().then(async () => {
          if (!input.models) {
            return;
          }

          // Create video-model relations
          await tx
            .insert(modelVideos)
            .values(input.models.map((model) => ({ modelId: Number(model), videoId: createdVideo.id })));
        });

        await Promise.all([tasksPromise, tagsPromise, categoriesPromise, modelsPromise]);

        return createdVideo;
      },
      {
        accessMode: "read write",
        isolationLevel: "repeatable read",
      },
    );

    // Prepare tasks for RabbitMQ
    const mqTasks: MqVideoTask[] = [
      {
        videoId: createdVideo.id,
        taskType: "poster",
        filePath: file.path,
        outputPath: path.dirname(file.path),
      },
      {
        videoId: createdVideo.id,
        taskType: "webvtt",
        filePath: file.path,
        outputPath: path.dirname(file.path),
        config: { webvtt: WEBVTT_CONFIG },
      },
      {
        videoId: createdVideo.id,
        taskType: "trailer",
        filePath: file.path,
        outputPath: path.dirname(file.path),
        config: { trailer: TRAILER_CONFIG },
      },
      {
        videoId: createdVideo.id,
        taskType: "duration",
        filePath: file.path,
        outputPath: path.dirname(file.path),
      },
    ];

    // Publish each task individually
    await Promise.all(
      mqTasks.map((task) =>
        ctx.amqp.pub.publish(AMQP.exchange, `video.task.${task.taskType}`, Buffer.from(JSON.stringify(task)), {
          persistent: true,
        }),
      ),
    );

    return { file };
  }),

  updateVideo: publicProcedure.input(updateVideoSchema).mutation(async ({ ctx, input }) => {
    return ctx.db.transaction(async (tx) => {
      // Get current video status
      const currentVideo = await tx.query.videos.findFirst({
        where: (videos, { eq }) => eq(videos.id, input.id),
        columns: { status: true },
      });

      if (!currentVideo) {
        throw new Error("Video not found");
      }

      // Don't allow updates while video is processing
      if (currentVideo.status === "processing") {
        throw new Error("Cannot update video while it's being processed");
      }

      // Update video details
      const updateVideoPromise = tx
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
        })
        .where(eq(videos.id, input.id));

      const updateTagsPromise = Promise.resolve().then(async () => {
        // Delete existing tags
        await tx.delete(videoTags).where(eq(videoTags.videoId, input.id));

        // Insert new tags
        const existingTags = await tx
          .select({ id: tags.id, name: tags.name })
          .from(tags)
          .where(inArray(tags.name, input.tags));

        const existingTagNames = existingTags.map((tag) => tag.name);
        const newTagNames = input.tags.filter((tag) => !existingTagNames.includes(tag));

        // Create new tags
        const newTags = await tx
          .insert(tags)
          .values(newTagNames.map((name) => ({ name })))
          .returning({ id: tags.id, name: tags.name });

        // Insert video tags
        const allTags = [...existingTags, ...newTags];
        await tx.insert(videoTags).values(
          allTags.map((tag) => ({
            tagId: tag.id,
            videoId: input.id,
          })),
        );
      });

      const updateCategoriesPromise = Promise.resolve().then(async () => {
        // Update categories
        await tx.delete(categoryVideos).where(eq(categoryVideos.videoId, input.id));

        // Insert new categories
        await tx
          .insert(categoryVideos)
          .values(input.categories!.map((category) => ({ categoryId: category, videoId: input.id })));
      });

      const updateModelsPromise = Promise.resolve().then(async () => {
        // Update models
        await tx.delete(modelVideos).where(eq(modelVideos.videoId, input.id));

        // Insert new models
        await tx.insert(modelVideos).values(input.models!.map((model) => ({ modelId: model, videoId: input.id })));
      });

      await Promise.all([updateVideoPromise, updateTagsPromise, updateCategoriesPromise, updateModelsPromise]);

      const video = await tx.query.videos.findFirst({
        where: (videos, { eq }) => eq(videos.id, input.id),
        with: {
          videoTags: { with: { tag: true } },
          modelVideos: { with: { model: true } },
          categoryVideos: { with: { category: true } },
        },
      });

      return video;
    });
  }),

  deleteVideo: publicProcedure.input(deleteVideoSchema).mutation(async ({ ctx, input }) => {
    const video = await ctx.db.query.videos.findFirst({ where: (videos, { eq }) => eq(videos.id, input.id) });

    if (!video) {
      throw new Error("Video not found");
    }

    await deleteFile(path.join(env.UPLOADS_VOLUME, path.basename(path.dirname(video.url))));
    await ctx.db.delete(videos).where(eq(videos.id, input.id));
  }),
});

export type VideoListResponse = inferTransformedProcedureOutput<typeof videoRouter, typeof videoRouter.getVideoList>;
export type VideoResponse = VideoListResponse["data"][number];

export type VideoByIdResponse = inferTransformedProcedureOutput<typeof videoRouter, typeof videoRouter.getVideoById>;

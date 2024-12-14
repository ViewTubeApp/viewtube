import "server-only";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { tags, videos, videoTags } from "@/server/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { zfd } from "zod-form-data";
import { writeFileToDisk } from "@/lib/file";
import { RELATED_LOAD_COUNT } from "@/constants/shared";
import path from "path";
import { WEBVTT_CONFIG, type WebVTTConfig, TRAILER_CONFIG, type TrailerConfig } from "@/constants/video";
import { RABBITMQ } from "@/constants/amqp";

type TaskType = "poster" | "webvtt" | "trailer";

type VideoTaskConfig = {
  webvtt?: WebVTTConfig;
  trailer?: TrailerConfig;
};

interface VideoTask {
  videoId: string;
  taskType: TaskType;
  filePath: string;
  outputPath: string;
  config?: VideoTaskConfig;
}

export const videoRouter = createTRPCRouter({
  latest: publicProcedure
    .input(
      z.object({
        query: z.string().optional().nullable(),
        count: z.number().min(1).max(1024),
      }),
    )
    .query(async ({ ctx, input }) => {
      ctx.log.debug("Query params: %o", {
        limit: input.count,
        query: input.query,
      });

      const results = await ctx.db.query.videos.findMany({
        limit: input.count,
        with: { videoTags: { with: { tag: true } }, modelVideos: { with: { model: true } } },
        where: (videos, { and, eq, ilike }) => {
          const onlyProcessed = eq(videos.processed, true);
          const titleLike = ilike(videos.title, "%" + input.query + "%");

          if (input.query) {
            ctx.log.debug(`Searching for videos with title containing "${input.query}"`);
            return and(onlyProcessed, titleLike);
          }

          ctx.log.debug("Fetching all processed videos");
          return onlyProcessed;
        },
        orderBy: (videos, { desc }) => [desc(videos.createdAt)],
      });
      const videos = results ?? [];

      ctx.log.debug(`Found ${videos.length} videos`);

      const latestVideo = videos[0];
      if (latestVideo) {
        ctx.log.debug("Latest video: %o", {
          id: latestVideo.id,
          title: latestVideo.title,
          processed: latestVideo.processed,
        });
      } else {
        ctx.log.debug("No videos found");
      }

      return videos;
    }),

  one: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      ctx.log.debug(`Fetching video details for ID: ${input.id}`);

      return ctx.db.transaction(
        async (tx) => {
          // Increment views count
          await tx
            .update(videos)
            .set({ viewsCount: sql`${videos.viewsCount} + 1` })
            .where(eq(videos.id, input.id));
          ctx.log.debug(`Updated views count for video ${input.id}`);

          // Get video details
          const video = await tx.query.videos.findFirst({
            with: { videoTags: { with: { tag: true } }, modelVideos: { with: { model: true } } },
            where: (videos, { eq }) => eq(videos.id, input.id),
          });
          ctx.log.debug("Video details: %o", {
            found: !!video,
            id: video?.id,
            title: video?.title,
            processed: video?.processed,
            viewsCount: video?.viewsCount,
          });

          // Get related videos
          const related = await tx.query.videos.findMany({
            with: { videoTags: { with: { tag: true } }, modelVideos: { with: { model: true } } },
            where: (videos, { not, eq, and }) => and(not(eq(videos.id, input.id)), eq(videos.processed, true)),
            orderBy: (videos, { desc }) => [desc(videos.createdAt)],
            limit: RELATED_LOAD_COUNT,
          });
          ctx.log.debug(`Found ${related.length} related videos`);

          const firstRelated = related[0];
          if (firstRelated) {
            ctx.log.debug("First related video: %o", {
              id: firstRelated.id,
              title: firstRelated.title,
              processed: firstRelated.processed,
            });
          }

          return { video, related };
        },
        {
          accessMode: "read write",
          isolationLevel: "repeatable read",
        },
      );
    }),

  upload: publicProcedure
    .input(
      zfd.formData({
        file: zfd.file(),
        title: zfd.text(),
        description: zfd.text(z.string().optional()),
        tags: zfd.repeatableOfType(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const t1 = performance.now();
      const file = await writeFileToDisk(input.file);
      const t2 = performance.now() - t1;
      ctx.log.debug(`File saved in ${t2}ms`);

      const outputDir = path.dirname(file.path);
      const videoId = path.basename(outputDir);
      ctx.log.debug("Video details: %o", {
        id: videoId,
        path: file.path,
        outputDir,
      });

      await ctx.db.transaction(
        async (tx) => {
          // Create video record
          const [createdVideo] = await tx
            .insert(videos)
            .values({
              id: videoId,
              url: file.url,
              title: input.title,
              description: input.description,
            })
            .returning({ id: videos.id });

          if (!createdVideo) {
            throw new Error("Failed to create video record");
          }

          if (input.tags) {
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
          }
        },
        {
          accessMode: "read write",
          isolationLevel: "repeatable read",
        },
      );

      // Send tasks to Hermes for processing
      const tasks: VideoTask[] = [
        {
          videoId,
          taskType: "poster",
          filePath: file.path,
          outputPath: outputDir,
        },
        {
          videoId,
          taskType: "webvtt",
          filePath: file.path,
          outputPath: outputDir,
          config: { webvtt: WEBVTT_CONFIG },
        },
        {
          videoId,
          taskType: "trailer",
          filePath: file.path,
          outputPath: outputDir,
          config: { trailer: TRAILER_CONFIG },
        },
      ];

      ctx.log.debug("Prepared %d tasks for video %s", tasks.length, videoId);
      tasks.forEach((task) => {
        ctx.log.debug("Task details: %o", {
          type: task.taskType,
          videoId: task.videoId,
          config: task.config,
        });
      });

      // Publish tasks to RabbitMQ
      const channel = ctx.amqp.pub;
      const routingKey = `video.task.${videoId}`;
      ctx.log.debug("Publishing tasks to RabbitMQ: %o", {
        exchange: RABBITMQ.exchange,
        routingKey,
        taskCount: tasks.length,
      });

      channel.publish(RABBITMQ.exchange, routingKey, Buffer.from(JSON.stringify(tasks)), { persistent: true });
      ctx.log.debug("Tasks published successfully");

      return { file };
    }),
});

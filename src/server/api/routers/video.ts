import "server-only";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type CreateVideoTask, tags, videos, videoTags, videoTasks } from "@/server/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { zfd } from "zod-form-data";
import { writeFileToDisk } from "@/lib/file";
import { RELATED_LOAD_COUNT } from "@/constants/shared";
import path from "path";
import { WEBVTT_CONFIG, type WebVTTConfig, TRAILER_CONFIG, type TrailerConfig } from "@/constants/video";
import { AMQP } from "@/constants/amqp";

type TaskType = "poster" | "webvtt" | "trailer";

interface VideoTaskConfig {
  webvtt?: WebVTTConfig;
  trailer?: TrailerConfig;
}

interface VideoTask {
  videoId: string;
  taskType: TaskType;
  filePath: string;
  outputPath: string;
  config?: VideoTaskConfig;
}

export const videoRouter = createTRPCRouter({
  getVideoList: publicProcedure
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
          const onlyCompleted = eq(videos.status, "completed");
          const titleLike = ilike(videos.title, "%" + input.query + "%");

          if (input.query) {
            ctx.log.debug(`Searching for videos with title containing "${input.query}"`);
            return and(onlyCompleted, titleLike);
          }

          ctx.log.debug("Fetching all completed videos");
          return onlyCompleted;
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
          status: latestVideo.status,
        });
      } else {
        ctx.log.debug("No videos found");
      }

      return videos;
    }),

  getVideoById: publicProcedure
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
            status: video?.status,
            viewsCount: video?.viewsCount,
          });

          // Get related videos
          const related = await tx.query.videos.findMany({
            with: { videoTags: { with: { tag: true } }, modelVideos: { with: { model: true } } },
            where: (videos, { not, eq, and }) => and(not(eq(videos.id, input.id)), eq(videos.status, "completed")),
            orderBy: (videos, { desc }) => [desc(videos.createdAt)],
            limit: RELATED_LOAD_COUNT,
          });
          ctx.log.debug(`Found ${related.length} related videos`);

          const firstRelated = related[0];
          if (firstRelated) {
            ctx.log.debug("First related video: %o", {
              id: firstRelated.id,
              title: firstRelated.title,
              status: firstRelated.status,
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

  uploadVideo: publicProcedure
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
          ];

          // Insert tasks into database
          await tx.insert(videoTasks).values(dbTasks);

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

      // Prepare tasks for RabbitMQ
      const mqTasks: VideoTask[] = [
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

      ctx.log.debug("Prepared %d tasks for video %s", mqTasks.length, videoId);
      mqTasks.forEach((task) => {
        ctx.log.debug("Task details: %o", {
          type: task.taskType,
          videoId: task.videoId,
          config: task.config,
        });
      });

      // Publish each task individually
      await Promise.all(
        mqTasks.map((task) =>
          ctx.amqp.pub.publish(AMQP.exchange, `video.task.${task.taskType}`, Buffer.from(JSON.stringify(task)), {
            persistent: true,
          }),
        ),
      );

      ctx.log.debug("Tasks published successfully");

      return { file };
    }),

  updateVideo: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        tags: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      ctx.log.debug("Updating video: %o", {
        id: input.id,
        title: input.title,
        description: input.description,
        tags: input.tags,
      });

      return ctx.db.transaction(async (tx) => {
        // Get current video status
        const currentVideo = await tx.query.videos.findFirst({
          where: (videos, { eq }) => eq(videos.id, input.id),
          columns: {
            status: true,
          },
        });

        if (!currentVideo) {
          throw new Error("Video not found");
        }

        // Don't allow updates while video is processing
        if (currentVideo.status === "processing") {
          throw new Error("Cannot update video while it's being processed");
        }

        // Update video details
        await tx
          .update(videos)
          .set({
            title: input.title,
            description: input.description,
          })
          .where(eq(videos.id, input.id));

        // Delete existing tags
        await tx.delete(videoTags).where(eq(videoTags.videoId, input.id));

        // Insert new tags
        const existingTags = await tx.select({ id: tags.id, name: tags.name }).from(tags).where(inArray(tags.name, input.tags));

        const existingTagNames = existingTags.map((tag) => tag.name);
        const newTagNames = input.tags.filter((tag) => !existingTagNames.includes(tag));

        // Create new tags
        const newTags = await Promise.all(
          newTagNames.map((name) => tx.insert(tags).values({ name }).returning({ id: tags.id, name: tags.name })),
        );

        // Insert video tags
        const allTags = [...existingTags, ...newTags.map((result) => result[0]!)];
        await Promise.all(
          allTags.map((tag) =>
            tx.insert(videoTags).values({
              tagId: tag.id,
              videoId: input.id,
            }),
          ),
        );

        const video = await tx.query.videos.findFirst({
          where: (videos, { eq }) => eq(videos.id, input.id),
          with: { videoTags: { with: { tag: true } }, modelVideos: { with: { model: true } } },
        });

        return video;
      });
    }),
});

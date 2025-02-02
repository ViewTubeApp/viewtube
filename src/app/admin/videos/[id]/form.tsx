"use client";

import * as m from "@/paraglide/messages";
import { api } from "@/trpc/react";
import { log as globalLog } from "@/utils/react/logger";
import { getPublicURL } from "@/utils/react/video";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { Loader2, Save } from "lucide-react";
import { motion } from "motion/react";
import { type FC } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { type VideoListResponse, type VideoResponse } from "@/server/api/routers/video";
import { type Category, type Model } from "@/server/db/schema";

import { useRouter } from "@/lib/i18n";

import { motions } from "@/constants/motion";
import { adminVideoListQueryOptions } from "@/constants/query";

import { CategoryAsyncSelect } from "@/components/category-async-select";
import { ModelAsyncSelect } from "@/components/model-async-select";
import { TagAsyncSelect } from "@/components/tag-async-select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VideoPlayer } from "@/components/video-player";
import { VideoPoster } from "@/components/video-poster";

interface EditVideoFormProps {
  video: VideoResponse;
}

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  tags: z.array(z.string()),

  models: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    }) satisfies z.ZodType<Pick<Model, "id" | "name">>,
  ),

  categories: z.array(
    z.object({
      id: z.number(),
      slug: z.string(),
    }) satisfies z.ZodType<Pick<Category, "id" | "slug">>,
  ),
});

type FormValues = z.infer<typeof schema>;

export const EditVideoForm: FC<EditVideoFormProps> = ({ video }) => {
  const router = useRouter();

  const log = globalLog.withTag("EditVideoForm");

  const form = useForm<FormValues>({
    mode: "all",
    resolver: zodResolver(schema),
    defaultValues: {
      title: video.title,
      description: video.description ?? "",
      tags: video.videoTags.map((tag) => tag.tag.name),
      models: video.modelVideos.map((model) => model.model),
      categories: video.categoryVideos.map((category) => category.category),
    },
  });

  const queryClient = useQueryClient();
  const videoListQueryKey = getQueryKey(api.video.getVideoList, adminVideoListQueryOptions);

  const { mutateAsync: updateVideo } = api.video.updateVideo.useMutation({
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: videoListQueryKey });
      const previousVideos = queryClient.getQueryData<VideoListResponse>(videoListQueryKey);

      queryClient.setQueryData(videoListQueryKey, (old: VideoListResponse | undefined) => {
        if (!old) return { data: [] };

        const next = old.data.map((video) => (video.id === data.id ? { ...video, ...data } : video));

        return {
          ...old,
          data: next,
        };
      });

      return { previousVideos };
    },
    onSuccess: () => {
      toast.success(m.video_updated());
      router.push("/admin/videos");
    },
    onError: (error, _, context) => {
      toast.error(error.message);
      log.error(error);
      queryClient.setQueryData(videoListQueryKey, context?.previousVideos);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: videoListQueryKey });
    },
  });

  const onSubmit = async (data: FormValues) => {
    log.debug(data);
    await updateVideo({
      id: video.id,
      title: data.title,
      tags: data.tags,
      description: data.description,
      models: data.models.map((model) => model.id),
      categories: data.categories.map((category) => category.id),
    });
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Form */}
      <motion.div {...motions.slide.x.in}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.title()}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={m.title()} className="rounded px-4 py-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.description()}</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={m.description()} className="min-h-[120px] rounded px-4 py-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.categories()}</FormLabel>
                  <FormControl>
                    <CategoryAsyncSelect value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.tags()}</FormLabel>
                  <FormControl>
                    <TagAsyncSelect value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="models"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.models()}</FormLabel>
                  <FormControl>
                    <ModelAsyncSelect value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              disabled={!form.formState.isValid || !form.formState.isDirty || form.formState.isSubmitting}
              type="submit"
              className="w-full rounded-full"
            >
              {form.formState.isSubmitting ?
                <Loader2 className="size-4 animate-spin" />
              : <Save className="size-4" />}{" "}
              {m.save()}
            </Button>
          </form>
        </Form>
      </motion.div>

      {/* Preview */}
      <motion.div {...motions.slide.x.in} className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">{m.thumb_preview()}</h3>
          <Card className="overflow-hidden">
            <VideoPoster
              title={video.title}
              poster={getPublicURL(video.url).forType("poster")}
              trailer={getPublicURL(video.url).forType("trailer")}
            />
          </Card>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">{m.video_preview()}</h3>
          <Card className="overflow-hidden">
            <VideoPlayer video={video} />
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

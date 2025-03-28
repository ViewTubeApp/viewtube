"use client";

import { useRouter } from "@/i18n/navigation";
import { api } from "@/trpc/react";
import { logger } from "@/utils/react/logger";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { Loader2 } from "lucide-react";
import { Save } from "lucide-react";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";
import { type FC } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { P, match } from "ts-pattern";
import { z } from "zod";

import { type VideoListResponse } from "@/server/api/routers/video";

import { motions } from "@/constants/motion";
import { adminVideoListQueryOptions } from "@/constants/query";

import { CategoryAsyncSelect } from "@/components/category-async-select";
import { ModelAsyncSelect } from "@/components/model-async-select";
import { TagAsyncSelect } from "@/components/tag-async-select";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadDropzone } from "@/components/upload-dropzone";

import { UploadVideoPreview } from "./preview";

interface Category {
  id: number;
  slug: string;
}

interface Model {
  id: number;
  name: string;
}
export interface UploadVideoFormValues {
  title: string;
  tags: string[];
  models: Model[];
  file_key: string;
  description?: string;
  categories: Category[];
}

interface UploadVideoFormProps {
  videoId?: number;
  defaultValues?: UploadVideoFormValues;
}

const log = logger.withTag("admin:videos:create");

export const UploadVideoForm: FC<UploadVideoFormProps> = ({ videoId, defaultValues }) => {
  const t = useTranslations();

  const router = useRouter();
  const utils = api.useUtils();

  const schema = z.object({
    title: z
      .string()
      .min(1, { message: t("error_title_required") })
      .max(72, { message: t("error_title_max_length", { max: 72 }) }),

    tags: z.array(z.string()),
    file_key: z.string().min(1, { message: t("error_file_required") }),

    description: z
      .string()
      .max(512, { message: t("error_description_max_length", { max: 512 }) })
      .optional(),

    categories: z.array(z.object({ id: z.number(), slug: z.string() })),
    models: z.array(z.object({ id: z.number(), name: z.string() })),
  });

  const form = useForm<UploadVideoFormValues>({
    mode: "all",
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      tags: [],
      title: "",
      models: [],
      file_key: "",
      categories: [],
      description: "",
    },
  });

  const title = form.watch("title");
  const fileKey = form.watch("file_key");

  const queryClient = useQueryClient();
  const videoListQueryKey = getQueryKey(api.video.getVideoList, adminVideoListQueryOptions);

  const mutation = match(videoId)
    .with(P.number, () => api.video.updateVideo)
    .with(P.nullish, () => api.video.createVideo)
    .exhaustive();

  const { mutate } = mutation.useMutation({
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: videoListQueryKey });
      const previousVideos = queryClient.getQueryData<VideoListResponse>(videoListQueryKey);

      queryClient.setQueryData(videoListQueryKey, (old: VideoListResponse | undefined) => {
        if (!old) return { data: [] };

        if ("id" in data) {
          const next = old.data.map((video) => (video.id === data.id ? { ...video, ...data } : video));
          return { ...old, data: next };
        }

        return old;
      });

      return { previousVideos };
    },

    onSuccess: async () => {
      void utils.invalidate();
      toast.success(videoId ? t("video_updated") : t("video_uploaded"));
      router.back();
    },

    onError: (error, _, context) => {
      log.error("mutation error", error);
      queryClient.setQueryData(videoListQueryKey, context?.previousVideos);
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: videoListQueryKey });
    },
  });

  const onSubmit: SubmitHandler<UploadVideoFormValues> = async (data) => {
    if (videoId) {
      const fn = mutate as ReturnType<typeof api.video.updateVideo.useMutation>["mutate"];
      fn({
        id: videoId,
        title: data.title,
        tags: data.tags,
        file_key: data.file_key,
        description: data.description,
        models: data.models.map((model) => model.id),
        categories: data.categories.map((category) => category.id),
      });
    } else {
      const fn = mutate as ReturnType<typeof api.video.createVideo.useMutation>["mutate"];
      fn({
        tags: data.tags,
        title: data.title,
        file_key: data.file_key,
        description: data.description,
        models: data.models.map((model) => model.id),
        categories: data.categories.map((category) => category.id),
      });
    }
  };

  const isDirty = Object.keys(form.formState.dirtyFields).length > 0;
  const isAllowedToSubmit = form.formState.isValid && isDirty && !form.formState.isSubmitting;

  return (
    <Form {...form}>
      <motion.form
        {...motions.slide.y.in}
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <div className="flex flex-col gap-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("title")}</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>{t("description")}</FormLabel>
                <FormControl>
                  <Textarea {...field} />
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
                <FormLabel>{t("categories")}</FormLabel>
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
                <FormLabel>{t("tags")}</FormLabel>
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
                <FormLabel>{t("models")}</FormLabel>
                <FormControl>
                  <ModelAsyncSelect value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <hr className="my-2" />

          <div className="flex gap-4">
            <Button
              size="lg"
              type="button"
              variant="secondary"
              className="flex flex-1/2 content-center text-md lg:col-start-2 lg:w-auto"
              onClick={() => router.back()}
            >
              {t("cancel")}
            </Button>

            <Button
              size="lg"
              disabled={!isAllowedToSubmit}
              type="submit"
              className="flex flex-1/2 content-center text-md lg:col-start-2 lg:w-auto"
            >
              {form.formState.isSubmitting ?
                <Loader2 className="size-5 animate-spin" />
              : <Save className="size-5" />}{" "}
              {t("save")}
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {fileKey && (
            <UploadVideoPreview
              title={title}
              src={fileKey}
              onRemove={() => {
                form.resetField("file_key", {
                  defaultValue: "",
                  keepTouched: true,
                });
              }}
            />
          )}

          {!fileKey && (
            <UploadDropzone
              className="h-full"
              endpoint="video_uploader"
              onChangeTitle={(title) => {
                form.setValue("title", title, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
              }}
              onChangeFileKey={(key) => {
                form.setValue("file_key", key, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
              }}
            />
          )}
        </div>
      </motion.form>
    </Form>
  );
};

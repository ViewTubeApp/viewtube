"use client";

import { useRouter } from "@/i18n/navigation";
import { api } from "@/trpc/react";
import { logger } from "@/utils/react/logger";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { Loader2 } from "lucide-react";
import { Save } from "lucide-react";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";
import { type FC } from "react";
import { toast } from "sonner";
import { P, match } from "ts-pattern";
import { z } from "zod";

import { type VideoListResponse } from "@/server/api/routers/video";

import { useAppForm } from "@/lib/form";

import { motions } from "@/constants/motion";
import { adminVideoListQueryOptions } from "@/constants/query";

import { CategoryAsyncSelect } from "@/components/category-async-select";
import { ModelAsyncSelect } from "@/components/model-async-select";
import { TagAsyncSelect } from "@/components/tag-async-select";
import { Button } from "@/components/ui/button";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
    categories: z.array(z.object({ id: z.number(), slug: z.string() })),
    models: z.array(z.object({ id: z.number(), name: z.string() })),
    file_key: z.string().min(1, { message: t("error_file_required") }),
    description: z.string().max(512, { message: t("error_description_max_length", { max: 512 }) }),
  });

  const form = useAppForm({
    validators: {
      onChange: schema,
    },
    defaultValues: {
      tags: defaultValues?.tags ?? [],
      title: defaultValues?.title ?? "",
      models: defaultValues?.models ?? [],
      file_key: defaultValues?.file_key ?? "",
      categories: defaultValues?.categories ?? [],
      description: defaultValues?.description ?? "",
    },
    onSubmit: async ({ value }) => {
      if (videoId) {
        const fn = mutate as ReturnType<typeof api.video.updateVideo.useMutation>["mutate"];
        fn({
          id: videoId,
          title: value.title,
          tags: value.tags,
          file_key: value.file_key,
          description: value.description,
          models: value.models.map((model) => model.id),
          categories: value.categories.map((category) => category.id),
        });
      } else {
        const fn = mutate as ReturnType<typeof api.video.createVideo.useMutation>["mutate"];
        fn({
          tags: value.tags,
          title: value.title,
          file_key: value.file_key,
          description: value.description,
          models: value.models.map((model) => model.id),
          categories: value.categories.map((category) => category.id),
        });
      }
    },
  });

  const queryClient = useQueryClient();
  const queryKey = getQueryKey(api.video.getVideoList, adminVideoListQueryOptions);

  const mutation = match(videoId)
    .with(P.number, () => api.video.updateVideo)
    .with(P.nullish, () => api.video.createVideo)
    .exhaustive();

  const { mutate } = mutation.useMutation({
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: queryKey });
      const previousVideos = queryClient.getQueryData<VideoListResponse>(queryKey);

      queryClient.setQueryData(queryKey, (old: VideoListResponse | undefined) => {
        if (!old) return { data: [] };

        if ("id" in data) {
          const next = old.data.map((video) => (video.id === data.id ? { ...video, ...data } : video));
          return { ...old, data: next };
        }

        return old;
      });

      return { previousVideos };
    },

    onSuccess: async (data) => {
      if ("task" in data) {
        const runs = JSON.parse(localStorage.getItem("runs") ?? "{}");
        runs[data.record.id] = data.task;
        localStorage.setItem("runs", JSON.stringify(runs));
      }

      void utils.invalidate();
      toast.success(videoId ? t("video_updated") : t("video_uploaded"));
      router.back();
    },

    onError: (error, _, context) => {
      log.error("mutation error", error);
      queryClient.setQueryData(queryKey, context?.previousVideos);
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKey });
    },
  });

  return (
    <motion.form
      {...motions.slide.y.in}
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
      className="grid grid-cols-1 gap-4 lg:grid-cols-2"
    >
      <div className="flex flex-col gap-2">
        <form.AppField name="title">
          {(field) => (
            <FormItem>
              <FormLabel>{t("title")}</FormLabel>
              <FormControl>
                <field.Input
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </form.AppField>

        <form.AppField name="description">
          {(field) => (
            <FormItem>
              <FormLabel>{t("description")}</FormLabel>
              <FormControl>
                <field.Textarea
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </form.AppField>

        <form.AppField name="categories">
          {(field) => (
            <FormItem>
              <FormLabel>{t("categories")}</FormLabel>
              <FormControl>
                <CategoryAsyncSelect value={field.state.value} onChange={field.handleChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </form.AppField>

        <form.AppField name="tags">
          {(field) => (
            <FormItem>
              <FormLabel>{t("tags")}</FormLabel>
              <FormControl>
                <TagAsyncSelect value={field.state.value} onChange={field.handleChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </form.AppField>

        <form.AppField name="models">
          {(field) => (
            <FormItem>
              <FormLabel>{t("models")}</FormLabel>
              <FormControl>
                <ModelAsyncSelect value={field.state.value} onChange={field.handleChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </form.AppField>

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

          <form.Subscribe
            selector={(state) => [state.isValid && state.isDirty && !state.isSubmitting, state.isSubmitting]}
          >
            {([isValid, isSubmitting]) => (
              <form.Button
                size="lg"
                disabled={!isValid}
                type="submit"
                className="flex flex-1/2 content-center text-md lg:col-start-2 lg:w-auto"
              >
                {isSubmitting ?
                  <Loader2 className="size-5 animate-spin" />
                : <Save className="size-5" />}{" "}
                {t("save")}
              </form.Button>
            )}
          </form.Subscribe>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <form.Subscribe selector={(state) => [state.values.title, state.values.file_key]}>
          {([title, file_key]) =>
            file_key && <UploadVideoPreview title={title} src={file_key} onRemove={() => form.resetField("file_key")} />
          }
        </form.Subscribe>

        <form.Subscribe selector={(state) => state.values.file_key}>
          {(file_key) =>
            !file_key && (
              <UploadDropzone
                className="h-full"
                endpoint="video_uploader"
                onChangeTitle={(title) => form.setFieldValue("title", title)}
                onChangeFileKey={(key) => form.setFieldValue("file_key", key)}
              />
            )
          }
        </form.Subscribe>
      </div>
    </motion.form>
  );
};

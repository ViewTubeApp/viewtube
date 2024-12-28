"use client";

import { useFileUploadStore } from "@/stores/file-upload";
import { api } from "@/trpc/react";
import { log as globalLog } from "@/utils/react/logger";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Body, type Meta, type UppyFile } from "@uppy/core";
import { type Restrictions } from "@uppy/core/lib/Restricter";
import { Loader2 } from "lucide-react";
import { Save } from "lucide-react";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { type FC, useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { type Category } from "@/server/db/schema";

import { motions } from "@/constants/motion";

import { CategoryAsyncSelect } from "@/components/category-async-select";
import { TagAsyncSelect } from "@/components/tag-async-select";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

import { UploadVideoPreview } from "./preview";

const FileUpload = dynamic(() => import("@/components/file-upload").then((mod) => mod.FileUpload), {
  ssr: false,
  loading: () => <Skeleton className="h-[550px] w-full rounded-xl" />,
});

const restrictions: Partial<Restrictions> = {
  allowedFileTypes: ["video/*"],
  maxNumberOfFiles: 1,
};

const schema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  tags: z.array(z.string()),

  categories: z.array(
    z.object({
      id: z.string(),
      slug: z.string(),
      createdAt: z.date(),
      updatedAt: z.date().nullable(),
    }) satisfies z.ZodType<Category>,
  ),

  // Matches the type of the file object returned by Uppy
  file: z
    .object({
      id: z.string(),
      name: z.string(),
      data: z.union([z.instanceof(File), z.instanceof(Blob)]),
    })
    .optional(),
});

type FormValues = z.infer<typeof schema>;
type FormFile = z.infer<typeof schema.shape.file>;

export const UploadVideoForm: FC = () => {
  const log = globalLog.withTag("UploadVideo");

  const router = useRouter();
  const utils = api.useUtils();

  const { client } = useFileUploadStore();

  const form = useForm<FormValues>({
    mode: "all",
    resolver: zodResolver(schema),
    defaultValues: {
      tags: [],
      title: "",
      categories: [],
      description: "",
      file: undefined,
    },
  });

  const file = form.watch("file");

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      // Get files from Uppy
      const files = client.getFiles();
      if (files.length === 0) {
        return;
      }

      // Upload file and create video in a single request
      await new Promise<void>((resolve, reject) => {
        // Set metadata
        client.setMeta({
          tags: data.tags,
          title: data.title,
          description: data.description,
          categories: data.categories.map((category) => category.id),
        });

        // Start upload
        client
          .upload()
          .then((result) => {
            if (!result?.successful?.[0]?.response?.body) {
              log.error(result, { event: "UploadVideo", hint: "upload result" });
              reject(new Error("Upload failed"));
              return;
            }
            resolve();
          })
          .catch(reject);
      });

      // Invalidate videos query
      await utils.video.invalidate();

      toast.success("Video uploaded");

      form.reset();
      router.push("/");
    } catch (error) {
      if (error instanceof Error) {
        log.error(error);
        toast.error(error.message);
      } else {
        log.error(error);
        toast.error("An unknown error occurred");
      }
    }
  };

  useEffect(() => {
    const handleAddFile = (file: UppyFile<Meta, Body>) => {
      const title = file.name?.split(".")[0];
      form.setValue("title", title ?? "", { shouldValidate: true, shouldTouch: true, shouldDirty: true });
      form.setValue("file", file as FormFile, { shouldValidate: true, shouldTouch: true, shouldDirty: true });
    };
    // Handle file attachment
    client.on("file-added", handleAddFile);

    const handleRemoveFile = () => {
      form.reset({ file: undefined, title: "", tags: [] }, { keepDirty: true, keepTouched: true });
    };
    // Handle file removal
    client.on("file-removed", handleRemoveFile);

    // Cleanup
    return () => {
      client.clear();
      client.off("file-added", handleAddFile);
      client.off("file-removed", handleRemoveFile);
    };
  }, [client, form]);

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
                <FormLabel>Title</FormLabel>
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
                <FormLabel>Description</FormLabel>
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
                <FormLabel>Categories</FormLabel>
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
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <TagAsyncSelect value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={!form.formState.isValid || !form.formState.isDirty || form.formState.isSubmitting}
            type="submit"
            className="w-full rounded-full px-10 py-3 font-semibold lg:col-start-2 lg:w-auto"
          >
            {form.formState.isSubmitting ?
              <Loader2 className="size-4 animate-spin" />
            : <Save className="size-4" />}{" "}
            Save
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          {file?.data && (
            <UploadVideoPreview title={file.name} src={file.data} onRemove={() => client.removeFile(file.id)} />
          )}
          <FileUpload restrictions={restrictions} />
        </div>
      </motion.form>
    </Form>
  );
};

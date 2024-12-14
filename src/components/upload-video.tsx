"use client";

import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import dynamic from "next/dynamic";
import { Skeleton } from "./ui/skeleton";
import { type Restrictions } from "@uppy/core/lib/Restricter";
import { useFileUploadStore } from "@/lib/store/file-upload";
import { useRouter } from "next/navigation";
import XHRUpload from "@uppy/xhr-upload";
import { useEffect, useMemo } from "react";
import { type Body, type Meta, type UppyFile } from "@uppy/core";
import { UploadVideoPreview } from "./upload-video-preview";
import { cn } from "@/lib/clsx";
import { Textarea } from "./ui/textarea";
import { TagSelect } from "./tag-select";

const FileUpload = dynamic(() => import("./file-upload").then((mod) => mod.FileUpload), {
  ssr: false,
  loading: () => <Skeleton className="h-[550px] w-full rounded-xl" />,
});

const restrictions: Partial<Restrictions> = {
  allowedFileTypes: ["video/*"],
  maxNumberOfFiles: 1,
};

const formSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  // Matches the type of the file object returned by Uppy
  file: z.object({
    name: z.string(),
    data: z.union([z.instanceof(File), z.instanceof(Blob)]),
  }),
});

type FormSchema = z.infer<typeof formSchema>;
type FormFile = z.infer<typeof formSchema.shape.file>;

export function UploadVideo() {
  const router = useRouter();
  const utils = api.useUtils();

  const { client } = useFileUploadStore();

  const {
    reset,
    setValue,
    register,
    handleSubmit,
    watch,
    formState: { isDirty, isValid },
  } = useForm<FormSchema>({
    mode: "all",
    reValidateMode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      tags: [],
      title: "",
      description: "",
      file: undefined,
    },
  });

  // Fetch available tags
  // const { data: availableTags = [] } = api.tag.list.useQuery();

  const tags = watch("tags");

  const onSubmit: SubmitHandler<FormSchema> = async (data) => {
    try {
      // Get files from Uppy
      const files = client.getFiles();
      if (files.length === 0) {
        return;
      }

      // Upload file and create video in a single request
      await new Promise<void>((resolve, reject) => {
        // Configure XHRUpload plugin
        const uppy = client.use(XHRUpload, {
          formData: true,
          fieldName: "file",
          endpoint: `/api/trpc/video.upload`,
        });

        console.log(data);

        // Set metadata
        uppy.setMeta({
          tags: data.tags,
          title: data.title,
          description: data.description,
        });

        // Start upload
        uppy
          .upload()
          .then((result) => {
            if (!result?.successful?.[0]?.response?.body) {
              reject(new Error("Upload failed"));
              return;
            }
            resolve();
          })
          .catch(reject);
      });

      // Invalidate videos query
      await utils.video.invalidate();

      reset();
      router.push("/");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Upload failed:", error.message);
      } else {
        console.error("Upload failed:", error);
      }
    }
  };

  useEffect(() => {
    const handleAddFile = (file: UppyFile<Meta, Body>) => {
      const title = file.name?.split(".")[0];
      setValue("title", title ?? "", { shouldValidate: true, shouldTouch: true, shouldDirty: true });
      setValue("file", file as FormFile, { shouldValidate: true, shouldTouch: true, shouldDirty: true });
    };
    // Handle file attachment
    client.on("file-added", handleAddFile);

    const handleRemoveFile = () => {
      reset({ file: undefined, title: "", tags: [] }, { keepDirty: true, keepTouched: true });
    };
    // Handle file removal
    client.on("file-removed", handleRemoveFile);

    // Cleanup
    return () => {
      client.off("file-added", handleAddFile);
      client.off("file-removed", handleRemoveFile);
    };
  }, [client, reset, setValue]);

  const file = client.getFiles()[0];
  const previewSrc = useMemo(() => (file ? URL.createObjectURL(file.data as File) : undefined), [file]);

  return (
    <div className="mx-auto max-w-5xl flex-1">
      <form onSubmit={handleSubmit(onSubmit)} className="grid-rows-auto grid grid-cols-2 gap-4">
        <div className="col-start-1 flex flex-col gap-2">
          <Input {...register("title")} type="text" placeholder="Title" className="rounded px-4 py-2" />
          <Textarea {...register("description")} placeholder="Description" className="rounded px-4 py-2" />
          <TagSelect
            value={tags}
            onValueChange={(value) => setValue("tags", value, { shouldValidate: true, shouldTouch: true, shouldDirty: true })}
          />
        </div>
        <div className={cn("col-start-2 flex flex-col gap-4", { "gap-0": !!previewSrc })}>
          <FileUpload restrictions={restrictions} className={cn({ "pointer-events-none h-0 opacity-0": !!previewSrc })} />
          {previewSrc && <UploadVideoPreview src={previewSrc} onRemove={() => client.removeFile(file?.id ?? "")} />}
        </div>
        <Button
          disabled={!isValid || !isDirty}
          type="submit"
          className="col-span-1 col-start-2 row-start-2 rounded-full px-10 py-3 font-semibold"
        >
          Submit
        </Button>
      </form>
    </div>
  );
}

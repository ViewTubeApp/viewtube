"use client";

import { useFileUploadStore } from "@/stores/file-upload";
import { api } from "@/trpc/react";
import { log as globalLog } from "@/utils/react/logger";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Body, type Meta, type UppyFile } from "@uppy/core";
import { type Restrictions } from "@uppy/core/lib/Restricter";
import XHRUpload from "@uppy/xhr-upload";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { TagSelect } from "./tag-select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import { Textarea } from "./ui/textarea";
import { UploadVideoPreview } from "./upload-video-preview";

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
  file: z
    .object({
      id: z.string(),
      name: z.string(),
      data: z.union([z.instanceof(File), z.instanceof(Blob)]),
    })
    .optional(),
});

type FormSchema = z.infer<typeof formSchema>;
type FormFile = z.infer<typeof formSchema.shape.file>;

export function UploadVideo() {
  const log = globalLog.withTag("UploadVideo");

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
  const file = watch("file");

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
          endpoint: `/api/trpc/video.uploadVideo`,
        });

        log.debug(uppy, { event: "UploadVideo", hint: "form data" });

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

      reset();
      router.push("/");
    } catch (error) {
      if (error instanceof Error) {
        log.error(error, { event: "UploadVideo", hint: "error" });
        toast.error(error.message);
      } else {
        log.error(error, { event: "UploadVideo", hint: "error" });
        toast.error("An unknown error occurred");
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
      client.clear();
      client.off("file-added", handleAddFile);
      client.off("file-removed", handleRemoveFile);
    };
  }, [client, reset, setValue]);

  return (
    <div className="mx-auto max-w-5xl flex-1">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Input {...register("title")} type="text" placeholder="Title" className="rounded px-4 py-2" />
          <Textarea {...register("description")} placeholder="Description" className="rounded px-4 py-2" />
          <TagSelect
            value={tags}
            onValueChange={(value) => setValue("tags", value, { shouldValidate: true, shouldTouch: true, shouldDirty: true })}
          />
          <Button
            disabled={!isValid || !isDirty}
            type="submit"
            className="w-full rounded-full px-10 py-3 font-semibold lg:col-start-2 lg:w-auto"
          >
            Submit
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          {file?.data && <UploadVideoPreview title={file.name} src={file.data} onRemove={() => client.removeFile(file.id)} />}
          <FileUpload restrictions={restrictions} />
        </div>
      </form>
    </div>
  );
}

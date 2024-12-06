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
import { useEffect } from "react";
import { type Body, type Meta, type UppyFile } from "@uppy/core";

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
    getValues,
    handleSubmit,
    formState: { isDirty, isValid },
  } = useForm<FormSchema>({
    mode: "all",
    reValidateMode: "onChange",
    resolver: zodResolver(formSchema),
  });

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

        // Set metadata
        uppy.setMeta({ title: data.title });

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
      setValue("title", file.name ?? "", { shouldValidate: true });
      setValue("file", file as FormFile, { shouldValidate: true });
    };
    // Handle file attachment
    client.on("file-added", handleAddFile);

    const handleRemoveFile = () => {
      reset({ file: undefined }, { keepDirty: true });
    };
    // Handle file removal
    client.on("file-removed", handleRemoveFile);

    // Cleanup
    return () => {
      client.off("file-added", handleAddFile);
      client.off("file-removed", handleRemoveFile);
    };
  }, [client, reset, setValue]);

  console.log(isValid, isDirty, getValues());

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <Input {...register("title")} type="text" placeholder="Title" className="w-full rounded-full px-4 py-2" />
        <FileUpload restrictions={restrictions} />
        <Button disabled={!isValid || !isDirty} type="submit" className="rounded-full px-10 py-3 font-semibold">
          Submit
        </Button>
      </form>
    </div>
  );
}

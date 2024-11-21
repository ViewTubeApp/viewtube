"use client";

import { type CreateVideo } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { Skeleton } from "./ui/skeleton";
import { type Restrictions } from "@uppy/core/lib/Restricter";
import { useFileUploadStore } from "@/lib/store/file-upload";
import { useEffect } from "react";

const FileUpload = dynamic(
  () => import("./file-upload").then((mod) => mod.FileUpload),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[550px] w-full rounded-xl" />,
  },
);

const restrictions: Partial<Restrictions> = {
  allowedFileTypes: ["video/*"],
  maxNumberOfFiles: 1,
};

export function UploadVideo() {
  const utils = api.useUtils();

  const { client } = useFileUploadStore();

  const {
    register,
    setValue,
    handleSubmit,
    formState: { isDirty },
  } = useForm<CreateVideo>({
    resolver: zodResolver(
      z.object({
        title: z.string(),
        url: z.string().url(),
      }),
    ),
    defaultValues: {
      url: "",
      title: "",
    },
  });

  const createVideo = api.video.create.useMutation({
    onSuccess: async () => {
      await utils.video.invalidate();
      redirect("/");
    },
  });

  const onSubmit: SubmitHandler<CreateVideo> = async (data) => {
    createVideo.mutate({
      title: data.title,
      url: data.url,
      thumbnail: data.url,
    });
  };

  useEffect(() => {
    client.on("upload-success", (_, response) => {
      setValue("url", response.body!.path as unknown as string);
    });
  });

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <Input
          {...register("title")}
          type="text"
          placeholder="Title"
          className="w-full rounded-full px-4 py-2"
        />
        <FileUpload restrictions={restrictions} />
        <Button
          disabled={!isDirty || createVideo.isPending}
          type="submit"
          className="rounded-full px-10 py-3 font-semibold"
        >
          {createVideo.isPending ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  );
}

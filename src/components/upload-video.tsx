"use client";

import { type CreateVideo } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { redirect } from "next/navigation";

export function UploadVideo() {
  const utils = api.useUtils();

  const { register, handleSubmit } = useForm<CreateVideo>({
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

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <Input
          {...register("title")}
          type="text"
          placeholder="Title"
          className="w-full rounded-full px-4 py-2"
        />
        <Input
          {...register("url")}
          type="text"
          placeholder="URL"
          className="w-full rounded-full px-4 py-2"
        />
        <Button
          type="submit"
          className="rounded-full px-10 py-3 font-semibold"
          disabled={createVideo.isPending}
        >
          {createVideo.isPending ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  );
}

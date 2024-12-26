"use client";

import { useUpdateVideoMutation } from "@/queries/react/use-update-video.mutation";
import { log as globalLog } from "@/utils/react/logger";
import { getClientVideoUrls } from "@/utils/react/video";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { motion } from "motion/react";
import { type FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { type UpdateVideoSchema } from "@/server/api/routers/video";
import { type VideoExtended } from "@/server/db/schema";

import { TagAsyncSelect } from "@/components/tag-async-select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VideoPlayer } from "@/components/video-player";
import { VideoPoster } from "@/components/video-poster";

interface EditVideoFormProps {
  video: VideoExtended;
}

type Schema = Omit<UpdateVideoSchema, "id">;

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  tags: z.array(z.string()),
}) satisfies z.ZodType<Schema>;

export const EditVideoForm: FC<EditVideoFormProps> = ({ video }) => {
  const log = globalLog.withTag("EditVideoForm");

  const { getVideoPosterUrl, getVideoTrailerUrl } = getClientVideoUrls();

  const form = useForm<Schema>({
    mode: "all",
    resolver: zodResolver(schema),
    defaultValues: {
      title: video.title,
      description: video.description ?? "",
      tags: video.videoTags.map((tag) => tag.tag.name),
    },
  });

  const { mutateAsync: updateVideo } = useUpdateVideoMutation();

  const onSubmit = async (data: Schema) => {
    log.debug(data);
    await updateVideo({ id: video.id, ...data });
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Form */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ease: "easeOut" }}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Title" className="rounded px-4 py-2" />
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
                    <Textarea {...field} placeholder="Description" className="min-h-[120px] rounded px-4 py-2" />
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
              className="w-full rounded-full"
            >
              {form.formState.isSubmitting ?
                <Loader2 className="size-4 animate-spin" />
              : <Save className="size-4" />}{" "}
              Save
            </Button>
          </form>
        </Form>
      </motion.div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ease: "easeOut" }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Thumbnail Preview (hover to see trailer)</h3>
          <Card className="overflow-hidden">
            <VideoPoster
              title={video.title}
              poster={getVideoPosterUrl(video.url)}
              trailer={getVideoTrailerUrl(video.url)}
            />
          </Card>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Video Preview</h3>
          <Card className="overflow-hidden">
            <VideoPlayer video={video} />
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

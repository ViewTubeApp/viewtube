"use client";

import { useUpdateVideoMutation } from "@/queries/react/use-update-video-mutation";
import { log as globalLog } from "@/utils/react/logger";
import { getClientVideoUrls } from "@/utils/react/video";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { type FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { type VideoExtended } from "@/server/db/schema";

import { TagSelect } from "./tag-select";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { VideoPlayer } from "./video-player";
import { VideoPoster } from "./video-poster";

interface EditVideoFormProps {
  video: VideoExtended;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  tags: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

export const EditVideoForm: FC<EditVideoFormProps> = ({ video }) => {
  const log = globalLog.withTag("EditVideoForm");

  const { getVideoPosterUrl, getVideoTrailerUrl } = getClientVideoUrls();

  const {
    watch,
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: video.title,
      description: video.description ?? "",
      tags: video.videoTags.map((tag) => tag.tag.name),
    },
  });

  const tags = watch("tags");

  const { mutate: updateVideo, isPending } = useUpdateVideoMutation();

  const onSubmit = (data: FormValues) => {
    log.debug(data);
    updateVideo({ id: video.id, ...data });
  };

  const handleTagsChange = (value: string[]) => {
    setValue("tags", value, {
      shouldValidate: true,
      shouldTouch: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Form */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ease: "easeOut" }}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Input {...register("title")} placeholder="Title" className="rounded px-4 py-2" />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Textarea {...register("description")} placeholder="Description" className="min-h-[120px] rounded px-4 py-2" />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <TagSelect value={tags} onValueChange={handleTagsChange} />

          <Button disabled={!isDirty || isPending} type="submit" className="w-full rounded-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </motion.div>

      {/* Preview */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ease: "easeOut" }} className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Thumbnail Preview (hover to see trailer)</h3>
          <Card className="overflow-hidden">
            <VideoPoster title={video.title} poster={getVideoPosterUrl(video.url)} trailer={getVideoTrailerUrl(video.url)} />
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

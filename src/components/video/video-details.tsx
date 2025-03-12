"use client";

import { useLiveVideo } from "@/hooks/use-live-video";
import { api } from "@/trpc/react";
import { Loader2, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";
import { type FC } from "react";
import { toast } from "sonner";

import { type VideoByIdResponse } from "@/server/api/routers/video";

import { motions } from "@/constants/motion";

import { Button } from "../ui/button";
import { VideoCategories, VideoModels, VideoTags } from "./video-tags";
import { VideoViews } from "./video-views";

interface VideoDetailsProps {
  video: VideoByIdResponse;
}

export const VideoDetails: FC<VideoDetailsProps> = ({ video: initialVideo }) => {
  const t = useTranslations();

  const tags = initialVideo.videoTags.map(({ tag }) => tag);
  const categories = initialVideo.categoryVideos.map(({ category }) => category);
  const models = initialVideo.modelVideos.map(({ model }) => model);

  const { video } = useLiveVideo({ videoId: initialVideo.id, initialData: initialVideo });

  const { mutate: likeVideo, isPending: isLikePending } = api.video.likeVideo.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: dislikeVideo, isPending: isDislikePending } = api.video.dislikeVideo.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <motion.div {...motions.slide.y.in} className="space-y-4">
      <h1 className="text-xl font-bold md:text-2xl">{video.title}</h1>
      <div className="flex flex-wrap gap-1">
        <VideoTags tags={tags} />
        <VideoCategories categories={categories} />
        <VideoModels models={models} />
      </div>

      <div className="flex items-center justify-between gap-2 gap-y-4 sm:gap-x-4">
        <div className="flex items-center gap-4">
          <VideoViews views={video.viewsCount} timestamp={video.createdAt} />
          {/* <Button className="col-span-2 w-full rounded-full sm:w-auto">Subscribe</Button> */}
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center rounded-full bg-secondary">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-l-full px-4"
              onClick={() => likeVideo({ videoId: video.id })}
              disabled={isLikePending || video.alreadyVoted}
            >
              {isLikePending ?
                <Loader2 className="size-4 animate-spin" />
              : <ThumbsUp className="size-4" />}
              {video.likesCount}
            </Button>
            <div className="h-6 w-[1px] bg-gray-600"></div>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-r-full px-4"
              onClick={() => dislikeVideo({ videoId: video.id })}
              disabled={isDislikePending || video.alreadyVoted}
            >
              {isDislikePending ?
                <Loader2 className="size-4 animate-spin" />
              : <ThumbsDown className="size-4" />}
              {video.dislikesCount}
            </Button>
          </div>
          <Button variant="secondary" size="sm" className="col-span-1 flex-1 rounded-full sm:flex-initial">
            <Share2 className="size-4" />
            <span className="inline sm:hidden xl:inline">{t("share")}</span>
          </Button>
          {/* <Button variant="destructive" size="sm" className="col-span-1 flex-1 rounded-full sm:flex-initial">
            <Flag className="size-4" />
            <span className="inline sm:hidden xl:inline">Report</span>
          </Button> */}
        </div>
      </div>

      {video.description && (
        <div className="mt-4 rounded-lg bg-card p-2 sm:p-4">
          <p className="text-sm text-muted-foreground">{video.description}</p>
        </div>
      )}
    </motion.div>
  );
};

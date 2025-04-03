"use client";

import { api } from "@/trpc/react";
import { Flag, User } from "lucide-react";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";
import { type FC } from "react";

import { type VideoByIdResponse } from "@/server/api/routers/video";

import { cn } from "@/lib/utils";

import { motions } from "@/constants/motion";

import { ClientShareButton } from "../client-share-button";
import { LikeButton } from "../like-button";
import { NoSSR } from "../no-ssr";
import { SubscribeButton } from "../subscribe-button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { TextExpander } from "../ui/text-expander";
import { VideoCategories, VideoModels, VideoTags } from "./video-tags";
import { VideoViews } from "./video-views";

interface VideoDetailsProps {
  className?: string;
  video: VideoByIdResponse;
}

export const VideoDetails: FC<VideoDetailsProps> = ({ video, className }) => {
  const t = useTranslations();

  const tags = video.video_tags.map(({ tag }) => tag);
  const categories = video.category_videos.map(({ category }) => category);
  const models = video.model_videos.map(({ model }) => model);

  return (
    <motion.div {...motions.slide.y.in} className={cn("space-y-3", className)}>
      <h1 className="text-xl font-bold md:text-2xl">{video.title}</h1>

      <div className="flex flex-wrap gap-1 empty:hidden">
        <VideoTags tags={tags} />
        <VideoCategories categories={categories} />
        <VideoModels models={models} />
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2 gap-y-4 sm:gap-x-4">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarFallback>
                <User className="size-5" />
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <p className="text-sm font-medium">{"<username>"}</p>
              <p className="text-xs text-muted-foreground">{"<subscribers_count>"}</p>
            </div>
          </div>

          <SubscribeButton className="rounded-full" />
        </div>

        <div className="flex justify-between gap-2">
          <div className="flex items-center rounded-full">
            <LikeButton
              mode="like"
              className="border-r border-border/20"
              videoId={video.id}
              count={video.likes_count}
              vote={video.my_vote}
              mutation={api.video.likeVideo}
            />
            <LikeButton
              mode="dislike"
              videoId={video.id}
              count={video.dislikes_count}
              vote={video.my_vote}
              mutation={api.video.dislikeVideo}
            />
          </div>

          <div className="flex gap-2">
            <NoSSR>
              <ClientShareButton className="flex-0" title={video.title} description={video.description} />
            </NoSSR>
            <Button variant="destructive" size="sm" className="rounded-full">
              <Flag className="size-4" />
              <span className="hidden lg:inline">{t("report")}</span>
            </Button>
          </div>
        </div>
      </div>

      {video.description && (
        <div className="mt-3 space-y-2">
          <VideoViews views={video.views_count} timestamp={video.created_at} />
          <hr className="m-0" />
          <TextExpander className="text-sm text-muted-foreground" lines={3}>
            {video.description}
          </TextExpander>
        </div>
      )}
    </motion.div>
  );
};

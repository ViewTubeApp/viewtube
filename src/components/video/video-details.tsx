"use client";

import { api } from "@/trpc/react";
import { Bell, Flag } from "lucide-react";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";
import { type FC } from "react";

import { type VideoByIdResponse } from "@/server/api/routers/video";

import { cn } from "@/lib/utils";

import { motions } from "@/constants/motion";

import { ClientShareButton } from "../client-share-button";
import { LikeButton } from "../like-button";
import { NoSSR } from "../no-ssr";
import { TextExpander } from "../text-expander";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { VideoCategories, VideoModels, VideoTags } from "./video-tags";
import { VideoViews } from "./video-views";

interface VideoDetailsProps {
  className?: string;
  video: VideoByIdResponse;
}

export const VideoDetails: FC<VideoDetailsProps> = ({ video, className }) => {
  const t = useTranslations();

  const tags = video.videoTags.map(({ tag }) => tag);
  const categories = video.categoryVideos.map(({ category }) => category);
  const models = video.modelVideos.map(({ model }) => model);

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
                {video.title
                  .split(" ")
                  .map((name) => name[0]?.toUpperCase() ?? "")
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <p className="text-sm font-medium">{"<username>"}</p>
              <p className="text-xs text-muted-foreground">{"<subscribers_count>"}</p>
            </div>
          </div>

          <Button size="sm" className="rounded-full">
            <Bell className="size-4" />
            {t("subscribe")}
          </Button>
        </div>

        <div className="flex justify-between gap-2">
          <div className="flex items-center rounded-full">
            <LikeButton
              mode="like"
              className="border-r border-border/20"
              videoId={video.id}
              count={video.likesCount}
              disabled={video.alreadyVoted}
              mutation={api.video.likeVideo}
            />
            <LikeButton
              mode="dislike"
              videoId={video.id}
              count={video.dislikesCount}
              disabled={video.alreadyVoted}
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
          <VideoViews views={video.viewsCount} timestamp={video.createdAt} />
          <hr className="m-0" />
          <TextExpander className="text-sm text-muted-foreground" lines={3}>
            {video.description}
          </TextExpander>
        </div>
      )}
    </motion.div>
  );
};

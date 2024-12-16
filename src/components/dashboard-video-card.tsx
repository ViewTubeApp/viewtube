"use client";

import { formatDistance } from "date-fns";
import { motion } from "motion/react";
import { type FC } from "react";

import { type VideoExtended } from "@/server/db/schema";

import { cn } from "@/lib/utils";
import { getClientVideoUrls } from "@/lib/video/client";

import { NiceImage } from "@/components/nice-image";

import { Card } from "./ui/card";

export const DashboardVideoCard: FC<{ video: VideoExtended }> = ({ video }) => {
  const { getVideoPosterUrl } = getClientVideoUrls();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: "easeOut" }}>
      <Card className="overflow-hidden transition-colors hover:bg-muted/50">
        <div className="relative aspect-video w-full">
          <NiceImage fill src={getVideoPosterUrl(video.url)} alt={video.title} className="object-cover" />
        </div>
        <div className="space-y-2 p-4">
          <h3 className="line-clamp-2 font-medium">{video.title}</h3>
          {video.description && <p className="line-clamp-2 text-sm text-muted-foreground">{video.description}</p>}

          <div className="flex items-center gap-2 text-sm">
            <span
              className={cn("rounded-full px-2 py-0.5 text-xs", {
                "bg-green-500/10 text-green-500": video.status === "completed",
                "bg-yellow-500/10 text-yellow-500": video.status === "processing",
              })}
            >
              {video.status === "completed" ? "Public" : "Processing"}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{formatDistance(video.createdAt, new Date(), { addSuffix: true })}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{video.viewsCount} views</span>
            <span>0 comments</span>
            <span>0 likes</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

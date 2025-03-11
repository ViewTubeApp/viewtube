"use client";

import * as m from "@/paraglide/messages";
import * as motion from "motion/react-client";

import { type VideoListElement } from "@/server/api/routers/video";

import { motions } from "@/constants/motion";

import { RelatedVideoCard } from "./related-video-card";

interface RelatedVideosProps {
  videos: VideoListElement[];
}

export function RelatedVideos({ videos }: RelatedVideosProps) {
  return (
    <motion.div {...motions.fade.in} className="flex flex-col gap-2">
      <h2 className="mb-2 text-lg font-semibold">{m.related_videos()}</h2>
      <div className="flex flex-col gap-3">
        {videos.map((video) => (
          <RelatedVideoCard key={video.id} video={video} />
        ))}
      </div>
    </motion.div>
  );
}

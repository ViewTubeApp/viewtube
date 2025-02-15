"use client";

import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import * as m from "@/paraglide/messages";
import { getPublicURL } from "@/utils/react/video";
import { motion } from "motion/react";
import { type FC } from "react";

import { type APIVideoType } from "@/server/api/routers/video";

import { cn } from "@/lib/utils";

import { motions } from "@/constants/motion";

import { NiceImage } from "@/components/nice-image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { DashboardRowActions } from "./actions";

interface DashboardVideoCardProps {
  item: APIVideoType;
}

export const DashboardVideoCard: FC<DashboardVideoCardProps> = ({ item: video }) => {
  const formattedDistance = useFormattedDistance();

  return (
    <motion.div {...motions.slide.y.in}>
      <Card className="transition-colors hover:bg-muted/50 isolate relative">
        <div className="overflow-hidden rounded-lg rounded-b-none relative aspect-video w-full">
          <NiceImage fill src={getPublicURL(video.url).forType("poster")} alt={video.title} className="object-cover" />
        </div>
        <div className="space-y-2 p-4 pb-0">
          <div className="flex items-center justify-between">
            <h3 className="line-clamp-2 font-medium">{video.title}</h3>
            <DashboardRowActions video={video} />
          </div>
          {video.description && <p className="line-clamp-2 text-sm text-muted-foreground">{video.description}</p>}
        </div>
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span
              className={cn("rounded-full px-2 py-0.5 text-xs", {
                "bg-green-500/10 text-green-500": video.status === "completed",
                "bg-yellow-500/10 text-yellow-500": video.status === "processing",
              })}
            >
              {m[`status_${video.status}`]()}
            </span>
            <span className="text-muted-foreground">{m.created_at({ date: formattedDistance(video.createdAt) })}</span>
          </div>

          <div className="flex items-center justify-end gap-4 text-sm text-muted-foreground">
            <span>
              {m.views_count({ count: Intl.NumberFormat("en-US", { notation: "compact" }).format(video.viewsCount) })}
            </span>
          </div>

          {/* Categories */}
          {video.categoryVideos.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-muted-foreground">{m.categories()}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {video.categoryVideos.map((category) => (
                  <Badge className="text-xs" key={category.category.id}>
                    {category.category.slug}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {video.videoTags.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-muted-foreground">{m.tags()}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {video.videoTags.map((tag) => (
                  <Badge key={tag.tag.id} className="text-xs">
                    {tag.tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Models */}
          {video.modelVideos.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-muted-foreground">{m.models()}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {video.modelVideos.map((model) => (
                  <Badge className="text-xs" key={model.model.id}>
                    {model.model.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

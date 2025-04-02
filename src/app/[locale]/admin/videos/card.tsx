"use client";

import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import { getPublicURL } from "@/utils/react/video";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";
import { type FC } from "react";

import { type VideoListElement } from "@/server/api/routers/video";

import { cn } from "@/lib/utils";

import { motions } from "@/constants/motion";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { NiceImage } from "@/components/ui/nice-image";

import { DashboardRowActions } from "./actions";

interface DashboardVideoCardProps {
  item: VideoListElement;
}

export const DashboardVideoCard: FC<DashboardVideoCardProps> = ({ item: video }) => {
  const t = useTranslations();
  const fd = useFormattedDistance();

  return (
    <motion.div {...motions.slide.y.in}>
      <Card className="isolate gap-2 relative p-0 pb-4">
        <div className="flex overflow-hidden rounded-xl rounded-b-none relative aspect-video w-full">
          <NiceImage fill src={getPublicURL(video.file_key)} alt={video.title} imageClassName="object-cover" />
        </div>
        <div className="space-y-2 px-2">
          <div className="flex items-center justify-between">
            <h3 className="line-clamp-2 font-medium">{video.title}</h3>
            <DashboardRowActions video={video} />
          </div>
          {video.description && <p className="line-clamp-2 text-sm text-muted-foreground">{video.description}</p>}
        </div>
        <div className="space-y-1 px-2">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span
              className={cn("rounded-full px-2 py-0.5 text-xs", {
                "bg-green-500/10 text-green-500": video.status === "completed",
                "bg-yellow-500/10 text-yellow-500": video.status === "processing",
                "bg-red-500/10 text-red-500": video.status === "failed",
                "bg-gray-500/10 text-gray-500": video.status === "pending",
              })}
            >
              {t(`status_${video.status}`)}
            </span>
            <span className="text-muted-foreground">{t("created_at", { date: fd(video.created_at) })}</span>
          </div>

          <div className="flex items-center justify-end gap-4 text-sm text-muted-foreground">
            <span>
              {t.rich("views_count", {
                strong: (chunks) => <span>{chunks}</span>,
                count: Intl.NumberFormat("en-US", { notation: "compact" }).format(video.views_count),
              })}
            </span>
          </div>

          {/* Categories */}
          {video.category_videos.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-muted-foreground">{t("categories")}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {video.category_videos.map((category) => (
                  <Badge className="text-xs" key={category.category.id}>
                    {category.category.slug}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {video.video_tags.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-muted-foreground">{t("tags")}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {video.video_tags.map((tag) => (
                  <Badge key={tag.tag.id} className="text-xs">
                    {tag.tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Models */}
          {video.model_videos.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-muted-foreground">{t("models")}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {video.model_videos.map((model) => (
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

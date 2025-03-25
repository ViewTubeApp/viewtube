"use client";

import { MoreHorizontal } from "lucide-react";
import { type FC } from "react";

import { type VideoListElement } from "@/server/api/routers/video";

import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DashboardRowCategoriesProps {
  limit?: number;
  video: VideoListElement;
}

export const DashboardRowCategories: FC<DashboardRowCategoriesProps> = ({ video, limit = 2 }) => {
  return (
    <div className="flex items-center gap-1">
      {video.category_videos.slice(0, limit).map(({ category }) => (
        <Badge key={category.id} className="text-xs cursor-pointer">
          {category.slug}
        </Badge>
      ))}

      {video.category_videos.length > limit && (
        <Popover>
          <PopoverTrigger asChild>
            <button className="rounded-full outline-hidden ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <MoreHorizontal className="size-4 cursor-pointer" />
            </button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-wrap gap-1">
              {video.category_videos.slice(limit).map(({ category }) => (
                <Badge key={category.id} className="text-xs cursor-pointer">
                  {category.slug}
                </Badge>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

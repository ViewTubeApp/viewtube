"use client";

import { MoreHorizontal } from "lucide-react";
import { type FC } from "react";

import { type VideoExtended } from "@/server/db/schema";

import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DashboardRowCategoriesProps {
  limit?: number;
  video: VideoExtended;
}

export const DashboardRowCategories: FC<DashboardRowCategoriesProps> = ({ video, limit = 2 }) => {
  return (
    <div className="flex items-center gap-1">
      {video.categoryVideos.slice(0, limit).map(({ category }) => (
        <Badge key={category.id} className="text-xs cursor-pointer">
          {category.slug}
        </Badge>
      ))}

      {video.categoryVideos.length > limit && (
        <Popover>
          <PopoverTrigger asChild>
            <button className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <MoreHorizontal className="size-4 cursor-pointer" />
            </button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-wrap gap-1">
              {video.categoryVideos.slice(limit).map(({ category }) => (
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

"use client";

import { MoreHorizontal } from "lucide-react";
import { type FC } from "react";

import { type APIVideoType } from "@/server/api/routers/video";

import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DashboardRowTagsProps {
  limit?: number;
  video: APIVideoType;
}

export const DashboardRowTags: FC<DashboardRowTagsProps> = ({ video, limit = 2 }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {video.videoTags.slice(0, limit).map(({ tag }) => (
          <Badge key={tag.id} className="text-xs cursor-pointer">
            {tag.name}
          </Badge>
        ))}
      </div>

      {video.videoTags.length > limit && (
        <Popover>
          <PopoverTrigger asChild>
            <button className="rounded-full outline-hidden ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <MoreHorizontal className="size-4 cursor-pointer" />
            </button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-wrap gap-1">
              {video.videoTags.slice(limit).map(({ tag }) => (
                <Badge key={tag.id} className="text-xs cursor-pointer">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

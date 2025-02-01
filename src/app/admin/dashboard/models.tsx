"use client";

import { MoreHorizontal } from "lucide-react";
import { type FC } from "react";

import { type VideoResponse } from "@/server/api/routers/video";

import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DashboardRowModelsProps {
  limit?: number;
  video: VideoResponse;
}

export const DashboardRowModels: FC<DashboardRowModelsProps> = ({ video, limit = 2 }) => {
  return (
    <div className="flex items-center gap-1">
      {video.modelVideos.slice(0, limit).map(({ model }) => (
        <Badge key={model.id} className="text-xs cursor-pointer">
          {model.name}
        </Badge>
      ))}

      {video.modelVideos.length > limit && (
        <Popover>
          <PopoverTrigger asChild>
            <button className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <MoreHorizontal className="size-4 cursor-pointer" />
            </button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-wrap gap-1">
              {video.modelVideos.slice(limit).map(({ model }) => (
                <Badge key={model.id} className="text-xs cursor-pointer">
                  {model.name}
                </Badge>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

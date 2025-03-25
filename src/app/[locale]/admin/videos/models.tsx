"use client";

import { MoreHorizontal } from "lucide-react";
import { type FC } from "react";

import { type VideoListElement } from "@/server/api/routers/video";

import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DashboardRowModelsProps {
  limit?: number;
  video: VideoListElement;
}

export const DashboardRowModels: FC<DashboardRowModelsProps> = ({ video, limit = 2 }) => {
  return (
    <div className="flex items-center gap-1">
      {video.model_videos.slice(0, limit).map(({ model }) => (
        <Badge key={model.id} className="text-xs cursor-pointer">
          {model.name}
        </Badge>
      ))}

      {video.model_videos.length > limit && (
        <Popover>
          <PopoverTrigger asChild>
            <button className="rounded-full outline-hidden ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <MoreHorizontal className="size-4 cursor-pointer" />
            </button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-wrap gap-1">
              {video.model_videos.slice(limit).map(({ model }) => (
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

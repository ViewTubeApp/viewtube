import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import * as m from "@/paraglide/messages";
import { getPublicURL } from "@/utils/react/video";
import { cn } from "@/utils/shared/clsx";
import { type ColumnDef } from "@tanstack/react-table";

import { type VideoListElement } from "@/server/api/routers/video";
import { type VideoTaskStatus } from "@/server/db/schema";

import { VideoPoster } from "@/components/video/video-poster";

import { DashboardRowActions } from "./actions";
import { DashboardRowCategories } from "./categories";
import { DashboardRowModels } from "./models";
import { DashboardRowTags } from "./tags";

export function useDashboardColumns() {
  const formattedDistance = useFormattedDistance();

  return [
    {
      accessorKey: "thumbnail",
      header: m.thumbnail(),
      cell: ({ row }) => {
        const video = row.original;
        return (
          <div className="relative aspect-video w-36 overflow-hidden">
            <VideoPoster
              title={video.title}
              poster={getPublicURL(video.url).forType("poster")}
              trailer={getPublicURL(video.url).forType("trailer")}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: m.title(),
      size: 512,
      cell: ({ row }) => {
        const video = row.original;
        return (
          <div className="flex flex-col gap-1">
            <span className="line-clamp-1 max-w-md font-medium">{video.title}</span>
            <span className="line-clamp-2 max-w-md text-sm text-muted-foreground">{video.description}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: m.status(),
      cell: ({ row }) => {
        const video = row.original;

        const statusColorMap: Record<VideoTaskStatus, string> = {
          completed: "text-green-500",
          processing: "text-yellow-500",
          failed: "text-red-500",
          pending: "text-gray-500",
        };

        return (
          <span className={cn("whitespace-nowrap text-sm capitalize", statusColorMap[video.status])}>
            {m[`status_${video.status}`]()}
          </span>
        );
      },
    },
    {
      accessorKey: "uploaded",
      header: m.uploaded(),
      cell: ({ row }) => {
        const video = row.original;
        return <span className="whitespace-nowrap text-sm">{formattedDistance(video.createdAt)}</span>;
      },
    },
    {
      accessorKey: "views",
      header: m.views(),
      cell: ({ row }) => {
        const video = row.original;
        return <span className="text-sm">{video.viewsCount}</span>;
      },
    },
    {
      accessorKey: "tags",
      header: m.tags(),
      cell: ({ row }) => {
        const video = row.original;
        return <DashboardRowTags video={video} />;
      },
    },
    {
      accessorKey: "categories",
      header: m.categories(),
      cell: ({ row }) => {
        const video = row.original;
        return <DashboardRowCategories video={video} />;
      },
    },
    {
      accessorKey: "models",
      header: m.models(),
      cell: ({ row }) => {
        const video = row.original;
        return <DashboardRowModels video={video} />;
      },
    },
    {
      id: "actions",
      size: 64,
      cell: ({ row }) => {
        const video = row.original;
        return <DashboardRowActions video={video} />;
      },
    },
  ] satisfies ColumnDef<VideoListElement>[];
}

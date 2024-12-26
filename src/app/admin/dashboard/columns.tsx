import { getClientVideoUrls } from "@/utils/react/video";
import { cn } from "@/utils/shared/clsx";
import { type ColumnDef } from "@tanstack/react-table";
import { formatDistance } from "date-fns/formatDistance";

import { type VideoExtended, type VideoTaskStatus } from "@/server/db/schema";

import { VideoPoster } from "@/components/video-poster";

import { DashboardRowActions } from "./actions";
import { DashboardRowCategories } from "./categories";
import { DashboardRowTags } from "./tags";

const { getVideoPosterUrl, getVideoTrailerUrl } = getClientVideoUrls();

export const columns: ColumnDef<VideoExtended>[] = [
  {
    accessorKey: "thumbnail",
    header: "Thumbnail",
    cell: ({ row }) => {
      const video = row.original;
      return (
        <div className="relative aspect-video h-20 w-36 overflow-hidden">
          <VideoPoster
            title={video.title}
            poster={getVideoPosterUrl(video.url)}
            trailer={getVideoTrailerUrl(video.url)}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
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
    header: "Status",
    cell: ({ row }) => {
      const video = row.original;

      const statusColorMap: Record<VideoTaskStatus, string> = {
        completed: "text-green-500",
        processing: "text-yellow-500",
        failed: "text-red-500",
        pending: "text-gray-500",
      };

      return (
        <span className={cn("whitespace-nowrap text-sm capitalize", statusColorMap[video.status])}>{video.status}</span>
      );
    },
  },
  {
    accessorKey: "uploaded",
    header: "Uploaded",
    cell: ({ row }) => {
      const video = row.original;
      return (
        <span className="whitespace-nowrap text-sm">
          {formatDistance(video.createdAt, new Date(), { addSuffix: true })}
        </span>
      );
    },
  },
  {
    accessorKey: "views",
    header: "Views",
    cell: ({ row }) => {
      const video = row.original;
      return <span className="text-sm">{video.viewsCount}</span>;
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const video = row.original;
      return <DashboardRowTags video={video} />;
    },
  },
  {
    accessorKey: "categories",
    header: "Categories",
    cell: ({ row }) => {
      const video = row.original;
      return <DashboardRowCategories video={video} />;
    },
  },
  {
    id: "actions",
    size: 0,
    cell: ({ row }) => {
      const video = row.original;
      return <DashboardRowActions video={video} />;
    },
  },
];
